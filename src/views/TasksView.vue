<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GlassButton from '../components/ui/GlassButton.vue'
import ProjectModal from '../components/ui/ProjectModal.vue'
import { useProjectsStore } from '../stores/projectsStore'
import { useTasksStore } from '../stores/tasksStore'
import type { Task } from '../types'

const route = useRoute()
const router = useRouter()
const projects = useProjectsStore()
const tasksStore = useTasksStore()

const newTaskTitle = ref('')
const editingTaskId = ref<string | null>(null)
const editValue = ref('')
const showProjectModal = ref(false)

const viewType = computed<'inbox' | 'today' | 'week' | 'project'>(() => {
  const v = route.params.view as string
  if (v === 'inbox' || v === 'today' || v === 'week') return v
  return 'project'
})

const projectId = computed(() => route.params.projectId as string || '')

const pageTitle = computed(() => {
  if (viewType.value === 'inbox') return { emoji: '📋', title: 'Входящие' }
  if (viewType.value === 'today') return { emoji: '📅', title: 'Сегодня' }
  if (viewType.value === 'week') return { emoji: '📆', title: 'На этой неделе' }
  const p = project.value
  if (p) return { emoji: p.emoji, title: p.name }
  return { emoji: '📁', title: 'Проекты' }
})

const project = computed(() => projects.sortedProjects.find(p => p.id === projectId.value))

const activeTasks = computed<Task[]>(() => {
  if (viewType.value === 'inbox') return tasksStore.inboxTasks
  if (viewType.value === 'today') return tasksStore.todayTasks
  if (viewType.value === 'week') return tasksStore.weekTasks
  if (projectId.value) {
    return tasksStore.projectTasks.filter(t => t.projectId === projectId.value)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }
  return []
})

const doneTasks = computed<Task[]>(() => {
  if (viewType.value === 'inbox') return tasksStore.doneInbox
  if (viewType.value === 'today') return tasksStore.doneToday
  if (viewType.value === 'week') return tasksStore.doneWeek
  if (projectId.value) {
    return tasksStore.doneProject.filter(t => t.projectId === projectId.value)
  }
  return []
})

watch(() => route.params, () => {
  newTaskTitle.value = ''
}, { immediate: true })

function addTask() {
  if (!newTaskTitle.value.trim()) return
  const listType = viewType.value === 'project' ? 'project' : viewType.value
  const pid = viewType.value === 'project' ? projectId.value : listType
  tasksStore.addTask(pid, newTaskTitle.value.trim(), listType)
  newTaskTitle.value = ''
}

function startEdit(taskId: string, title: string) {
  editingTaskId.value = taskId
  editValue.value = title
}

function saveEdit(taskId: string) {
  if (editValue.value.trim()) {
    tasksStore.updateTask(taskId, { title: editValue.value.trim() })
  }
  editingTaskId.value = null
}

function startProjectEdit() {
  showProjectModal.value = true
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}ч ${m}м`
  return `${m}м`
}

function goToTimer(taskId: string) {
  router.push(`/timer?task=${taskId}`)
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{ pageTitle.emoji }}</span>
        <h1 class="text-2xl font-semibold">{{ pageTitle.title }}</h1>
        <button
          v-if="project"
          class="p-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-all cursor-pointer"
          @click="startProjectEdit"
          title="Редактировать проект"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button
          v-if="project"
          class="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
          @click="projects.deleteProject(project.id); router.push('/tasks/inbox')"
          title="Удалить проект"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>

      <!-- Add task -->
      <div class="flex gap-3">
        <input
          v-model="newTaskTitle"
          class="flex-1 glass px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/50 rounded-xl"
          :placeholder="`Добавить задачу в «${pageTitle.title}»...`"
          @keyup.enter="addTask"
        />
        <GlassButton @click="addTask">Добавить</GlassButton>
      </div>

      <!-- Tasks -->
      <div class="space-y-1">
        <div
          v-for="t in activeTasks"
          :key="t.id"
          class="glass px-4 py-3 flex items-center gap-3 group hover:bg-white/30 dark:hover:bg-white/10 transition-all"
        >
          <button
            class="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all duration-200 hover:border-accent hover:bg-accent/10 cursor-pointer"
            :class="t.status === 'done' ? 'bg-accent border-accent' : 'border-text-secondary'"
            @click="tasksStore.completeTask(t.id)"
          />
          <template v-if="editingTaskId === t.id">
            <input
              v-model="editValue"
              class="flex-1 bg-transparent border-b border-accent outline-none text-sm px-1"
              @keyup.enter="saveEdit(t.id)"
              @blur="saveEdit(t.id)"
              @keyup.escape="editingTaskId = null"
            />
          </template>
          <template v-else>
            <span
              class="flex-1 text-sm cursor-pointer"
              @dblclick="startEdit(t.id, t.title)"
            >
              {{ t.title }}
            </span>
          </template>
          <span class="text-xs text-text-secondary tabular-nums">{{ formatTime(t.totalSeconds) }}</span>
          <button
            class="p-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            @click="goToTimer(t.id)"
            title="Запустить таймер"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <button
            class="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            @click="tasksStore.deleteTask(t.id)"
            title="Удалить"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

        <div v-if="activeTasks.length === 0" class="text-center py-16 text-text-secondary">
          <p class="text-lg mb-1">Нет задач</p>
          <p class="text-sm">Добавьте первую задачу</p>
        </div>
      </div>

      <!-- Done tasks -->
      <div v-if="doneTasks.length > 0" class="border-t border-glass-border pt-4">
        <details class="group">
          <summary class="text-sm text-text-secondary cursor-pointer hover:text-text transition-colors select-none">
            Выполненные ({{ doneTasks.length }})
          </summary>
          <div class="mt-2 space-y-1">
            <div
              v-for="t in doneTasks"
              :key="t.id"
              class="flex items-center gap-3 px-4 py-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
              <span class="text-sm line-through">{{ t.title }}</span>
              <span class="text-xs text-text-secondary ml-auto">{{ formatTime(t.totalSeconds) }}</span>
              <button
                class="text-text-secondary hover:text-accent transition-colors p-1 cursor-pointer"
                @click="tasksStore.reactivateTask(t.id)"
                title="Вернуть в активные"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>

    <ProjectModal
      v-if="showProjectModal && project"
      :project="project"
      @close="showProjectModal = false"
    />
  </div>
</template>
