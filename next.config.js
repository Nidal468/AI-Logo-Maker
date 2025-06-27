/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https', // Usually 'https' is preferred
          hostname: '**',    // This wildcard matches ALL hostnames
        },
    
      ],
    },
  };
  
  export default nextConfig;