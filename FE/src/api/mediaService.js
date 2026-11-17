import mediaApi from "../services/api/mediaApi";

const mediaService = {
  upload: (file) => mediaApi.upload(file),
  uploadMultiple: (files) => mediaApi.uploadMultiple(files),
  uploadImage: (file) => mediaApi.upload(file),
  uploadImages: (files) => mediaApi.uploadMultiple(files),
};

export default mediaService;
