import { useRef, useState, useCallback, type DragEvent } from 'react'
import { ImagePlus, X, AlertCircle, Loader2 } from 'lucide-react'
import { adminApi } from '@/lib/api/admin.api'
import { toast } from 'sonner'

export interface UploadedImage {
  id: string
  previewUrl: string
  uploadedUrl?: string
  progress: number
  error?: string
}

interface Props {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxCount?: number
}

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5

export function ImageUploader({ images, onChange, maxCount = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const canAdd = images.length < maxCount

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files)
      const remaining = maxCount - images.length
      const toProcess = arr.slice(0, remaining)

      const invalids = toProcess.filter(
        f => !ACCEPTED.includes(f.type) || f.size > MAX_SIZE_MB * 1024 * 1024,
      )
      if (invalids.length) {
        toast.error(`${invalids.length} fichier(s) ignoré(s) — JPG/PNG/WebP, max ${MAX_SIZE_MB} Mo`)
      }

      const valid = toProcess.filter(
        f => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE_MB * 1024 * 1024,
      )
      if (!valid.length) return

      const newItems: UploadedImage[] = valid.map(f => ({
        id: crypto.randomUUID(),
        previewUrl: URL.createObjectURL(f),
        progress: 0,
      }))

      onChange([...images, ...newItems])

      for (const item of newItems) {
        const file = valid[newItems.indexOf(item)]
        try {
          const res = await adminApi.uploadOfferImage(file, pct => {
            onChange(prev =>
              prev.map(img => (img.id === item.id ? { ...img, progress: pct } : img)),
            )
          })
          const raw = res.data?.data ?? res.data
          const url: string = Array.isArray(raw) ? raw[0]?.url : raw?.url
          onChange(prev =>
            prev.map(img =>
              img.id === item.id ? { ...img, uploadedUrl: url, progress: 100 } : img,
            ),
          )
        } catch {
          onChange(prev =>
            prev.map(img =>
              img.id === item.id ? { ...img, error: 'Échec du téléversement', progress: 0 } : img,
            ),
          )
        }
      }
    },
    [images, maxCount, onChange],
  )

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (canAdd) setIsDragging(true)
  }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (canAdd) processFiles(e.dataTransfer.files)
  }
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ''
  }

  const remove = (id: string) => {
    onChange(images.filter(img => img.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAdd && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors select-none ${
            isDragging
              ? 'border-[#4d9538] bg-[#ebf5ea]'
              : 'border-gray-200 bg-gray-50 hover:border-[#4d9538] hover:bg-[#ebf5ea]/50'
          }`}
        >
          <ImagePlus size={24} className={isDragging ? 'text-[#4d9538]' : 'text-gray-400'} />
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#4d9538]">Cliquez</span> ou glissez des photos
          </p>
          <p className="text-xs text-gray-400">JPG, PNG, WebP · max {MAX_SIZE_MB} Mo · {images.length}/{maxCount}</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="hidden"
        onChange={onFileChange}
      />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map(img => (
            <div
              key={img.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <img
                src={img.previewUrl}
                alt=""
                className="w-full h-full object-cover"
              />

              {/* Upload progress overlay */}
              {!img.uploadedUrl && !img.error && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                  <Loader2 size={16} className="text-white animate-spin" />
                  <span className="text-white text-[10px] font-semibold">{img.progress}%</span>
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-[#c41539]/60 flex items-center justify-center">
                  <AlertCircle size={18} className="text-white" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#c41539] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} strokeWidth={3} />
              </button>

              {/* Progress bar at bottom */}
              {!img.uploadedUrl && !img.error && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div
                    className="h-full bg-[#4d9538] transition-all"
                    style={{ width: `${img.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add more slot */}
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#4d9538] hover:text-[#4d9538] transition-colors"
            >
              <ImagePlus size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
