import React from "react";
import Image from "next/image";

const ImageList = [
  {
    id: 1,
    img: "/Shopping.png",
    title: "Upto 50% off on all Men's Wear",
    description:
      "lorem His Life will forever be Changed dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

const Hero = ({ handleOrderPopup }) => {
  var settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "ease-in-out",
    pauseOnHover: false,
    pauseOnFocus: true,
  };

  return (
    <div className="relative overflow-hidden min-h-[550px] sm:min-h-[650px] bg-gray-100 flex lg:justify-center lg:items-center dark:bg-gray-950 dark:text-white duration-200 ">
      {/* background pattern */}
      <div className="h-[700px] w-[700px] bg-primary/40 absolute -top-1/2 right-0 rounded-3xl rotate-45 -z[8]"></div>
      {/* hero section */}
      <div className="container pb-8 sm:pb-0 ">
        {ImageList.map((data) => (
          <div key={data.id}>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* text content section */}
              <div className=" lg:pl-5 flex flex-col justify-center gap-4 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1 relative z-10">
                <h1
                  
                  className=" text-body-bold lg:text-heading1-bold font-bold text-center  "
                >
                  {data.title}
                </h1>
                <p
                  className=" text-justify lg:pl-5 px-2 "
                >
                  {data.description}
                </p>
                <div
                  className=" flex flex-col items-center justify-center "
                >
                  <button
                    onClick={handleOrderPopup}
                    className="bg-gradient-to-r bg-black from-primary to-secondary hover:scale-105 duration-200 text-white py-2 px-4 rounded-full"
                  >
                    Order Now
                  </button>
                </div>
              </div>
              {/* image section */}
              <div className="order-1 sm:order-2">
                <div
                  
                >
                  <Image
                    src={data.img}
                    alt="banner"
                    width={2000}
                    height={1000}
                    className=" h-[300px] sm:h-[450px] w-full sm:scale-105 lg:scale-120 object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
