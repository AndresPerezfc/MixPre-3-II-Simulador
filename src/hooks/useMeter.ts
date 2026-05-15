import { useEffect, useRef } from 'react'
import { useMixerStore } from '../store/mixerStore'
import type { AudioNodes } from './useAudioEngine'

export function useMeter(nodesRef: React.RefObject<AudioNodes | null>) {
  const rafRef = useRef<number>(0)
  const isAudioReady = useMixerStore((s) => s.isAudioReady)

  useEffect(() => {
    if (!isAudioReady) return

    const buf = new Float32Array(2048)
    const { setChannelLevel } = useMixerStore.getState()

    const tick = () => {
      const nodes = nodesRef.current
      if (!nodes) return

      // Read channels fresh each frame to pick up mute changes without re-creating the loop
      const channels = useMixerStore.getState().channels

      nodes.analysers.forEach((analyser, i) => {
        const ch = channels[i]
        if (!ch || ch.muted) {
          setChannelLevel(ch?.id ?? ((i + 1) as 1 | 2 | 3), -60, false)
          return
        }

        analyser.getFloatTimeDomainData(buf)

        let sum = 0
        for (let j = 0; j < buf.length; j++) {
          const s = buf[j] ?? 0
          sum += s * s
        }
        const rms = Math.sqrt(sum / buf.length)
        const db = rms > 0 ? 20 * Math.log10(rms) : -60
        const clamped = Math.max(-60, Math.min(0, db))
        const clipping = db > -1

        setChannelLevel(ch.id, clamped, clipping)
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isAudioReady, nodesRef])
}
