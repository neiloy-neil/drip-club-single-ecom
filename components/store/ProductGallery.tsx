"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, ZoomIn } from "lucide-react"

function getEmbedUrl(videoUrl: string): { type: "youtube" | "vimeo" | "direct"; url: string } | null {
  if (!videoUrl) return null
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (ytMatch) return { type: "youtube", url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` }
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { type: "vimeo", url: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` }
  if (videoUrl.match(/\.(mp4|webm|ogg)(\?|$)/i)) return { type: "direct", url: videoUrl }
  return null
}

export default function ProductGallery({ images }: { images: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [playingVideo, setPlayingVideo] = useState(false)

  const activeItem = images[activeIndex]
  const activeImage = activeItem?.url || "/placeholder.jpg"
  const isActiveVideo = activeItem?.isVideo && activeItem?.videoUrl
  const embed = isActiveVideo ? getEmbedUrl(activeItem.videoUrl) : null

  const nextImage = () => { setActiveIndex((i) => (i + 1) % (images.length || 1)); setPlayingVideo(false) }
  const prevImage = () => { setActiveIndex((i) => (i - 1 + (images.length || 1)) % (images.length || 1)); setPlayingVideo(false) }

  const handleThumbClick = (idx: number) => {
    setActiveIndex(idx)
    setPlayingVideo(false)
  }

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4 md:gap-6 sticky top-20">

      {/* Main Viewer */}
      <div className="w-full flex-1 relative bg-drip-muted overflow-hidden group">
        <div className="aspect-[3/4] md:aspect-[4/5] w-full relative">
          {isActiveVideo && playingVideo && embed ? (
            embed.type === "direct" ? (
              <video src={embed.url} controls autoPlay className="w-full h-full object-contain bg-black" />
            ) : (
              <iframe
                src={embed.url}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            )
          ) : (
            <>
              <Image
                src={activeImage}
                alt="Product Image"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                priority
              />
              {isActiveVideo && (
                <button
                  onClick={() => setPlayingVideo(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-7 h-7 text-drip-black ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
            </>
          )}
        </div>

        {/* Mobile Arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <ChevronLeft className="w-5 h-5 text-drip-black" />
            </button>
            <button onClick={nextImage} className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <ChevronRight className="w-5 h-5 text-drip-black" />
            </button>
          </>
        )}

        {!isActiveVideo && (
          <button className="hidden md:flex absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm text-drip-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-drip-gold hover:text-white shadow-sm">
            <ZoomIn className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 lg:w-24 shrink-0 pb-2 md:pb-0 hide-scrollbar snap-x">
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => handleThumbClick(idx)}
            className={`relative aspect-[3/4] w-20 md:w-full overflow-hidden transition-all snap-center rounded-sm ${activeIndex === idx ? "ring-1 ring-drip-black ring-offset-2 opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            <Image src={img.url} alt={img.alt || "Thumbnail"} fill sizes="96px" className="object-cover" />
            {img.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-5 h-5 text-white" fill="white" />
              </div>
            )}
          </button>
        ))}
        {images.length === 0 && (
          <div className="aspect-[3/4] w-20 md:w-full bg-drip-muted rounded-sm" />
        )}
      </div>

    </div>
  )
}
