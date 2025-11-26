<template>
  <div class="skill-overview animate-fade-in space-y-5">
    <!-- Summary Stats -->
    <div class="grid grid-cols-2 gap-4">
      <UCard class="overflow-hidden">
        <div class="text-center py-4">
          <div class="text-4xl font-bold text-primary-400 mb-2">
            {{ progress.assessed }}
          </div>
          <div class="text-xs text-zinc-500 uppercase tracking-wider font-medium">Assessed</div>
        </div>
      </UCard>
      <UCard class="overflow-hidden">
        <div class="text-center py-4">
          <div class="text-4xl font-bold mb-2" :style="{ color: avgLevelColor }">
            {{ avgLevelLabel }}
          </div>
          <div class="text-xs text-zinc-500 uppercase tracking-wider font-medium">Avg. Level</div>
        </div>
      </UCard>
    </div>

    <!-- Level Distribution -->
    <UCard class="overflow-hidden">
      <template #header>
        <h3 class="font-bold text-lg flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-bar-chart-3" class="text-blue-400" />
          </div>
          Skill Distribution
        </h3>
      </template>

      <div class="space-y-4">
        <div
          v-for="level in distribution"
          :key="level.level"
          class="flex items-center gap-4"
        >
          <div class="w-24 text-sm font-medium text-zinc-400 truncate">
            {{ level.shortLabel || level.label.split(' ')[0] }}
          </div>
          <div class="flex-1 bg-zinc-800/80 rounded-full h-3 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :style="{
                width: `${totalTopics > 0 ? (level.count / totalTopics) * 100 : 0}%`,
                backgroundColor: getColorHex(level.color)
              }"
            />
          </div>
          <div class="w-8 text-sm text-right text-zinc-300 font-semibold tabular-nums">{{ level.count }}</div>
        </div>
      </div>
    </UCard>

    <!-- Weak Areas -->
    <UCard v-if="weakTopics.length > 0" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg text-orange-400 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-alert-triangle" class="text-orange-400" />
            </div>
            Areas to Improve
          </h3>
          <UBadge color="warning" variant="soft" size="lg" class="rounded-xl font-semibold">{{ weakTopics.length }}</UBadge>
        </div>
      </template>

      <div class="space-y-2 max-h-56 overflow-y-auto -mr-2 pr-2">
        <div
          v-for="topic in weakTopics"
          :key="topic.id"
          class="flex items-center justify-between px-4 py-3 bg-zinc-800/60 rounded-xl border border-zinc-700/40 hover:border-zinc-600/60 transition-colors"
        >
          <span class="font-medium">{{ topic.name }}</span>
          <span
            class="text-xs font-bold px-3 py-1 rounded-lg"
            :style="{ backgroundColor: getColorHex(CONFIDENCE_LEVELS[topic.level].color) + '20', color: getColorHex(CONFIDENCE_LEVELS[topic.level].color) }"
          >
            Level {{ topic.level }}
          </span>
        </div>
      </div>
    </UCard>

    <!-- Unassessed Topics -->
    <UCard v-if="unassessedTopics.length > 0" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg text-zinc-400 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <UIcon name="i-lucide-help-circle" class="text-zinc-500" />
            </div>
            Not Yet Assessed
          </h3>
          <UBadge variant="soft" color="neutral" size="lg" class="rounded-xl font-semibold">{{ unassessedTopics.length }}</UBadge>
        </div>
      </template>

      <div class="space-y-2 max-h-56 overflow-y-auto -mr-2 pr-2">
        <div
          v-for="topic in unassessedTopics"
          :key="topic.id"
          class="flex items-center justify-between px-4 py-3 bg-zinc-800/60 rounded-xl border border-zinc-700/40 hover:border-zinc-600/60 transition-colors"
        >
          <span class="text-zinc-400 font-medium">{{ topic.name }}</span>
          <UButton
            size="sm"
            variant="soft"
            class="rounded-xl font-medium"
            @click="$emit('assessTopic', topic.id)"
          >
            <UIcon name="i-lucide-target" class="mr-1.5" />
            Assess
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- All Topics -->
    <UCard class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <UIcon name="i-lucide-list" class="text-zinc-400" />
            </div>
            All Topics
          </h3>
          <UButton
            size="sm"
            variant="ghost"
            color="neutral"
            class="rounded-xl"
            @click="showAll = !showAll"
          >
            {{ showAll ? 'Collapse' : 'Expand' }}
            <UIcon :name="showAll ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="ml-1.5" />
          </UButton>
        </div>
      </template>

      <div v-if="showAll" class="space-y-2 max-h-[400px] overflow-y-auto -mr-2 pr-2">
        <div
          v-for="topic in allTopicsWithLevel"
          :key="topic.id"
          class="flex items-center justify-between px-4 py-3 bg-zinc-800/60 rounded-xl border border-zinc-700/40"
        >
          <span class="font-medium">{{ topic.name }}</span>
          <span
            v-if="topic.level !== null"
            class="text-xs font-bold px-3 py-1 rounded-lg"
            :style="{ backgroundColor: getColorHex(CONFIDENCE_LEVELS[topic.level].color) + '20', color: getColorHex(CONFIDENCE_LEVELS[topic.level].color) }"
          >
            {{ CONFIDENCE_LEVELS[topic.level].shortLabel || CONFIDENCE_LEVELS[topic.level].label.split(' ')[0] }}
          </span>
          <span v-else class="text-sm text-zinc-600 font-medium">—</span>
        </div>
      </div>
      <div v-else class="text-center py-6">
        <p class="text-zinc-500">
          <span class="text-zinc-300 font-semibold">{{ technology?.topics.length }}</span> topics total
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillStore, CONFIDENCE_LEVELS, type SkillTopic } from '../composables/useSkillStore'

const props = defineProps<{
  techId: string
}>()

defineEmits<{
  assessTopic: [topicId: string]
}>()

const {
  getTechnologyById,
  getTechnologyProgress,
  getLevelDistribution,
  getUnassessedTopics,
  getWeakTopics,
  getLatestAssessment
} = useSkillStore()

const showAll = ref(false)

const technology = computed(() => getTechnologyById.value(props.techId))
const progress = computed(() => getTechnologyProgress.value(props.techId))
const distribution = computed(() => getLevelDistribution.value(props.techId))
const unassessedTopics = computed(() => getUnassessedTopics.value(props.techId))
const weakTopics = computed(() => getWeakTopics.value(props.techId, 2))

const totalTopics = computed(() => technology.value?.topics.length ?? 0)

const avgLevelLabel = computed(() => {
  const level = Math.round(progress.value.avgLevel)
  return CONFIDENCE_LEVELS[level]?.label ?? '—'
})

const avgLevelColor = computed(() => {
  const level = Math.round(progress.value.avgLevel)
  return getColorHex(CONFIDENCE_LEVELS[level]?.color ?? 'gray')
})

const allTopicsWithLevel = computed(() => {
  if (!technology.value) return []
  return technology.value.topics.map(topic => ({
    ...topic,
    level: getLatestAssessment.value(topic.id)?.level ?? null
  }))
})

function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    gray: '#9CA3AF',
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    lime: '#84CC16',
    green: '#22C55E',
    teal: '#14B8A6',
    blue: '#3B82F6'
  }
  return colorMap[color] || '#9CA3AF'
}
</script>
