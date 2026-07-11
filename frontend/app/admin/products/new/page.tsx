import { createProduct } from "../actions";
export default function NewProductPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">
        Add Product
      </h1>

    <form action={createProduct} encType="multipart/form-data" className="space-y-5">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          name="slug"
          placeholder="Slug"
          className="w-full border rounded-lg p-3"
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border rounded-lg p-3 h-32"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          name="brand"
          placeholder="Brand"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          name="partNumber"
          placeholder="Part Number"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="file"
          name="image"
          placeholder="Image/*"
          className="w-full border rounded-lg p-3"
        />

        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Save Product
        </button>

      </form>
    </main>
  );
}