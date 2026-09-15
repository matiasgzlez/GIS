/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite compilar en otra carpeta (ej. pruebas) sin pisar el .next de `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};
module.exports = nextConfig;
