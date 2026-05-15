interface StatusLEDProps {
  active: boolean
  color: 'green' | 'red' | 'amber'
  size?: number
  label?: string
  cx: number
  cy: number
}

const colorMap = {
  green: { on: '#39ff14', glow: '#39ff14' },
  red: { on: '#ff3131', glow: '#ff3131' },
  amber: { on: '#ffaa00', glow: '#ffaa00' },
}

export function StatusLED({ active, color, size = 6, cx, cy, label }: StatusLEDProps) {
  const { on, glow } = colorMap[color]
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={active ? on : '#1a1a1a'}
        stroke="#111"
        strokeWidth="1"
        style={active ? { filter: `drop-shadow(0 0 4px ${glow})` } : undefined}
      />
      {label && (
        <text
          x={cx}
          y={cy + size + 10}
          textAnchor="middle"
          fill="#666"
          fontSize="8"
          fontFamily="Courier New, monospace"
        >
          {label}
        </text>
      )}
    </g>
  )
}
