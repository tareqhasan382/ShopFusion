"use client"

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { navLinks } from "../../../lib/constants";


const TopBar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-20 w-full flex justify-between items-center px-8 py-4 bg-blue-2 shadow-xl lg:hidden">
     <h1 className=' gradient-text text-transparent text-heading4-bold '>ShopFusion</h1>
      <div className="flex gap-4 max-md:hidden">
        {navLinks.map((link) => (
          <Link
            href={link.url}
            key={link.label}
            className={`flex gap-4 text-body-medium ${pathname === link.url ? "text-blue-1" : "text-black"}`}
          >
            <p>{link.label}</p>
          </Link>
        ))}
      </div>

      <div className="relative flex gap-4 items-center">
        <Menu
          className="cursor-pointer md:hidden"
          onClick={() => setDropdownMenu(!dropdownMenu)}
        />
        {dropdownMenu && (
          <div className="absolute top-10 right-4 flex flex-col gap-8 p-4 bg-white shadow-xl rounded-lg">
            {navLinks.map((link) => (
              <Link
                href={link.url}
                key={link.label}
                className="flex gap-4 text-body-medium"
              >
                {link.icon} <p>{link.label}</p>
              </Link>
            ))}
          </div>
        )}
        {/* <UserButton /> */}
        <p>Edit Profile</p>
      </div>
    </div>
  );
};

export default TopBar;