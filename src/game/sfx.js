let ac = null

function ctx() {
  if (!ac) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) ac = new AC()
    } catch (e) {
      ac = null
    }
  }
  if (ac && ac.state === 'suspended') ac.resume()
  return ac
}

function tone(freq, dur = 0.1, type = 'square', vol = 0.08, delay = 0, glide = null) {
  const c = ctx()
  if (!c) return
  const t = c.currentTime + delay
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(Math.max(20, freq), t)
  if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export const sfx = {
  step() {
    tone(190, 0.05, 'square', 0.025, 0, 130)
  },
  turn() {
    tone(210, 0.05, 'square', 0.025, 0, 170)
  },
  trap() {
    tone(120, 0.28, 'sawtooth', 0.11, 0, 70)
    tone(85, 0.34, 'square', 0.1, 0.03, 55)
  },
  tick() {
    tone(1350, 0.045, 'square', 0.04)
  },
  bloom() {
    ;[523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.18, 'triangle', 0.09, i * 0.09))
  },
  win() {
    ;[523, 659, 784, 1046, 784, 1046, 1318, 2093].forEach((f, i) => tone(f, 0.22, 'triangle', 0.09, i * 0.13))
  },
  wisp() {
    tone(880, 0.2, 'sine', 0.04, 0, 1320)
  },
}