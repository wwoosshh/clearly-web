import api from "./api";
import { unwrapResponse } from "./apiHelpers";

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  path: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "JPEG, PNG, WebP 형식만 지원됩니다.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "파일 크기는 10MB를 초과할 수 없습니다.";
  }
  return null;
}

export async function uploadImage(
  file: File,
  bucket: string = "chat",
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);

  const response = await api.post("/upload/file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return unwrapResponse<UploadResult>(response);
}

export async function uploadImages(
  files: File[],
  bucket: string = "chat",
  onProgress?: (percent: number) => void,
): Promise<UploadResult[]> {
  for (const file of files) {
    const error = validateImageFile(file);
    if (error) throw new Error(error);
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("bucket", bucket);

  const response = await api.post("/upload/files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  const inner = unwrapResponse<UploadResult[]>(response);
  return Array.isArray(inner) ? inner : [inner];
}
