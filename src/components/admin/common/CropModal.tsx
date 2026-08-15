'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

export type FillMode = 'white' | 'edge' | 'average' | string; // string = manual '#rrggbb'

export interface CropResult {
  area: Area;
  fitMode: 'cover' | 'contain';
  fillMode?: FillMode;
}

interface CropModalProps {
  imageUrl: string;
  aspectRatio?: number;
  onConfirm: (result: CropResult) => void;
  onCancel: () => void;
}

const FILL_MODE_OPTIONS: { value: FillMode; label: string }[] = [
  { value: 'white', label: '預設白色' },
  { value: 'edge', label: '邊緣像素平均' },
  { value: 'average', label: '整張圖平均色' },
];

export default function CropModal({
  imageUrl,
  aspectRatio,
  onConfirm,
  onCancel,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  // 不裁切、置中補色：整張圖用 fit:'contain' 塞進目標尺寸，避免拍照長寬比
  // 跟目標不符時（例如相機拍 16:9）用 fit:'cover' 裁到商品本體
  const [noCrop, setNoCrop] = useState(false);
  const [fillMode, setFillMode] = useState<FillMode>('white');
  const [manualColor, setManualColor] = useState('#ffffff');

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  function handleConfirm() {
    if (!croppedAreaPixels) return;
    onConfirm({
      area: croppedAreaPixels,
      fitMode: noCrop ? 'contain' : 'cover',
      fillMode: noCrop ? (fillMode === 'manual' ? manualColor : fillMode) : undefined,
    });
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
            aspect={noCrop ? undefined : aspectRatio}
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

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={noCrop}
                onChange={(e) => setNoCrop(e.target.checked)}
              />
              不裁切，改用置中補色（適合長寬比跟目標不符的照片，避免裁到商品本體）
            </label>

            {noCrop && (
              <div className="mt-3 flex flex-wrap items-center gap-3 pl-6">
                <span className="text-sm text-gray-600">補色方式</span>
                {FILL_MODE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="fillMode"
                      value={opt.value}
                      checked={fillMode === opt.value}
                      onChange={() => setFillMode(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
                <label className="flex items-center gap-1 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="fillMode"
                    value="manual"
                    checked={fillMode === 'manual'}
                    onChange={() => setFillMode('manual')}
                  />
                  手動輸入
                </label>
                {fillMode === 'manual' && (
                  <input
                    type="color"
                    value={manualColor}
                    onChange={(e) => setManualColor(e.target.value)}
                    className="h-7 w-10 cursor-pointer rounded border border-gray-300"
                  />
                )}
              </div>
            )}
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
