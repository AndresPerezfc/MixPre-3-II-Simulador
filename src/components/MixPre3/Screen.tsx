import { useMixerStore } from '../../store/mixerStore'
import { Meter } from './Meter'

interface ScreenProps {
  x: number
  y: number
  width: number
  height: number
  booting: boolean
  bootPhase: number
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const BOOT_LINES = [
  'Sound Devices MixPre-3 II',
  'v7.20 Firmware',
  'Initializing audio engine...',
  'Ready.',
]

export function Screen({ x, y, width, height, booting, bootPhase }: ScreenProps) {
  const { channels, transport, recordingSeconds, isAudioReady } = useMixerStore()
  const pad = 12

  const meterWidth = 18
  const meterHeight = height - 80
  const meterY = y + 32
  const meterSpacing = (width - pad * 2) / 3

  return (
    <g>
      {/* Screen bezel */}
      <rect x={x} y={y} width={width} height={height} fill="#050505" rx="4" />
      <rect
        x={x + 2}
        y={y + 2}
        width={width - 4}
        height={height - 4}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1"
        rx="3"
      />

      {booting ? (
        // Boot sequence
        <g>
          {BOOT_LINES.slice(0, bootPhase + 1).map((line, i) => (
            <text
              key={i}
              x={x + pad}
              y={y + 30 + i * 18}
              fill={i === bootPhase ? '#39ff14' : '#2a6a14'}
              fontSize="11"
              fontFamily="Courier New, monospace"
              className="boot-text"
            >
              {line}
            </text>
          ))}
        </g>
      ) : (
        // Operating display
        <g>
          {/* Header bar */}
          <rect x={x} y={y} width={width} height={22} fill="#0d0d0d" rx="4" />
          <text
            x={x + pad}
            y={y + 15}
            fill="#555"
            fontSize="10"
            fontFamily="Courier New, monospace"
          >
            SOUND DEVICES  MixPre-3 II
          </text>

          {/* Channel meters */}
          {channels.map((ch, i) => {
            const meterX = x + pad + i * meterSpacing + meterSpacing / 2 - meterWidth / 2
            return (
              <g key={ch.id}>
                <text
                  x={meterX + meterWidth / 2}
                  y={meterY - 14}
                  textAnchor="middle"
                  fill="#aaa"
                  fontSize="9"
                  fontFamily="Courier New, monospace"
                >
                  {ch.name}
                </text>
                <Meter
                  level={ch.level}
                  clipping={ch.clipping}
                  x={meterX}
                  y={meterY}
                  width={meterWidth}
                  height={meterHeight}
                />
                {/* Phantom indicator on screen */}
                {ch.phantom && (
                  <text
                    x={meterX + meterWidth / 2}
                    y={meterY + meterHeight + 22}
                    textAnchor="middle"
                    fill="#4488ff"
                    fontSize="8"
                    fontFamily="Courier New, monospace"
                    style={{ filter: 'drop-shadow(0 0 2px #4488ff)' }}
                  >
                    48V
                  </text>
                )}
              </g>
            )
          })}

          {/* Bottom info bar */}
          <rect
            x={x}
            y={y + height - 36}
            width={width}
            height={36}
            fill="#0d0d0d"
          />

          {/* Transport status */}
          {transport === 'recording' && (
            <g>
              <circle
                cx={x + pad + 5}
                cy={y + height - 22}
                r={5}
                fill="#ff3131"
                className="rec-pulse"
                style={{ filter: 'drop-shadow(0 0 4px #ff3131)' }}
              />
              <text
                x={x + pad + 14}
                y={y + height - 18}
                fill="#ff3131"
                fontSize="10"
                fontFamily="Courier New, monospace"
                style={{ filter: 'drop-shadow(0 0 2px #ff3131)' }}
              >
                REC  {formatTime(recordingSeconds)}
              </text>
            </g>
          )}

          {transport === 'idle' && (
            <text
              x={x + pad}
              y={y + height - 18}
              fill="#444"
              fontSize="10"
              fontFamily="Courier New, monospace"
            >
              {isAudioReady ? 'STANDBY' : 'NO INPUT'}
            </text>
          )}

          {/* Sample rate info */}
          <text
            x={x + width - pad}
            y={y + height - 18}
            textAnchor="end"
            fill="#444"
            fontSize="9"
            fontFamily="Courier New, monospace"
          >
            48kHz / 32bit
          </text>

          {/* No audio warning */}
          {!isAudioReady && (
            <text
              x={x + width / 2}
              y={y + height / 2}
              textAnchor="middle"
              fill="#333"
              fontSize="10"
              fontFamily="Courier New, monospace"
            >
              Haz clic en POWER para iniciar
            </text>
          )}
        </g>
      )}
    </g>
  )
}
