import React from "react";
import logo from "../assets/logo3.png";
import authIllustration from "../assets/2.jpeg";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LEFT SIDE */}
      <div className="flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">

          {/* LOGO + TAGLINE */}
          <div className="mb-8">
            <img
              src={logo}
              alt="AbleShare"
              className="h-10 mb-2"
            />

            <p className="text-gray-500">
              Collaborate. Assign. Stay in sync.
            </p>
          </div>

          {/* PAGE HEADING */}
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

          {/* FORM */}
          {children}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden md:flex items-center justify-center bg-gray-50">
        <img
          src={authIllustration}
          alt="Team collaborating"
          className="w-[85%] max-w-[520px] rounded-xl shadow-md"
        />
      </div>

    </div>
  );
}
