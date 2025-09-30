// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   // images: {
//   //   remotePatterns: [
//   //     {
//   //       protocol: "https",
//   //       hostname: "ik.imagekit.io",
//   //       port: "",
//   //     },
//   //   ],
//   // },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_VAPI_WEB_TOKEN: process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN,
    NEXT_PUBLIC_VAPI_ASSISTANT_ID: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
