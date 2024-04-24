"use client"
import React, { useRef, useState } from 'react'
import PhotoCard from './PhotoCard';
import ButtonSubmit from './ButtonSubmit';
import { toast } from 'react-toastify';
import { uploadPhoto } from '../../../actions/uploadActions';

const UploadForm = ({setPhotos}) => {
    const formRef=useRef();
    const [files,setFiles]=useState([]);
    const handleInputFiles =async(event)=>{
        const files = event.target.files;
       // console.log("files:",files)
        const newFiles = [...files].filter(file=>{
            if(file.size < 1024*1024 && file.type.startsWith('image/') ){
                return file
            }
        })
        setFiles(prev=>[...newFiles,...prev])
      //  console.log("check file:",{files,newFiles})
    }
    const handleDeleteFiles =async(index)=>{
        const newFiles = files.filter((_,i)=>i !==index)
        setFiles(newFiles);
        formRef.current.reset();
       // console.log("index:",newFiles)
        
    }
    const handleUpload=async()=>{
        if(!files.length) return toast.warning("Please select Image")
       const formData = new FormData();
        
       files.forEach(file=>{
        formData.append('files',file)
       })
       const res = await uploadPhoto(formData)
       setPhotos(res?.data)
       
    }
  return (
    <div>
        {/* <h1>Upload Form</h1> */}
        <div>
            <form action={handleUpload} ref={formRef}>
                <div style={{background:"#ddd",minHeight:200,margin:"10px 0" , padding:10}} >
                    <input type="file" accept='image/*' multiple onChange={handleInputFiles} />
                    <h5 className=' text-rose-600 ' >(*) Only accept image files less than 1mb in size. Up to 3 photo files</h5>
                    {/* Preview Images */}
                    <div className=' flex flex-wrap gap-5 my-5 items-center '>
                        {files.map((file,index)=>(
                            <PhotoCard key={index} url={URL.createObjectURL(file)} onClick={()=>handleDeleteFiles(index)} />
                        ))}
                    </div>
                    
                </div>
                <ButtonSubmit value="Upload Image" />
            </form>
            
            {/* <button type='button' className=' px-3 py-2 rounded-md bg-black text-white ' >Upload Image</button> */}
        </div>
    </div>
  )
}

export default UploadForm;