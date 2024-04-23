"use client"
import { BASEURL } from "@/app/(home)/page";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from "react-toastify";

const CollectionForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [descriptionError, setDescError] = useState(false);
  const [selectImage, setSelectImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
const handleImageUpload = async (event) => {
  event.preventDefault();
  const file = event.target.files[0];
  if (!file) return;
  setSelectImage(file);
};

  const handleTitle = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (value.trim() === "") {
      setTitleError(true);
    }
  };
  const handleDesc = (e) => {
    const value = e.target.value;
    setDescription(value);
    if (value.trim() === "") {
        setDescError(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("selectImage:",selectImage)
    setLoading(true);
    if (!selectImage) {
      setLoading(false)
      toast.warning("Please select a Image to upload.", {
        position: "top-center", 
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", selectImage);
    formData.append("upload_preset", "Reservation");
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dsybkyula/image/upload",
      formData
    );
    const data = {
      image: response?.data?.secure_url,
      title: title,
      description: description,
    };

    try {
      if (title.trim() === "") {
        setTitleError(true);
        setLoading(false);
        return;
      } else {
        setTitleError(false);
      }
      if (description.trim() === "") {
        setDescError(true);
        setLoading(false);
        return;
      } else {
        setDescError(false);
      }
      // console.log("post data:", data);
      const response = await fetch(`${BASEURL}/api/collection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setLoading(false);
        setDescription("");
        setTitle("");
        toast.success("Collection Created Successfully");
        router.push("/admin/collections");
      } else {
        setLoading(false);
        toast.error("Collection Created Failed");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Collection Created Failed");
    }
  };
  return (
    <div>
         <form onSubmit={handleSubmit} className=" flex flex-col ">
          <input
            className=" my-3 lg:w-[1250px] w-full p-2 lg:text-4xl text-lg border-gray-300 border-[1px] rounded-md focus:border-gray-600 text-black "
            type="text"
            id="title"
            name="title"
            value={title}
            placeholder="Title"
            onChange={handleTitle}
          />
          {titleError && (
            <span className="text-sm text-red-500 ">
              Title field is required
            </span>
          )}

          <textarea
          className="lg:w-[1250px] w-full h-24 p-2 text-lg border-gray-300 border-[1px] rounded-md focus:border-gray-600 text-black "
          type="text"
            id="description"
            name="title"
            value={description}
            placeholder="Collection description"
            onChange={handleDesc}
         
        />
        {descriptionError && (
            <span className="text-sm text-red-500 ">
              Title field is required
            </span>
          )}
          
          
          <div className=" flex flex-col gap-5 my-3 cursor-pointer ">
           
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className=" flex items-center gap-8 ">
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading
                ? " cursor-not-allowed bg-blue-800 text-white font-semibold  rounded-lg px-4 py-2"
                : " bg-blue-600 text-white font-semibold  rounded-lg px-4 py-2"
            }`}
          >
            {loading ? "Loading" : "Submit"}
          </button>
          <Link href="/admin/collections">
          <button className=" bg-blue-800 text-white font-semibold  rounded-lg px-4 py-2 ">
            Discard
          </button>
        </Link>
          </div>
        </form>
        <div className=" w-full text-wrap flex flex-wrap gap-2 ">
        
        {selectImage ? (
          <Image
            src={URL.createObjectURL(selectImage)}
            alt="img"
            height={50}
            width={50}
            className=" object-fill lg:w-44 w-full h-auto "
          />
        ) : (
          <p className=" text-left ">Image upload preview will appear here!</p>
        )}
      </div>
    </div>
  )
}

export default CollectionForm;