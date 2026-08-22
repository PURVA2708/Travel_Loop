import { useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-ink">{label}</span>}

      {value ? (
        <div className="relative overflow-hidden rounded-2xl">
          <img src={value} alt="Trip cover" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-sm font-bold text-surface-white hover:bg-ink"
            aria-label="Remove cover photo"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 text-sm text-ink/50 hover:border-brand hover:text-ink disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Spinner className="h-6 w-6" />
              Uploading…
            </>
          ) : (
            <>
              <span className="text-2xl">📷</span>
              Click to upload a cover photo
            </>
          )}
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
