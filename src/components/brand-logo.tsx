/**
 * Qi Rising brand mark — a rising-leaf monoline glyph that inherits
 * `currentColor` so it renders crisply on brand tiles, headers and portals.
 * High-res SVG (vector) — no bitmap scaling blur.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5c4.1 0 7.4 3 7.4 8 0 4.1-2.8 8.5-6.5 10.4L12 21.7l-.9-.8C7.4 19 4.6 14.6 4.6 10.5c0-5 3.3-8 7.4-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.2v7.4M8.9 11l3.1 3.1 3.1-3.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}