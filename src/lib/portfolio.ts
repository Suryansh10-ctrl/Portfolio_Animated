import portfolioData from "@/content/portfolio.json";
import type { PortfolioData, Book } from "@/types/portfolio";

export const portfolio: PortfolioData = portfolioData as unknown as PortfolioData;

export function getAllBooks(): Book[] {
  return portfolio.books;
}

export function getBookById(id: string): Book | undefined {
  return portfolio.books.find((b) => b.id.toLowerCase() === id.toLowerCase());
}

export function getAdjacentBooks(id: string): { prev: Book | null; next: Book | null; index: number } {
  const index = portfolio.books.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return { prev: null, next: null, index: -1 };
  }
  const prev = index > 0 ? portfolio.books[index - 1] : null;
  const next = index < portfolio.books.length - 1 ? portfolio.books[index + 1] : null;
  return { prev, next, index };
}
