'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

const RESULTS_PER_PAGE = 5;

export default function ChangelogPage() {
  const [commits, set_commits] = useState<Commit[]>([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [page, set_page] = useState(1);

  useEffect(() => {
    fetch('/api/changelog')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch changelog');
        return res.json();
      })
      .then((data) => {
        set_commits(data);
        set_loading(false);
      })
      .catch((e) => {
        set_error(e.message);
        set_loading(false);
      });
  }, []);

  const total_pages = Math.ceil(commits.length / RESULTS_PER_PAGE);
  const start_index = (page - 1) * RESULTS_PER_PAGE;
  const end_index = start_index + RESULTS_PER_PAGE;
  const paginated_commits = commits.slice(start_index, end_index);

  const handle_prev = () => set_page((p) => Math.max(1, p - 1));
  const handle_next = () => set_page((p) => Math.min(total_pages, p + 1));

  return (
    <main className="container mx-auto px-2 py-8 max-w-2xl">
      <nav className="navbar bg-base-100 rounded-lg mb-8 flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center">
        <div className="text-3xl font-extrabold mb-2 md:mb-0">Changelog</div>
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 md:gap-2 items-stretch md:items-center">
          <Link
            href="/"
            className="btn btn-accent btn-sm font-semibold w-full md:w-auto"
          >
            Home
          </Link>
          <a
            href="https://github.com/moikas-code/live_moikas"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-neutral btn-sm font-semibold flex items-center gap-1 w-full md:w-auto"
            aria-label="Contribute on GitHub"
          >
            <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="inline-block align-text-bottom"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
            Contribute
          </a>
        </div>
      </nav>
      <section className="bg-base-200 rounded-lg p-6 shadow-lg">
        {loading ? (
          <div className="space-y-6">
            {[...Array(RESULTS_PER_PAGE)].map((_, i) => (
              <div key={i} className="border-b border-base-300 pb-4">
                <div className="h-6 w-2/3 mb-2 shimmer bg-base-300 animate-pulse rounded" />
                <div className="h-4 w-1/3 mb-2 shimmer bg-base-300 animate-pulse rounded" />
                <div className="flex items-center mt-1 gap-2">
                  <div className="w-6 h-6 rounded-full shimmer bg-base-300 animate-pulse" />
                  <div className="h-3 w-16 shimmer bg-base-300 animate-pulse rounded" />
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center mt-8">
              <div className="btn btn-outline btn-sm w-24 h-8 shimmer bg-base-300 animate-pulse" />
              <div className="h-4 w-24 shimmer bg-base-300 animate-pulse rounded" />
              <div className="btn btn-outline btn-sm w-24 h-8 shimmer bg-base-300 animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <>
            <ul className="space-y-6">
              {paginated_commits.map((commit) => (
                <li key={commit.sha} className="border-b border-base-300 pb-4">
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:underline break-words"
                  >
                    {commit.commit.message}
                  </a>
                  <div className="text-sm text-gray-600 mt-1">
                    by {commit.commit.author.name} on{' '}
                    {new Date(commit.commit.author.date).toLocaleString()}
                  </div>
                  {commit.author && (
                    <div className="flex items-center mt-1">
                      <Image
                        src={commit.author.avatar_url}
                        alt={commit.author.login}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-xs">{commit.author.login}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-8">
              <button
                className="btn btn-outline btn-sm"
                onClick={handle_prev}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {page} of {total_pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={handle_next}
                disabled={page === total_pages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
} 