/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: false, // Disable strict mode to prevent double-mounting in development
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.youtube.com https://s.ytimg.com https://www.google.com https://apis.google.com https://ssl.gstatic.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://*.youtube.com https://*.google.com https://*.gstatic.com https://youtube.com https://www.youtube-nocookie.com https://www.youtubeeducation.com https://www-onepick-opensocial.googleusercontent.com https://*.doubleclick.net https://*.googleapis.com https://www.googleadservices.com https://tpc.googlesyndication.com https://www.youtubekids.com;
              script-src-elem 'self' 'unsafe-inline' blob: https://www.youtube.com https://s.ytimg.com https://www.google.com https://apis.google.com https://ssl.gstatic.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://*.youtube.com https://*.google.com https://*.gstatic.com https://youtube.com https://www.youtube-nocookie.com https://www.youtubeeducation.com https://www-onepick-opensocial.googleusercontent.com https://*.doubleclick.net https://*.googleapis.com https://www.googleadservices.com https://tpc.googlesyndication.com https://www.youtubekids.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.youtube.com https://s.ytimg.com https://www.google.com https://apis.google.com https://ssl.gstatic.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://*.youtube.com https://*.google.com https://*.gstatic.com https://youtube.com https://www.youtube-nocookie.com https://www.youtubeeducation.com https://www-onepick-opensocial.googleusercontent.com https://*.doubleclick.net https://*.googleapis.com https://www.googleadservices.com https://tpc.googlesyndication.com https://www.youtubekids.com;
              font-src 'self' https://fonts.gstatic.com data:;
              img-src 'self' https: data: blob:;
              media-src 'self' https://www.youtube.com https://i.ytimg.com https://*.youtube.com https://*.google.com https://*.gstatic.com https://youtube.com https://www.youtube-nocookie.com https://www.youtubeeducation.com https://www-onepick-opensocial.googleusercontent.com https://www.google.com https://ssl.gstatic.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://*.doubleclick.net https://*.googleapis.com https://www.googleadservices.com https://tpc.googlesyndication.com https://www.youtubekids.com;
              connect-src 'self' https://generativelanguage.googleapis.com;
              frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.youtube.com https://*.google.com https://*.gstatic.com https://youtube.com https://www.youtubeeducation.com https://www-onepick-opensocial.googleusercontent.com https://www.google.com https://ssl.gstatic.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://*.doubleclick.net https://*.googleapis.com https://www.googleadservices.com https://tpc.googlesyndication.com https://www.youtubekids.com;
              child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;
              object-src 'self' blob: data:;
              base-uri 'self';
              frame-ancestors 'none';
              form-action 'self';
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  },
};

export default nextConfig;