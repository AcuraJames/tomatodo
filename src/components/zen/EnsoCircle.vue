<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'

const props = defineProps<{
  progress: number
  size: number
}>()

const settings = useSettingsStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDark = computed(() => settings.theme === 'dark')

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = props.size * dpr
  canvas.height = props.size * dpr
  ctx.scale(dpr, dpr)

  const cx = props.size / 2
  const cy = props.size / 2
  const r = props.size / 2 - 6
  const color = isDark.value ? '#ffffff' : '#1a1a2e'

  ctx.clearRect(0, 0, props.size, props.size)

  // Background subtle ring
  ctx.strokeStyle = isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2)
  ctx.stroke()

  // Enso — incomplete circle with brushstroke effect
  const gapAngle = (1 - props.progress) * Math.PI * 2
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + Math.PI * 2 - gapAngle

  ctx.strokeStyle = color
  ctx.lineCap = 'round'

  // Outer thicker pass
  ctx.lineWidth = 4
  ctx.globalAlpha = 0.3 + props.progress * 0.7
  ctx.beginPath()
  ctx.arc(cx, cy, r, startAngle, endAngle)
  ctx.stroke()

  // Main brushstroke
  ctx.lineWidth = 2.5
  ctx.globalAlpha = 0.6 + props.progress * 0.4
  ctx.beginPath()
  ctx.arc(cx, cy, r, startAngle - 0.02, endAngle + 0.02)
  ctx.stroke()

  // Thin accent
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.arc(cx, cy, r - 1, startAngle, endAngle)
  ctx.stroke()

  // Ink splatter at the start of the stroke (sumi-e effect)
  if (props.progress > 0.02) {
    ctx.globalAlpha = 0.3
    ctx.fillStyle = color
    for (let i = 0; i < 3; i++) {
      const a = startAngle + (Math.PI * 2 * props.progress) * 0.05 * (i + 1)
      const sx = cx + Math.cos(a) * r
      const sy = cy + Math.sin(a) * r
      const sr = 1 + Math.random() * 1.5
      ctx.beginPath()
      ctx.arc(sx, sy, sr, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 1
}

watch(() => [props.progress, settings.theme], draw)
onMounted(draw)
</script>

<template>
  <canvas
    ref="canvasRef"
    :style="{ width: size + 'px', height: size + 'px' }"
    class="absolute inset-0 mx-auto my-auto"
  />
</template>
