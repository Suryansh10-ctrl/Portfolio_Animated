import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBooks, getBookById } from "@/lib/portfolio";
import VolumePage from "@/components/VolumePage";

export async function generateStaticParams() {
  const books = getAllBooks();
  return books.map((book) => ({
    id: book.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = getBookById(id);
  if (!book) return {};
  return {
    title: `Volume ${book.roman}: ${book.title} — ${book.discipline}`,
    description: book.note,
  };
}

export default async function BookDynamicRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBookById(id);
  if (!book) notFound();
  return <VolumePage book={book} />;
}
