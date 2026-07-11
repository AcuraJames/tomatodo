import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '../types'

const EMOJIS = ['📁', '💻', '🎨', '📝', '📊', '🎯', '📚', '🏠', '❤️', '⭐', '🔥', '💡', '🎵', '📸', '✍️', '🧠', '🚴', '🏃', '🏋️', '⚽', '🏀', '🎾']

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])

  const sortedProjects = computed(() =>
    [...projects.value].sort((a, b) => a.sortOrder - b.sortOrder)
  )

  function addProject(name: string, color: string, emoji: string) {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      color,
      emoji,
      sortOrder: projects.value.length,
      createdAt: new Date().toISOString(),
    }
    projects.value.push(project)
  }

  function updateProject(id: string, data: Partial<Project>) {
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) Object.assign(projects.value[idx], data)
  }

  function deleteProject(id: string) {
    projects.value = projects.value.filter(p => p.id !== id)
  }

  function reorder(orderedIds: string[]) {
    orderedIds.forEach((id, i) => {
      const p = projects.value.find(p => p.id === id)
      if (p) p.sortOrder = i
    })
  }

  return { projects, sortedProjects, addProject, updateProject, deleteProject, reorder, EMOJIS }
}, {
  persist: true,
})
