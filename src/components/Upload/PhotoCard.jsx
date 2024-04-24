import Image from 'next/image';
import React from 'react'

const PhotoCard = ({url,onClick}) => {
  return (
    <div className=' flex flex-col items-center '>
        <div style={{border:"2px solid red",padding:5}}>
            <Image src={url} alt='Image' width={100} height={60} priority />
        </div>
        <button type='button' onClick={onClick} >Delete</button>
    </div>
  )
}

export default PhotoCard;