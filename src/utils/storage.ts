import { supabase } from "@/integrations/supabase/client";

export const BUCKETS = {
  PRODUCTS: 'product-images',
  DISCOVERY_SETS: 'discovery-set-images'
} as const;

/**
 * Upload an image to Supabase Storage
 */
export const uploadImage = async (
  bucket: string,
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;

    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Storage error:', err);
    return { url: null, error: 'Failed to upload image' };
  }
};

/**
 * Delete an image from Supabase Storage
 */
export const deleteImage = async (
  bucket: string,
  url: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/storage/v1/object/public/');
    if (pathParts.length < 2) {
      return { success: false, error: 'Invalid URL format' };
    }
    
    const [bucketName, ...filePathParts] = pathParts[1].split('/');
    const filePath = filePathParts.join('/');

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Delete error:', err);
    return { success: false, error: 'Failed to delete image' };
  }
};

/**
 * Upload product image
 */
export const uploadProductImage = async (file: File, productId: string) => {
  return uploadImage(BUCKETS.PRODUCTS, file, productId);
};

/**
 * Upload discovery set image
 */
export const uploadDiscoverySetImage = async (file: File, configId: string) => {
  return uploadImage(BUCKETS.DISCOVERY_SETS, file, configId);
};