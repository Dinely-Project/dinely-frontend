import React, { useRef, useState } from 'react';
import ImagePreview from './ImagePreview';
import { validateImageFile } from '../api/imageUpload';

interface ImageUploadInputProps {
  value: string | null;
  onChange: (imageUrl: string) => void;
  onError: (error: string) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  label?: string;
  showPreview?: boolean;
}

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  onError,
  onUpload,
  disabled = false,
  label = 'Upload Image',
  showPreview = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError.message);
      return;
    }

    if (onUpload) {
      setIsUploading(true);
      setUploadProgress(0);
      onError('');

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const next = prev + Math.random() * 30;
            return next > 90 ? 90 : next;
          });
        }, 200);

        const imageUrl = await onUpload(file);
        clearInterval(progressInterval);
        setUploadProgress(100);

        onChange(imageUrl);
        setTimeout(() => {
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 500);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        onError(message);
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange('');
    onError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">
          {label}
        </label>
      )}

      {showPreview && value && (
        <div className="relative inline-block">
          <ImagePreview imageUrl={value} size="medium" />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
            className="absolute -right-2 -top-2 rounded-full bg-[#FF4C6A] p-1.5 text-white hover:bg-[#FF2E4E] disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      )}

      <div
        onClick={handleClick}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 transition ${
          disabled || isUploading
            ? 'cursor-not-allowed border-white/10 bg-white/2.5 opacity-50'
            : 'cursor-pointer border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[rgba(255,107,53,0.2)] border-t-[#FF6B35]" />
            <div className="text-center">
              <div className="text-sm font-semibold text-white">Uploading...</div>
              <div className="mt-1 text-xs text-muted">{Math.round(uploadProgress)}%</div>
            </div>
            <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#FF6B35] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl">📷</div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white">Click to upload</div>
              <div className="mt-1 text-xs text-muted">JPG, PNG or WebP • Max 5MB</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploadInput;
