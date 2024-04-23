import Link from "next/link";

export default function NotFound() {
  return (
    <div className=" flex flex-col w-screen h-screen items-center justify-center gap-3 ">
      <h2 className=" lg:text-4xl text-2xl font-semibold text-heading3-bold ">404 - Page Not Found</h2>
      <p className=" text-xl font-semibold ">
      The page you are looking for does not exist.
      </p>
      <Link href="/">
        <button className=" px-4 py-2 text-xl font-semibold bg-black text-white rounded ">
          Back Home
        </button>
      </Link>
    </div>
  );
}
