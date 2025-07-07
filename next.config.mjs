/** @type {import('next').NextConfig} */
const nextConfig = {
  // Această configurație îi spune lui Next.js să nu încerce
  // să "împacheteze" pdf-parse în timpul build-ului pe server.
  // Acest lucru rezolvă eroarea "Failed to collect page data"
  // cauzată de dependențele native ale pachetului.
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
