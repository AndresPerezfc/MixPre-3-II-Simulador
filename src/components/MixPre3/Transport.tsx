import { useMixerStore } from '../../store/mixerStore'

interface TransportProps {
  x: number
  y: number
  onRecord: () => void
  onStop: () => void
}

// Compact layout: Play(r13) — Stop(r13, +36) — REC(+64, w=44) — total ~108px
export function Transport({ x, y, onRecord, onStop }: TransportProps) {
  const { transport, power } = useMixerStore()
  const isRecording = transport === 'recording'
  const disabled = !power

  const playX = x
  const stopX = x + 36
  const recX = x + 64

  return (
    <g opacity={disabled ? 0.4 : 1}>
      {/* PLAY button */}
      <g style={{ cursor: disabled ? 'default' : 'pointer' }}>
        <circle cx={playX} cy={y} r={13} fill="#d8d8d8" stroke="#aaa" strokeWidth="1" />
        <polygon
          points={`${playX - 4},${y - 6} ${playX - 4},${y + 6} ${playX + 7},${y}`}
          fill="#222"
        />
      </g>

      {/* STOP button */}
      <g style={{ cursor: disabled ? 'default' : 'pointer' }} onClick={disabled ? undefined : onStop}>
        <circle cx={stopX} cy={y} r={13} fill="#d8d8d8" stroke="#aaa" strokeWidth="1" />
        <rect x={stopX - 6} y={y - 6} width={12} height={12} fill="#222" rx="1" />
      </g>

      {/* REC button — rectángulo blanco prominente */}
      <g
        style={{ cursor: disabled ? 'default' : 'pointer' }}
        onClick={disabled ? undefined : (isRecording ? onStop : onRecord)}
      >
        <rect
          x={recX}
          y={y - 14}
          width={44}
          height={28}
          rx="4"
          fill={isRecording ? '#e0e0e0' : '#e8e8e8'}
          stroke="#999"
          strokeWidth="1.5"
          style={isRecording ? { filter: 'drop-shadow(0 0 6px #ff3131)' } : undefined}
        />
        {isRecording && (
          <circle
            cx={recX + 9}
            cy={y}
            r={4}
            fill="#ff3131"
            className="rec-pulse"
            style={{ filter: 'drop-shadow(0 0 4px #ff3131)' }}
          />
        )}
        <text
          x={recX + (isRecording ? 28 : 22)}
          y={y + 4}
          textAnchor="middle"
          fill="#111"
          fontSize="11"
          fontWeight="bold"
          fontFamily="Courier New, monospace"
          letterSpacing="1"
        >
          REC
        </text>
      </g>
    </g>
  )
}
