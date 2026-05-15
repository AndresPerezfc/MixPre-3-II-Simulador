import { useState, useEffect, useCallback } from 'react'
import { useMixerStore } from '../../store/mixerStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useMeter } from '../../hooks/useMeter'
import { useRecorder } from '../../hooks/useRecorder'
import { ChannelStrip } from './ChannelStrip'
import { Screen } from './Screen'
import { Transport } from './Transport'
import { Knob } from './Knob'

const W = 920
const H = 300

// Layout constants
// Channel zone:  x=45 → CH1, CH2, CH3 end at ~320 (45 + 2×95 + 72 + glow)
// Transport zone: x=332 → ends at ~442 (110px: Play+Stop+REC compactos)
// Screen zone:   x=455 → ends at ~905
const CHASSIS_PAD = 14
const CHANNEL_STRIP_START_X = 45
const CHANNEL_STRIP_Y = 90
const CHANNEL_SPACING = 95
const SCREEN_X = 455
const SCREEN_Y = 18
const SCREEN_W = 450
const SCREEN_H = H - 36
const TRANSPORT_X = 332
const TRANSPORT_Y = 128
const HP_KNOB_X = 334
const HP_KNOB_Y = 196

export function MixPre3() {
  const {
    power, channels, headphoneGain,
    setPower, setChannelGain, setHeadphoneGain,
  } = useMixerStore()

  const [booting, setBooting] = useState(false)
  const [bootPhase, setBootPhase] = useState(-1)

  const { nodesRef, start, stop, updateGain, updateMasterGain } = useAudioEngine()
  useMeter(nodesRef)
  const { startRecording, stopRecording } = useRecorder(nodesRef)

  // Boot sequence
  const handlePowerToggle = useCallback(async () => {
    if (power) {
      stop()
      setPower(false)
      setBooting(false)
      setBootPhase(-1)
    } else {
      setPower(true)
      setBooting(true)
      setBootPhase(0)
      // Sequence boot lines
      for (let i = 1; i <= 3; i++) {
        await new Promise((r) => setTimeout(r, 600))
        setBootPhase(i)
      }
      await new Promise((r) => setTimeout(r, 500))
      setBooting(false)
      await start()
    }
  }, [power, start, stop, setPower])

  // Sync gain changes to audio nodes
  const handleGainChange = useCallback(
    (channelIndex: number, dB: number) => {
      const ch = channels[channelIndex]
      if (!ch) return
      setChannelGain(ch.id, dB)
      updateGain(channelIndex, dB, ch.muted)
    },
    [channels, setChannelGain, updateGain]
  )

  const handleHpGain = useCallback(
    (val: number) => {
      setHeadphoneGain(val)
      updateMasterGain(val)
    },
    [setHeadphoneGain, updateMasterGain]
  )

  // Keep audio gains in sync when mute toggles (not on every level update)
  const muteState = channels.map((c) => c.muted).join(',')
  useEffect(() => {
    channels.forEach((ch, i) => {
      updateGain(i, ch.gain, ch.muted)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muteState, updateGain])

  return (
    <div className="flex items-center justify-center w-full py-8">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W, userSelect: 'none' }}
        overflow="visible"
      >
        <defs>
          <radialGradient id="knobGradient" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <linearGradient id="chassisGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e3133" />
            <stop offset="100%" stopColor="#1a1c1d" />
          </linearGradient>
          <linearGradient id="handleGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#555" />
            <stop offset="50%" stopColor="#888" />
            <stop offset="100%" stopColor="#555" />
          </linearGradient>
          <filter id="screenGlow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Chassis body ── */}
        <rect
          x={CHASSIS_PAD}
          y={CHASSIS_PAD}
          width={W - CHASSIS_PAD * 2}
          height={H - CHASSIS_PAD * 2}
          rx="12"
          fill="url(#chassisGrad)"
          stroke="#111"
          strokeWidth="2"
        />

        {/* Left handle */}
        <rect x={0} y={40} width={20} height={H - 80} rx="6" fill="url(#handleGrad)" />
        <circle cx={10} cy={56} r={4} fill="#444" />
        <circle cx={10} cy={H - 56} r={4} fill="#444" />

        {/* Right handle */}
        <rect x={W - 20} y={40} width={20} height={H - 80} rx="6" fill="url(#handleGrad)" />
        <circle cx={W - 10} cy={56} r={4} fill="#444" />
        <circle cx={W - 10} cy={H - 56} r={4} fill="#444" />

        {/* Divider between channels and screen */}
        <line
          x1={SCREEN_X - 8}
          y1={CHASSIS_PAD + 10}
          x2={SCREEN_X - 8}
          y2={H - CHASSIS_PAD - 10}
          stroke="#111"
          strokeWidth="2"
        />

        {/* ── Power button ── */}
        <g onClick={handlePowerToggle} style={{ cursor: 'pointer' }}>
          <circle
            cx={36}
            cy={36}
            r={12}
            fill={power ? '#c84010' : '#1a0a04'}
            stroke="#333"
            strokeWidth="1.5"
            style={power ? { filter: 'drop-shadow(0 0 6px #e84c1e)' } : undefined}
          />
          {/* Power icon */}
          <path
            d="M36,28 L36,33 M31,30.5 A8,8 0 1,0 41,30.5"
            stroke={power ? '#fff' : '#555'}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* ── Channel strips ── */}
        {channels.map((ch, i) => (
          <ChannelStrip
            key={ch.id}
            channel={ch}
            x={CHANNEL_STRIP_START_X + i * CHANNEL_SPACING}
            y={CHANNEL_STRIP_Y}
            onGainChange={(dB) => handleGainChange(i, dB)}
          />
        ))}

        {/* ── Transport controls ── */}
        <Transport
          x={TRANSPORT_X}
          y={TRANSPORT_Y}
          onRecord={startRecording}
          onStop={stopRecording}
        />

        {/* ── Headphone volume knob ── */}
        <text
          x={HP_KNOB_X + 24}
          y={HP_KNOB_Y - 14}
          textAnchor="middle"
          fill="#666"
          fontSize="9"
          fontFamily="Courier New, monospace"
        >
          HP VOL
        </text>
        <svg x={HP_KNOB_X} y={HP_KNOB_Y} width={44} height={44} overflow="visible">
          <Knob
            value={headphoneGain}
            min={0}
            max={100}
            size={44}
            onChange={handleHpGain}
            glowColor="#aaa"
          />
        </svg>

        {/* Headphone jack decoration */}
        <circle cx={HP_KNOB_X + 22} cy={HP_KNOB_Y + 56} r={4} fill="#111" stroke="#333" strokeWidth="1.5" />
        <circle cx={HP_KNOB_X + 22} cy={HP_KNOB_Y + 56} r={1.5} fill="#050505" />

        {/* ── Screen ── */}
        <Screen
          x={SCREEN_X}
          y={SCREEN_Y}
          width={SCREEN_W}
          height={SCREEN_H}
          booting={booting}
          bootPhase={bootPhase}
        />

        {/* ── Decorative XLR connectors (left side) ── */}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${CHASSIS_PAD + 8}, ${70 + i * 80})`}>
            <circle cx={0} cy={0} r={14} fill="#111" stroke="#2a2a2a" strokeWidth="2" />
            <circle cx={0} cy={0} r={8} fill="#0a0a0a" />
            {[0, 120, 240].map((a) => {
              const rad = (a - 90) * (Math.PI / 180)
              return (
                <circle key={a} cx={Math.cos(rad) * 5} cy={Math.sin(rad) * 5} r={1.5} fill="#444" />
              )
            })}
            <text x={18} y={4} fill="#333" fontSize="8" fontFamily="Courier New, monospace">
              {i + 1}
            </text>
          </g>
        ))}

        {/* ── Sound Devices logo on screen panel ── */}
        {!power && (
          <text
            x={SCREEN_X + SCREEN_W / 2}
            y={SCREEN_Y + SCREEN_H / 2 - 10}
            textAnchor="middle"
            fill="#222"
            fontSize="14"
            fontFamily="Courier New, monospace"
            letterSpacing="2"
          >
            SOUND DEVICES
          </text>
        )}
        {!power && (
          <text
            x={SCREEN_X + SCREEN_W / 2}
            y={SCREEN_Y + SCREEN_H / 2 + 10}
            textAnchor="middle"
            fill="#1a1a1a"
            fontSize="11"
            fontFamily="Courier New, monospace"
          >
            MixPre-3 II
          </text>
        )}
      </svg>

      {/* Mic error message below device */}
    </div>
  )
}
