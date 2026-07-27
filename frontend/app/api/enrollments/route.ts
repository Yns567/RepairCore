import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const enrollmentSchema = z.object({ courseId: z.coerce.number().int().positive() });

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
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

  if (Number(course.price) > 0) {
    return NextResponse.json({ error: "Paid course enrollment requires checkout." }, { status: 402 });
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
    update: {},
    create: {
      userId: session.user.id,
      courseId,
    },
  });

  return NextResponse.json({ enrollment }, { status: 201 });
}
