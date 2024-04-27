import Image from "next/image";
import Link from "next/link";
import HeartFavorite from "./HeartFavorite";

const ProductCard = ({ product }) => {
  
  // console.log("product:",product) <Link href={`/admin/products/${item._id}`}>
  return (
    <div className=" w-[235px] bg-slate-200 hover:bg-slate-300 p-2 rounded gap-4">
      <Link
        href={`/products/${product._id}`}
        className="w-[220px] flex flex-col gap-2"
      >
        <Image
          src={product?.media[0]}
          alt="product"
          width={450}
          height={300}
          priority
          className="h-[250px] rounded-lg object-cover"
        />
      </Link>
      <div className=" flex flex-col gap-1 py-2 ">
        <p className="text-base-bold">{product?.title}</p>
        <p className="text-small-medium text-grey-2">{product?.category}</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-body-bold">
          ${parseFloat(product?.price?.["$numberDecimal"] ?? 0).toFixed(2)}
        </p>
        <HeartFavorite product={product} />
      </div>
    </div>
  );
};

export default ProductCard;
