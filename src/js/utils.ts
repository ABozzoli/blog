/**
 * Converts a string into a URL-friendly slug.
 *
 * Example:
 * ```ts
 * slugify("Hello World!") // "hello-world"
 * ```
 *
 * @param {string} text - The input string to slugify.
 * @returns {string} The slugified version of the input string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Formats a date into a locale date string (UTC timezone).
 *
 * Example:
 * ```ts
 * formatDate("2025-10-08") // "October 8, 2025"
 * ```
 *
 * @param {string | number | Date | null} date - The date to format.
 * @returns {string} The formatted date string.
 */
export function formatDate(date: string | number | Date | null): string {
  const options = { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" } as Intl.DateTimeFormatOptions;

  return date ? new Date(date).toLocaleDateString("en-US", options) : "N/D";
}

import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

/**
 * Sorts an array of Astro content articles from newest to oldest.
 *
 * @param {CollectionEntry<"articles">[]} articles - The list of articles to sort.
 * @returns {CollectionEntry<"articles">[]} A new array sorted by date (descending).
 */
export function sortByDate(articles: CollectionEntry<"articles">[]): CollectionEntry<"articles">[] {
  return [...articles].sort(
    (a, b) => new Date(b.data.publishDate ?? "").getTime() - new Date(a.data.publishDate ?? "").getTime(),
  );
}

/** Options: filter by categories, exclude title, limit results, only published by default. */
export type FetchArticlesOptions = {
  categories?: CollectionEntry<"articles">["data"]["categories"];
  excludeTitle?: string;
  limit?: number;
};

/** Fetch articles with basic filters and newest-first sorting. */
export async function fetchArticles(options: FetchArticlesOptions = {}): Promise<CollectionEntry<"articles">[]> {
  const { categories, excludeTitle, limit } = options;

  const entries = await getCollection("articles", ({ data }) => {
    if (!import.meta.env.DEV && !data.publishDate) return false;
    if (categories?.length && !categories.some((category) => data.categories.includes(category))) return false;
    if (excludeTitle && data.title === excludeTitle) return false;
    return true;
  });

  let result = sortByDate(entries);
  if (limit && limit >= 0) result = result.slice(0, limit);
  return result;
}

/**
 * Returns a full URL path that respects the Astro base configuration.
 *
 * Example:
 * ```ts
 * resolveHref("articles") // "/blog/articles"
 * ```
 *
 * @param {string} href - The relative path to resolve.
 * @returns {string} The resolved full URL path.
 */
export function resolveHref(href: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${href.replace(/^\//, "")}`;
}

/**
 * Checks whether the provided `href` matches the current page path.
 * Returns `"page"` if it matches, otherwise `undefined`.
 *
 * Example:
 * ```ts
 * isCurrentPage("/blog/articles", "articles") // "page"
 * ```
 *
 * @param {string} currentPath - The current page path.
 * @param {string} href - The href to compare.
 * @returns {"page" | undefined} Returns `"page"` if it's the current page, otherwise `undefined`.
 */
export function isCurrentPage(currentPath: string, href: string): "page" | undefined {
  return currentPath.replace(/\/$/, "") === resolveHref(href).replace(/\/$/, "") ? "page" : undefined;
}
