<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'

const props = defineProps<{
  progress: number
}>()

const settings = useSettingsStore()
const isDark = computed(() => settings.theme === 'dark')

const stage = computed(() => {
  if (props.progress < 0.2) return 1
  if (props.progress < 0.4) return 2
  if (props.progress < 0.6) return 3
  if (props.progress < 0.8) return 4
  return 5
})

const trunkC = computed(() => isDark.value ? '#5D4037' : '#6D4C41')
const branchC = computed(() => isDark.value ? '#4E342E' : '#5D4037')
const leafD = computed(() => isDark.value ? '#2E7D32' : '#388E3C')
const leafM = computed(() => isDark.value ? '#43A047' : '#66BB6A')
const leafL = computed(() => isDark.value ? '#66BB6A' : '#81C784')
const potC = computed(() => isDark.value ? '#8D6E63' : '#A1887F')
const potR = computed(() => isDark.value ? '#6D4C41' : '#8D6E63')
</script>

<template>
  <svg viewBox="0 0 200 240" class="w-full h-auto">
    <!-- Pot (always visible) -->
    <g :opacity="stage >= 1 ? 1 : 0.3">
      <path d="M70 190 L130 190 L125 230 L75 230 Z" :fill="potC" :stroke="potR" stroke-width="1.5" />
      <rect x="65" y="186" width="70" height="8" rx="2" :fill="potR" />
      <ellipse cx="100" cy="190" rx="28" ry="5" fill="#3E2723" opacity="0.4" />
    </g>

    <!-- Stage 1: Sprout (0-20%) -->
    <g v-if="stage >= 1" :opacity="stage === 1 ? progress / 0.2 : 1">
      <path d="M100 190 Q99 175 100 165" fill="none" :stroke="trunkC" stroke-width="2" stroke-linecap="round" />
      <ellipse cx="94" cy="162" rx="6" ry="3" :fill="leafL" :transform="`rotate(-30 94 162)`" />
      <ellipse cx="106" cy="162" rx="6" ry="3" :fill="leafM" :transform="`rotate(30 106 162)`" />
    </g>

    <!-- Stage 2: Seedling (20-40%) -->
    <g v-if="stage >= 2" :opacity="stage === 2 ? (progress - 0.2) / 0.2 : 1">
      <path d="M100 190 Q98 170 100 150 Q102 135 100 125" fill="none" :stroke="trunkC" stroke-width="3" stroke-linecap="round" />
      <ellipse cx="92" cy="148" rx="5" ry="3" :fill="leafD" :transform="`rotate(-25 92 148)`" />
      <ellipse cx="108" cy="148" rx="5" ry="3" :fill="leafD" :transform="`rotate(25 108 148)`" />
      <ellipse cx="90" cy="130" rx="7" ry="4" :fill="leafM" :transform="`rotate(-35 90 130)`" />
      <ellipse cx="110" cy="130" rx="7" ry="4" :fill="leafM" :transform="`rotate(35 110 130)`" />
      <ellipse cx="100" cy="120" rx="5" ry="3" :fill="leafL" />
    </g>

    <!-- Stage 3: Young tree (40-60%) -->
    <g v-if="stage >= 3" :opacity="stage === 3 ? (progress - 0.4) / 0.2 : 1">
      <path d="M100 190 Q97 165 100 140 Q103 115 100 90" fill="none" :stroke="trunkC" stroke-width="4.5" stroke-linecap="round" />
      <!-- Branch left -->
      <path d="M100 125 Q82 118 68 115" fill="none" :stroke="branchC" stroke-width="2.5" stroke-linecap="round" />
      <ellipse cx="65" cy="112" rx="9" ry="6" :fill="leafD" :transform="`rotate(-10 65 112)`" />
      <ellipse cx="62" cy="109" rx="6" ry="4" :fill="leafM" :transform="`rotate(-15 62 109)`" />
      <!-- Branch right -->
      <path d="M100 115 Q118 108 132 105" fill="none" :stroke="branchC" stroke-width="2.5" stroke-linecap="round" />
      <ellipse cx="135" cy="102" rx="9" ry="6" :fill="leafD" :transform="`rotate(10 135 102)`" />
      <ellipse cx="138" cy="99" rx="6" ry="4" :fill="leafM" :transform="`rotate(15 138 99)`" />
      <!-- Top foliage -->
      <ellipse cx="100" cy="86" rx="10" ry="7" :fill="leafD" />
      <ellipse cx="97" cy="83" rx="7" ry="5" :fill="leafM" />
    </g>

    <!-- Stage 4: Maturing (60-80%) -->
    <g v-if="stage >= 4" :opacity="stage === 4 ? (progress - 0.6) / 0.2 : 1">
      <path d="M100 190 Q96 160 100 130 Q104 100 100 70" fill="none" :stroke="trunkC" stroke-width="5.5" stroke-linecap="round" />
      <!-- Trunk texture -->
      <path d="M98 175 Q96 155 99 135" :stroke="trunkC" stroke-width="1" opacity="0.3" />
      <path d="M102 165 Q101 145 103 125" :stroke="trunkC" stroke-width="1" opacity="0.3" />
      <!-- Branch lower left -->
      <path d="M100 120 Q78 112 55 108" fill="none" :stroke="branchC" stroke-width="3" stroke-linecap="round" />
      <ellipse cx="50" cy="104" rx="12" ry="8" :fill="leafD" :transform="`rotate(-10 50 104)`" />
      <ellipse cx="47" cy="100" rx="8" ry="5" :fill="leafM" :transform="`rotate(-15 47 100)`" />
      <ellipse cx="45" cy="97" rx="5" ry="3" :fill="leafL" :transform="`rotate(-10 45 97)`" />
      <!-- Branch lower right -->
      <path d="M100 110 Q122 102 145 98" fill="none" :stroke="branchC" stroke-width="3" stroke-linecap="round" />
      <ellipse cx="150" cy="94" rx="12" ry="8" :fill="leafD" :transform="`rotate(10 150 94)`" />
      <ellipse cx="153" cy="90" rx="8" ry="5" :fill="leafM" :transform="`rotate(15 153 90)`" />
      <ellipse cx="155" cy="87" rx="5" ry="3" :fill="leafL" :transform="`rotate(10 155 87)`" />
      <!-- Branch upper left -->
      <path d="M100 95 Q82 85 65 80" fill="none" :stroke="branchC" stroke-width="2.5" stroke-linecap="round" />
      <ellipse cx="62" cy="77" rx="10" ry="7" :fill="leafD" :transform="`rotate(-10 62 77)`" />
      <ellipse cx="59" cy="74" rx="7" ry="4" :fill="leafM" :transform="`rotate(-15 59 74)`" />
      <!-- Branch upper right -->
      <path d="M100 85 Q118 75 135 70" fill="none" :stroke="branchC" stroke-width="2.5" stroke-linecap="round" />
      <ellipse cx="138" cy="67" rx="10" ry="7" :fill="leafD" :transform="`rotate(10 138 67)`" />
      <ellipse cx="141" cy="64" rx="7" ry="4" :fill="leafM" :transform="`rotate(15 141 64)`" />
      <!-- Top -->
      <ellipse cx="100" cy="66" rx="12" ry="8" :fill="leafD" />
      <ellipse cx="97" cy="63" rx="8" ry="5" :fill="leafM" />
      <ellipse cx="95" cy="60" rx="5" ry="3" :fill="leafL" />
    </g>

    <!-- Stage 5: Full bonsai (80-100%) -->
    <g v-if="stage >= 5" :opacity="stage === 5 ? (progress - 0.8) / 0.2 : 1">
      <path d="M100 190 Q95 155 100 120 Q105 85 100 50" fill="none" :stroke="trunkC" stroke-width="6" stroke-linecap="round" />
      <path d="M97 170 Q95 145 98 115" :stroke="trunkC" stroke-width="1.5" opacity="0.35" />
      <path d="M103 160 Q102 135 104 110" :stroke="trunkC" stroke-width="1.5" opacity="0.3" />
      <path d="M99 140 Q97 120 100 100" :stroke="trunkC" stroke-width="1" opacity="0.2" />
      <!-- Branch LL -->
      <path d="M100 112 Q75 104 48 100" fill="none" :stroke="branchC" stroke-width="3.5" stroke-linecap="round" />
      <path d="M75 104 Q70 95 62 92" fill="none" :stroke="branchC" stroke-width="2" stroke-linecap="round" />
      <ellipse cx="44" cy="96" rx="14" ry="9" :fill="leafD" :transform="`rotate(-12 44 96)`" />
      <ellipse cx="40" cy="92" rx="9" ry="6" :fill="leafM" :transform="`rotate(-18 40 92)`" />
      <ellipse cx="37" cy="88" rx="6" ry="4" :fill="leafL" :transform="`rotate(-12 37 88)`" />
      <ellipse cx="58" cy="88" rx="8" ry="5" :fill="leafM" :transform="`rotate(-10 58 88)`" />
      <!-- Branch LR -->
      <path d="M100 102 Q125 94 152 90" fill="none" :stroke="branchC" stroke-width="3.5" stroke-linecap="round" />
      <path d="M125 94 Q130 85 138 82" fill="none" :stroke="branchC" stroke-width="2" stroke-linecap="round" />
      <ellipse cx="156" cy="86" rx="14" ry="9" :fill="leafD" :transform="`rotate(12 156 86)`" />
      <ellipse cx="160" cy="82" rx="9" ry="6" :fill="leafM" :transform="`rotate(18 160 82)`" />
      <ellipse cx="162" cy="78" rx="6" ry="4" :fill="leafL" :transform="`rotate(12 162 78)`" />
      <ellipse cx="142" cy="78" rx="8" ry="5" :fill="leafM" :transform="`rotate(10 142 78)`" />
      <!-- Branch UL -->
      <path d="M100 82 Q80 72 58 66" fill="none" :stroke="branchC" stroke-width="2.5" stroke-linecap="round" />
      <ellipse cx="54" cy="63" rx="11" ry="7" :fill="leafD" :transform="`rotate(-15 54 63)`" />
      <ellipse cx="50" cy="59" rx="7" ry="5" :fill="leafM" :transform="`rotate(-20 50 59)`" />
      <ellipse cx="48" cy="56" rx="5" ry="3" :fill="leafL" :transform="`rotate(-15 48 56)`" />
      <!-- Branch UR -->
      <path d="M100 72 Q120 62 142 56" fill="none" :stroke="branchC" stroke-width="2.5" stroke-linecap="round" />
      <ellipse cx="146" cy="53" rx="11" ry="7" :fill="leafD" :transform="`rotate(15 146 53)`" />
      <ellipse cx="150" cy="49" rx="7" ry="5" :fill="leafM" :transform="`rotate(20 150 49)`" />
      <ellipse cx="152" cy="46" rx="5" ry="3" :fill="leafL" :transform="`rotate(15 152 46)`" />
      <!-- Top cluster -->
      <ellipse cx="100" cy="46" rx="15" ry="10" :fill="leafD" />
      <ellipse cx="96" cy="42" rx="10" ry="7" :fill="leafM" />
      <ellipse cx="93" cy="38" rx="6" ry="4" :fill="leafL" />
      <!-- Extra detail -->
      <ellipse cx="118" cy="58" rx="7" ry="5" :fill="leafL" :transform="`rotate(10 118 58)`" opacity="0.6" />
      <ellipse cx="82" cy="68" rx="7" ry="5" :fill="leafM" :transform="`rotate(-10 82 68)`" opacity="0.6" />
      <ellipse cx="110" cy="52" rx="6" ry="4" :fill="leafL" opacity="0.5" />
    </g>
  </svg>
</template>
