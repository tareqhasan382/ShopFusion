"use client";
import Link from "next/link";
import { useRouter } from 'next/navigation'
import React, { useState } from "react";
import { toast } from "react-toastify";

const SignUpForm = () => {
  const router = useRouter()
 const [loading,setLoading]=useState(false)

  const [formData, setFormData] = useState({
    name: "",
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
    //  console.log("data:",formData);
      try {
         setLoading(true)
       const result= await fetch('api/signup',{
          method:"POST",
          headers:{"Content-Type":"application/json"},body:JSON.stringify(formData)
        })
       // console.log("result:",result)
       if(result.ok){
        setLoading(false)
        toast.success("User created successfully")
        router.push('/sign-in', { scroll: false })
       }else if(result.status===409){
        setLoading(false)
        toast.warning("User already exist")
       }else{
        setLoading(false)
        toast.error("User created failed")
       setFormData("")
       form.reset()
      }
      } catch (error) {
        setLoading(false)
        toast.error("User created failed")
      }
    }
  };
  return (
    <div className=" flex flex-col items-center justify-center h-auto ">
      <div className=" my-10 ">
        <h1 className=" text-heading1-bold font-bold mb-4 text-center ">Sign Up</h1>
        <form
          onSubmit={handleSubmit}
          className=" py-10 rounded-lg shadow-lg flex flex-col bg-gray-200 px-6 md:px-10 "
        >
          <div className=" flex flex-col ">
            <label className=" mb-2 ">Name</label>
            <input
              className=" p-2 border-gray-300 border-[1px] rounded-lg w-[300px] mb-4 outline-none focus:border-gray-600 text-black "
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className=" text-sm text-red-500 ">{errors.name}</span>
            )}
          </div>
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
           {loading? "Loading...":"Submit"} 
          </button>
          <span className=" text-right ">
            Already have an account ?
            <Link href="/sign-in" className=" text-blue-600 underline pl-2  ">
              Log in
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;
