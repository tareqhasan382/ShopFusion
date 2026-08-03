"use client";
import { BASEURL } from "@lib/config";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { uploadPhoto } from "../../../actions/uploadActions";

const CollectionForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({ title: "", image: "" });
  const [selectImage, setSelectImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file.");
    }
    if (file.size >= 1024 * 1024) {
      return toast.error("Image must be smaller than 1MB.");
    }

    setSelectImage(file);
    setUploadedImage("");
    setErrors((prev) => ({ ...prev, image: "" }));

    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);
    const res = await uploadPhoto(formData);
    setUploading(false);

    if (res?.error) return toast.error(res.error);
    setUploadedImage(res?.data?.[0] || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = { title: "", image: "" };
    if (title.trim().length < 2)
      nextErrors.title = "Title must be at least 2 characters.";
    if (!uploadedImage && !selectImage) nextErrors.image = "Please upload an image.";
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return toast.error("Please fix the highlighted fields.");
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/api/collection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          title: title.trim(),
          description: description.trim(),
        }),
      });
      const payload = await response.json();
      if (response.ok) {
        toast.success("Collection created successfully.");
        router.push("/admin/collections");
      } else {
        toast.error(payload?.message || "Failed to create collection.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create collection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="input-label">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            placeholder="Collection title"
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="input-label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            placeholder="Short description for this collection"
            onChange={(e) => setDescription(e.target.value)}
            className="input-field h-24 resize-none"
          />
        </div>

        <div>
          <label className="input-label">Cover image</label>
          <div className="flex flex-wrap items-center gap-5">
            {(selectImage || uploadedImage) && (
              <Image
                src={
                  selectImage
                    ? URL.createObjectURL(selectImage)
                    : uploadedImage
                }
                alt="Collection preview"
                height={160}
                width={160}
                className="h-40 w-40 rounded-xl border border-slate-200 object-cover"
              />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  {uploadedImage ? "Replace image" : "Choose image"}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {errors.image && <p className="field-error mt-2">{errors.image}</p>}
        </div>

        <div className="flex items-center gap-4 border-t border-slate-200 pt-5">
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {loading ? "Creating..." : "Create collection"}
          </button>
          <Link href="/admin/collections" className="btn-secondary">
            Discard
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CollectionForm;
