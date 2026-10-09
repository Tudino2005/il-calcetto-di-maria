import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Arena Stats',
    short_name: 'Arena Stats',
    description: 'Classifiche in tempo reale dell\'Arena del Biliardino',
    start_url: '/classifiche',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
