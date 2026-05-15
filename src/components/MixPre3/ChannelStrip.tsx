import { Knob } from './Knob'
import { StatusLED } from './StatusLED'
import { useMixerStore } from '../../store/mixerStore'
import type { Channel } from '../../store/mixerStore'

interface ChannelStripProps {
  channel: Channel
  x: number
  y: number
  onGainChange: (dB: number) => void
}

const KNOB_SIZE = 72

export function ChannelStrip({ channel, x, y, onGainChange }: ChannelStripProps) {
  const { togglePhantom, toggleMute } = useMixerStore()
  const hasSignal = channel.level > -50

  return (
    <g>
      {/* Channel number label */}
      <text
        x={x + KNOB_SIZE / 2}
        y={y - 8}
        textAnchor="middle"
        fill="#aaa"
        fontSize="13"
        fontWeight="bold"
        fontFamily="Courier New, monospace"
      >
        {channel.id}
      </text>

      {/* Signal LED */}
      <StatusLED
        cx={x + KNOB_SIZE / 2 - 12}
        cy={y - 22}
        active={hasSignal && !channel.muted}
        color="green"
        size={4}
        label="SIG"
      />

      {/* Clip LED */}
      <StatusLED
        cx={x + KNOB_SIZE / 2 + 12}
        cy={y - 22}
        active={channel.clipping}
        color="red"
        size={4}
        label="CLIP"
      />

      {/* Gain knob — knobGradient defined in parent SVG defs */}
      <svg x={x} y={y} width={KNOB_SIZE} height={KNOB_SIZE} overflow="visible">
        <Knob
          value={channel.gain}
          onChange={onGainChange}
          size={KNOB_SIZE}
        />
      </svg>

      {/* 48V Phantom button */}
      <g
        onClick={() => togglePhantom(channel.id)}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={x}
          y={y + KNOB_SIZE + 36}
          width={KNOB_SIZE / 2 - 2}
          height={18}
          rx="3"
          fill={channel.phantom ? '#1a3a6e' : '#1a1a1a'}
          stroke={channel.phantom ? '#4488ff' : '#333'}
          strokeWidth="1"
          style={
            channel.phantom
              ? { filter: 'drop-shadow(0 0 4px #4488ff)' }
              : undefined
          }
        />
        <text
          x={x + KNOB_SIZE / 4 - 1}
          y={y + KNOB_SIZE + 49}
          textAnchor="middle"
          fill={channel.phantom ? '#4488ff' : '#555'}
          fontSize="8"
          fontFamily="Courier New, monospace"
          fontWeight="bold"
        >
          48V
        </text>
      </g>

      {/* MUTE button */}
      <g
        onClick={() => toggleMute(channel.id)}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={x + KNOB_SIZE / 2 + 2}
          y={y + KNOB_SIZE + 36}
          width={KNOB_SIZE / 2 - 2}
          height={18}
          rx="3"
          fill={channel.muted ? '#4a1010' : '#1a1a1a'}
          stroke={channel.muted ? '#ff3131' : '#333'}
          strokeWidth="1"
          style={
            channel.muted
              ? { filter: 'drop-shadow(0 0 4px #ff3131)' }
              : undefined
          }
        />
        <text
          x={x + KNOB_SIZE / 2 + 2 + (KNOB_SIZE / 2 - 2) / 2}
          y={y + KNOB_SIZE + 49}
          textAnchor="middle"
          fill={channel.muted ? '#ff3131' : '#555'}
          fontSize="8"
          fontFamily="Courier New, monospace"
          fontWeight="bold"
        >
          MUTE
        </text>
      </g>

      {/* Channel name label at bottom */}
      <text
        x={x + KNOB_SIZE / 2}
        y={y + KNOB_SIZE + 72}
        textAnchor="middle"
        fill="#555"
        fontSize="9"
        fontFamily="Courier New, monospace"
      >
        {channel.name}
      </text>
    </g>
  )
}
