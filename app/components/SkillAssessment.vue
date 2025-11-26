<template>
  <div class="skill-assessment animate-fade-in">
    <!-- Progress Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center ring-1 ring-zinc-700/50">
            <UIcon name="i-lucide-target" class="text-zinc-300" />
          </div>
          <div>
            <span class="text-sm text-zinc-500 block">Assessing</span>
            <span class="font-medium text-zinc-200">{{ technology?.name }}</span>
          </div>
        </div>
        <UBadge variant="soft" color="neutral" size="lg" class="rounded-xl px-4 py-2 font-semibold">
          {{ currentIndex + 1 }} / {{ topics.length }}
        </UBadge>
      </div>
      <div class="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          class="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>

    <!-- Current Topic Card -->
    <UCard v-if="currentTopic" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-xl sm:text-2xl font-bold text-white">{{ currentTopic.name }}</h3>
          <UBadge v-if="currentTopic.category" variant="soft" size="lg" class="rounded-xl">
            {{ currentTopic.category }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-10">
        <!-- Current Level Display -->
        <div class="text-center py-8">
          <div
            class="text-3xl sm:text-4xl font-bold mb-3 transition-colors"
            :style="{ color: currentLevelInfo.colorHex }"
          >
            {{ currentLevelInfo.label }}
          </div>
          <p class="text-zinc-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
            {{ currentLevelInfo.description }}
          </p>
        </div>

        <!-- Slider -->
        <div class="px-2 sm:px-4">
          <input
            v-model.number="selectedLevel"
            type="range"
            min="0"
            max="7"
            step="1"
            class="slider-modern gradient-confidence w-full"
          />

          <!-- Level markers -->
          <div class="flex justify-between mt-4 px-1">
            <button
              v-for="n in 8"
              :key="n"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200"
              :class="selectedLevel === n - 1
                ? 'bg-white text-zinc-900 shadow-lg scale-110'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'"
              @click="selectedLevel = n - 1"
            >
              {{ n - 1 }}
            </button>
          </div>
        </div>

        <!-- Quick Select Grid -->
        <div class="grid grid-cols-4 gap-2 sm:gap-3">
          <button
            v-for="level in CONFIDENCE_LEVELS"
            :key="level.level"
            class="px-2 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border-2"
            :class="selectedLevel === level.level
              ? 'border-current bg-current/10 scale-105'
              : 'border-transparent bg-zinc-800/60 hover:bg-zinc-800'"
            :style="{ color: getColorHex(level.color) }"
            @click="selectedLevel = level.level"
          >
            {{ level.shortLabel || level.label.split(' ')[0] }}
          </button>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            size="xl"
            class="rounded-xl w-14"
            :disabled="currentIndex === 0"
            @click="goBack"
          >
            <UIcon name="i-lucide-chevron-left" class="text-lg" />
          </UButton>

          <UButton
            variant="soft"
            color="neutral"
            size="xl"
            class="flex-1 rounded-xl font-medium"
            @click="skipTopic"
          >
            Skip
          </UButton>

          <UButton
            size="xl"
            class="flex-1 rounded-xl font-semibold gradient-primary border-0"
            @click="saveAndNext"
          >
            Save & Next
            <UIcon name="i-lucide-chevron-right" class="ml-2 text-lg" />
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Completion Card -->
    <UCard v-else-if="isComplete" class="overflow-hidden">
      <div class="py-12 text-center">
        <div class="relative inline-block mb-8">
          <div class="absolute inset-0 bg-primary-500/30 rounded-full blur-2xl animate-pulse-soft" />
          <div class="relative w-24 h-24 rounded-full gradient-primary mx-auto flex items-center justify-center glow-primary">
            <UIcon name="i-lucide-check" class="text-5xl text-white" />
          </div>
        </div>
        <h3 class="text-3xl font-bold mb-3 text-gradient">Assessment Complete!</h3>
        <p class="text-zinc-400 mb-10 max-w-sm mx-auto text-lg">
          You've assessed all {{ topics.length }} topics in {{ technology?.name }}.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <UButton size="xl" class="flex-1 rounded-xl h-14 font-semibold gradient-primary border-0" @click="$emit('viewOverview')">
            <UIcon name="i-lucide-bar-chart-2" class="mr-2 text-lg" />
            View Progress
          </UButton>
          <UButton
            size="xl"
            variant="soft"
            color="neutral"
            class="flex-1 rounded-xl h-14 font-medium"
            @click="restartAssessment"
          >
            <UIcon name="i-lucide-refresh-cw" class="mr-2" />
            Reassess All
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSkillStore, CONFIDENCE_LEVELS, type SkillTopic } from '../composables/useSkillStore'

const props = defineProps<{
  techId: string
}>()

const emit = defineEmits<{
  viewOverview: []
}>()

const { getTechnologyById, getLatestAssessment, saveAssessment } = useSkillStore()

const technology = computed(() => getTechnologyById.value(props.techId))
const topics = computed(() => technology.value?.topics ?? [])

const currentIndex = ref(0)
const selectedLevel = ref(3)
const assessedTopicIds = ref<Set<string>>(new Set())

const currentTopic = computed((): SkillTopic | null => {
  return topics.value[currentIndex.value] || null
})

const isComplete = computed(() => {
  return currentIndex.value >= topics.value.length
})

const progressPercent = computed(() => {
  if (topics.value.length === 0) return 0
  return Math.round((assessedTopicIds.value.size / topics.value.length) * 100)
})

const currentLevelInfo = computed(() => {
  const level = CONFIDENCE_LEVELS[selectedLevel.value]
  return {
    ...level,
    colorHex: getColorHex(level.color)
  }
})

function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    gray: '#71717a',
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    lime: '#84cc16',
    green: '#22c55e',
    teal: '#14b8a6',
    blue: '#3b82f6'
  }
  return colorMap[color] || '#71717a'
}

// Load existing assessment when topic changes
watch(currentTopic, (topic) => {
  if (topic) {
    const existing = getLatestAssessment.value(topic.id)
    selectedLevel.value = existing?.level ?? 3
  }
}, { immediate: true })

function saveAndNext() {
  if (currentTopic.value) {
    saveAssessment(currentTopic.value.id, selectedLevel.value)
    assessedTopicIds.value.add(currentTopic.value.id)
  }
  currentIndex.value++
}

function skipTopic() {
  currentIndex.value++
}

function goBack() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function restartAssessment() {
  currentIndex.value = 0
  assessedTopicIds.value.clear()
}
</script>
