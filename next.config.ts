/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora ESLint durante el build (no falla el build por errores de lint)
    ignoreDuringBuilds: true,
  },
  // ...otras opciones
};

module.exports = nextConfig;
