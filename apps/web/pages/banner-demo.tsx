import { useState } from 'react';
import Head from 'next/head';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo, TenantDebug, BannerCarousel, Arrow } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';

interface BannerDemoProps {
  tenant: string;
}

export default function BannerDemo({ tenant }: BannerDemoProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      id: '1',
      title: 'Enjoy free home lessons this summer',
      subtitle: 'Designer Dresses - Pick from trendy Designer Course',
      date: 'September 12-22',
      ctaText: 'Get Started',
      ctaHref: '/courses',
      backgroundColor: '#4A70F7',
      ctaColor: '#F78C4A'
    },
    {
      id: '2',
      title: 'Master React Development',
      description: 'Learn modern React patterns and best practices with our comprehensive course',
      ctaText: 'Enroll Now',
      ctaHref: '/courses/react',
      backgroundColor: '#10B981',
      ctaColor: '#F59E0B'
    },
    {
      id: '3',
      title: 'TypeScript Fundamentals',
      description: 'Build type-safe applications with TypeScript',
      date: 'Starting January 15',
      ctaText: 'Learn More',
      ctaHref: '/courses/typescript',
      backgroundColor: '#8B5CF6',
      ctaColor: '#EC4899'
    }
  ];

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    console.log('Slide changed to:', index);
  };

  const handleCtaClick = (slide: any) => {
    console.log('CTA clicked for slide:', slide.title);
  };

  return (
    <>
      <Head>
        <title>Banner Demo - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>
      
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        logo={getDefaultLogo()}
        onUserAction={(action) => {
          switch (action) {
            case 'profile':
              console.log('Navigate to profile');
              break;
            case 'settings':
              console.log('Navigate to settings');
              break;
            case 'logout':
              console.log('Logout');
              break;
          }
        }}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <TenantBanner tenant={tenant} />
        
        <div className="mt-6 space-y-8">
          {/* Banner Carousel Demo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Banner Carousel Demo</h2>
            <p className="text-gray-600 mb-6">
              Interactive banner carousel with auto-play, navigation controls, and customizable slides.
            </p>
            
            <BannerCarousel
              slides={bannerSlides}
              autoPlay={true}
              autoPlayInterval={5000}
              showArrows={true}
              showDots={true}
              onSlideChange={handleSlideChange}
              onCtaClick={handleCtaClick}
              className="mb-6"
            />
            
            <div className="text-sm text-gray-500">
              Current slide: {currentSlide + 1} of {bannerSlides.length}
            </div>
          </div>

          {/* Arrow Component Demo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Arrow Component Demo</h2>
            <p className="text-gray-600 mb-6">
              Versatile arrow component for navigation controls.
            </p>
            
            <div className="space-y-6">
              {/* Direction Examples */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Directions</h3>
                <div className="flex items-center space-x-4">
                  <Arrow direction="left" onClick={() => console.log('Left clicked')} />
                  <Arrow direction="right" onClick={() => console.log('Right clicked')} />
                  <Arrow direction="up" onClick={() => console.log('Up clicked')} />
                  <Arrow direction="down" onClick={() => console.log('Down clicked')} />
                </div>
              </div>

              {/* Size Examples */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sizes</h3>
                <div className="flex items-center space-x-4">
                  <Arrow direction="right" size="small" onClick={() => console.log('Small clicked')} />
                  <Arrow direction="right" size="medium" onClick={() => console.log('Medium clicked')} />
                  <Arrow direction="right" size="large" onClick={() => console.log('Large clicked')} />
                </div>
              </div>

              {/* Variant Examples */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Variants</h3>
                <div className="flex items-center space-x-4">
                  <Arrow direction="right" variant="default" onClick={() => console.log('Default clicked')} />
                  <Arrow direction="right" variant="outline" onClick={() => console.log('Outline clicked')} />
                  <Arrow direction="right" variant="ghost" onClick={() => console.log('Ghost clicked')} />
                </div>
              </div>

              {/* Disabled State */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">States</h3>
                <div className="flex items-center space-x-4">
                  <Arrow direction="right" onClick={() => console.log('Enabled clicked')} />
                  <Arrow direction="right" disabled onClick={() => console.log('Disabled clicked')} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <TenantDebug />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (context: any) => {
  const host = context.req.headers.host;
  let tenant = 'demo'; // Default tenant
  
  // Extract tenant from subdomain
  if (host && host.includes('.')) {
    const parts = host.split('.');
    if (parts.length > 1) {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
        tenant = subdomain;
      }
    }
  }
  
  // Check query parameter as fallback
  if (context.query.tenant) {
    tenant = context.query.tenant;
  }
  
  return {
    props: {
      tenant
    }
  };
};
