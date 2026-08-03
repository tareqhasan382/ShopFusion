"use client";
import { useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import { uploadPhoto } from "../../../actions/uploadActions";

const UploadForm = ({ setPhotos }) => {
  const formRef = useRef();
  const inputRef = useRef();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleInputFiles = async (event) => {
    const incoming = [...event.target.files];
    const newFiles = incoming.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image.`);
        return false;
      }
      if (file.size >= 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 1MB limit.`);
        return false;
      }
      return true;
    });

    if (files.length + newFiles.length > 3) {
      toast.warning("You can upload a maximum of 3 images.");
      return;
    }

    setFiles((prev) => [...newFiles, ...prev]);
  };

  const handleDeleteFiles = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length) return toast.warning("Please select at least one image.");

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await uploadPhoto(formData);
    setUploading(false);

    if (res?.error) return toast.error(res.error);
    setPhotos(res?.data);
    toast.success("Images uploaded successfully.");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="mb-1 font-semibold text-slate-900">Product images</p>
      <p className="mb-4 text-sm text-slate-500">
        Up to 3 images, each under 1MB (JPG, PNG or WEBP).
      </p>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputFiles}
        ref={inputRef}
        className="hidden"
      />

      <div className="flex flex-wrap gap-4">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative h-28 w-28 overflow-hidden rounded-xl border border-slate-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDeleteFiles(index)}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-rose-600"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {files.length < 3 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-indigo-400 hover:text-indigo-500"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">Add image</span>
          </button>
        )}
      </div>

      {files.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="btn-secondary mt-5 inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload images"}
        </button>
      )}
    </div>
  );
};

export default UploadForm;
