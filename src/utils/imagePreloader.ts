// Image preloader utility for critical images
class ImagePreloader {
  private cache = new Map<string, Promise<string>>();

  // Preload critical images
  preloadCriticalImages() {
    const criticalImages = [
      '/logo.png',
      '/Discoverybox.png',
      '/TomFord.webp',
      '/Lelabo.webp',
      '/Creed.webp',
      '/pdmarly.webp',
      '/Amouage.webp',
      '/Xerjoff.webp'
    ];

    criticalImages.forEach(src => this.preloadImage(src));
  }

  // Preload a single image
  preloadImage(src: string): Promise<string> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    const promise = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  // Preload images for a specific brand
  async preloadBrandImages(brandName: string) {
    const brandImages: Record<string, string> = {
      "Tom Ford": "/TomFord.webp",
      "Le Labo": "/Lelabo.webp", 
      "Creed": "/Creed.webp",
      "Parfums de Marly": "/pdmarly.webp",
      "Amouage": "/Amouage.webp",
      "Xerjoff": "/Xerjoff.webp",
      "Maison Francis Kurkdjian": "/MaisonFrancis.webp",
      "Initio Parfums": "/Initio.webp"
    };

    const imageSrc = brandImages[brandName];
    if (imageSrc) {
      try {
        await this.preloadImage(imageSrc);
      } catch (error) {
        console.warn(`Failed to preload brand image for ${brandName}:`, error);
      }
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get optimized Unsplash URL
  static getOptimizedUnsplashUrl(url: string, width?: number, height?: number): string {
    if (!url.includes('unsplash.com')) return url;
    
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    params.set('auto', 'format');
    params.set('fit', 'crop');
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', '75');
    params.set('fm', 'webp');
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Batch preload with concurrency limit
  async preloadBatch(urls: string[], concurrency = 3): Promise<void> {
    const chunks = [];
    for (let i = 0; i < urls.length; i += concurrency) {
      chunks.push(urls.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(url => this.preloadImage(url))
      );
    }
  }
}

export const imagePreloader = new ImagePreloader(); 