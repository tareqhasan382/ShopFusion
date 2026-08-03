"use client";
import Image from "next/image";
import { useState } from "react";

const Gallery = ({ productMedia }) => {
  const [mainImage, setMainImage] = useState(productMedia?.[0] || "/placeholder.svg");

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <Image
          src={mainImage}
          width={500}
          height={500}
          alt="Product"
          priority
          className="aspect-square w-full max-w-[500px] object-cover"
        />
      </div>
      {productMedia?.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {productMedia.map((image, index) => (
            <button
              key={index}
              onClick={() => setMainImage(image)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                mainImage === image
                  ? "border-indigo-600"
                  : "border-transparent hover:border-slate-300"
              }`}
            >
              <Image
                src={image}
                height={200}
                width={200}
                alt="Product thumbnail"
                className="h-20 w-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
