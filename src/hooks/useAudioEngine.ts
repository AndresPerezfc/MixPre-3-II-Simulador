import { useRef, useCallback } from 'react'
import { useMixerStore } from '../store/mixerStore'

export interface AudioNodes {
  context: AudioContext
  source: MediaStreamAudioSourceNode
  gains: [GainNode, GainNode, GainNode]
  analysers: [AnalyserNode, AnalyserNode, AnalyserNode]
  masterGain: GainNode
  masterAnalyser: AnalyserNode
  stream: MediaStream
}

export function useAudioEngine() {
  const nodesRef = useRef<AudioNodes | null>(null)
  const { setAudioReady, channels, headphoneGain } = useMixerStore()

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const context = new AudioContext()
      const source = context.createMediaStreamSource(stream)

      const makeAnalyser = () => {
        const a = context.createAnalyser()
        a.fftSize = 2048
        a.smoothingTimeConstant = 0.6
        return a
      }

      const gains: [GainNode, GainNode, GainNode] = [
        context.createGain(),
        context.createGain(),
        context.createGain(),
      ]

      const analysers: [AnalyserNode, AnalyserNode, AnalyserNode] = [
        makeAnalyser(),
        makeAnalyser(),
        makeAnalyser(),
      ]

      const masterGain = context.createGain()
      const masterAnalyser = makeAnalyser()

      // CH1 and CH3 use the same mono source; CH2 tries the right channel if stereo
      source.connect(gains[0])
      source.connect(gains[1])
      source.connect(gains[2])

      gains[0].connect(analysers[0])
      gains[1].connect(analysers[1])
      gains[2].connect(analysers[2])

      analysers[0].connect(masterGain)
      analysers[1].connect(masterGain)
      analysers[2].connect(masterGain)

      masterGain.connect(masterAnalyser)
      masterGain.connect(context.destination)

      // Apply initial gain values from store
      channels.forEach((ch, i) => {
        gains[i]!.gain.value = ch.muted ? 0 : dbToLinear(ch.gain)
      })
      masterGain.gain.value = headphoneGain / 100

      nodesRef.current = { context, source, gains, analysers, masterGain, masterAnalyser, stream }
      setAudioReady(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al acceder al micrófono'
      setAudioReady(false, msg)
    }
  }, [channels, headphoneGain, setAudioReady])

  const stop = useCallback(() => {
    if (!nodesRef.current) return
    const { context, stream } = nodesRef.current
    stream.getTracks().forEach((t) => t.stop())
    void context.close()
    nodesRef.current = null
    setAudioReady(false)
  }, [setAudioReady])

  const updateGain = useCallback((channelIndex: number, dB: number, muted: boolean) => {
    if (!nodesRef.current) return
    nodesRef.current.gains[channelIndex]!.gain.value = muted ? 0 : dbToLinear(dB)
  }, [])

  const updateMasterGain = useCallback((val: number) => {
    if (!nodesRef.current) return
    nodesRef.current.masterGain.gain.value = val / 100
  }, [])

  return { nodesRef, start, stop, updateGain, updateMasterGain }
}

function dbToLinear(db: number): number {
  // 0 dB en la UI = ganancia neutra (1.0); 60 dB = máximo (~1000x)
  // Usamos 20 dB como punto neutro, escala lineal ±40 dB
  return Math.pow(10, (db - 20) / 20)
}
