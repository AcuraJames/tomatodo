<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})
</script>

<template>
  <button
    class="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'md' && 'px-5 py-2.5 text-base',
      size === 'lg' && 'px-7 py-3.5 text-lg',
      variant === 'primary' && 'bg-accent text-white hover:opacity-90 shadow-lg shadow-accent/25',
      variant === 'secondary' && 'glass hover:bg-white/30 dark:hover:bg-white/10',
      variant === 'ghost' && 'hover:bg-black/5 dark:hover:bg-white/10',
    ]"
  >
    <slot />
  </button>
</template>
