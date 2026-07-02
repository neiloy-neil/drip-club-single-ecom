import { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DRIP — Wear Your Story',
    short_name: 'DRIP',
    description: 'Premium fashion for the modern individual',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#1a1a1a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
