import Image from "next/image";

const PhotoCard = ({ url, onClick }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="overflow-hidden rounded-lg border-2 border-indigo-200 p-1">
        <Image
          src={url}
          alt="Selected image"
          width={100}
          height={60}
          priority
          className="object-cover"
        />
      </div>
      <button
        type="button"
        onClick={onClick}
        className="text-xs font-medium text-rose-600 hover:text-rose-700"
      >
        Delete
      </button>
    </div>
  );
};

export default PhotoCard;
