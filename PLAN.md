# Plan: Simulador Web Sound Devices MixPre-3 II

## Contexto
Se construirá un simulador web interactivo de la grabadora Sound Devices MixPre-3 II. El objetivo es replicar visualmente el panel frontal del dispositivo (dibujado en SVG sin assets externos) y conectarlo a audio real del micrófono del PC via Web Audio API. El producto final se desplegará en Vercel.

---

## Stack tecnológico

| Capa | Tecnología | Razón |
|---|---|---|
| Framework | React 18 + TypeScript | Componentes interactivos, tipado seguro |
| Bundler | Vite | Dev server rápido, build optimizado para Vercel |
| Estado | Zustand | Ligero, sin boilerplate, ideal para estado de hardware |
| Estilos | Tailwind CSS | Solo para el layout de la página; el dispositivo se estiliza con SVG/CSS inline |
| Gráficos | SVG puro (sin assets externos) | Escalable, interactivo, sin licencias |
| Audio | Web Audio API (nativo del navegador) | Sin dependencias externas |
| Grabación | MediaRecorder API (nativo del navegador) | Para exportar archivo de audio |

**Dependencias de producción:** `react`, `react-dom`, `zustand`  
**Dev:** `vite`, `typescript`, `tailwindcss`, `@types/react`

---

## Representación gráfica (basada en fotos de referencia reales)

El panel frontal se dibuja íntegramente con SVG inline (~900×320px). Las imágenes en `/imagenes-grabadora/` sirven de referencia fiel. No se requiere ninguna imagen externa en la app.

```
┌──[S]──────────────────────────────────────────────────────────────────────┐
│       1              2              3          ▶   ■              SOUND   │
│   ╔══════╗       ╔══════╗       ╔══════╗    [    ] [    ]  [REC] DEVICES  │
│   ║ (  ) ║       ║ (  ) ║       ║ (  ) ║                          ──────  │
│   ╚══════╝       ╚══════╝       ╚══════╝                   CH1 ████  -6  │
│  (aro verde)    (aro verde)    (aro verde)                  CH2 ██    -18 │
│   [48V][MUT]     [48V][MUT]     [48V][MUT]                 CH3 █     -24 │
│                                                                            │
│                                                       00:02:34  ● REC     │
│                                                       48kHz / 32bit float │
└────────────────────────────────────────────────────────────────────────────┘
```

**Elementos visuales — detalles exactos de las fotos:**

- **Chasis**: cuerpo negro mate `#1a1a1a`, con ribetes/agarraderas laterales metálicas plateadas (rectángulos redondeados `#888` con tornillos decorativos en esquinas)
- **Botón de power**: esquina superior izquierda, círculo pequeño con ícono "S" en naranja/rojo `#e84c1e`
- **Knobs de ganancia** (×3): 
  - Círculo exterior `#111` con marcas de escala en verde `#39ff14` alrededor
  - **Anillo LED verde brillante** entre el cuerpo del knob y las marcas (efecto `box-shadow` o `filter: drop-shadow` en SVG)
  - Indicador de posición: línea o punto en el centro del knob
  - Controlados con arrastre vertical del mouse; rango 0–60 dB
- **Etiquetas de canal**: "1", "2", "3" sobre cada knob en blanco
- **Botones de transporte** (entre knobs y pantalla):
  - Play (▶): círculo blanco `#e8e8e8` mediano
  - Stop (■): círculo blanco `#e8e8e8` mediano  
  - **REC**: rectángulo blanco grande con texto negro "REC" en negrita — es el más prominente
- **Pantalla**: tercio derecho del panel, fondo negro `#050505`, texto y barras en verde `#39ff14` y blanco; logo "SOUND DEVICES" en reposo; muestra niveles, timer y datos técnicos durante operación
- **Botones por canal** (debajo de cada knob): `[48V]` y `[MUTE]` — rectángulos pequeños, se iluminan al activar
- **Decoración lateral izquierda** (solo visual, sin funcionalidad): silueta de 2 conectores XLR circulares
- **Decoración lateral derecha** (solo visual): silueta del conector XLR del canal 3 + jack de auriculares + knob dentado HP

---

## Arquitectura del audio (Web Audio API)

```
getUserMedia (micrófono del PC)
        │
  MediaStreamSourceNode
        │
  ┌─────┴────────────────────────────┐
  │                                  │
GainNode (CH1)              ChannelSplitter
AnalyserNode (CH1)          GainNode (CH2) ← canal derecho (si mic es estéreo)
  │                         AnalyserNode (CH2)
  │                                  │
  └──────────┬───────────────────────┘
             │            GainNode (CH3) ← misma fuente mono, gain independiente
             ▼
       GainNode (master / headphone)
       AnalyserNode (master)
             │
   AudioContext.destination  →  MediaRecorder (para grabación)
```

**Nota sobre CH3:** Si el micrófono es mono, CH3 usará la misma señal que CH1 pero con su propio nodo de ganancia independiente. Si el micrófono es estéreo, CH1=Left, CH2=Right, CH3=suma mono.

**Medición de niveles (metering):**
- Loop `requestAnimationFrame` → `AnalyserNode.getFloatTimeDomainData()` → cálculo RMS → conversión a dB → actualiza el store → las barras SVG se re-renderizan.

---

## Estructura de archivos del proyecto

```
simulador-muntusia/
├── public/
├── src/
│   ├── components/
│   │   └── MixPre3/
│   │       ├── index.tsx           # Wrapper principal del dispositivo
│   │       ├── DeviceBody.tsx      # SVG del chasis y layout general
│   │       ├── ChannelStrip.tsx    # Strip por canal (knob + phantom + mute + LEDs)
│   │       ├── Knob.tsx            # Knob rotativo reutilizable (drag vertical)
│   │       ├── Meter.tsx           # Barras de nivel animadas en SVG
│   │       ├── Screen.tsx          # Pantalla táctil (niveles + timer + info)
│   │       ├── Transport.tsx       # Botones REC / PLAY / STOP
│   │       └── StatusLED.tsx       # LED señal / clip
│   ├── hooks/
│   │   ├── useAudioEngine.ts       # Setup AudioContext, nodos, conexiones
│   │   ├── useMeter.ts             # rAF loop → niveles en dB para cada canal
│   │   └── useRecorder.ts          # MediaRecorder → descarga de archivo .webm
│   ├── store/
│   │   └── mixerStore.ts           # Estado global (Zustand)
│   ├── App.tsx                     # Layout de página (fondo oscuro + dispositivo centrado)
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## Modelo de estado (Zustand)

```typescript
interface Channel {
  id: 1 | 2 | 3
  name: string          // "CH 1", "CH 2", "CH 3"
  gain: number          // 0–60 dB
  phantomPower: boolean // 48V phantom power
  muted: boolean
  level: number         // dB RMS en tiempo real (-60 a 0), actualizado por rAF
  clipping: boolean     // true si supera -1 dBFS
}

interface MixerState {
  power: boolean
  channels: [Channel, Channel, Channel]
  transport: 'idle' | 'recording' | 'playing'
  recordingSeconds: number
  headphoneGain: number   // 0–100
  isAudioReady: boolean
  audioError: string | null
  // Acciones
  setPower: (on: boolean) => void
  setChannelGain: (id: number, dB: number) => void
  togglePhantom: (id: number) => void
  toggleMute: (id: number) => void
  setTransport: (state: 'idle' | 'recording' | 'playing') => void
  setHeadphoneGain: (val: number) => void
  setChannelLevel: (id: number, dB: number, clipping: boolean) => void
  setAudioReady: (ready: boolean, error?: string) => void
}
```

---

## Operaciones básicas a implementar

| # | Operación | Descripción |
|---|---|---|
| 1 | **Encendido/apagado** | Animación de boot en la pantalla al activar el power |
| 2 | **Ganancia por canal** | Knob rotativo con arrastre vertical, rango 0–60 dB |
| 3 | **Phantom Power 48V** | Toggle por canal, botón se ilumina en azul al activar |
| 4 | **Mute por canal** | Silencia el canal, barra de nivel queda en 0 |
| 5 | **Medidores en tiempo real** | Barras SVG animadas via rAF, responden al micrófono real |
| 6 | **LEDs de señal y clip** | Verde si hay señal presente, rojo si supera -1 dBFS |
| 7 | **Transporte: REC / PLAY / STOP** | Estados del dispositivo con indicadores visuales |
| 8 | **Timer de grabación** | Contador visible en pantalla durante REC |
| 9 | **Grabación y descarga** | MediaRecorder captura audio procesado → descarga `.webm` |
| 10 | **Volumen de auriculares** | Knob master que controla el GainNode de salida |
| 11 | **Pantalla informativa** | Nombres de canales, niveles, timer, "48kHz / 32-bit float" |

---

## Fases de implementación

### Fase 1 — Scaffold del proyecto
- Crear proyecto con `npm create vite@latest`
- Instalar dependencias: `zustand`, `tailwindcss`
- Configurar `vercel.json` para SPA (redirect todas las rutas a `index.html`)
- Verificar `npm run dev` funciona

### Fase 2 — Visual: SVG del dispositivo
- `DeviceBody.tsx` — chasis SVG completo (sin funcionalidad aún)
- `Knob.tsx` — componente knob con interacción drag (mousedown → mousemove → mouseup)
- `ChannelStrip.tsx` — 3 canales con knob + LED + botón phantom + botón mute
- `Transport.tsx` — botones REC/PLAY/STOP con estados visuales
- `Screen.tsx` — pantalla con placeholder estático

### Fase 3 — Estado global
- Implementar `mixerStore.ts` completo
- Conectar todos los componentes visuales al store
- Los controles actualizan el estado, los displays leen del estado

### Fase 4 — Motor de audio
- `useAudioEngine.ts` — solicitar permisos mic, construir grafo de AudioContext
- `useMeter.ts` — loop rAF que actualiza `channel.level` y `channel.clipping` en el store
- `useRecorder.ts` — MediaRecorder sobre el destino del AudioContext
- Conectar `channel.gain` del store a los GainNodes correspondientes en tiempo real

### Fase 5 — Pantalla animada
- Barras de nivel en `Screen.tsx` conectadas a `channel.level` (SVG `<rect height>` dinámico)
- Timer de grabación (`recordingSeconds` en el store, incrementa cada segundo durante REC)
- Indicadores de sample rate, estado de transporte, nombre de canales

### Fase 6 — Polish
- Animación de boot al encender (secuencia de texto en pantalla)
- Efectos hover/active en botones y knobs (CSS)
- Responsive: el dispositivo SVG se escala con `viewBox` en pantallas pequeñas
- Manejo de errores (mic denegado, navegador sin soporte)

---

## Verificación (checklist de pruebas)

- [ ] `npm run dev` — dispositivo visible en pantalla sin errores de consola
- [ ] Clic en power → animación de boot en pantalla
- [ ] Permisos de micrófono concedidos → LEDs de señal cambian a verde
- [ ] Arrastrar knob CH1 hacia arriba → barra de CH1 en pantalla sube
- [ ] Activar 48V en CH1 → botón se ilumina en azul
- [ ] Clic MUTE en CH2 → barra de CH2 queda en 0 aunque haya señal
- [ ] Clic REC → botón rojo activo, timer avanza, LED de grabación parpadea
- [ ] Clic STOP → timer se detiene, aparece opción de descarga del archivo
- [ ] `npm run build` → sin errores TypeScript, sin warnings críticos
- [ ] Abrir el build en HTTPS (Vercel) → micrófono funciona igual que en local

---

## Notas importantes

- El micrófono **requiere HTTPS** en producción. Vercel lo provee automáticamente. En desarrollo, `localhost` es permitido por los navegadores.
- La grabación exporta formato `.webm` (Opus codec), compatible con todos los navegadores modernos. Si se requiere `.wav` en el futuro, se puede agregar un encoder en el cliente.
- El Phantom Power 48V es un indicador visual en el simulador; no afecta el audio del PC (en el hardware real alimenta micrófonos de condensador via XLR).
