/**
 * Renders structured data as a `<script type="application/ld+json">` tag.
 * Pattern: a server component that outputs no visible UI. `<` is escaped so text
 * inside the data (a post title, say) can never close the script tag early.
 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
