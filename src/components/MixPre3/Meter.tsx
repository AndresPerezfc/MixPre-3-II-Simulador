interface MeterProps {
  level: number    // -60 to 0 dBFS
  clipping: boolean
  x: number
  y: number
  width: number
  height: number
  label?: string
}

function levelToHeight(level: number, maxHeight: number): number {
  const pct = (level + 60) / 60  // 0 to 1
  return Math.max(0, pct * maxHeight)
}

function levelToColor(level: number, clipping: boolean): string {
  if (clipping) return '#ff3131'
  if (level > -6) return '#ffaa00'
  return '#39ff14'
}

export function Meter({ level, clipping, x, y, width, height, label }: MeterProps) {
  const fillHeight = levelToHeight(level, height)
  const fillY = y + height - fillHeight
  const color = levelToColor(level, clipping)

  // dB markers
  const markers = [-60, -40, -20, -12, -6, -3, 0]

  return (
    <g>
      {/* Background track */}
      <rect x={x} y={y} width={width} height={height} fill="#0a0a0a" rx="2" />

      {/* Level fill */}
      <rect
        x={x + 1}
        y={fillY}
        width={width - 2}
        height={fillHeight}
        fill={color}
        rx="1"
        style={fillHeight > 0 ? { filter: `drop-shadow(0 0 3px ${color})` } : undefined}
      />

      {/* Scale markers */}
      {markers.map((db) => {
        const markerY = y + height - levelToHeight(db, height)
        return (
          <g key={db}>
            <line
              x1={x - 2}
              y1={markerY}
              x2={x + width + 2}
              y2={markerY}
              stroke="#333"
              strokeWidth="0.5"
            />
          </g>
        )
      })}

      {/* Label */}
      {label && (
        <text
          x={x + width / 2}
          y={y - 5}
          textAnchor="middle"
          fill="#888"
          fontSize="9"
          fontFamily="Courier New, monospace"
        >
          {label}
        </text>
      )}

      {/* dB value */}
      <text
        x={x + width / 2}
        y={y + height + 12}
        textAnchor="middle"
        fill={clipping ? '#ff3131' : '#666'}
        fontSize="8"
        fontFamily="Courier New, monospace"
      >
        {level > -60 ? `${Math.round(level)}` : '—'}
      </text>
    </g>
  )
}
