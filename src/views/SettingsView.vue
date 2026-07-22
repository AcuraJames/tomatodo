<script setup lang="ts">
import GlassCard from '../components/ui/GlassCard.vue'
import { useSettingsStore } from '../stores/settingsStore'
import { useTheme } from '../composables/useTheme'

const settings = useSettingsStore()
const { isDark, toggle } = useTheme()
</script>

<template>
  <div class="max-w-xl mx-auto space-y-6">
    <h1 class="text-2xl font-semibold">Настройки</h1>

    <GlassCard padding="p-6">
      <h3 class="text-sm font-medium text-text-secondary mb-4">Внешний вид</h3>

      <div class="flex items-center justify-between">
        <span class="text-sm">Тёмная тема</span>
        <button
          class="relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer"
          :class="isDark ? 'bg-accent' : 'bg-glass-border'"
          @click="toggle"
        >
          <div
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
            :class="isDark ? 'translate-x-6' : 'translate-x-0.5'"
          />
        </button>
      </div>
    </GlassCard>

    <GlassCard padding="p-6">
      <h3 class="text-sm font-medium text-text-secondary mb-4">Таймер</h3>

      <div class="flex items-center justify-between">
        <span class="text-sm">Автозапуск следующей сессии</span>
        <button
          class="relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer"
          :class="settings.autoStartNextSession ? 'bg-accent' : 'bg-glass-border'"
          @click="settings.autoStartNextSession = !settings.autoStartNextSession"
        >
          <div
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
            :class="settings.autoStartNextSession ? 'translate-x-6' : 'translate-x-0.5'"
          />
        </button>
      </div>
    </GlassCard>

    <GlassCard padding="p-6">
      <h3 class="text-sm font-medium text-text-secondary mb-4">Звук</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm">Звуковые уведомления</span>
          <button
            class="relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer"
            :class="settings.soundEnabled ? 'bg-accent' : 'bg-glass-border'"
            @click="settings.soundEnabled = !settings.soundEnabled"
          >
            <div
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
              :class="settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">Фоновая музыка</span>
          <button
            class="relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer"
            :class="settings.musicEnabled ? 'bg-accent' : 'bg-glass-border'"
            @click="settings.musicEnabled = !settings.musicEnabled"
          >
            <div
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
              :class="settings.musicEnabled ? 'translate-x-6' : 'translate-x-0.5'"
            />
          </button>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm">Громкость</span>
            <span class="text-xs text-text-secondary">{{ Math.round(settings.volume * 100) }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="settings.volume"
            @input="settings.volume = parseFloat(($event.target as HTMLInputElement).value)"
            class="w-full accent-accent"
          />
        </div>
      </div>
    </GlassCard>

    <GlassCard padding="p-6">
      <h3 class="text-sm font-medium text-text-secondary mb-4">О приложении</h3>
      <div class="text-sm text-text-secondary space-y-1">
        <p>Tomatodo — помодоро-таймер с японским садом</p>
        <p>Версия 0.1.14</p>
      </div>
    </GlassCard>
  </div>
</template>
