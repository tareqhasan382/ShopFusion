"use client";
import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
const SignInFrom = () => {
  const router = useRouter()
  const [loading,setLoading]=useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async(e) => {
 
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required`;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log("data:",formData);
      try {
        
       setLoading(true)
        const result = await signIn( "credentials",{email:formData.email, password:formData.password,redirect:false})
       // console.log("result:",result)
       setLoading(false)
       
         if(result.error){
          setLoading(false)
          toast.error("Invalid credentials")
         }
         if(result.ok){
          toast.success("User loggedIn successfully")
          setLoading(false)
          router.replace("/")
          
         }

       
       } catch (error) {
        setLoading(false)
         toast.error("User loggedIn occoer")
       }
    }
  };

  return (
    <div className=" flex flex-col items-center justify-center h-auto ">
      <div className=" my-10 ">
        <h1 className=" font-bold mb-4 text-center text-heading1-bold ">Sign In</h1>
        <form
          onSubmit={handleSubmit}
          className=" py-10 rounded-lg shadow-lg flex flex-col bg-gray-200 px-6 md:px-10 "
        >
          <div className=" flex flex-col ">
            <label className=" mb-2 ">Email</label>
            <input
              className=" p-2 border-gray-300 border-[1px] rounded-lg w-[300px] mb-4 outline-none focus:border-gray-600 text-black "
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className=" text-sm text-red-500 ">{errors.email}</span>
            )}
          </div>
          <div className=" flex flex-col ">
            <label className=" mb-2 ">Password</label>
            <input
              className=" p-2 border-gray-300 border-[1px] rounded-lg w-[300px] mb-4 outline-none focus:border-gray-600 text-black "
              type="text"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className=" text-sm text-red-500 ">{errors.password}</span>
            )}
          </div>

          <button
          disabled={loading}
            type="submit"
            className=" text-heading4-bold p-2 border rounded-lg bg-blue-500 text-white border-gray-300 mt-2 mb-4 focus:border-gray-600"
          >
            {loading?"Loading...":"Login"}
          </button>
          <span className=" text-right ">
          Don&rsquo;t have an account?
            <Link href="/sign-up" className=" underline text-blue-600 pl-2 ">
              Sign up
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}

export default SignInFrom;
