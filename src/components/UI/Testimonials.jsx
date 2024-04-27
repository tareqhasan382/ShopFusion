import Image from "next/image";
import React from "react";

const TestimonialData = [
  {
    id: 1,
    name: "Victor",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
    img: "https://picsum.photos/101/101",
  },
  {
    id: 2,
    name: "Satya Nadella",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
    img: "https://picsum.photos/102/102",
  },
  {
    id: 3,
    name: "Virat Kohli",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
    img: "https://picsum.photos/104/104",
  },
  
];

const Testimonials = () => {
  var settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
    pauseOnHover: true,
    pauseOnFocus: true,
    responsive: [
      {
        breakpoint: 10000,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="py-10 mb-10">
      <div className="container">
        {/* header section */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p  className="text-sm text-primary">
            What our customers are saying
          </p>
          <h1  className="text-heading1-bold">
            Testimonials
          </h1>
          <p  className="text-xs text-gray-400">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sit
            asperiores modi Sit asperiores modi
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-center items-center justify-center lg:px-10 ">
  {TestimonialData.map((data) => (
    <div key={data.id} className="my-6  ">
      <div className="flex flex-col gap-2 shadow-lg py-8 px-6 mx-4 rounded-xl bg-rose-100 relative">
        <div className="mb-4">
          <Image
            src={data.img}
            alt="image"
            height={100}
            width={100}
            className="rounded-full w-20 h-20"
          />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="space-y-3">
            <p className="text-xs text-gray-500">{data.text}</p>
            <h1 className="text-xl font-bold text-black/80 dark:text-light">
              {data.name}
            </h1>
          </div>
        </div>
        <p className="text-gray-500 text-[95px] font-extrabold font-serif absolute top-0 right-4">,,</p>
      </div>
    </div>
  ))}
</div>

      </div>
    </div>
  );
};

export default Testimonials;