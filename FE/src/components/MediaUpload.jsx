import { useRef, useState } from "react";
import mediaService from "../api/mediaService";

export default function MediaUpload({ label = "Upload image", accept = "image/*", multiple = false, dropzone = false, disabled = false, onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function change(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
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
      setError(err.message || "Unable to upload the file.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return <div className="text-xs">
    <label className={dropzone ? "flex w-full cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#9db5df] bg-[#f8faff] p-5 text-center font-semibold text-[#3a475a] transition hover:border-[#1d5fe5] hover:bg-[#eef4ff]" : "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#9db5df] bg-white px-3 py-2 font-semibold text-[#1d5fe5]"}>
      <span className={`material-symbols-outlined text-[#1d5fe5] ${dropzone ? "mb-1 text-3xl" : "text-base"}`}>cloud_upload</span>
      <span>{loading ? "Uploading..." : label}</span>
      {dropzone && <span className="mt-1 font-normal text-[#8996a9]">Choose {multiple ? "one or more images" : "an image"} from your device</span>}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} disabled={disabled || loading} onChange={change} className="sr-only" />
    </label>
    {error && <p role="alert" className="mt-1 text-red-600">{error}</p>}
  </div>;
}
