"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const category = formData.get("category") as string;
  const brand = formData.get("brand") as string;
  const partNumber = formData.get("partNumber") as string;
  const imageFile = formData.get("image") as File;

  let imagePath: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const  filepath = path.join(process.cwd(), "public", "images", "products", filename);
    await writeFile(filepath, buffer);
    imagePath = `/images/products/${filename}`;
  }
  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      stock,
      category,
      brand,
      partNumber,
      image: imagePath,
      status: "ACTIVE",
    },
  });

  redirect("/admin/products");
}

export async function updateProduct(
  id: number,
  formData: FormData
) {
  await prisma.product.update({
    where: {
      id,
    },
    data: {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      category: formData.get("category") as string,
      brand: formData.get("brand") as string,
      partNumber: formData.get("partNumber") as string,
      image: formData.get("image") as string,
    },
  });

  redirect("/admin/products");
}
export async function deleteProduct(id: number) {
  "use server";

  await prisma.product.delete({
    where: {
      id,
    },
  });

  redirect("/admin/products");
}