"use client"
import React, { useState } from 'react'

const SelectTags = ({selectedTags, setSelectedTags}) => {
    // const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag) => {
    if (tag.trim() !== "") {
      setSelectedTags([...selectedTags, tag.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (index) => {
    const newTags = [...selectedTags];
    newTags.splice(index, 1);
    setSelectedTags(newTags);
  };
  return (
    <div>
      <div className="flex flex-col relative " >
       
       <input
         type="text"
         value={inputValue}
         onChange={(e) => setInputValue(e.target.value)}
         onKeyDown={(e) => {
           if (e.key === "Enter") {
             e.preventDefault();
             addTag(inputValue);
           }
         }}
         placeholder="Press Enter to add a tag"
         className=" my-3  p-2 lg:text-4xl text-lg border-gray-300 border-[1px] rounded-md  focus:border-gray-600 text-black"
       />
     </div>

     <div className="flex flex-wrap">
       {selectedTags.map((tag, index) => (
         <div
           key={index}
           className="bg-gray-200 px-2 py-1 mx-4 rounded-full mr-2 mt-2 cursor-pointer relative "
         >
           {tag}{" "}
           <span
             className=" font-semibold text-red-400 "
             onClick={() => removeTag(index)}
           >
             x
           </span>
         </div>
       ))}
     </div>
    </div>
  )
}

export default SelectTags