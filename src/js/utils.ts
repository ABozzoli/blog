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
 * Returns a generated unique id.
 *
 * Uses `crypto.randomUUID()` when available, otherwise falls back to a
 * random base-36 string.
 *
 * Example:
 * ```ts
 * createId() // "3e4f5g6h7"
 * ```
 *
 * @returns {string} A unique id string.
 */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 11);
}

/**
 * Returns an array of generated unique ids.
 *
 * Example:
 * ```ts
 * createIds(3) // ["abc123", "def456", "ghi789"]
 * ```
 *
 * @param {number} count - The number of ids to generate.
 * @returns {string[]} An array of unique id strings.
 */
export function createIds(count: number): string[] {
  return Array.from({ length: count }, () => createId());
}

/**
 * Joins multiple id strings into a space-separated string, filtering out
 * falsy values. Returns `undefined` if no valid ids are provided.
 *
 * Useful for building `aria-labelledby` or `aria-describedby` attribute values.
 *
 * Example:
 * ```ts
 * joinIds("id-1", "id-2", null) // "id-1 id-2"
 * joinIds(null, undefined)      // undefined
 * ```
 *
 * @param {...(string | false | null | undefined)} ids - The ids to join.
 * @returns {string | undefined} A space-separated string of ids, or `undefined`.
 */
export function joinIds(...ids: (string | false | null | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
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

/**
 * Returns `true` when both category lists contain the exact same values,
 * regardless of order.
 *
 * This is used by `fetchArticles()` when callers want exact category-set
 * matches to be prioritized ahead of partial matches.
 *
 * A sorted comparison keeps the logic explicit and avoids false positives when
 * duplicate category values are present.
 *
 * @param {CollectionEntry<"articles">["data"]["categories"]} categoriesSetA - First category list.
 * @param {CollectionEntry<"articles">["data"]["categories"]} categoriesSetB - Second category list.
 * @returns {boolean} `true` when both lists contain the same category values.
 */
function hasSameCategories(
  categoriesSetA: CollectionEntry<"articles">["data"]["categories"],
  categoriesSetB: CollectionEntry<"articles">["data"]["categories"],
): boolean {
  if (categoriesSetA.length !== categoriesSetB.length) return false;

  const sortedCategoriesSetA = [...categoriesSetA].sort();
  const sortedCategoriesSetB = [...categoriesSetB].sort();

  return sortedCategoriesSetA.every((category, index) => category === sortedCategoriesSetB[index]);
}

/**
 * Orders articles so exact category matches come first while preserving the
 * existing order within each group.
 *
 * @param {CollectionEntry<"articles">[]} articles - The articles to reorder.
 * @param {CollectionEntry<"articles">["data"]["categories"]} categories - The requested categories.
 * @returns {CollectionEntry<"articles">[]} Articles with exact category matches first.
 */
function prioritizeSameCategories(
  articles: CollectionEntry<"articles">[],
  categories: CollectionEntry<"articles">["data"]["categories"],
): CollectionEntry<"articles">[] {
  const exactMatches: CollectionEntry<"articles">[] = [];
  const otherMatches: CollectionEntry<"articles">[] = [];

  for (const article of articles) {
    if (hasSameCategories(article.data.categories, categories)) {
      exactMatches.push(article);
    } else otherMatches.push(article);
  }

  return [...exactMatches, ...otherMatches];
}

export type FetchArticlesOptions = {
  categories?: CollectionEntry<"articles">["data"]["categories"];
  titleToExclude?: string;
  limit?: number;
};

/**
 * Fetches articles from the Astro content collection using optional filters.
 *
 * Behavior summary:
 * - Excludes unpublished articles outside development.
 * - Filters by category overlap when `categories` is provided.
 * - Prioritizes exact category set matches when `categories` is provided.
 * - Excludes one article by exact title when `titleToExclude` is provided.
 * - Sorts results from newest to oldest.
 * - Applies `limit` after sorting.
 *
 * Example:
 * ```ts
 * const relatedArticles = await fetchArticles({
 *   categories: ["accessibility", "astro"],
 *   titleToExclude: "Accessible Tabs",
 *   limit: 3,
 * });
 * ```
 *
 * @param {FetchArticlesOptions} options - Optional article filters.
 * @returns {Promise<CollectionEntry<"articles">[]>} A filtered, date-sorted list of articles.
 */
export async function fetchArticles(options: FetchArticlesOptions = {}): Promise<CollectionEntry<"articles">[]> {
  const { categories, titleToExclude, limit } = options;

  const articles = await getCollection("articles", ({ data }) => {
    if (titleToExclude && data.title === titleToExclude) return false;
    if (!import.meta.env.DEV && !data.publishDate) return false;
    if (categories?.length && !categories.some((category) => data.categories.includes(category))) return false;
    return true;
  });

  let filteredArticles = sortByDate(articles);
  if (categories?.length) filteredArticles = prioritizeSameCategories(filteredArticles, categories);
  if (typeof limit === "number" && limit >= 0) filteredArticles = filteredArticles.slice(0, limit);
  return filteredArticles;
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
