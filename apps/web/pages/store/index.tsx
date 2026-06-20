import { GetServerSideProps } from 'next';

export default function StoreIndexRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/store/product', permanent: false },
});
