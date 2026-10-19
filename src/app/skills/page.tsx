import type { Metadata } from "next";
import { getBookById } from "@/lib/portfolio";
import VolumePage from "@/components/VolumePage";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const book = getBookById("skills");
  if (!book) return {};
  return {
    title: `Volume ${book.roman}: ${book.title} — ${book.discipline}`,
    description: book.note,
  };
}

export default function SkillsRoute() {
  const book = getBookById("skills");
  if (!book) notFound();
  return <VolumePage book={book} />;
}
