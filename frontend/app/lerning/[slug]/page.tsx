import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import EnrollButton from "@/components/learning/EnrollButton";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!course) {
    notFound();
  }

  let isEnrolled = false;
  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId: course.id },
      },
    });
    isEnrolled = !!enrollment;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white">{course.title}</h1>

      {course.description && (
        <p className="mt-4 text-slate-400">{course.description}</p>
      )}

      <div className="mt-8">
        <EnrollButton
          courseId={course.id}
          isEnrolled={isEnrolled}
          price={course.price.toString()}
        />
      </div>

      <h2 className="mt-12 text-2xl font-bold text-white">Course Content</h2>

      <div className="mt-6 space-y-3">
        {course.lessons.length === 0 && (
          <p className="text-slate-500">Lessons coming soon.</p>
        )}

        {course.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="flex items-center gap-4 rounded-xl border border-slate-800 bg-[#111827] p-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {index + 1}
            </span>
            <span className="text-white">{lesson.title}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
