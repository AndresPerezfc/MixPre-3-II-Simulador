import { MixPre3 } from './components/MixPre3'
import { useMixerStore } from './store/mixerStore'

export default function App() {
  const { audioError } = useMixerStore()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] px-4">
      <MixPre3 />

      {/* Error / instructions */}
      <div className="mt-4 text-center" style={{ fontFamily: 'Courier New, monospace' }}>
        {audioError && (
          <p className="text-red-500 text-sm">
            Micrófono: {audioError}
          </p>
        )}
        <p className="text-[#333] text-xs mt-2">
          Haz clic en el botón de encendido para iniciar el simulador · Requiere permiso de micrófono
        </p>
      </div>
    </div>
  )
}
