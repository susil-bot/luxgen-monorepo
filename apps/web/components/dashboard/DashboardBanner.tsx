import { useEffect, useState } from 'react';
import { OptimizedImage } from '../media/OptimizedImage';

export interface DashboardBannerItem {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText?: string;
}

interface DashboardBannerProps {
  banners: DashboardBannerItem[];
  autoPlay?: boolean;
  interval?: number;
}

/** Dashboard hero carousel using next/image (UI-137). */
export function DashboardBanner({ banners, autoPlay = true, interval = 5000 }: DashboardBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, banners.length]);

  if (!banners.length) return null;
  const current = banners[index];

  return (
    <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <OptimizedImage
            src={banner.image}
            alt={banner.title}
            fill
            priority={i === 0}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 text-white">
        <h2 className="text-3xl font-bold mb-2">{current.title}</h2>
        <p className="text-lg opacity-90 mb-4 max-w-2xl">{current.description}</p>
        {current.buttonText ? (
          <span className="inline-flex w-fit bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold">{current.buttonText}</span>
        ) : null}
      </div>
    </div>
  );
}
