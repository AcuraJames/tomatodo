<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'

const props = defineProps<{
  progress: number
}>()

const settings = useSettingsStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animFrame: number | null = null
let resizeObserver: ResizeObserver | null = null

interface Koi {
  angle: number
  speed: number
  orbitFactor: number
  hue: number
  size: number
  tailPhase: number
}

const fish: Koi[] = []

function initFish() {
  fish.length = 0
  const colors = [350, 30, 40, 10, 0]
  for (let i = 0; i < 5; i++) {
    fish.push({
      angle: (Math.PI * 2 / 5) * i + (Math.random() - 0.5) * 0.2,
      speed: 0.00375 + i * 0.00075 + Math.random() * 0.0015,
      orbitFactor: 0.35 + i * 0.015 + Math.random() * 0.01,
      hue: colors[i],
      size: 10 + Math.random() * 5,
      tailPhase: i * Math.PI * 0.4,
    })
  }
}

function drawKoi(ctx: CanvasRenderingContext2D, koi: Koi, cx: number, cy: number, area: number) {
  const orbitR = area * koi.orbitFactor
  const x = cx + Math.cos(koi.angle) * orbitR
  const y = cy + Math.sin(koi.angle) * orbitR
  const angle = koi.angle + Math.PI / 2 + Math.sin(koi.tailPhase * 0.3) * 0.08

  const s = koi.size

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  const grad = ctx.createLinearGradient(-s * 2, 0, s * 2, 0)
  grad.addColorStop(0, `hsla(${koi.hue}, 80%, 55%, 0.7)`)
  grad.addColorStop(0.5, `hsla(${koi.hue + 20}, 90%, 75%, 0.8)`)
  grad.addColorStop(1, `hsla(${koi.hue}, 80%, 50%, 0.7)`)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 2, s * 0.7, 0, 0, Math.PI * 2)
  ctx.fill()

  const tailWag = Math.sin(koi.tailPhase) * 0.3
  ctx.fillStyle = `hsla(${koi.hue}, 70%, 45%, 0.6)`
  ctx.beginPath()
  ctx.moveTo(-s * 1.8, 0)
  ctx.quadraticCurveTo(-s * 2.8, -s * 0.6 + tailWag * s, -s * 3.2, tailWag * s * 0.5)
  ctx.quadraticCurveTo(-s * 2.8, s * 0.6 + tailWag * s, -s * 1.8, 0)
  ctx.fill()

  ctx.fillStyle = `hsla(${koi.hue + 30}, 70%, 65%, 0.3)`
  ctx.beginPath()
  ctx.moveTo(s * 0.5, -s * 0.6)
  ctx.quadraticCurveTo(0, -s * 1.3, -s * 0.8, -s * 0.5)
  ctx.fill()

  ctx.fillStyle = '#1a1a2e'
  ctx.beginPath()
  ctx.arc(s * 1.2, -s * 0.15, s * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.beginPath()
  ctx.arc(s * 1.3, -s * 0.2, s * 0.08, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = canvas.offsetWidth * dpr
  canvas.height = canvas.offsetHeight * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width / (window.devicePixelRatio || 1)
  const h = canvas.height / (window.devicePixelRatio || 1)
  const cx = w / 2
  const cy = h / 2
  const area = Math.min(w, h)
  const isDark = settings.theme === 'dark'

  ctx.clearRect(0, 0, w, h)

  const rippleColor = isDark ? '255, 255, 255' : '0, 0, 0'
  const ripples = [
    { r: area * 0.28 + Math.sin(Date.now() / 2000) * 3, opacity: 0.06 },
    { r: area * 0.38 + Math.sin(Date.now() / 2500 + 1) * 4, opacity: 0.04 },
    { r: area * 0.48 + Math.sin(Date.now() / 3000 + 2) * 5, opacity: 0.03 },
  ]
  for (const rip of ripples) {
    ctx.strokeStyle = `rgba(${rippleColor}, ${rip.opacity})`
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(cx, cy, rip.r, 0, Math.PI * 2)
    ctx.stroke()
  }

  for (const koi of fish) {
    koi.angle += koi.speed
    koi.tailPhase += 0.05 + koi.speed * 2
  }

  const SORTED = [...fish].sort((a, b) => a.size - b.size)
  for (const koi of SORTED) {
    drawKoi(ctx, koi, cx, cy, area)
  }

  animFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  initFish()
  resize()
  animate()

  resizeObserver = new ResizeObserver(() => {
    resize()
  })
  if (canvasRef.value?.parentElement) {
    resizeObserver.observe(canvasRef.value.parentElement)
  }
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<template>
  <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 5" />
</template>
