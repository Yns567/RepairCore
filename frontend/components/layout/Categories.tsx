const categories = [
  {
    title: "Store",
    description: "Phone parts, tools and accessories",
    icon: "🛒",
  },
  {
    title: "Software",
    description: "Unlock, Flash and Repair Software",
    icon: "💻",
  },
  {
    title: "Hardware",
    description: "Board repair and electronics",
    icon: "🔧",
  },
  {
    title: "Learning",
    description: "Tutorials and repair courses",
    icon: "📚",
  },
];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto py-20 px-6">
      <h2 className="text-4xl font-bold mb-10">
        Explore RepairCore
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-lg transition"
          >
            <div className="text-5xl mb-4">{cat.icon}</div>

            <h3 className="text-xl font-bold">
              {cat.title}
            </h3>

            <p className="text-gray-500 mt-2">
              {cat.description}
            </p>

            <button className="mt-6 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
              Open
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}