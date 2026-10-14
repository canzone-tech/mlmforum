import type {NextConfig} from "next";
const backend=process.env.API_INTERNAL_ORIGIN || "http://127.0.0.1:4000";
const config:NextConfig={
 poweredByHeader:false,
 output:"standalone",
 reactStrictMode:true,
 async rewrites(){
  return [
   {source:"/api/:path*",destination:backend+"/api/:path*"},
   {source:"/teamwork.jpg",destination:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85"}
  ];
 }
};
export default config;
