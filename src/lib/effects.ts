// ============================================================
// Efeitos sensoriais — confetti (canvas), haptics (Vibration API),
// som (Web Audio API). Tudo com guard de suporte e toggle de som.
// ============================================================

// ---------- Haptics ----------

export function hapticSuccess() {
  if ('vibrate' in navigator) navigator.vibrate(50)
}

export function hapticError() {
  if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
}

export function hapticTap() {
  if ('vibrate' in navigator) navigator.vibrate(12)
}

// ---------- Som (Web Audio API) ----------

const SOUND_KEY = 'pralis:sound'

export function isSoundOn(): boolean {
  return localStorage.getItem(SOUND_KEY) !== 'off'
}

export function setSoundOn(on: boolean) {
  localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
}

let audioCtx: AudioContext | null = null
function ctx(): AudioContext | null {
  if (!isSoundOn()) return null
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      audioCtx = new AC()
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    return audioCtx
  } catch {
    return null
  }
}

function tone(freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 0.06) {
  const c = ctx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durationMs / 1000)
  osc.connect(g)
  g.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + durationMs / 1000)
}

/** "ding" sutil ao avançar story */
export function soundDing() {
  tone(880, 120, 'sine', 0.05)
}

/** acerto no quiz — duas notas ascendentes */
export function soundCorrect() {
  tone(660, 110, 'triangle', 0.06)
  setTimeout(() => tone(990, 160, 'triangle', 0.06), 90)
}

/** erro no quiz — nota descendente suave */
export function soundWrong() {
  tone(300, 220, 'sine', 0.05)
}

/** conclusão de módulo — pequeno arpejo */
export function soundComplete() {
  ;[523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 180, 'triangle', 0.05), i * 110))
}

// ---------- Confetti (Canvas 2D — espigas/grãos dourados) ----------

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  size: number
  color: string
  shape: 'grain' | 'leaf'
}

const CONFETTI_COLORS = ['#f37435', '#b8860b', '#d4a86a', '#ff8f5a', '#e8cfa0']

export function fireConfetti(durationMs = 1800) {
  if (typeof document === 'undefined') return
  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;width:100vw;height:100vh'
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  document.body.appendChild(canvas)
  const c = canvas.getContext('2d')
  if (!c) {
    canvas.remove()
    return
  }
  c.scale(dpr, dpr)

  const W = window.innerWidth
  const count = 90
  const particles: Particle[] = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: -20 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.3,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
    shape: Math.random() > 0.5 ? 'grain' : 'leaf',
  }))

  const start = performance.now()
  function frame(now: number) {
    const elapsed = now - start
    c!.clearRect(0, 0, W, window.innerHeight)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05
      p.rot += p.vr
      c!.save()
      c!.translate(p.x, p.y)
      c!.rotate(p.rot)
      c!.fillStyle = p.color
      if (p.shape === 'grain') {
        c!.beginPath()
        c!.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2)
        c!.fill()
      } else {
        c!.beginPath()
        c!.ellipse(0, 0, p.size * 0.5, p.size * 0.9, 0, 0, Math.PI * 2)
        c!.fill()
      }
      c!.restore()
    }
    if (elapsed < durationMs) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(frame)
}
