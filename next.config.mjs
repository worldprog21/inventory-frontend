/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      new URL("http://localhost:1337/**"),
      new URL("https://inventory-backend-57oe.onrender.com/**"),
    ],
  },
};

export default nextConfig;
