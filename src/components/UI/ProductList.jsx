import React from 'react'
import ProductCard from './ProductCard';

const ProductList = ({products}) => {
  //console.log("products:",products)
  return (
    <div className="flex flex-col items-center gap-10 py-8 px-5">
      <p className="text-heading1-bold">Products</p>
      {!products?.data || products?.data.length === 0 ? (
        <p className="text-body-bold">No products found</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-16">
          {products?.data.map((product) => (
            <ProductCard key={product._id} product={product}/>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductList;