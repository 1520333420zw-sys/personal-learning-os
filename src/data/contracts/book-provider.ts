export interface BookSearchResult {
  providerId: string; title: string; authors: string[]; firstPublishYear?: number;
  isbn?: string; coverUrl?: string; language?: string; sourceUrl: string;
}

export interface BookProvider {
  search(query: string): Promise<BookSearchResult[]>;
}
