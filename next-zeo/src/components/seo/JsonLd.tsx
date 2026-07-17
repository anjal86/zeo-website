interface JsonLdProps {
  data: unknown;
}

export const serializeJsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, '\\u003c');

export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
