"use client";
import { BASEURL } from "@lib/config";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { uploadPhoto } from "../../../actions/uploadActions";

const EditCollection = ({ collectionId }) => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const [selectImage, setSelectImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const getCollection = async () => {
      try {
        const result = await fetch(`${BASEURL}/api/collection/${collectionId}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!result.ok) throw new Error("Failed to fetch data");
        const data = await result.json();
        setTitle(data?.data?.title || "");
        setDescription(data?.data?.description || "");
        setExistingImage(data?.data?.image || "");
      } catch (error) {
        console.log(error);
        toast.error("Failed to load collection.");
      } finally {
        setPageLoading(false);
      }
    };
    getCollection();
  }, [collectionId]);

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
    if (title.trim().length < 2) {
      return toast.error("Title must be at least 2 characters.");
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/api/collection/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage || existingImage,
          title: title.trim(),
          description: description.trim(),
        }),
      });
      const payload = await response.json();
      if (response.ok) {
        toast.success("Collection updated successfully.");
        router.push("/admin/collections");
      } else {
        toast.error(payload?.message || "Failed to update collection.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update collection.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
      </div>
    );
  }

  const previewUrl = selectImage
    ? URL.createObjectURL(selectImage)
    : uploadedImage || existingImage;

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
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="description" className="input-label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field h-24 resize-none"
          />
        </div>

        <div>
          <label className="input-label">Cover image</label>
          <div className="flex flex-wrap items-center gap-5">
            {previewUrl && (
              <Image
                src={previewUrl}
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
                  Replace image
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
        </div>

        <div className="flex items-center gap-4 border-t border-slate-200 pt-5">
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {loading ? "Saving..." : "Save changes"}
          </button>
          <Link href="/admin/collections" className="btn-secondary">
            Discard
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditCollection;
