'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface CropModalProps {
  imageUrl: string;
  aspectRatio?: number;
  onConfirm: (croppedAreaPixels: Area) => void;
  onCancel: () => void;
}

export default function CropModal({
  imageUrl,
  aspectRatio,
  onConfirm,
  onCancel,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  function handleConfirm() {
    if (croppedAreaPixels) {
      onConfirm(croppedAreaPixels);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex h-[90vh] w-[90vw] max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        {/* Crop area */}
        <div className="relative flex-1">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm text-gray-600">縮放</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800"
            >
              確認裁剪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
