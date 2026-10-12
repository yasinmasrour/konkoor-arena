import api from "./axios";

export interface UploadResponse {
  message: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
}

/**
 * آپلود تصویر کاور مقاله
 */
export const uploadBlogCover = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload/blog-cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

/**
 * آپلود تصویر داخل متن مقاله
 */
export const uploadBlogContent = async (
  file: File,
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload/blog-content", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

/**
 * آپلود عمومی
 */
export const uploadImage = async (
  file: File,
  folder = "uploads",
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await api.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
