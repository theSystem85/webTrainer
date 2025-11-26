<template>
  <div class="llm-chat animate-fade-in space-y-5">
    <!-- API Key Warning -->
    <UAlert
      v-if="!hasApiKey"
      color="warning"
      variant="soft"
      class="rounded-xl"
    >
      <template #title>
        <span class="flex items-center gap-2 font-bold">
          <UIcon name="i-lucide-key" />
          OpenAI API Key Required
        </span>
      </template>
      <template #description>
        <p class="mb-3">Configure your API key in Settings to enable AI-powered quizzes.</p>
        <UButton size="sm" variant="soft" class="rounded-xl font-medium" @click="$emit('openSettings')">
          <UIcon name="i-lucide-settings" class="mr-1.5" />
          Go to Settings
        </UButton>
      </template>
    </UAlert>

    <!-- Topic Selector -->
    <UCard class="overflow-hidden">
      <UFormField label="Select a topic to quiz">
        <USelectMenu
          v-model="selectedTopicId"
          :options="topicOptions"
          placeholder="Choose a topic..."
          searchable
          size="xl"
          class="rounded-xl"
        >
          <template #leading>
            <UIcon name="i-lucide-book-open" class="text-zinc-500" />
          </template>
        </USelectMenu>
      </UFormField>
    </UCard>

    <!-- Quiz Interface -->
    <UCard v-if="selectedTopic" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-primary-500/20 flex items-center justify-center ring-1 ring-blue-500/20">
              <UIcon name="i-lucide-brain" class="text-xl text-blue-400" />
            </div>
            <div>
              <h3 class="font-bold text-lg">{{ selectedTopic.name }}</h3>
              <p class="text-sm text-zinc-500">Level {{ currentLevel }} quiz</p>
            </div>
          </div>
          <UButton
            v-if="settings.ttsEnabled && currentQuestion"
            :icon="isSpeaking ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
            variant="ghost"
            color="neutral"
            size="lg"
            class="rounded-xl"
            @click="toggleSpeech"
          />
        </div>
      </template>

      <!-- Question Display -->
      <div v-if="currentQuestion" class="space-y-6">
        <div class="p-5 sm:p-6 bg-zinc-800/60 rounded-2xl border border-zinc-700/50">
          <p class="text-base sm:text-lg leading-relaxed font-medium">{{ currentQuestion }}</p>
        </div>

        <!-- Answer Input -->
        <UTextarea
          v-model="userAnswer"
          placeholder="Type your answer..."
          :rows="4"
          :disabled="isLoading || showFeedback"
          size="xl"
          class="rounded-xl"
        />

        <!-- Feedback -->
        <UAlert
          v-if="showFeedback && feedback"
          :color="lastResult?.isCorrect ? 'success' : 'warning'"
          variant="soft"
          class="rounded-xl"
        >
          <template #title>
            <span class="flex items-center gap-2 font-bold">
              <UIcon :name="lastResult?.isCorrect ? 'i-lucide-check-circle' : 'i-lucide-info'" />
              {{ lastResult?.isCorrect ? 'Correct!' : 'Not quite...' }}
            </span>
          </template>
          <template #description>
            <p class="leading-relaxed">{{ feedback }}</p>
          </template>
        </UAlert>

        <!-- Actions -->
        <div class="flex gap-3">
          <UButton
            v-if="!showFeedback"
            :loading="isLoading"
            :disabled="!userAnswer.trim()"
            size="xl"
            class="flex-1 rounded-xl h-14 font-semibold gradient-primary border-0"
            @click="submitAnswer"
          >
            Submit Answer
          </UButton>
          <UButton
            v-else
            size="xl"
            class="flex-1 rounded-xl h-14 font-semibold gradient-primary border-0"
            @click="nextQuestion"
          >
            Next Question
            <UIcon name="i-lucide-chevron-right" class="ml-2 text-lg" />
          </UButton>
          <UButton
            variant="soft"
            color="neutral"
            size="xl"
            class="rounded-xl h-14 px-5"
            :loading="isLoading"
            @click="askForExplanation"
          >
            <UIcon name="i-lucide-lightbulb" class="mr-2" />
            Explain
          </UButton>
        </div>
      </div>

      <!-- Start Quiz -->
      <div v-else class="text-center py-14">
        <div class="relative inline-block mb-6">
          <div class="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl" />
          <div class="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 mx-auto flex items-center justify-center ring-1 ring-zinc-700/50">
            <UIcon name="i-lucide-play" class="text-3xl text-zinc-300" />
          </div>
        </div>
        <p class="text-zinc-400 mb-8 max-w-sm mx-auto text-lg">
          Test your knowledge of <span class="text-white font-semibold">"{{ selectedTopic.name }}"</span>
        </p>
        <UButton
          size="xl"
          :loading="isLoading"
          :disabled="!hasApiKey"
          class="rounded-xl h-14 px-8 font-semibold gradient-primary border-0"
          @click="generateNewQuestion"
        >
          <UIcon name="i-lucide-sparkles" class="mr-2 text-lg" />
          Start Quiz
        </UButton>
      </div>
    </UCard>

    <!-- Explanation Modal -->
    <UModal v-model="showExplanation">
      <UCard>
        <template #header>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center ring-1 ring-yellow-500/20">
              <UIcon name="i-lucide-lightbulb" class="text-xl text-yellow-400" />
            </div>
            <h3 class="font-bold text-lg">Explanation</h3>
          </div>
        </template>
        <div class="text-zinc-300 leading-relaxed text-base">
          <p>{{ explanation }}</p>
        </div>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton
              v-if="settings.ttsEnabled"
              variant="soft"
              color="neutral"
              size="lg"
              class="rounded-xl"
              @click="speakExplanation"
            >
              <UIcon name="i-lucide-volume-2" class="mr-2" />
              Read Aloud
            </UButton>
            <UButton size="lg" class="rounded-xl font-medium" @click="showExplanation = false">Close</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSkillStore, CONFIDENCE_LEVELS, type SkillTopic } from '../composables/useSkillStore'
import { useSettings } from '../composables/useSettings'
import { useOpenAI } from '../composables/useOpenAI'
import { useSpeech } from '../composables/useSpeech'

const props = defineProps<{
  techId: string
}>()

defineEmits<{
  openSettings: []
}>()

const { getTechnologyById, getLatestAssessment, saveQuizResult } = useSkillStore()
const { settings, hasApiKey } = useSettings()
const { isLoading, generateQuestion, evaluateAnswer, explainTopic } = useOpenAI()
const { speak, stop, isSpeaking } = useSpeech()

const technology = computed(() => getTechnologyById.value(props.techId))

const selectedTopicId = ref<string | null>(null)
const currentQuestion = ref<string | null>(null)
const userAnswer = ref('')
const feedback = ref<string | null>(null)
const showFeedback = ref(false)
const lastResult = ref<{ isCorrect: boolean } | null>(null)
const showExplanation = ref(false)
const explanation = ref('')

const topicOptions = computed(() => {
  if (!technology.value) return []
  return technology.value.topics.map(t => ({
    label: t.name,
    value: t.id
  }))
})

const selectedTopic = computed(() => {
  if (!selectedTopicId.value || !technology.value) return null
  return technology.value.topics.find(t => t.id === selectedTopicId.value)
})

const currentLevel = computed(() => {
  if (!selectedTopicId.value) return 3
  return getLatestAssessment.value(selectedTopicId.value)?.level ?? 3
})

// Reset when topic changes
watch(selectedTopicId, () => {
  currentQuestion.value = null
  userAnswer.value = ''
  feedback.value = null
  showFeedback.value = false
})

async function generateNewQuestion() {
  if (!technology.value || !selectedTopic.value) return

  const question = await generateQuestion(
    technology.value.name,
    selectedTopic.value.name,
    currentLevel.value
  )

  if (question) {
    currentQuestion.value = question
    userAnswer.value = ''
    feedback.value = null
    showFeedback.value = false

    if (settings.value.ttsEnabled) {
      speak(question)
    }
  }
}

async function submitAnswer() {
  if (!technology.value || !selectedTopic.value || !currentQuestion.value) return

  const result = await evaluateAnswer(
    technology.value.name,
    selectedTopic.value.name,
    currentQuestion.value,
    userAnswer.value
  )

  if (result) {
    feedback.value = result.feedback
    showFeedback.value = true
    lastResult.value = { isCorrect: result.isCorrect }

    saveQuizResult({
      topicId: selectedTopic.value.id,
      question: currentQuestion.value,
      userAnswer: userAnswer.value,
      isCorrect: result.isCorrect
    })

    if (settings.value.ttsEnabled) {
      speak(result.feedback)
    }
  }
}

function nextQuestion() {
  generateNewQuestion()
}

async function askForExplanation() {
  if (!technology.value || !selectedTopic.value) return

  const result = await explainTopic(
    technology.value.name,
    selectedTopic.value.name,
    currentLevel.value
  )

  if (result) {
    explanation.value = result
    showExplanation.value = true
  }
}

function speakExplanation() {
  speak(explanation.value)
}

function toggleSpeech() {
  if (isSpeaking.value) {
    stop()
  }
  else if (currentQuestion.value) {
    speak(currentQuestion.value)
  }
}
</script>
