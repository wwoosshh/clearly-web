"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadImage, validateImageFile, type UploadResult } from "@/lib/upload";

interface ImageUploadProps {
  maxFiles?: number;
  bucket?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

export function ImageUpload({
  maxFiles = 10,
  bucket = "chat",
  value,
  onChange,
  label = "사진 첨부",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        setError(`최대 ${maxFiles}개까지 업로드할 수 있습니다.`);
        return;
      }

      for (const file of acceptedFiles) {
        const err = validateImageFile(file);
        if (err) {
          setError(err);
          return;
        }
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        const urls: string[] = [];
        for (let i = 0; i < acceptedFiles.length; i++) {
          const result: UploadResult = await uploadImage(
            acceptedFiles[i],
            bucket,
            (p) => {
              const overall = Math.round(
                ((i * 100 + p) / acceptedFiles.length)
              );
              setProgress(overall);
            },
          );
          urls.push(result.url);
        }
        onChange([...value, ...urls]);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "업로드에 실패했습니다.");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [value, onChange, maxFiles, bucket],
  );

  const removeImage = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    disabled: uploading || value.length >= maxFiles,
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} ({value.length}/{maxFiles})
      </label>

      {/* 이미지 미리보기 그리드 */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative aspect-square group">
              <img
                src={url}
                alt={`첨부 이미지 ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 드롭존 */}
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">업로드 중...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-sm text-blue-500">이미지를 여기에 놓으세요</p>
          ) : (
            <p className="text-sm text-gray-500">
              클릭하거나 이미지를 드래그하여 업로드
              <br />
              <span className="text-xs text-gray-400">
                JPEG, PNG, WebP (최대 10MB)
              </span>
            </p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
