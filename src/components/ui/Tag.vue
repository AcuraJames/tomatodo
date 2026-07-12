<script setup lang="ts">
defineProps<{
  text: string
  color: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none"
    :style="{ background: color + '1A', color }"
  >
    {{ text }}
  </span>
</template>
