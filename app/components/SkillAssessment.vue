<template>
  <div class="skill-assessment animate-fade-in">
    <!-- Progress Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <UIcon name="i-lucide-target" class="text-sm text-zinc-400" />
          </div>
          <span class="text-sm text-zinc-400">{{ technology?.name }}</span>
        </div>
        <UBadge variant="soft" color="neutral" class="rounded-lg">
          {{ currentIndex + 1 }} / {{ topics.length }}
        </UBadge>
      </div>
      <UProgress :value="progressPercent" size="sm" class="rounded-full" />
    </div>

    <!-- Current Topic Card -->
    <UCard v-if="currentTopic" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg sm:text-xl font-semibold">{{ currentTopic.name }}</h3>
          <UBadge v-if="currentTopic.category" variant="soft" class="rounded-lg">
            {{ currentTopic.category }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-8">
        <!-- Current Level Display -->
        <div class="text-center py-6">
          <div
            class="text-2xl sm:text-3xl font-bold mb-2 transition-colors"
            :style="{ color: currentLevelInfo.colorHex }"
          >
            {{ currentLevelInfo.label }}
          </div>
          <p class="text-zinc-400 text-sm max-w-xs mx-auto">
            {{ currentLevelInfo.description }}
          </p>
        </div>

        <!-- Slider -->
        <div class="px-2">
          <input
            v-model.number="selectedLevel"
            type="range"
            min="0"
            max="7"
            step="1"
            class="slider-modern gradient-confidence w-full"
          />

          <!-- Level markers -->
          <div class="flex justify-between mt-3 px-1">
            <span
              v-for="n in 8"
              :key="n"
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all"
              :class="selectedLevel === n - 1
                ? 'bg-white text-zinc-900'
                : 'text-zinc-600'"
            >
              {{ n - 1 }}
            </span>
          </div>
        </div>

        <!-- Quick Select Grid -->
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="level in CONFIDENCE_LEVELS"
            :key="level.level"
            class="px-2 py-2.5 rounded-xl text-xs font-medium transition-all border"
            :class="selectedLevel === level.level
              ? 'border-white/20 bg-white/10'
              : 'border-transparent bg-zinc-800/50 hover:bg-zinc-800'"
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
            class="rounded-xl"
            :disabled="currentIndex === 0"
            @click="goBack"
          >
            <UIcon name="i-lucide-chevron-left" />
          </UButton>

          <UButton
            variant="soft"
            color="neutral"
            class="flex-1 rounded-xl"
            @click="skipTopic"
          >
            Skip
          </UButton>

          <UButton
            class="flex-1 rounded-xl"
            @click="saveAndNext"
          >
            Save & Next
            <UIcon name="i-lucide-chevron-right" class="ml-1" />
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Completion Card -->
    <UCard v-else-if="isComplete" class="overflow-hidden">
      <div class="py-8 text-center">
        <div class="w-20 h-20 rounded-3xl gradient-primary mx-auto mb-6 flex items-center justify-center glow-primary">
          <UIcon name="i-lucide-check" class="text-4xl text-white" />
        </div>
        <h3 class="text-2xl font-bold mb-2">Assessment Complete!</h3>
        <p class="text-zinc-400 mb-8 max-w-xs mx-auto">
          You've assessed all {{ topics.length }} topics in {{ technology?.name }}.
        </p>
        <div class="flex gap-3 justify-center">
          <UButton size="lg" class="rounded-xl" @click="$emit('viewOverview')">
            <UIcon name="i-lucide-bar-chart-2" class="mr-2" />
            View Progress
          </UButton>
          <UButton
            size="lg"
            variant="soft"
            color="neutral"
            class="rounded-xl"
            @click="restartAssessment"
          >
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
