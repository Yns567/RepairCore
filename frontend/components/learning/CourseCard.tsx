import Link from "next/link";
import Image from "next/image";

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

type CourseCardProps = {
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  price: string;
  level: string;
  lessonCount: number;
};

export default function CourseCard({
  slug,
  title,
  description,
  image,
  price,
  level,
  lessonCount,
}: CourseCardProps) {
  const isFree = Number(price) === 0;

  return (
    <Link
      href={`/lerning/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl"
    >
      <div className="relative h-48 bg-[#0F172A]">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          {levelLabels[level] ?? level}
        </span>
      </div>

      <div className="space-y-3 p-6">
        <h3 className="text-xl font-bold text-white group-hover:text-blue-400">
          {title}
        </h3>

        {description && (
          <p className="line-clamp-2 text-sm text-slate-400">{description}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-slate-500">{lessonCount} lessons</span>
          <span className="text-lg font-bold text-blue-400">
            {isFree ? "Free" : `${price} $`}
          </span>
        </div>
      </div>
    </Link>
  );
}
