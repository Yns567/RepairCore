"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authorization";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.category.create({
    data: {
      name,
      slug: slugify(name),
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
}
