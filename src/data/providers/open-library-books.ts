import type { BookProvider, BookSearchResult } from "@/data/contracts/book-provider";

interface OpenLibraryDocument {
  key?: unknown; title?: unknown; author_name?: unknown; first_publish_year?: unknown;
  isbn?: unknown; cover_i?: unknown; language?: unknown;
}

export const openLibraryBooks: BookProvider = {
  async search(query: string): Promise<BookSearchResult[]> {
    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("fields", "key,title,author_name,first_publish_year,isbn,cover_i,language");
    url.searchParams.set("limit", "12");
    const response = await fetch(url, { signal: AbortSignal.timeout(10000), next: { revalidate: 3600 }, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Open Library search failed: ${response.status}`);
    const payload: unknown = await response.json();
    const docs = typeof payload === "object" && payload !== null && "docs" in payload && Array.isArray(payload.docs) ? payload.docs as OpenLibraryDocument[] : [];
    return docs.flatMap((doc) => {
      if (typeof doc.key !== "string" || !/^\/works\/OL\d+W$/.test(doc.key) || typeof doc.title !== "string") return [];
      const coverId = typeof doc.cover_i === "number" && Number.isInteger(doc.cover_i) && doc.cover_i > 0 ? doc.cover_i : undefined;
      const isbn = Array.isArray(doc.isbn) ? doc.isbn.find((value): value is string => typeof value === "string") : undefined;
      const authors = Array.isArray(doc.author_name) ? doc.author_name.filter((value): value is string => typeof value === "string").slice(0, 4) : [];
      return [{ providerId: doc.key, title: doc.title, authors,
        firstPublishYear: typeof doc.first_publish_year === "number" ? doc.first_publish_year : undefined,
        isbn, language: Array.isArray(doc.language) ? doc.language.find((value): value is string => typeof value === "string") : undefined,
        coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
        sourceUrl: `https://openlibrary.org${doc.key}`,
      } satisfies BookSearchResult];
    });
  },
};
