import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GardenTree } from '../types'

export const useZenStore = defineStore('zen', () => {
  const gardenTrees = ref<GardenTree[]>([])

  function plantTree(tree: GardenTree) {
    gardenTrees.value.push(tree)
  }

  function removeTree(taskId: string) {
    gardenTrees.value = gardenTrees.value.filter(t => t.taskId !== taskId)
  }

  return { gardenTrees, plantTree, removeTree }
}, {
  persist: true,
})
