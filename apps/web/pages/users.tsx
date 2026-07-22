import { GetServerSideProps } from 'next';

/** @deprecated Use /organization/users */
export default function UsersRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/organization/users', permanent: false },
});
