<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: 'Выбрать дату',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const showCalendar = ref(false)
const currentMonth = ref(new Date())

const today = computed(() => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
})

const monthLabel = computed(() => {
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  return `${months[currentMonth.value.getMonth()]} ${currentMonth.value.getFullYear()}`
})

const isCurrentMonth = computed(() => {
  const now = new Date()
  return currentMonth.value.getFullYear() === now.getFullYear() && currentMonth.value.getMonth() === now.getMonth()
})

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()

  const days: { date: Date; day: number; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isPast: boolean }[] = []

  const prevMonth = new Date(year, month, 0)
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonth.getDate() - i
    const date = new Date(year, month - 1, d)
    days.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: false,
      isSelected: props.modelValue === formatDateISO(date),
      isPast: true,
    })
  }

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d)
    const isToday = date.getTime() === today.value.getTime()
    const isSelected = props.modelValue === formatDateISO(date)
    const isPast = date.getTime() < today.value.getTime()
    days.push({ date, day: d, isCurrentMonth: true, isToday, isSelected, isPast })
  }

  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    days.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: false,
      isSelected: props.modelValue === formatDateISO(date),
      isPast: false,
    })
  }

  return days
})

function formatDateISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateDisplay(d: string): string {
  if (!d) return ''
  const date = new Date(d)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}.${month}.${year}`
}

function selectDate(date: Date, isPast: boolean) {
  if (isPast) return
  emit('update:modelValue', formatDateISO(date))
  showCalendar.value = false
}

function prevMonth() {
  if (isCurrentMonth.value) return
  const m = currentMonth.value.getMonth()
  const y = currentMonth.value.getFullYear()
  currentMonth.value = new Date(y, m - 1, 1)
}

function nextMonth() {
  const m = currentMonth.value.getMonth()
  const y = currentMonth.value.getFullYear()
  currentMonth.value = new Date(y, m + 1, 1)
}

function clearDate() {
  emit('update:modelValue', '')
  showCalendar.value = false
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 cursor-pointer text-left"
      :class="modelValue
        ? 'bg-accent/10 border border-accent/30 text-text'
        : 'bg-white dark:bg-[#1a1a2e] border border-glass-border text-text-secondary hover:border-accent/50'"
      @click="showCalendar = !showCalendar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" :class="modelValue ? 'text-accent' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span v-if="modelValue" class="truncate">{{ formatDateDisplay(modelValue) }}</span>
      <span v-else class="truncate">{{ placeholder }}</span>
      <svg v-if="modelValue" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-auto flex-shrink-0 text-text-secondary hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" @click.stop="clearDate">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>

    <Teleport to="body">
      <div v-if="showCalendar" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="showCalendar = false">
        <div class="bg-white dark:bg-[#1a1a2e] p-4 rounded-2xl w-80 space-y-3 shadow-2xl border border-glass-border">
          <div class="flex items-center justify-between">
            <button
              class="p-1.5 rounded-lg transition-colors cursor-pointer"
              :class="isCurrentMonth ? 'text-text-secondary/30 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary'"
              :disabled="isCurrentMonth"
              @click="prevMonth"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span class="text-sm font-medium text-text">{{ monthLabel }}</span>
            <button class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-text-secondary" @click="nextMonth">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div class="grid grid-cols-7 gap-0.5">
            <div v-for="day in weekDays" :key="day" class="text-center text-xs text-text-secondary py-1 font-medium">
              {{ day }}
            </div>
            <button
              v-for="(cell, i) in calendarDays"
              :key="i"
              type="button"
              class="w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all duration-150"
              :class="[
                cell.isSelected ? 'bg-accent text-white font-semibold shadow-md shadow-accent/25 cursor-pointer' : '',
                !cell.isSelected && cell.isToday ? 'ring-1 ring-accent text-accent font-semibold cursor-pointer' : '',
                !cell.isSelected && !cell.isToday && cell.isCurrentMonth && !cell.isPast ? 'hover:bg-accent/10 text-text cursor-pointer' : '',
                !cell.isSelected && !cell.isToday && cell.isCurrentMonth && cell.isPast ? 'text-text-secondary/30 cursor-not-allowed' : '',
                !cell.isSelected && !cell.isToday && !cell.isCurrentMonth ? 'text-text-secondary/40 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer' : '',
              ]"
              @click="selectDate(cell.date, cell.isPast)"
            >
              {{ cell.day }}
            </button>
          </div>

          <div class="flex justify-end pt-1">
            <button type="button" class="text-xs text-text-secondary hover:text-accent transition-colors cursor-pointer" @click="showCalendar = false">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
