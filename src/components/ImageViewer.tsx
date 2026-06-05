interface ImageViewerProps {
  images: string[]
  onRemove?: (idx: number) => void
}

export default function ImageViewer({ images, onRemove }: ImageViewerProps) {
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {images.map((img, idx) => (
        <div key={idx} className="relative group">
          <img
            src={img}
            alt={`图片 ${idx + 1}`}
            className="w-full h-36 object-cover rounded-lg border border-border"
          />
          {onRemove && (
            <button
              onClick={() => onRemove(idx)}
              className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm hover:bg-red-500"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
