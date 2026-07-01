import {
  useRef, useState, useEffect, useCallback,
  type DragEvent, type ChangeEvent,
} from 'react'
import { Mic, Square, Upload, Play, Pause, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { adminApi } from '@/lib/api/admin.api'
import { toast } from 'sonner'

export interface VoiceData {
  url: string
  duration: number
  filename: string
}

interface Props {
  value: VoiceData | null
  onChange: (voice: VoiceData | null) => void
}

type Mode = 'idle' | 'recording' | 'uploading' | 'ready' | 'error'

const ACCEPTED_VOICE = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/ogg', 'audio/webm', 'video/webm']
const MAX_VOICE_MB = 50

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VoiceUploader({ value, onChange }: Props) {
  const [tab, setTab] = useState<'upload' | 'record'>('upload')
  const [mode, setMode] = useState<Mode>(value ? 'ready' : 'idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  // Recording state
  const [recordingElapsed, setRecordingElapsed] = useState(0)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  // Playback state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (value) setMode('ready')
    else if (mode === 'ready') setMode('idle')
  }, [value])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaRef.current?.stop()
    }
  }, [])

  const uploadBlob = async (blob: Blob, filename: string) => {
    setMode('uploading')
    setUploadProgress(0)
    try {
      const res = await adminApi.uploadOfferVoice(blob, filename, pct => setUploadProgress(pct))
      const raw = res.data?.data ?? res.data
      onChange({
        url: raw.url,
        duration: raw.duration ?? 0,
        filename,
      })
      setMode('ready')
    } catch {
      setError('Échec du téléversement')
      setMode('error')
    }
  }

  // ── File upload tab ──────────────────────────────────────────────────────────
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_VOICE.includes(file.type)) {
      toast.error('Format non supporté — MP3, WAV, M4A, WebM')
      return
    }
    if (file.size > MAX_VOICE_MB * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max ${MAX_VOICE_MB} Mo)`)
      return
    }
    uploadBlob(file, file.name)
  }, [])

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0])
    e.target.value = ''
  }

  // ── Recorder tab ─────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        uploadBlob(blob, 'recording.webm')
      }

      recorder.start()
      startTimeRef.current = Date.now()
      setRecordingElapsed(0)
      setMode('recording')
      timerRef.current = setInterval(() => {
        setRecordingElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch {
      toast.error("Microphone inaccessible. Vérifiez les permissions.")
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // ── Audio player ─────────────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
    else { audioRef.current.play(); setIsPlaying(true) }
  }

  const deleteVoice = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    setIsPlaying(false)
    setCurrentTime(0)
    onChange(null)
    setMode('idle')
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (mode === 'ready' && value) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ebf5ea] border border-[#4d9538]/20">
        <audio
          ref={audioRef}
          src={value.url}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-[#4d9538] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#038543] transition-colors"
        >
          {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#231F20] truncate">{value.filename}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4d9538] transition-all"
                style={{ width: value.duration ? `${(currentTime / value.duration) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-[11px] text-gray-500 flex-shrink-0 tabular-nums">
              {formatDuration(currentTime)} / {formatDuration(value.duration)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={deleteVoice}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c41539] hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )
  }

  if (mode === 'uploading') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
        <Loader2 size={18} className="text-[#4d9538] animate-spin flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-gray-600">Téléversement en cours…</p>
          <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4d9538] transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-500 tabular-nums">{uploadProgress}%</span>
      </div>
    )
  }

  if (mode === 'error') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
        <AlertCircle size={18} className="text-[#c41539] flex-shrink-0" />
        <p className="flex-1 text-sm text-[#c41539]">{error}</p>
        <button
          type="button"
          onClick={() => setMode('idle')}
          className="text-xs underline text-gray-500 hover:text-[#231F20]"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(['upload', 'record'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-colors ${
              tab === t ? 'bg-white text-[#231F20] shadow-sm' : 'text-gray-500 hover:text-[#231F20]'
            }`}
          >
            {t === 'upload' ? <Upload size={12} /> : <Mic size={12} />}
            {t === 'upload' ? 'Télécharger' : 'Enregistrer'}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              isDragging
                ? 'border-[#4d9538] bg-[#ebf5ea]'
                : 'border-gray-200 bg-gray-50 hover:border-[#4d9538] hover:bg-[#ebf5ea]/50'
            }`}
          >
            <Upload size={20} className={isDragging ? 'text-[#4d9538]' : 'text-gray-400'} />
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-[#4d9538]">Cliquez</span> ou glissez un fichier audio
            </p>
            <p className="text-xs text-gray-400">MP3, WAV, M4A, WebM · max {MAX_VOICE_MB} Mo</p>
          </div>
          <input ref={inputRef} type="file" accept={ACCEPTED_VOICE.join(',')} className="hidden" onChange={onFileChange} />
        </>
      )}

      {tab === 'record' && (
        <div className="flex flex-col items-center gap-3 py-4">
          {mode === 'recording' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c41539] animate-pulse" />
                <span className="text-sm font-semibold text-[#231F20] tabular-nums">
                  {formatDuration(recordingElapsed)}
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="w-12 h-12 rounded-full bg-[#c41539] text-white flex items-center justify-center hover:bg-[#a01230] transition-colors"
              >
                <Square size={16} fill="white" />
              </button>
              <p className="text-xs text-gray-500">Cliquez pour arrêter</p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={startRecording}
                className="w-12 h-12 rounded-full bg-[#4d9538] text-white flex items-center justify-center hover:bg-[#038543] transition-colors"
              >
                <Mic size={18} />
              </button>
              <p className="text-xs text-gray-500">Cliquez pour commencer l'enregistrement</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
