<template>
  <div class="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col">
    <!-- Top Header -->
    <header class="sticky top-0 z-30 glass border-b border-zinc-800/50 safe-area-top">
      <div class="container-app">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <div class="flex items-center gap-3">
            <UButton
              v-if="currentView !== 'home'"
              icon="i-lucide-arrow-left"
              variant="ghost"
              color="neutral"
              size="sm"
              class="rounded-xl"
              @click="goBack"
            />
            <div>
              <h1 class="text-lg sm:text-xl font-semibold tracking-tight">
                {{ headerTitle }}
              </h1>
              <p v-if="currentView === 'home'" class="text-xs text-zinc-500 hidden sm:block">
                Track your coding skills
              </p>
            </div>
          </div>
          <UButton
            icon="i-lucide-settings"
            variant="ghost"
            color="neutral"
            size="sm"
            class="rounded-xl"
            @click="currentView = 'settings'"
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 pb-24 sm:pb-28">
      <div class="container-app py-4 sm:py-6">
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
        <div v-show="currentView === 'detail' && selectedTechId" class="space-y-4 animate-fade-in">
          <!-- Tech Header Card -->
          <UCard class="overflow-hidden">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                <UIcon name="i-lucide-code-2" class="text-2xl text-white" />
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-semibold">{{ selectedTechnology?.name }}</h2>
                <p class="text-sm text-zinc-400">{{ selectedTechnology?.topics.length }} topics</p>
              </div>
            </div>
          </UCard>

          <!-- Action Buttons -->
          <div class="grid gap-3">
            <UButton
              block
              size="xl"
              class="h-14 rounded-2xl font-medium"
              @click="currentView = 'assess'"
            >
              <UIcon name="i-lucide-clipboard-check" class="mr-3 text-lg" />
              Self Assessment
              <UIcon name="i-lucide-chevron-right" class="ml-auto text-lg opacity-50" />
            </UButton>
            <UButton
              block
              size="xl"
              variant="soft"
              color="neutral"
              class="h-14 rounded-2xl font-medium"
              @click="currentView = 'overview'"
            >
              <UIcon name="i-lucide-bar-chart-2" class="mr-3 text-lg" />
              View Progress
              <UIcon name="i-lucide-chevron-right" class="ml-auto text-lg opacity-50" />
            </UButton>
            <UButton
              block
              size="xl"
              variant="soft"
              color="secondary"
              class="h-14 rounded-2xl font-medium"
              @click="currentView = 'quiz'"
            >
              <UIcon name="i-lucide-brain" class="mr-3 text-lg" />
              AI Quiz
              <UIcon name="i-lucide-chevron-right" class="ml-auto text-lg opacity-50" />
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
        <div class="flex justify-around items-center h-16 sm:h-18 gap-2">
          <button
            class="bottom-nav-item flex flex-col items-center justify-center"
            :class="{ 'active': currentView === 'home' }"
            @click="currentView = 'home'"
          >
            <UIcon
              name="i-lucide-home"
              class="text-xl mb-0.5"
              :class="currentView === 'home' ? 'text-primary' : 'text-zinc-500'"
            />
            <span
              class="text-[11px] font-medium"
              :class="currentView === 'home' ? 'text-primary' : 'text-zinc-500'"
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
              class="w-12 h-12 rounded-2xl flex items-center justify-center -mt-4 shadow-lg transition-all"
              :class="currentView === 'add' ? 'gradient-primary glow-primary' : 'bg-zinc-800'"
            >
              <UIcon name="i-lucide-plus" class="text-xl text-white" />
            </div>
            <span
              class="text-[11px] font-medium mt-1"
              :class="currentView === 'add' ? 'text-primary' : 'text-zinc-500'"
            >
              Add
            </span>
          </button>

          <button
            class="bottom-nav-item flex flex-col items-center justify-center"
            :class="{ 'active': currentView === 'settings' }"
            @click="currentView = 'settings'"
          >
            <UIcon
              name="i-lucide-settings"
              class="text-xl mb-0.5"
              :class="currentView === 'settings' ? 'text-primary' : 'text-zinc-500'"
            />
            <span
              class="text-[11px] font-medium"
              :class="currentView === 'settings' ? 'text-primary' : 'text-zinc-500'"
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
