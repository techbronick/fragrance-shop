// scripts/storage-upload.mjs
//
// Uploads a buffer to the product-images Supabase bucket and returns the
// public URL. Requires the service-role key so RLS doesn't block the
// upload — anon key is insufficient.

import { createClient } from '@supabase/supabase-js';

export function createUploader() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('VITE_SUPABASE_URL missing');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing — anon key cannot write storage');
  const client = createClient(url, key);

  return async function upload(productId, buffer) {
    const path = `${productId}.webp`;
    const { error } = await client.storage
      .from('product-images')
      .upload(path, buffer, { contentType: 'image/webp', upsert: true });
    if (error) throw new Error(`upload failed for ${productId}: ${error.message}`);
    const { data } = client.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };
}
