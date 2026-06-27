import { GetServerSideProps } from 'next';

/** Legacy path — trainer landing lives under /store/mentors */
export default function MentorsLegacyRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/store/mentors', permanent: true },
});
