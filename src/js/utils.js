export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    timeZone: "UTC",
  })
}

export function sortByDate(articles) {
  return articles.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

/**
 * Returns a full URL path that respects the Astro base config.
 * Example: resolveHref("articles") -> "/blog/articles"
 */
export function resolveHref(href) {
  const base = import.meta.env.BASE_URL || '/';
  // Ensure exactly one slash between base and href
  return `${base.replace(/\/$/, '')}/${href.replace(/^\//, '')}`;
}

export function isCurrentPage(currentPath, href) {
  return currentPath.replace(/\/$/, '') === resolveHref(href).replace(/\/$/, '') ? 'page' : undefined;
}
