import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Prisma } from "@/lib/generated/prisma";
import { PRICING_CURRENCY, toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { debitWallet, InsufficientBalanceError } from "@/lib/wallet";
import { z } from "zod";

const enrollmentSchema = z.object({ courseId: z.coerce.number().int().positive() });

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = enrollmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course." }, { status: 400 });
  }
  const { courseId } = parsed.data;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "ACTIVE") {
    return NextResponse.json({ error: "course not found" }, { status: 404 });
  }

  const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) {
    return NextResponse.json({ enrollment: existing, existing: true }, { status: 200 });
  }

  const price = toMoney(course.price);
  try {
    const enrollment = await prisma.$transaction(async (tx) => {
      // The unique (userId, courseId) constraint makes a double click fail here,
      // before any money moves.
      const created = await tx.enrollment.create({ data: { userId, courseId } });
      if (price.gt(0)) {
        await debitWallet(tx, {
          userId,
          currency: PRICING_CURRENCY.course,
          amount: price,
          description: `Course: ${course.title}`,
          referenceType: "COURSE",
          referenceId: String(created.id),
        });
      }
      return created;
    });

    revalidatePath(`/learning/${course.slug}`);
    revalidatePath("/account/wallet");
    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    if (error instanceof InsufficientBalanceError) {
      return NextResponse.json({ error: "Your dirham balance is not enough for this course." }, { status: 402 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ existing: true }, { status: 200 });
    }
    return NextResponse.json({ error: "We could not enroll you. Please try again." }, { status: 400 });
  }
}
