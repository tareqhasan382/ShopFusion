"use client"
import React from 'react'
import { useFormStatus } from 'react-dom'
const ButtonSubmit = ({value,...props}) => {
    const { pending } = useFormStatus()
  return (
    <button disabled={pending} {...props} className=' px-3 py-2 rounded-md bg-black text-white '>
      {pending ? "Loading...":value}
    </button>
  )
}

export default ButtonSubmit;