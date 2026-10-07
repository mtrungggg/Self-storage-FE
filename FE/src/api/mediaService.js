import apiClient from "./apiClient";

const mediaService = {
  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response?.success !== true) throw new Error(response?.message || "Unable to upload the file.");
    if (!response.data?.url) throw new Error("The server did not return the uploaded file URL.");
    return response.data;
  },

  async uploadMultiple(files) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await apiClient.post("/media/upload-multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response?.success !== true) throw new Error(response?.message || "Unable to upload the files.");
    if (!Array.isArray(response.data) || response.data.some((file) => !file?.url)) {
      throw new Error("The server returned an invalid uploaded file list.");
    }
    return response.data;
  },
};

export default mediaService;
