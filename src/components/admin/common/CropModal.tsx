'use client';

import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  // Locked-aspect mode (react-easy-crop: pan + zoom, fixed-ratio frame)
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 不裁切、置中補色：整張圖用 fit:'contain' 塞進目標尺寸，避免拍照長寬比
  // 跟目標不符時（例如相機拍 16:9）用 fit:'cover' 裁到商品本體。react-easy-crop
  // 的裁切框只能縮放/平移，沒辦法拖曳邊角自由改變比例，所以這個模式改用
  // react-image-crop（真正的自由拖曳裁切框）。
  const [noCrop, setNoCrop] = useState(false);
  const [freeCrop, setFreeCrop] = useState<Crop>();
  const [freeCropPixels, setFreeCropPixels] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [fillMode, setFillMode] = useState<FillMode>('white');
  const [manualColor, setManualColor] = useState('#ffffff');

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    // Start from a 90%-centered box with the image's own aspect ratio so
    // there's something visible to drag right away, but nothing constrains
    // the user from resizing it to any shape afterward.
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, width / height, width, height),
      width,
      height,
    );
    setFreeCrop(initial);
  }

  function handleConfirm() {
    if (noCrop) {
      if (!freeCropPixels || !imgRef.current) return;
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      onConfirm({
        area: {
          x: freeCropPixels.x * scaleX,
          y: freeCropPixels.y * scaleY,
          width: freeCropPixels.width * scaleX,
          height: freeCropPixels.height * scaleY,
        },
        fitMode: 'contain',
        fillMode: fillMode === 'manual' ? manualColor : fillMode,
      });
      return;
    }

    if (!croppedAreaPixels) return;
    onConfirm({ area: croppedAreaPixels, fitMode: 'cover' });
  }

  const canConfirm = noCrop ? !!freeCropPixels : !!croppedAreaPixels;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex h-[90vh] w-[90vw] max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        {/* Crop area */}
        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-900">
          {noCrop ? (
            <ReactCrop
              crop={freeCrop}
              onChange={(_, percentCrop) => setFreeCrop(percentCrop)}
              onComplete={(pixelCrop) => setFreeCropPixels(pixelCrop)}
              ruleOfThirds
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt="裁切預覽"
                onLoad={onImageLoad}
                className="max-h-[70vh] max-w-full"
              />
            </ReactCrop>
          ) : (
            <div className="absolute inset-0">
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
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-gray-200 px-6 py-4">
          {!noCrop && (
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
          )}

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={noCrop}
                onChange={(e) => setNoCrop(e.target.checked)}
              />
              不裁切，改用置中補色（適合長寬比跟目標不符的照片，避免裁到商品本體。可自由拖曳裁切框，不限比例）
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
              disabled={!canConfirm}
              className="rounded-md bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              確認裁剪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
