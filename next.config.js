/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure API routes
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Increase body size limit if needed
    },
    responseLimit: false, // Remove response size limit for streaming
  },
  // Ensure environment variables are available
  env: {
    // You can add public environment variables here if needed
  },
}

module.exports = nextConfig
