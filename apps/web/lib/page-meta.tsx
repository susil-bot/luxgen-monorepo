import Head from 'next/head';

export function PageMeta({
  title,
  description,
  ogImage,
  canonical,
}: {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}) {
  const full = title.includes('LuxGen') ? title : `${title} — LuxGen`;
  return (
    <Head>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={full} />
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  );
}
