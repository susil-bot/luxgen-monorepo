import Head from 'next/head';
export function AdminPageMeta({ title }: { title: string }) {
  return (
    <Head>
      <title>{title} — LuxGen</title>
      <meta name="robots" content="noindex,nofollow" />
    </Head>
  );
}
