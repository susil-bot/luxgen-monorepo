import Image, { type ImageProps } from 'next/image';

const DEFAULT_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

/** next/image wrapper for page-level assets (UI-136). */
export function OptimizedImage({
  sizes = DEFAULT_SIZES,
  alt,
  ...props
}: ImageProps) {
  return <Image sizes={sizes} alt={alt} {...props} />;
}
