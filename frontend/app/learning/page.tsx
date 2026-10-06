import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/learning/CourseCard";
import { getT } from "@/lib/i18n/server";

export default async function LearningPage() {
  const { t } = await getT();
  const courses = await prisma.course.findMany({
    where: { status: "ACTIVE" },
    include: { _count: { select: { lessons: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 md:py-12">
      <h1 className="text-2xl font-bold md:text-4xl text-white">{t("learning.title")}</h1>

      <p className="mt-4 text-slate-400">
        {t("learning.subtitle")}
      </p>

      {courses.length === 0 ? (
        <p className="mt-16 text-center text-slate-500">
          {t("learning.empty")}
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
