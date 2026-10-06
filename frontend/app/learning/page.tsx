import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/learning/CourseCard";

export default async function LearningPage() {
  const courses = await prisma.course.findMany({
    where: { status: "ACTIVE" },
    include: { _count: { select: { lessons: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold text-white">Learn Phone Repair</h1>

      <p className="mt-4 text-slate-400">
        Hands-on courses from beginner to advanced smartphone repair.
      </p>

      {courses.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">
          No courses available right now.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              slug={course.slug}
              title={course.title}
              description={course.description}
              image={course.image}
              price={course.price.toString()}
              level={course.level}
              lessonCount={course._count.lessons}
            />
          ))}
        </div>
      )}
    </main>
  );
}
