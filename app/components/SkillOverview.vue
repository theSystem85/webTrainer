<template>
  <div class="skill-overview animate-fade-in space-y-4">
    <!-- Summary Stats -->
    <div class="grid grid-cols-2 gap-3">
      <UCard class="overflow-hidden">
        <div class="text-center py-2">
          <div class="text-3xl font-bold text-primary mb-1">
            {{ progress.assessed }}
          </div>
          <div class="text-xs text-zinc-500 uppercase tracking-wide">Assessed</div>
        </div>
      </UCard>
      <UCard class="overflow-hidden">
        <div class="text-center py-2">
          <div class="text-3xl font-bold mb-1" :style="{ color: avgLevelColor }">
            {{ avgLevelLabel }}
          </div>
          <div class="text-xs text-zinc-500 uppercase tracking-wide">Avg. Level</div>
        </div>
      </UCard>
    </div>

    <!-- Level Distribution -->
    <UCard class="overflow-hidden">
      <template #header>
        <h3 class="font-semibold flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart-3" class="text-zinc-500" />
          Skill Distribution
        </h3>
      </template>

      <div class="space-y-3">
        <div
          v-for="level in distribution"
          :key="level.level"
          class="flex items-center gap-3"
        >
          <div class="w-20 text-xs text-zinc-500 truncate">
            {{ level.shortLabel || level.label.split(' ')[0] }}
          </div>
          <div class="flex-1 bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: `${totalTopics > 0 ? (level.count / totalTopics) * 100 : 0}%`,
                backgroundColor: getColorHex(level.color)
              }"
            />
          </div>
          <div class="w-6 text-xs text-right text-zinc-400 font-medium">{{ level.count }}</div>
        </div>
      </div>
    </UCard>

    <!-- Weak Areas -->
    <UCard v-if="weakTopics.length > 0" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-orange-400 flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" />
            Areas to Improve
          </h3>
          <UBadge color="warning" variant="soft" class="rounded-lg">{{ weakTopics.length }}</UBadge>
        </div>
      </template>

      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="topic in weakTopics"
          :key="topic.id"
          class="flex items-center justify-between px-3 py-2.5 bg-zinc-800/50 rounded-xl"
        >
          <span class="text-sm">{{ topic.name }}</span>
          <span
            class="text-xs font-medium px-2 py-0.5 rounded-md"
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
          <h3 class="font-semibold text-zinc-400 flex items-center gap-2">
            <UIcon name="i-lucide-help-circle" />
            Not Yet Assessed
          </h3>
          <UBadge variant="soft" color="neutral" class="rounded-lg">{{ unassessedTopics.length }}</UBadge>
        </div>
      </template>

      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="topic in unassessedTopics"
          :key="topic.id"
          class="flex items-center justify-between px-3 py-2.5 bg-zinc-800/50 rounded-xl"
        >
          <span class="text-sm text-zinc-400">{{ topic.name }}</span>
          <UButton
            size="xs"
            variant="soft"
            class="rounded-lg"
            @click="$emit('assessTopic', topic.id)"
          >
            Assess
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- All Topics -->
    <UCard class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold flex items-center gap-2">
            <UIcon name="i-lucide-list" class="text-zinc-500" />
            All Topics
          </h3>
          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            class="rounded-lg"
            @click="showAll = !showAll"
          >
            {{ showAll ? 'Collapse' : 'Expand' }}
            <UIcon :name="showAll ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="ml-1" />
          </UButton>
        </div>
      </template>

      <div v-if="showAll" class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="topic in allTopicsWithLevel"
          :key="topic.id"
          class="flex items-center justify-between px-3 py-2.5 bg-zinc-800/50 rounded-xl"
        >
          <span class="text-sm">{{ topic.name }}</span>
          <span
            v-if="topic.level !== null"
            class="text-xs font-medium px-2 py-0.5 rounded-md"
            :style="{ backgroundColor: getColorHex(CONFIDENCE_LEVELS[topic.level].color) + '20', color: getColorHex(CONFIDENCE_LEVELS[topic.level].color) }"
          >
            {{ CONFIDENCE_LEVELS[topic.level].shortLabel || CONFIDENCE_LEVELS[topic.level].label.split(' ')[0] }}
          </span>
          <span v-else class="text-xs text-zinc-600">—</span>
        </div>
      </div>
      <p v-else class="text-sm text-zinc-500 text-center py-4">
        {{ technology?.topics.length }} topics total
      </p>
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
