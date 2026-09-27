import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  currentImage: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  placeholderText?: string;
}

/**
 * Compresses an image file using an off-screen HTML5 Canvas.
 * Produces an optimized JPEG data URL (~30-60 KB) that fits effortlessly
 * into Firestore documents and persists in real-time across all devices.
 */
export async function compressImageFile(file: File, maxWidth = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageChange,
  label = 'Upload Image',
  placeholderText = 'Upload a photo from your device',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setIsUploading(true);
    try {
      const compressed = await compressImageFile(file);
      onImageChange(compressed);
    } catch (err: any) {
      console.error('Image compression error:', err);
      setErrorMsg(err.message || 'Could not process image');
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold uppercase text-[#3E2723]/70">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-[10px] text-[#E56B6B] hover:underline cursor-pointer"
        >
          {showUrlFallback ? '← Back to File Upload' : 'or paste URL'}
        </button>
      </div>

      {!showUrlFallback ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center gap-3 p-2.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            dragActive
              ? 'border-[#FF8A8A] bg-pink-50/50'
              : 'border-amber-900/15 bg-[#FFFBF5] hover:bg-amber-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileInputChange}
            className="hidden"
          />

          {/* Thumbnail preview */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-900/10 shrink-0 bg-amber-100 flex items-center justify-center">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <i className="fa-solid fa-image text-amber-900/30 text-lg"></i>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <i className="fa-solid fa-spinner fa-spin text-sm"></i>
              </div>
            )}
          </div>

          {/* Action text */}
          <div className="grow min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E2723]">
              <i className="fa-solid fa-cloud-arrow-up text-[#E56B6B]"></i>
              <span>{isUploading ? 'Compressing & uploading...' : 'Choose image to upload'}</span>
            </div>
            <p className="text-[10px] text-[#3E2723]/60 truncate">
              {currentImage?.startsWith('data:image')
                ? 'Custom image uploaded from device'
                : placeholderText}
            </p>
          </div>

          <button
            type="button"
            className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-900/15 shadow-2xs hover:bg-amber-50 text-[#3E2723] shrink-0"
          >
            Browse
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentImage}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="https://..."
            className="w-full p-2 border border-amber-900/15 rounded-xl text-xs bg-[#FFFBF5]"
          />
        </div>
      )}

      {errorMsg && (
        <p className="text-[10px] text-red-500 font-semibold">{errorMsg}</p>
      )}
    </div>
  );
};
