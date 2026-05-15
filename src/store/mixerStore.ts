import { create } from 'zustand'

export interface Channel {
  id: 1 | 2 | 3
  name: string
  gain: number       // 0–60 dB
  phantom: boolean   // 48V phantom power
  muted: boolean
  level: number      // dBFS en tiempo real, -60 a 0
  clipping: boolean
}

export type TransportState = 'idle' | 'recording' | 'playing'

interface MixerStore {
  power: boolean
  channels: [Channel, Channel, Channel]
  transport: TransportState
  recordingSeconds: number
  headphoneGain: number   // 0–100
  isAudioReady: boolean
  audioError: string | null

  setPower: (on: boolean) => void
  setChannelGain: (id: number, dB: number) => void
  togglePhantom: (id: number) => void
  toggleMute: (id: number) => void
  setTransport: (state: TransportState) => void
  setHeadphoneGain: (val: number) => void
  setChannelLevel: (id: number, level: number, clipping: boolean) => void
  setAudioReady: (ready: boolean, error?: string) => void
  tickRecording: () => void
  resetRecording: () => void
}

const defaultChannel = (id: 1 | 2 | 3): Channel => ({
  id,
  name: `CH ${id}`,
  gain: 20,
  phantom: false,
  muted: false,
  level: -60,
  clipping: false,
})

export const useMixerStore = create<MixerStore>((set) => ({
  power: false,
  channels: [defaultChannel(1), defaultChannel(2), defaultChannel(3)],
  transport: 'idle',
  recordingSeconds: 0,
  headphoneGain: 70,
  isAudioReady: false,
  audioError: null,

  setPower: (on) => set({ power: on }),

  setChannelGain: (id, dB) =>
    set((s) => ({
      channels: s.channels.map((ch) =>
        ch.id === id ? { ...ch, gain: Math.max(0, Math.min(60, dB)) } : ch
      ) as [Channel, Channel, Channel],
    })),

  togglePhantom: (id) =>
    set((s) => ({
      channels: s.channels.map((ch) =>
        ch.id === id ? { ...ch, phantom: !ch.phantom } : ch
      ) as [Channel, Channel, Channel],
    })),

  toggleMute: (id) =>
    set((s) => ({
      channels: s.channels.map((ch) =>
        ch.id === id ? { ...ch, muted: !ch.muted } : ch
      ) as [Channel, Channel, Channel],
    })),

  setTransport: (state) => set({ transport: state }),

  setHeadphoneGain: (val) =>
    set({ headphoneGain: Math.max(0, Math.min(100, val)) }),

  setChannelLevel: (id, level, clipping) =>
    set((s) => ({
      channels: s.channels.map((ch) =>
        ch.id === id ? { ...ch, level, clipping } : ch
      ) as [Channel, Channel, Channel],
    })),

  setAudioReady: (ready, error) =>
    set({ isAudioReady: ready, audioError: error ?? null }),

  tickRecording: () =>
    set((s) => ({ recordingSeconds: s.recordingSeconds + 1 })),

  resetRecording: () => set({ recordingSeconds: 0 }),
}))
