<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  progress: number
  isDark: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animFrame: number | null = null
let resizeObserver: ResizeObserver | null = null

const palette = computed(() => props.isDark ? DARK : LIGHT)

const LIGHT = {
  sky1: 'rgba(230, 210, 180, 0.9)',
  sky2: 'rgba(210, 195, 170, 0.85)',
  sun: 'rgba(220, 180, 130, 0.25)',
  mountain: 'rgba(140, 155, 145, 0.35)',
  mountain2: 'rgba(120, 140, 130, 0.3)',
  ground1: 'rgba(160, 170, 130, 0.5)',
  ground2: 'rgba(140, 155, 120, 0.6)',
  ground3: 'rgba(120, 140, 110, 0.7)',
  pond: 'rgba(150, 180, 190, 0.25)',
  ripple: 'rgba(100, 130, 140, 0.1)',
  trunk: 'rgba(100, 80, 70, 0.5)',
  pot: 'rgba(180, 150, 130, 0.6)',
  potBorder: 'rgba(140, 110, 90, 0.5)',
  foliage: 'rgba(130, 160, 120, 0.5)',
  foliage2: 'rgba(110, 140, 100, 0.4)',
  foliage3: 'rgba(90, 120, 80, 0.3)',
  petal: 'rgba(220, 170, 170, 0.2)',
}

const DARK = {
  sky1: 'rgba(25, 20, 30, 0.95)',
  sky2: 'rgba(40, 35, 45, 0.9)',
  sun: 'rgba(255, 200, 100, 0.2)',
  mountain: 'rgba(60, 70, 80, 0.5)',
  mountain2: 'rgba(50, 60, 70, 0.4)',
  ground1: 'rgba(30, 40, 35, 0.6)',
  ground2: 'rgba(25, 35, 30, 0.7)',
  ground3: 'rgba(15, 25, 20, 0.8)',
  pond: 'rgba(60, 100, 120, 0.3)',
  ripple: 'rgba(180, 210, 230, 0.06)',
  trunk: 'rgba(80, 60, 50, 0.9)',
  pot: 'rgba(160, 130, 110, 0.9)',
  potBorder: 'rgba(120, 90, 70, 0.8)',
  foliage: 'rgba(90, 140, 80, 0.7)',
  foliage2: 'rgba(60, 110, 60, 0.5)',
  foliage3: 'rgba(40, 80, 40, 0.3)',
  petal: 'rgba(255, 180, 190, 0.15)',
}

function drawSun(ctx: CanvasRenderingContext2D, w: number, h: number, p: typeof LIGHT) {
  const grad = ctx.createRadialGradient(w * 0.8, h * 0.12, 0, w * 0.8, h * 0.12, w * 0.12)
  grad.addColorStop(0, p.sun)
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(w * 0.8, h * 0.12, w * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

function drawMountains(ctx: CanvasRenderingContext2D, w: number, h: number, p: typeof LIGHT) {
  ctx.fillStyle = p.mountain
  ctx.beginPath()
  ctx.moveTo(0, h * 0.5)
  ctx.quadraticCurveTo(w * 0.1, h * 0.22, w * 0.2, h * 0.4)
  ctx.quadraticCurveTo(w * 0.3, h * 0.18, w * 0.38, h * 0.35)
  ctx.quadraticCurveTo(w * 0.5, h * 0.15, w * 0.6, h * 0.38)
  ctx.quadraticCurveTo(w * 0.7, h * 0.12, w * 0.8, h * 0.32)
  ctx.quadraticCurveTo(w * 0.9, h * 0.2, w, h * 0.45)
  ctx.lineTo(w, h * 0.52)
  ctx.lineTo(0, h * 0.52)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = p.mountain2
  ctx.beginPath()
  ctx.moveTo(0, h * 0.52)
  ctx.quadraticCurveTo(w * 0.15, h * 0.35, w * 0.25, h * 0.45)
  ctx.quadraticCurveTo(w * 0.4, h * 0.3, w * 0.5, h * 0.48)
  ctx.quadraticCurveTo(w * 0.6, h * 0.28, w * 0.7, h * 0.42)
  ctx.quadraticCurveTo(w * 0.85, h * 0.38, w, h * 0.48)
  ctx.lineTo(w, h * 0.52)
  ctx.lineTo(0, h * 0.52)
  ctx.closePath()
  ctx.fill()
}

function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number, p: typeof LIGHT) {
  const grad = ctx.createLinearGradient(0, h * 0.52, 0, h)
  grad.addColorStop(0, p.ground1)
  grad.addColorStop(0.25, p.ground2)
  grad.addColorStop(1, p.ground3)
  ctx.fillStyle = grad
  ctx.fillRect(0, h * 0.52, w, h * 0.48)
}

function drawPond(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, p: typeof LIGHT) {
  const cx = w * 0.28
  const cy = h * 0.68
  const rx = w * 0.13
  const ry = h * 0.05

  const pondGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx)
  pondGrad.addColorStop(0, p.pond)
  pondGrad.addColorStop(0.6, p.pond)
  pondGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = pondGrad
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 3; i++) {
    const r = rx * (0.2 + i * 0.28) + Math.sin(time + i * 2) * 3
    ctx.strokeStyle = p.ripple
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.ellipse(cx, cy, r, r * 0.55, Math.sin(time * 0.3 + i) * 0.08, 0, Math.PI * 2)
    ctx.stroke()
  }

  for (let i = 0; i < 3; i++) {
    const speed = 0.35 + i * 0.08
    const a = time * speed + i * 2.1
    const fx = cx + Math.sin(a) * rx * 0.5
    const fy = cy + Math.cos(a) * ry * 0.4
    const vx = Math.cos(a) * rx * 0.5
    const vy = -Math.sin(a) * ry * 0.4
    const fa = Math.atan2(vy, vx)
    const bodyWave = Math.sin(time * 3 + i * 2) * 0.25
    const tailWag = Math.sin(time * 4 + i * 3) * 0.4
    const fs = 2.5 + i * 0.5

    ctx.save()
    ctx.translate(fx, fy)
    ctx.rotate(fa + bodyWave)
    ctx.scale(1, 0.35)

    ctx.fillStyle = `hsla(${30 + i * 20}, 70%, 60%, 0.4)`
    ctx.beginPath()
    ctx.ellipse(0, 0, fs * 2, fs * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = `hsla(${30 + i * 20}, 60%, 45%, 0.3)`
    ctx.beginPath()
    ctx.moveTo(-fs * 1.8, 0)
    ctx.quadraticCurveTo(-fs * 3, -fs * 0.6 + tailWag * fs, -fs * 3.5, tailWag * fs * 0.5)
    ctx.quadraticCurveTo(-fs * 3, fs * 0.6 + tailWag * fs, -fs * 1.8, 0)
    ctx.fill()

    ctx.restore()
  }
}

function drawPetals(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, p: typeof LIGHT) {
  for (let i = 0; i < 6; i++) {
    const x = ((i * 137 + time * 25) % (w + 30)) - 15
    const y = ((i * 89 + time * 15 + i * 50) % (h * 0.55)) + h * 0.05
    const sway = Math.sin(time + i * 1.7) * 8

    ctx.fillStyle = p.petal
    ctx.beginPath()
    ctx.ellipse(x + sway, y, 3, 1.8, Math.sin(time + i) * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  const time = Date.now() / 1000
  const p = palette.value

  ctx.clearRect(0, 0, w, h)

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, p.sky1)
  sky.addColorStop(0.4, p.sky2)
  sky.addColorStop(0.55, 'transparent')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  drawSun(ctx, w, h, p)
  drawMountains(ctx, w, h, p)
  drawGround(ctx, w, h, p)
  drawPond(ctx, w, h, time, p)
  drawPetals(ctx, w, h, time, p)

  animFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }
  animate()

  resizeObserver = new ResizeObserver(() => {
    const c = canvasRef.value
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    c.width = c.offsetWidth * dpr
    c.height = c.offsetHeight * dpr
    const ctx = c.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
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
  <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />
</template>
