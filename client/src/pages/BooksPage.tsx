import { useEffect, useState } from 'react';
import { booksApi } from '../services/endpoints';
import type { Book } from '../types';
import { Bookmark } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Spinner';
import { useDebounce } from '../hooks/useDebounce';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedQ = useDebounce(q, 350);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (debouncedQ) params.q = debouncedQ;
      if (category) params.category = category;
      const [b, c] = await Promise.all([booksApi.list(params), booksApi.categories()]);
      setBooks(b.data.data.books);
      setCategories(c.data.data.categories);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load books'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, category]);

  return (
    <div className="space-y-8">
      <PageHeader title="Books Library" description="Search, bookmark, and track reading progress." />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-sm"
          label="Search"
          placeholder="Search books…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          className="w-48"
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <div className="flex items-end">
          <Button type="button" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !books.length ? (
        <EmptyState title="No books found" description="Try another search or category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <article key={book._id} className="card-surface flex flex-col">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-wave-600">{book.category}</p>
                  <h3 className="font-display text-lg font-bold">{book.title}</h3>
                  <p className="text-sm text-slate-500">{book.author}</p>
                </div>
                <button
                  type="button"
                  className={`rounded-lg p-2 ${
                    book.userMeta?.bookmarked ? 'bg-wave-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  onClick={() => booksApi.bookmark(book._id).then(load)}
                  aria-label={book.userMeta?.bookmarked ? `Remove bookmark for ${book.title}` : `Bookmark ${book.title}`}
                  aria-pressed={!!book.userMeta?.bookmarked}
                >
                  <Bookmark size={16} aria-hidden />
                </button>
              </div>
              <p className="flex-1 text-sm text-slate-600 dark:text-slate-400">{book.description}</p>
              <p className="mt-3 text-xs text-slate-400">{book.pages} pages</p>
              <div className="mt-3">
                <label className="mb-1 flex justify-between text-xs" htmlFor={`progress-${book._id}`}>
                  <span>Reading progress</span>
                  <span>{book.userMeta?.readingProgress ?? 0}%</span>
                </label>
                <input
                  id={`progress-${book._id}`}
                  type="range"
                  min={0}
                  max={100}
                  value={book.userMeta?.readingProgress ?? 0}
                  className="w-full accent-wave-600"
                  onChange={(e) =>
                    booksApi.progress(book._id, { readingProgress: Number(e.target.value) }).then(load)
                  }
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
