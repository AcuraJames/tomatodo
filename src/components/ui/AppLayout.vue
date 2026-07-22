<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '../../stores/settingsStore'
import { useProjectsStore } from '../../stores/projectsStore'
import { useTimerStore } from '../../stores/timerStore'
import ThemeToggle from './ThemeToggle.vue'
import ProjectModal from './ProjectModal.vue'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const settings = useSettingsStore()
const projects = useProjectsStore()
const timer = useTimerStore()

const showCreateModal = ref(false)
const collapsed = computed(() => settings.sidebarCollapsed)

const hideSidebar = computed(() =>
  route.path === '/timer' && timer.status === 'running' && timer.zenMode
)

const navItems = [
  { path: '/', label: 'Главная', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/timer', label: 'Таймер', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/stats', label: 'Статистика', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

const smartLists = [
  { path: '/tasks/inbox', label: 'Входящие', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
  { path: '/tasks/today', label: 'Сегодня', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { path: '/tasks/plans', label: 'Планы', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
]

function isActive(path: string): boolean {
  if (path.startsWith('/tasks/')) {
    return route.path.startsWith(path)
  }
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function isProjectActive(id: string): boolean {
  return route.path === `/tasks/project/${id}`
}

function selectProject(projectId: string) {
  router.push(`/tasks/project/${projectId}`)
}

function selectSmartList(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-surface text-text">
    <!-- Theme toggle floating (hidden in Zen + running) -->
    <div
      v-if="!hideSidebar"
      class="fixed top-4 right-4 z-50"
    >
      <ThemeToggle />
    </div>

    <aside
      v-if="!hideSidebar"
      class="flex-shrink-0 flex flex-col glass m-2 rounded-2xl border-glass-border transition-all duration-300"
      :class="collapsed ? 'w-16' : 'w-56'"
    >
      <!-- Logo + toggle -->
      <div class="flex items-center gap-2 px-4 h-14 border-b border-glass-border/50" :class="collapsed ? 'justify-center' : ''">
        <span v-if="collapsed" class="text-xl font-bold text-accent">T</span>
        <template v-else>
          <span class="text-xl font-bold text-accent">Tomatodo</span>
        </template>
        <button
          class="ml-auto p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          :class="collapsed ? 'ml-0' : ''"
          @click="settings.toggleSidebar()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9l5 5M18 5l-5 5 5 5" />
          </svg>
        </button>
      </div>

      <!-- Main nav -->
      <nav class="flex flex-col gap-0.5 px-2 pt-3">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          :class="[
            isActive(item.path)
              ? 'bg-accent/15 text-accent font-medium'
              : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text',
            collapsed ? 'justify-center px-0' : ''
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path :d="item.icon" />
          </svg>
          <span v-if="!collapsed" class="text-sm">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Smart lists -->
      <div class="px-2 pt-5">
        <div v-if="!collapsed" class="text-xs font-medium uppercase tracking-wider text-text-secondary px-3 mb-1">
          Списки
        </div>
        <div class="flex flex-col gap-0.5">
          <button
            v-for="item in smartLists"
            :key="item.path"
            class="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer text-left w-full"
            :class="[
              isActive(item.path)
                ? 'bg-accent/15 text-accent font-medium'
                : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text',
              collapsed ? 'justify-center px-0' : ''
            ]"
            @click="selectSmartList(item.path)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path :d="item.icon" />
            </svg>
            <span v-if="!collapsed" class="text-sm">{{ item.label }}</span>
          </button>
        </div>
      </div>

      <!-- Projects -->
      <div class="flex-1 flex flex-col min-h-0 px-2 pt-5">
        <div class="flex items-center mb-1 px-3" :class="collapsed ? 'justify-center' : 'justify-between'">
          <span v-if="!collapsed" class="text-xs font-medium uppercase tracking-wider text-text-secondary">Проекты</span>
          <button
            class="p-1 rounded-lg hover:bg-accent/15 text-text-secondary hover:text-accent transition-colors cursor-pointer"
            @click="showCreateModal = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14m-7-7h14" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-0.5 px-1">
          <button
            v-for="p in projects.sortedProjects"
            :key="p.id"
            class="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 text-left cursor-pointer"
            :class="[
              isProjectActive(p.id)
                ? 'bg-accent/15 text-accent font-medium'
                : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text',
              collapsed ? 'justify-center px-0' : ''
            ]"
            @click="selectProject(p.id)"
          >
            <span class="text-lg flex-shrink-0">{{ p.emoji }}</span>
            <span v-if="!collapsed" class="text-sm truncate">{{ p.name }}</span>
          </button>

          <div v-if="projects.sortedProjects.length === 0 && !collapsed" class="text-center py-6">
            <p class="text-xs text-text-secondary">Нет проектов</p>
          </div>
        </div>
      </div>

      <!-- Bottom: settings -->
      <div class="px-2 pb-3 pt-2 border-t border-glass-border/50">
        <router-link
          to="/settings"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          :class="[
            route.path === '/settings'
              ? 'bg-accent/15 text-accent font-medium'
              : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text',
            collapsed ? 'justify-center px-0' : ''
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span v-if="!collapsed" class="text-sm">Настройки</span>
        </router-link>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-6 lg:p-8">
      <router-view />
    </main>

    <ProjectModal v-if="showCreateModal" @close="showCreateModal = false" />
  </div>
</template>
