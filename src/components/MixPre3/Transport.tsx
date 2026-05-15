import { useMixerStore } from '../../store/mixerStore'

interface TransportProps {
  x: number
  y: number
  onRecord: () => void
  onStop: () => void
}

export function Transport({ x, y, onRecord, onStop }: TransportProps) {
  const { transport, power } = useMixerStore()
  const isRecording = transport === 'recording'
  const disabled = !power

  return (
    <g opacity={disabled ? 0.4 : 1}>
      {/* PLAY button — circle blanco */}
      <g style={{ cursor: disabled ? 'default' : 'pointer' }}>
        <circle cx={x} cy={y} r={16} fill="#d8d8d8" stroke="#aaa" strokeWidth="1" />
        {/* Play triangle */}
        <polygon
          points={`${x - 5},${y - 8} ${x - 5},${y + 8} ${x + 9},${y}`}
          fill="#222"
        />
      </g>

      {/* STOP button — circle blanco */}
      <g style={{ cursor: disabled ? 'default' : 'pointer' }} onClick={disabled ? undefined : onStop}>
        <circle cx={x + 46} cy={y} r={16} fill="#d8d8d8" stroke="#aaa" strokeWidth="1" />
        {/* Stop square */}
        <rect x={x + 46 - 7} y={y - 7} width={14} height={14} fill="#222" rx="1" />
      </g>

      {/* REC button — rectángulo blanco prominente */}
      <g style={{ cursor: disabled ? 'default' : 'pointer' }} onClick={disabled ? undefined : (isRecording ? onStop : onRecord)}>
        <rect
          x={x + 80}
          y={y - 16}
          width={52}
          height={32}
          rx="4"
          fill={isRecording ? '#e0e0e0' : '#e8e8e8'}
          stroke="#999"
          strokeWidth="1.5"
          style={
            isRecording
              ? { filter: 'drop-shadow(0 0 6px #ff3131)' }
              : undefined
          }
        />
        {/* Red dot when recording */}
        {isRecording && (
          <circle
            cx={x + 80 + 10}
            cy={y}
            r={5}
            fill="#ff3131"
            className="rec-pulse"
            style={{ filter: 'drop-shadow(0 0 4px #ff3131)' }}
          />
        )}
        <text
          x={x + 80 + (isRecording ? 32 : 26)}
          y={y + 5}
          textAnchor="middle"
          fill="#111"
          fontSize="13"
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
