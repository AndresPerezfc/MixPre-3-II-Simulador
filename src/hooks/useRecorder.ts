import { useRef, useCallback, useEffect } from 'react'
import { useMixerStore } from '../store/mixerStore'
import type { AudioNodes } from './useAudioEngine'

export function useRecorder(nodesRef: React.RefObject<AudioNodes | null>) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { transport, setTransport, tickRecording, resetRecording } = useMixerStore()

  const startRecording = useCallback(() => {
    const nodes = nodesRef.current
    if (!nodes) return

    const dest = nodes.context.createMediaStreamDestination()
    nodes.masterGain.connect(dest)

    chunksRef.current = []
    const recorder = new MediaRecorder(dest.stream)
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.start(100)
    recorderRef.current = recorder

    resetRecording()
    setTransport('recording')

    timerRef.current = setInterval(() => {
      tickRecording()
    }, 1000)
  }, [nodesRef, resetRecording, setTransport, tickRecording])

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    const recorder = recorderRef.current
    if (!recorder) return

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mixpre3_recording_${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }
    recorder.stop()
    recorderRef.current = null
    setTransport('idle')
  }, [setTransport])

  // Sync transport changes triggered externally (e.g. STOP button)
  useEffect(() => {
    if (transport === 'idle' && recorderRef.current) {
      stopRecording()
    }
  }, [transport, stopRecording])

  return { startRecording, stopRecording }
}
