import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

const Collections = async({collections}) => {
// console.log("collections:",collections)

  return (
    <div className="flex flex-col items-center gap-10 py-8 px-5">
      <p className="text-heading1-bold">Collections</p>
      {!collections?.data || collections?.data.length === 0 ? (
        <p className="text-body-bold">No collections found</p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-8">
          {collections?.data.map((collection) => (
            <div key={collection._id}>
              <Image
                key={collection._id}
                src={collection?.image}
                alt={collection.title}
                width={350}
                height={200}
                priority
                className="rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Collections;
// href={`/collections/${collection._id}`}