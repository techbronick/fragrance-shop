import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  width,
  height,
  priority = false,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : '');
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before image comes into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  }, [imageError, fallbackSrc, onError]);

  // Optimize Unsplash URLs
  const getOptimizedSrc = (url: string) => {
    if (url.includes('unsplash.com')) {
      const baseUrl = url.split('?')[0];
      const params = new URLSearchParams();
      params.set('auto', 'format');
      params.set('fit', 'max'); // ✅ Schimbă din 'crop' în 'max'
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      params.set('q', '75');
      params.set('fm', 'webp');
      return `${baseUrl}?${params.toString()}`;
    }
    return url;
  };

  const optimizedSrc = imageSrc ? getOptimizedSrc(imageSrc) : '';

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {/* Loading placeholder */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Actual image */}
      {isInView && optimizedSrc && (
        <img
        src={optimizedSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-contain transition-opacity duration-300", // ✅ object-contain
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
      />
      )}
    </div>
  );
};

export default OptimizedImage; 