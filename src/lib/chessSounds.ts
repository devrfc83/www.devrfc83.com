import type { Chess, Move } from 'chess.js'

type ChessSound = 'move' | 'capture' | 'castle' | 'promote' | 'check' | 'gameEnd'

const MUTE_STORAGE_KEY = 'devrfc83-chess-sounds-muted'

let audioCtx: AudioContext | null = null
let soundsMuted = false

function readMutedFromStorage(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Lee preferencia guardada y sincroniza el estado del módulo (llamar al montar la página). */
export function initChessSoundsMuted(): boolean {
  soundsMuted = readMutedFromStorage()
  return soundsMuted
}

export function getChessSoundsMuted(): boolean {
  return soundsMuted
}

export function setChessSoundsMuted(muted: boolean) {
  soundsMuted = muted
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0')
  } catch {
    // localStorage no disponible
  }
}

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  void audioCtx.resume()
  return audioCtx
}

/** Desbloquea audio tras un gesto del usuario (política de autoplay del navegador). */
export function unlockChessSounds() {
  void getContext().resume()
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.12,
) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, start)
  g.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function noiseBurst(ctx: AudioContext, start: number, duration: number, gain = 0.08) {
  const bufferSize = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, start)
  g.gain.exponentialRampToValueAtTime(0.001, start + duration)
  src.connect(filter)
  filter.connect(g)
  g.connect(ctx.destination)
  src.start(start)
}

function play(kind: ChessSound) {
  const ctx = getContext()
  const t = ctx.currentTime

  switch (kind) {
    case 'move':
      noiseBurst(ctx, t, 0.04, 0.05)
      tone(ctx, 340, t, 0.035, 'triangle', 0.045)
      break
    case 'capture':
      noiseBurst(ctx, t, 0.09, 0.11)
      tone(ctx, 200, t, 0.09, 'square', 0.075)
      tone(ctx, 130, t + 0.025, 0.07, 'sine', 0.055)
      break
    case 'castle':
      tone(ctx, 300, t, 0.055, 'sine', 0.065)
      tone(ctx, 400, t + 0.045, 0.055, 'sine', 0.055)
      noiseBurst(ctx, t + 0.03, 0.05, 0.035)
      break
    case 'promote':
      tone(ctx, 440, t, 0.07, 'sine', 0.075)
      tone(ctx, 554, t + 0.07, 0.09, 'sine', 0.07)
      tone(ctx, 659, t + 0.14, 0.11, 'sine', 0.06)
      break
    case 'check':
      tone(ctx, 880, t, 0.09, 'sine', 0.09)
      tone(ctx, 1047, t + 0.1, 0.11, 'sine', 0.075)
      break
    case 'gameEnd':
      tone(ctx, 523, t, 0.18, 'sine', 0.09)
      tone(ctx, 659, t + 0.14, 0.22, 'sine', 0.08)
      tone(ctx, 784, t + 0.28, 0.3, 'sine', 0.065)
      break
  }
}

function soundForMove(move: Move, gameAfter: Chess): ChessSound {
  if (gameAfter.isGameOver()) return 'gameEnd'
  if (gameAfter.isCheck()) return 'check'
  if (move.isKingsideCastle() || move.isQueensideCastle()) return 'castle'
  if (move.isPromotion()) return 'promote'
  if (move.isCapture() || move.isEnPassant()) return 'capture'
  return 'move'
}

export function playChessMoveSound(move: Move, gameAfter: Chess) {
  if (soundsMuted) return
  try {
    play(soundForMove(move, gameAfter))
  } catch {
    // Sin audio (SSR, permisos, etc.)
  }
}
