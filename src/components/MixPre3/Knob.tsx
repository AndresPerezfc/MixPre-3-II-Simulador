import { useRef, useCallback } from 'react'

interface KnobProps {
  value: number      // 0–60 dB
  min?: number
  max?: number
  size?: number
  onChange: (val: number) => void
  glowColor?: string
  label?: string
}

// Map value to rotation angle: min → -140°, max → +140°
function valueToAngle(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 280 - 140
}

export function Knob({
  value,
  min = 0,
  max = 60,
  size = 64,
  onChange,
  glowColor = '#39ff14',
  label,
}: KnobProps) {
  const startY = useRef<number | null>(null)
  const startVal = useRef<number>(value)

  const angle = valueToAngle(value, min, max)
  const r = size / 2
  const innerR = r - 8
  const tickLength = 5

  // Generate scale ticks around the knob
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const tickAngle = -140 + i * 14
    const rad = (tickAngle - 90) * (Math.PI / 180)
    const outerR = r - 2
    const innerTick = outerR - tickLength
    return {
      x1: r + Math.cos(rad) * innerTick,
      y1: r + Math.sin(rad) * innerTick,
      x2: r + Math.cos(rad) * outerR,
      y2: r + Math.sin(rad) * outerR,
      active: tickAngle <= angle - 140 + 140,
    }
  })

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      startY.current = e.clientY
      startVal.current = value

      const onMove = (me: MouseEvent) => {
        if (startY.current === null) return
        const delta = (startY.current - me.clientY) * 0.5
        const next = Math.max(min, Math.min(max, startVal.current + delta))
        onChange(next)
      }

      const onUp = () => {
        startY.current = null
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [value, min, max, onChange]
  )

  // Indicator dot position
  const indicatorRad = (angle - 90) * (Math.PI / 180)
  const indicatorX = r + Math.cos(indicatorRad) * (innerR - 6)
  const indicatorY = r + Math.sin(indicatorRad) * (innerR - 6)

  return (
    <g className="knob-interactive" onMouseDown={onMouseDown} style={{ cursor: 'ns-resize' }}>
      {/* Outer ring glow track */}
      <circle
        cx={r}
        cy={r}
        r={r - 4}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="6"
      />
      {/* Active arc ticks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={glowColor}
          strokeWidth={1.2}
          opacity={0.9}
          style={
            t.active
              ? { filter: `drop-shadow(0 0 2px ${glowColor})` }
              : { opacity: 0.25 }
          }
        />
      ))}
      {/* Knob body */}
      <circle
        cx={r}
        cy={r}
        r={innerR}
        fill="url(#knobGradient)"
        stroke="#333"
        strokeWidth="1"
      />
      {/* Indicator dot */}
      <circle
        cx={indicatorX}
        cy={indicatorY}
        r={3}
        fill={glowColor}
        style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
      />
      {/* Label */}
      {label && (
        <text
          x={r}
          y={size + 14}
          textAnchor="middle"
          fill="#aaa"
          fontSize="10"
          fontFamily="Courier New, monospace"
        >
          {label}
        </text>
      )}
      {/* Value readout */}
      <text
        x={r}
        y={size + 26}
        textAnchor="middle"
        fill={glowColor}
        fontSize="9"
        fontFamily="Courier New, monospace"
      >
        {Math.round(value)}dB
      </text>
    </g>
  )
}
