import { CiFacebook, CiInstagram, CiLinkedin, CiTwitter } from "react-icons/ci";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div>
      <div className="max-w-[1640px] h-full bottom-0 min-h-full m-auto pt-12 lg:px-20">
        <footer className=" text-white  px-8 items-center justify-center ">
          <div className=" w-full ">
            <div className="flex flex-wrap items-center justify-center text-center gap-10 ">
              <div className=" w-[340px] ">
                <h1 className=" gradient-text text-transparent text-heading3-bold py-5 ">
                  ShopFusion
                </h1>
                <div className="flex justify-center space-x-4">
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum
                    in beatae ea recusandae blanditiis veritatis.
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">Developers</h2>
                <div className="flex justify-center space-x-4">
                  <p>Getting Started</p>
                  <p>Community</p>
                  <p>FAQ</p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">Contact Us</h2>
                <div className="flex justify-center space-x-4">
                  <CiFacebook size={30} className=" hover:cursor-pointer " />
                  <CiLinkedin size={30} className=" hover:cursor-pointer " />
                  <CiTwitter size={30} className=" hover:cursor-pointer " />
                  <CiInstagram size={30} className=" hover:cursor-pointer " />
                </div>
              </div>
            </div>
          </div>
        </footer>
        <div className=" flex flex-row items-center justify-center py-10  ">
          <span className=" px-1 ">Copyright &copy; {currentYear} ||</span>
          <span>Developed by Tareq</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
