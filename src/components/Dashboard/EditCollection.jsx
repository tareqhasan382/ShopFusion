"use client"
import { BASEURL } from '@/app/(home)/page';
import React, { useEffect, useState } from 'react'
import Loader from '../Loader';
import axios from "axios";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const EditCollection = ({collectionId}) => {
    const [collections, setCollections] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [selectImage, setSelectImage] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    useEffect(() => {
        const getCollection = async () => {
          setLoading(true);
          try {
            const result = await fetch(
              `${BASEURL}/api/collection/${collectionId}`,
              {
                method: "GET",
                cache: "no-store",
              }
            );
            if (!result.ok) {
              throw new Error("Failed to update data");
            }
    
            const data = await result.json();
            setCollections(data?.data)
            setTitle(data?.data.title)
            setDescription(data?.data.description)
            
            setLoading(false);
          } catch (error) {
            setLoading(false);
            console.log(error);
          }
        };
        getCollection();
      }, [collectionId]);

//======= update collection==========
  
const handleImageUpload = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (!file) return;
    setSelectImage(file);
  };
  
    const handleTitle = (e) => {
      const value = e.target.value;
      setTitle(value);
      
    };
    const handleDesc = (e) => {
      const value = e.target.value;
      setDescription(value);
      
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      let response
      if(selectImage){
        const formData = new FormData();
      formData.append("file", selectImage);
      formData.append("upload_preset", "Reservation");
       response = await axios.post(
        "https://api.cloudinary.com/v1_1/dsybkyula/image/upload",
        formData
      );
      }
      const data = {
        image: response?.data?.secure_url,
        title: title,
        description: description,
      };
  
      try {
        const response = await fetch(`${BASEURL}/api/collection/${collectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
  
        if (response.ok) {
          setLoading(false);
          setDescription("");
          setTitle("");
          toast.success("Collection Updated Successfully");
          router.push("/admin/collections");
        } else {
          setLoading(false);
          toast.error("Collection Updated Failed");
        }
      } catch (error) {
        setLoading(false);
        toast.error("Collection Updated Failed");
      }
    }
  return (
    <div>
        {
            loading && <Loader/>
        }
        <div>
         <form onSubmit={handleSubmit} className=" flex flex-col ">
          <input
            className="lg:w-[1250px] w-full p-2 lg:text-4xl text-lg border-gray-300 border-b-[1px] outline-none focus:border-gray-600 text-black "
            type="text"
            id="title"
            name="title"
            value={title}
            placeholder="Title"
            onChange={handleTitle}
          />
          

          <textarea
          className="lg:w-[1250px] w-full h-44 p-2 text-lg border-gray-300 border-b-[1px] outline-none focus:border-gray-600 text-black "
          type="text"
            id="description"
            name="title"
            value={description}
            placeholder="Collection description"
            onChange={handleDesc}
         
        />
        
          
          
          <div className=" flex flex-col gap-5 my-3 cursor-pointer ">
           
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className=" flex items-center gap-8 py-4 ">
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
            <Image
            src={collections?.image}
            alt="img"
            height={50}
            width={50}
            className=" object-cover lg:w-44 w-full h-auto "
          />
        )}
      </div>
    </div>
    </div>
  )
}

export default EditCollection;