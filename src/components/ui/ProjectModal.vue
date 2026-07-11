<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Project } from '../../types'
import { useProjectsStore } from '../../stores/projectsStore'
import GlassButton from './GlassButton.vue'

const props = defineProps<{
  project?: Project | null
}>()

const emit = defineEmits<{ close: [] }>()
const projects = useProjectsStore()

const name = ref('')
const selectedColor = ref('#7c3aed')
const selectedEmoji = ref('📁')
const isEdit = ref(false)

const colors = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']
const emojis = ['📁', '💻', '🎨', '📝', '📊', '🎯', '📚', '🏠', '❤️', '⭐', '🔥', '💡', '🎵', '📸', '✍️', '🧠', '🌸', '🌿', '🍀', '🌺', '🎋', '🏯', '⛩️', '🗾', '🚴', '🏃', '🏋️', '⚽', '🏀', '🎾']

onMounted(() => {
  if (props.project) {
    isEdit.value = true
    name.value = props.project.name
    selectedColor.value = props.project.color
    selectedEmoji.value = props.project.emoji
  }
})

function save() {
  if (!name.value.trim()) return
  if (isEdit.value && props.project) {
    projects.updateProject(props.project.id, {
      name: name.value.trim(),
      color: selectedColor.value,
      emoji: selectedEmoji.value,
    })
  } else {
    projects.addProject(name.value.trim(), selectedColor.value, selectedEmoji.value)
  }
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-white dark:bg-[#1a1a2e] p-6 rounded-2xl w-80 space-y-5 shadow-2xl border border-glass-border">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">{{ isEdit ? 'Редактировать проект' : 'Новый проект' }}</h3>
        <button class="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-text-secondary" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="flex gap-3 items-center">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          :style="{ background: selectedColor + '20' }"
        >
          {{ selectedEmoji }}
        </div>
        <input
          v-model="name"
          class="flex-1 bg-transparent border-b-2 border-glass-border focus:border-accent outline-none px-1 py-1 text-sm transition-colors"
          placeholder="Название проекта..."
          @keyup.enter="save"
        />
      </div>

      <div>
        <label class="text-xs text-text-secondary mb-2 block">Цвет</label>
        <div class="flex gap-2">
          <button
            v-for="c in colors"
            :key="c"
            class="w-7 h-7 rounded-full transition-all duration-200 cursor-pointer"
            :class="selectedColor === c ? 'ring-2 ring-offset-2 ring-accent' : ''"
            :style="{ background: c }"
            @click="selectedColor = c"
          />
        </div>
      </div>

      <div>
        <label class="text-xs text-text-secondary mb-2 block">Эмодзи</label>
        <div class="grid grid-cols-6 gap-1">
          <button
            v-for="e in emojis"
            :key="e"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all duration-200 cursor-pointer"
            :class="selectedEmoji === e ? 'bg-accent/20 ring-1 ring-accent' : 'hover:bg-black/5 dark:hover:bg-white/5'"
            @click="selectedEmoji = e"
          >
            {{ e }}
          </button>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <GlassButton variant="ghost" class="flex-1" @click="emit('close')">Отмена</GlassButton>
        <GlassButton class="flex-1" :disabled="!name.trim()" @click="save">{{ isEdit ? 'Сохранить' : 'Создать' }}</GlassButton>
      </div>
    </div>
  </div>
</template>
