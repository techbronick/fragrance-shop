import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToStorage, StorageBucket } from '@/utils/storage-upload';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: StorageBucket;
  label?: string;
  fileName?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  bucket,
  label = 'Image',
  fileName,
  className = ''
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes externally
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    const result = await uploadImageToStorage(file, bucket, fileName);

    if (result.error) {
      toast({
        title: 'Upload failed',
        description: result.error.message,
        variant: 'destructive'
      });
      setPreview(value || null);
    } else if (result.url) {
      onChange(result.url);
      toast({
        title: 'Upload successful',
        description: 'Image uploaded successfully'
      });
    }

    setUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      <div className="flex items-center gap-4">
        {/* Preview */}
        {preview ? (
          <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {preview ? 'Change Image' : 'Upload Image'}
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {preview && (
            <p className="text-xs text-muted-foreground">
              Click to change image
            </p>
          )}
        </div>
      </div>

      {/* URL Input (for manual entry or display) */}
      {preview && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Image URL</Label>
          <Input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreview(e.target.value);
            }}
            className="text-xs"
            placeholder="Or enter image URL manually"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
