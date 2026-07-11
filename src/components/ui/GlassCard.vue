<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'strong'
  padding?: string
}>(), {
  variant: 'default',
  padding: 'p-6',
})

const classes = computed(() => [
  props.variant === 'strong' ? 'glass-strong' : 'glass',
  props.padding,
])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
