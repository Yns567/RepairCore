import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        <Link href="/" className="text-2xl font-bold">
          RepairCore
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/store" className="hover:text-blue-600">
            Store
          </Link>

          <Link href="/software" className="hover:text-blue-600">
            Software
          </Link>

          <Link href="/hardware" className="hover:text-blue-600">
            Hardware
          </Link>

          <Link href="/learning" className="hover:text-blue-600">
            Learning
          </Link>
        </nav>

      </div>
    </header>
  );
}