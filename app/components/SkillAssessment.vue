<template>
  <div class="skill-assessment animate-fade-in">
    <!-- Filters Section -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-filter" class="text-zinc-500" />
        <USelectMenu
          v-model="selectedFilter"
          :items="filterOptions"
          value-key="value"
          class="w-56"
        />
      </div>

      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-arrow-up-down" class="text-zinc-500" />
        <USelectMenu
          v-model="selectedSort"
          :items="sortOptions"
          value-key="value"
          class="w-40"
        />
      </div>

      <span class="text-sm text-zinc-500 ml-auto">
        {{ filteredTopics.length }}/{{ allTopics.length }}
      </span>

      <UButton
        v-if="filterValue !== 'all' || sortValue !== 'default'"
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-lucide-x"
        class="rounded-lg"
        @click="resetFilters"
      />
    </div>

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
          {{ currentIndex + 1 }} / {{ filteredTopics.length }}
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
          <div class="flex items-center gap-4">
            <h3 class="text-xl sm:text-2xl font-bold text-white">{{ currentTopic.name }}</h3>
            <UBadge v-if="currentTopic.category" variant="soft" size="lg" class="rounded-xl">
              {{ currentTopic.category }}
            </UBadge>
          </div>

          <!-- Delete / Remove topic button (permanent) -->
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-trash-2"
              variant="ghost"
              color="error"
              size="md"
              class="rounded-lg"
              :title="`Remove ${currentTopic.name}`"
              @click.stop="confirmRemove(currentTopic)"
            />
          </div>
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
            @input="onSliderInput"
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
              @click="onQuickSelect(n - 1)"
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
            @click="onQuickSelect(level.level)"
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

          <!-- Conditional buttons based on input method -->
          <UButton
            v-if="isSliderMode"
            size="xl"
            class="flex-1 rounded-xl font-semibold gradient-primary border-0"
            @click="saveAndNext"
          >
            Save & Next
            <UIcon name="i-lucide-chevron-right" class="ml-2 text-lg" />
          </UButton>
          <UButton
            v-else
            size="xl"
            class="flex-1 rounded-xl font-semibold gradient-primary border-0"
            @click="evaluateAndNext"
          >
            Evaluate
            <UIcon name="i-lucide-chevron-right" class="ml-2 text-lg" />
          </UButton>
        </div>
      </template>
    </UCard>

      <!-- Remove confirmation modal (render only when actively showing a topic to remove) -->
      <UModal v-if="showRemoveConfirm && topicToRemove" v-model="showRemoveConfirm">
        <UCard>
          <template #header>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
                <UIcon name="i-lucide-trash-2" class="text-2xl text-red-400" />
              </div>
              <div>
                <h3 class="font-bold text-lg">Remove Topic?</h3>
                <p class="text-sm text-zinc-500">This will permanently remove the topic from the technology.</p>
              </div>
            </div>
          </template>
          <p class="text-zinc-300 leading-relaxed">
            Are you sure you want to remove <span class="text-white font-semibold">"{{ topicToRemove?.name }}"</span> permanently? This action cannot be undone.
          </p>
          <template #footer>
            <div class="flex gap-3 justify-end">
              <UButton variant="ghost" color="neutral" size="lg" class="rounded-xl" @click="showRemoveConfirm = false">
                Cancel
              </UButton>
              <UButton color="error" size="lg" class="rounded-xl font-medium" @click="doRemove">
                <UIcon name="i-lucide-trash-2" class="mr-2" />
                Remove
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>

    <!-- Completion Card -->
    <UCard v-if="isComplete" class="overflow-hidden">
      <div class="py-12 text-center">
        <div class="relative inline-block mb-8">
          <div class="absolute inset-0 bg-primary-500/30 rounded-full blur-2xl animate-pulse-soft" />
          <div class="relative w-24 h-24 rounded-full gradient-primary mx-auto flex items-center justify-center glow-primary">
            <UIcon name="i-lucide-check" class="text-5xl text-white" />
          </div>
        </div>
        <h3 class="text-3xl font-bold mb-3 text-gradient">Assessment Complete!</h3>
        <p class="text-zinc-400 mb-10 max-w-sm mx-auto text-lg">
          You've assessed all {{ filteredTopics.length }} topics in {{ technology?.name }}.
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
import { ref, computed, watch, onMounted } from 'vue'
import { useSkillStore, CONFIDENCE_LEVELS, type SkillTopic } from '../composables/useSkillStore'

const props = defineProps<{
  techId: string
  initialTopicIndex?: number
}>()

const emit = defineEmits<{
  viewOverview: []
  topicIndexChange: [index: number]
}>()

const { getTechnologyById, getLatestAssessment, getTopicHistory, saveAssessment, removeTopicFromTechnology } = useSkillStore()

const technology = computed(() => getTechnologyById.value(props.techId))
const allTopics = computed(() => technology.value?.topics ?? [])

// Filter and sort options
type FilterType = 'all' | 'not-assessed' | 'level-0' | 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5' | 'level-6' | 'level-7'
type SortType = 'default' | 'random' | 'alphabetical' | 'least-asked'

const selectedFilter = ref<FilterType>('all')
const selectedSort = ref<SortType>('default')

// Computed to handle both string and object values from USelectMenu
const filterValue = computed(() => {
  const val = selectedFilter.value
  return typeof val === 'object' && val !== null ? (val as { value: string }).value : val
})

const sortValue = computed(() => {
  const val = selectedSort.value
  return typeof val === 'object' && val !== null ? (val as { value: string }).value : val
})

const filterOptions = [
  { label: 'All topics', value: 'all' },
  { label: 'Not yet assessed', value: 'not-assessed' },
  { label: 'Level 0 - New', value: 'level-0' },
  { label: 'Level 1 - Heard', value: 'level-1' },
  { label: 'Level 2 - Know', value: 'level-2' },
  { label: 'Level 3 - Tried', value: 'level-3' },
  { label: 'Level 4 - Docs', value: 'level-4' },
  { label: 'Level 5 - Good', value: 'level-5' },
  { label: 'Level 6 - Teach', value: 'level-6' },
  { label: 'Level 7 - Expert', value: 'level-7' }
]

const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Random', value: 'random' },
  { label: 'A-Z', value: 'alphabetical' },
  { label: 'Least asked', value: 'least-asked' }
]

// Filter topics based on selected filter
const filteredTopics = computed(() => {
  let topics = [...allTopics.value]
  const filter = filterValue.value

  // Apply filter
  if (filter === 'not-assessed') {
    topics = topics.filter(topic => !getLatestAssessment.value(topic.id))
  } else if (filter.startsWith('level-')) {
    const level = parseInt(filter.split('-')[1] ?? '0')
    topics = topics.filter(topic => {
      const assessment = getLatestAssessment.value(topic.id)
      return assessment?.level === level
    })
  }

  // Apply sort
  switch (sortValue.value) {
    case 'random':
      topics = shuffleArray(topics)
      break
    case 'alphabetical':
      topics = topics.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'least-asked':
      topics = topics.sort((a, b) => {
        const historyA = getTopicHistory.value(a.id)
        const historyB = getTopicHistory.value(b.id)
        const countA = historyA?.assessmentCount ?? 0
        const countB = historyB?.assessmentCount ?? 0
        if (countA !== countB) return countA - countB
        // If same count, sort by last assessed (oldest first)
        const lastA = historyA?.lastAssessedAt ?? 0
        const lastB = historyB?.lastAssessedAt ?? 0
        return lastA - lastB
      })
      break
  }

  return topics
})

// Shuffle helper for random sort
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j] as T
    shuffled[j] = temp as T
  }
  return shuffled
}

function resetFilters() {
  selectedFilter.value = 'all'
  selectedSort.value = 'default'
}

// Persist filter / sort per-technology
const STORAGE_PREFIX = 'skillTrainer_assessment_'
function storageKey(kind: 'filter' | 'sort') {
  const id = props.techId || 'global'
  return `${STORAGE_PREFIX}${id}_${kind}`
}

function loadFilterPreferences() {
  try {
    if (typeof window === 'undefined') return
    const savedFilter = localStorage.getItem(storageKey('filter'))
    const savedSort = localStorage.getItem(storageKey('sort'))

    if (savedFilter && filterOptions.some(o => o.value === savedFilter)) {
      selectedFilter.value = savedFilter as FilterType
    }
    else {
      selectedFilter.value = 'all'
    }

    if (savedSort && sortOptions.some(o => o.value === savedSort)) {
      selectedSort.value = savedSort as SortType
    }
    else {
      selectedSort.value = 'default'
    }
  }
  catch (e) {
    console.warn('Failed to load assessment filter/sort from storage', e)
  }
}

onMounted(() => {
  loadFilterPreferences()

  // Restore initial topic index from prop (clamp to valid range)
  if (props.initialTopicIndex !== undefined && props.initialTopicIndex > 0) {
    setTimeout(() => {
      const maxIdx = Math.max(0, filteredTopics.value.length - 1)
      currentIndex.value = Math.min(props.initialTopicIndex!, maxIdx)
    }, 0)
  }
})

// Reload preferences when tech changes
watch(() => props.techId, () => {
  loadFilterPreferences()
}, { immediate: true })

// Persist whenever values change (store actual string values)
watch(filterValue, (val) => {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(storageKey('filter'), val)
  }
  catch {}
})

watch(sortValue, (val) => {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(storageKey('sort'), val)
  }
  catch {}
})

const currentIndex = ref(props.initialTopicIndex ?? 0)
const selectedLevel = ref(3)
const assessedTopicIds = ref<Set<string>>(new Set())
const isSliderMode = ref(true)
const showRemoveConfirm = ref(false)
const topicToRemove = ref<SkillTopic | null>(null)

// Emit index changes to parent for URL sync
watch(currentIndex, (idx) => {
  emit('topicIndexChange', idx)
})

const currentTopic = computed((): SkillTopic | null => {
  return filteredTopics.value[currentIndex.value] || null
})

const isComplete = computed(() => {
  return currentIndex.value >= filteredTopics.value.length
})

const progressPercent = computed(() => {
  if (filteredTopics.value.length === 0) return 0
  return Math.round((assessedTopicIds.value.size / filteredTopics.value.length) * 100)
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

// Track if slider has been used (to determine button behavior)
// Slider input handler — mark slider mode so Save & Next must be pressed
function onSliderInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  selectedLevel.value = val
  isSliderMode.value = true
}

// Quick select handler — when user clicks a quick-assessment button we auto-save & go to next
function onQuickSelect(level: number) {
  // set level
  selectedLevel.value = level
  // mark NOT slider mode
  isSliderMode.value = false
  // directly save + advance
  saveAndNext()
}

function saveAndNext() {
  if (currentTopic.value) {
    saveAssessment(currentTopic.value.id, selectedLevel.value)
    assessedTopicIds.value.add(currentTopic.value.id)
  }
  currentIndex.value++
}

function evaluateAndNext() {
  if (currentTopic.value) {
    saveAssessment(currentTopic.value.id, selectedLevel.value)
    assessedTopicIds.value.add(currentTopic.value.id)
  }
  isSliderMode.value = false
  currentIndex.value++
}

function skipTopic() {
  currentIndex.value++
}

function confirmRemove(topic: SkillTopic | null) {
  topicToRemove.value = topic
  showRemoveConfirm.value = true
}

function doRemove() {
  if (!topicToRemove.value) return
  // capture id and current filtered list index before changing the store
  const id = topicToRemove.value.id
  const currentFiltered = [...filteredTopics.value]
  const idx = currentFiltered.findIndex(t => t.id === id)

  // Remove topic from the technology (store will update reactive lists)
  removeTopicFromTechnology(props.techId, id)

  // Close modal first (will unmount quickly) — this avoids showing a blank popup after we clear the topic
  showRemoveConfirm.value = false

  // Remove from assessed set and other state cleanup
  assessedTopicIds.value.delete(id)

  // Decide next index: prefer the item that moved into the removed index
  // compute new length
  const newLen = filteredTopics.value.length
  if (newLen === 0) {
    currentIndex.value = 0
  } else if (idx >= 0 && idx < newLen) {
    // the next item shifted into this slot — keep idx
    currentIndex.value = idx
  } else {
    // removed last item, clamp to new last
    currentIndex.value = Math.max(0, newLen - 1)
  }

  // Clear selection reference after a short delay so UI close animation doesn't briefly show an empty modal
  setTimeout(() => {
    topicToRemove.value = null
  }, 250)
}

function goBack() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function restartAssessment() {
  currentIndex.value = 0
  assessedTopicIds.value.clear()
  isSliderMode.value = false
}

// Reset index when filters change
watch([filterValue, sortValue], () => {
  currentIndex.value = 0
  assessedTopicIds.value.clear()
})
</script>
