import { useRef, useState } from "react";
import mediaService from "../api/mediaService";
import BUSINESS_CONFIG from "../config/businessConfig";
import { useLanguage } from "../context/LanguageContext";

export default function MediaUpload({
  label,
  accept = "image/*",
  multiple = false,
  dropzone = false,
  disabled = false,
  onUploaded,
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const displayLabel = label ?? t("common.upload", "Tải ảnh lên");

  async function change(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const maxSizeBytes = BUSINESS_CONFIG.UPLOAD.MAX_FILE_SIZE_BYTES;
    const oversized = files.find((f) => f.size > maxSizeBytes);
    if (oversized) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setError(`File "${oversized.name}" exceeds the maximum limit of ${maxMb}MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (multiple) {
        const uploaded = await mediaService.uploadMultiple(files);
        uploaded.forEach(onUploaded);
      } else {
        const uploaded = await mediaService.upload(files[0]);
        onUploaded(uploaded);
      }
    } catch (err) {
      setError(err.message || t("common.upload_error", "Không thể tải file lên."));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="text-xs">
      <label
        className={
          dropzone
            ? "flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/50 p-5 text-center font-semibold text-zinc-700 dark:text-zinc-300 transition hover:border-zinc-900 dark:hover:border-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800"
            : "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 font-semibold text-zinc-800 dark:text-zinc-200 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
        }
      >
        <span
          className={`material-symbols-outlined text-zinc-700 dark:text-zinc-300 ${
            dropzone ? "mb-1 text-3xl" : "text-base"
          }`}
        >
          cloud_upload
        </span>
        <span>{loading ? t("common.uploading", "Đang tải lên...") : displayLabel}</span>
        {dropzone && (
          <span className="mt-1 font-normal text-zinc-400 dark:text-zinc-500">
            {multiple ? t("common.choose_multiple_images", "Chọn một hoặc nhiều ảnh từ thiết bị") : t("common.choose_an_image", "Chọn một ảnh từ thiết bị")}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || loading}
          onChange={change}
          className="sr-only"
        />
      </label>
      {error && <p role="alert" className="mt-1 text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
