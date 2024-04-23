"use client"
import { useRouter } from 'next/navigation';
import React from 'react';

const Pagination = ({page,hasPrev,hasNext}) => {

    const router = useRouter();

  return (
    <div className=" flex flex-row justify-end items-end my-4 gap-6 pr-6 ">
    <button disabled={!hasPrev} onClick={()=>router.push(`?page=${page-1}`)} className={`${!hasPrev && " cursor-not-allowed bg-opacity-45 " } w-24 h-10 bg-gray-900  text-white`}>
      Previous
    </button>
    <button disabled={!hasNext} onClick={()=>router.push(`?page=${page+1}`)} className={`${!hasNext && " cursor-not-allowed bg-opacity-45 " } w-24 h-10 bg-gray-900  text-white`}>
      Next
    </button>
  </div>
  );
}

export default Pagination;
