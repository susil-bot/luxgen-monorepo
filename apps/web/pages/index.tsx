import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGlobalContext } from '@luxgen/ui';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

interface HomeProps {
  tenant: string | null;
}

export default function Home({ tenant }: HomeProps) {
  const router = useRouter();
  const { isInitialized, currentTenant } = useGlobalContext();

  useEffect(() => {
    if (isInitialized && currentTenant && currentTenant !== 'demo') {
      router.push('/dashboard');
    }
  }, [isInitialized, currentTenant, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to LuxGen
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your multi-tenant learning management system
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50">
              Learn More
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const host = context.req.headers.host;
  const tenant = host?.split('.')[0] || null;

  return {
    props: {
      tenant,
    },
  };
};
