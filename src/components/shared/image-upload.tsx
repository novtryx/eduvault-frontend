'use client';

import * as React from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImageToImageKit, ImageUploadError } from '@/lib/imagekit-upload';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — generous for a logo, keeps pages fast
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string) => void;
  folder?: string;
  disabled?: boolean;
  label?: string;
}

// Uploads directly to ImageKit (see lib/imagekit-upload.ts) and hands
// back a plain URL string via onChange — the caller decides what to do
// with it (e.g. put it in a form field and PATCH the backend on save).
// This component never talks to our own backend; it only produces a URL.
export function ImageUpload({ value, onChange, folder, disabled, label = 'Upload image' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please choose a PNG, JPG, WEBP, or SVG image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Image is larger than 2MB. Please choose a smaller file.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImageToImageKit(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof ImageUploadError ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- external ImageKit URL, not a local asset */}
            <img src={value} alt="" className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted text-navy-300">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                label
              )}
            </Button>
            {value && !isUploading && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange('')}
                className="flex items-center gap-1 text-[12.5px] text-navy-400 hover:text-danger disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          <p className="text-[11.5px] text-navy-400">PNG, JPG, WEBP, or SVG — up to 2MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="sr-only"
      />
      {error && <p className="text-[12.5px] text-danger">{error}</p>}
    </div>
  );
}