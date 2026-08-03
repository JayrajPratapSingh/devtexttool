/** @type {import('next').NextConfig} */
const nextConfig = {
  // We lint separately with the project's flat ESLint config.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
