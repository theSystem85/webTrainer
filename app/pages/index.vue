<template>
  <div class="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col bg-pattern">
    <!-- Top Header -->
    <header class="sticky top-0 z-30 glass border-b border-zinc-800/50 safe-area-top">
      <div class="container-app">
        <div class="flex items-center justify-between h-16 sm:h-18">
          <div class="flex items-center gap-4">
            <UButton
              v-if="currentView !== 'home'"
              icon="i-lucide-arrow-left"
              variant="ghost"
              color="neutral"
              size="lg"
              class="rounded-xl -ml-2"
              @click="goBack"
            />
            <div>
              <h1 class="text-lg sm:text-xl font-bold tracking-tight">
                {{ headerTitle }}
              </h1>
              <p v-if="currentView === 'home'" class="text-xs text-zinc-500 hidden sm:block">
                Master your coding skills
              </p>
            </div>
          </div>
          <UButton
            icon="i-lucide-settings"
            variant="ghost"
            color="neutral"
            size="lg"
            class="rounded-xl"
            @click="currentView = 'settings'"
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 pb-28 sm:pb-32">
      <div class="container-app py-5 sm:py-8">
        <!-- Home View -->
        <TechnologyList
          v-show="currentView === 'home'"
          @add="currentView = 'add'"
          @select="selectTechnology"
        />

        <!-- Add Technology View -->
        <AddTechnology
          v-show="currentView === 'add'"
          @saved="onTechnologySaved"
        />

        <!-- Technology Detail View -->
        <div v-show="currentView === 'detail' && selectedTechId" class="space-y-5 animate-fade-in">
          <!-- Tech Header Card -->
          <UCard class="overflow-hidden">
            <div class="flex items-center gap-5">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-blue-500/30 rounded-2xl blur-xl" />
                <div class="relative w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                  <UIcon name="i-lucide-code-2" class="text-3xl text-white" />
                </div>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold">{{ selectedTechnology?.name }}</h2>
                <p class="text-sm text-zinc-400 flex items-center gap-1.5 mt-1">
                  <UIcon name="i-lucide-layers" class="text-xs" />
                  {{ selectedTechnology?.topics.length }} topics
                </p>
              </div>
            </div>
          </UCard>

          <!-- Action Buttons -->
          <div class="grid gap-4">
            <UButton
              block
              size="xl"
              class="h-16 sm:h-18 rounded-2xl font-semibold text-base gradient-primary border-0 btn-glow"
              @click="currentView = 'assess'"
            >
              <UIcon name="i-lucide-clipboard-check" class="mr-3 text-xl" />
              Self Assessment
              <UIcon name="i-lucide-chevron-right" class="ml-auto text-xl opacity-60" />
            </UButton>
            <UButton
              block
              size="xl"
              variant="soft"
              color="neutral"
              class="h-16 sm:h-18 rounded-2xl font-semibold text-base"
              @click="currentView = 'overview'"
            >
              <UIcon name="i-lucide-bar-chart-2" class="mr-3 text-xl" />
              View Progress
              <UIcon name="i-lucide-chevron-right" class="ml-auto text-xl opacity-60" />
            </UButton>
            <UButton
              block
              size="xl"
              variant="soft"
              color="secondary"
              class="h-16 sm:h-18 rounded-2xl font-semibold text-base glow-blue"
              @click="currentView = 'quiz'"
            >
              <UIcon name="i-lucide-brain" class="mr-3 text-xl" />
              AI Quiz
              <UIcon name="i-lucide-chevron-right" class="ml-auto text-xl opacity-60" />
            </UButton>
          </div>
        </div>

        <!-- Assessment View -->
        <SkillAssessment
          v-show="currentView === 'assess' && selectedTechId"
          :tech-id="selectedTechId || ''"
          @view-overview="currentView = 'overview'"
        />

        <!-- Overview View -->
        <SkillOverview
          v-show="currentView === 'overview' && selectedTechId"
          :tech-id="selectedTechId || ''"
          @assess-topic="startAssessmentFromTopic"
        />

        <!-- Quiz View -->
        <LLMChat
          v-show="currentView === 'quiz' && selectedTechId"
          :tech-id="selectedTechId || ''"
          @open-settings="currentView = 'settings'"
        />

        <!-- Settings View -->
        <SettingsPanel v-show="currentView === 'settings'" />
      </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-30 glass border-t border-zinc-800/50 safe-area-bottom">
      <div class="container-app">
        <div class="flex justify-around items-center h-18 sm:h-20 gap-2">
          <button
            class="bottom-nav-item flex flex-col items-center justify-center py-2"
            :class="{ 'active': currentView === 'home' }"
            @click="currentView = 'home'"
          >
            <UIcon
              name="i-lucide-home"
              class="text-2xl mb-1 transition-colors"
              :class="currentView === 'home' ? 'text-primary-400' : 'text-zinc-500'"
            />
            <span
              class="text-xs font-semibold transition-colors"
              :class="currentView === 'home' ? 'text-primary-400' : 'text-zinc-500'"
            >
              Home
            </span>
          </button>

          <button
            class="bottom-nav-item flex flex-col items-center justify-center"
            :class="{ 'active': currentView === 'add' }"
            @click="currentView = 'add'"
          >
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center -mt-6 shadow-xl transition-all duration-300"
              :class="currentView === 'add' ? 'gradient-primary glow-primary scale-110' : 'bg-zinc-800 hover:bg-zinc-700'"
            >
              <UIcon name="i-lucide-plus" class="text-2xl text-white" />
            </div>
            <span
              class="text-xs font-semibold mt-1.5 transition-colors"
              :class="currentView === 'add' ? 'text-primary-400' : 'text-zinc-500'"
            >
              Add
            </span>
          </button>

          <button
            class="bottom-nav-item flex flex-col items-center justify-center py-2"
            :class="{ 'active': currentView === 'settings' }"
            @click="currentView = 'settings'"
          >
            <UIcon
              name="i-lucide-settings"
              class="text-2xl mb-1 transition-colors"
              :class="currentView === 'settings' ? 'text-primary-400' : 'text-zinc-500'"
            />
            <span
              class="text-xs font-semibold transition-colors"
              :class="currentView === 'settings' ? 'text-primary-400' : 'text-zinc-500'"
            >
              Settings
            </span>
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSkillStore } from '../composables/useSkillStore'

type ViewType = 'home' | 'add' | 'detail' | 'assess' | 'overview' | 'quiz' | 'settings'

const { getTechnologyById } = useSkillStore()

const currentView = ref<ViewType>('home')
const selectedTechId = ref<string | null>(null)
const previousView = ref<ViewType>('home')

const selectedTechnology = computed(() => {
  if (!selectedTechId.value) return null
  return getTechnologyById.value(selectedTechId.value)
})

// Track previous view for settings back navigation
watch(currentView, (newView, oldView) => {
  if (newView === 'settings') {
    previousView.value = oldView
  }
})

const headerTitle = computed(() => {
  switch (currentView.value) {
    case 'home':
      return 'Skill Trainer'
    case 'add':
      return 'Add Technology'
    case 'detail':
      return selectedTechnology.value?.name || 'Technology'
    case 'assess':
      return 'Self Assessment'
    case 'overview':
      return 'Progress Overview'
    case 'quiz':
      return 'AI Quiz'
    case 'settings':
      return 'Settings'
    default:
      return 'Skill Trainer'
  }
})

function selectTechnology(techId: string) {
  selectedTechId.value = techId
  currentView.value = 'detail'
}

function onTechnologySaved(techId: string) {
  selectedTechId.value = techId
  currentView.value = 'assess'
}

function startAssessmentFromTopic(_topicId: string) {
  currentView.value = 'assess'
}

function goBack() {
  const backMap: Record<ViewType, ViewType> = {
    home: 'home',
    add: 'home',
    detail: 'home',
    assess: 'detail',
    overview: 'detail',
    quiz: 'detail',
    settings: previousView.value
  }
  currentView.value = backMap[currentView.value]
}
</script>
