import { supabase } from '@/integrations/supabase/client';

export type StorageBucket = 'product-images' | 'discovery-sets-images' | 'brand-images';

export interface UploadResult {
  url: string | null;
  error: Error | null;
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name
 * @param fileName - Optional custom file name (without extension). If not provided, generates a unique name
 * @returns The public URL of the uploaded image
 */
export const uploadImageToStorage = async (
  file: File,
  bucket: StorageBucket,
  fileName?: string
): Promise<UploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        url: null,
        error: new Error('File must be an image')
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        url: null,
        error: new Error('Image size must be less than 5MB')
      };
    }

    // Generate file name
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
    
    // For brand-images bucket, use the fileName directly as-is (for consistent naming)
    // For other buckets, add timestamp and random string for uniqueness
    let finalFileName: string;
    if (bucket === 'brand-images' && fileName) {
      // Ensure .webp extension for brand images
      finalFileName = `${fileName}.webp`;
    } else {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      finalFileName = fileName 
        ? `${fileName}-${timestamp}-${randomString}.${fileExt}`
        : `${timestamp}-${randomString}.${fileExt}`;
    }

    // Upload file to storage
    // Note: Now uses RLS - only admins can upload (via Storage policies)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: bucket === 'brand-images' // Allow overwriting for brand images
      });

    if (error) {
      return {
        url: null,
        error: new Error(`Upload failed: ${error.message}`)
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      error: null
    };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error : new Error('Unknown upload error')
    };
  }
};

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name
 */
export const deleteImageFromStorage = async (
  url: string,
  bucket: StorageBucket
): Promise<{ error: Error | null }> => {
  try {
    // Extract file path from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];

    // Note: Now uses RLS - only admins can delete (via Storage policies)
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    return { error: error ? new Error(error.message) : null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown delete error')
    };
  }
};
