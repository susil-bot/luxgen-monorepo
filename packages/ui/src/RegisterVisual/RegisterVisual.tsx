import React from 'react';
import { BaseComponentProps } from '../types';
import { withSSR } from '../ssr';

export interface RegisterVisualProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  testimonial?: {
    quote: string;
    author: string;
    stats: string;
  };
  className?: string;
}

const RegisterVisualComponent: React.FC<RegisterVisualProps> = ({
  title = "Join Our Community",
  subtitle = "Over 10,000+ successful placements",
  testimonial = {
    quote: "Join thousands of professionals who have found their dream careers through our platform. Start your journey today!",
    author: "Join Our Community",
    stats: "Over 10,000+ successful placements"
  },
  className = '',
  ...props
}) => {
  return (
    <div className={`register-visual ${className}`} {...props}>
      <div className="relative">
        {/* Abstract Graphic */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] mb-6 md:mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur-3xl"></div>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 relative">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-pulse"></div>
              {/* Middle ring */}
              <div 
                className="absolute inset-4 rounded-full border-2 border-green-300/50 animate-pulse" 
                style={{ animationDelay: '0.5s' }}
              ></div>
              {/* Inner ring */}
              <div 
                className="absolute inset-8 rounded-full border border-green-200/70 animate-pulse" 
                style={{ animationDelay: '1s' }}
              ></div>
              {/* Center dot */}
              <div className="absolute inset-1/2 w-4 h-4 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-green-300 rounded-full animate-bounce"
                  style={{
                    top: `${20 + (i * 10)}%`,
                    left: `${15 + (i * 8)}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s',
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-8 h-8 text-yellow-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.05c-3.481.881-6.006 3.789-6.006 7.559 0 2.5 1.5 4.5 3.5 4.5s3.5-2 3.5-4.5c0-3.77-2.525-6.678-6.006-7.559l.996-2.05c5.252 1.039 8.983 4.905 8.983 10.609v7.391h-9.017z"/>
              </svg>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
              "{testimonial.quote}"
            </p>
            <div>
              <p className="text-gray-900 font-semibold text-lg">{testimonial.author}</p>
              <p className="text-gray-600">{testimonial.stats}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RegisterVisual = withSSR(RegisterVisualComponent);
