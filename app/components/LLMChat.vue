<template>
  <div class="llm-chat animate-fade-in space-y-4">
    <!-- API Key Warning -->
    <UAlert
      v-if="!hasApiKey"
      color="warning"
      variant="soft"
      class="rounded-xl"
    >
      <template #title>
        <span class="flex items-center gap-2">
          <UIcon name="i-lucide-key" />
          OpenAI API Key Required
        </span>
      </template>
      <template #description>
        <p class="mb-2">Configure your API key in Settings to enable AI-powered quizzes.</p>
        <UButton size="xs" variant="soft" class="rounded-lg" @click="$emit('openSettings')">
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
          class="rounded-xl"
        />
      </UFormField>
    </UCard>

    <!-- Quiz Interface -->
    <UCard v-if="selectedTopic" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-brain" class="text-lg text-blue-400" />
            </div>
            <div>
              <h3 class="font-semibold">{{ selectedTopic.name }}</h3>
              <p class="text-xs text-zinc-500">Level {{ currentLevel }} quiz</p>
            </div>
          </div>
          <UButton
            v-if="settings.ttsEnabled && currentQuestion"
            :icon="isSpeaking ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
            variant="ghost"
            color="neutral"
            size="sm"
            class="rounded-xl"
            @click="toggleSpeech"
          />
        </div>
      </template>

      <!-- Question Display -->
      <div v-if="currentQuestion" class="space-y-5">
        <div class="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
          <p class="text-base sm:text-lg leading-relaxed">{{ currentQuestion }}</p>
        </div>

        <!-- Answer Input -->
        <UTextarea
          v-model="userAnswer"
          placeholder="Type your answer..."
          :rows="3"
          :disabled="isLoading || showFeedback"
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
            <span class="flex items-center gap-2">
              <UIcon :name="lastResult?.isCorrect ? 'i-lucide-check-circle' : 'i-lucide-info'" />
              {{ lastResult?.isCorrect ? 'Correct!' : 'Not quite...' }}
            </span>
          </template>
          <template #description>
            {{ feedback }}
          </template>
        </UAlert>

        <!-- Actions -->
        <div class="flex gap-3">
          <UButton
            v-if="!showFeedback"
            :loading="isLoading"
            :disabled="!userAnswer.trim()"
            class="flex-1 rounded-xl h-11"
            @click="submitAnswer"
          >
            Submit Answer
          </UButton>
          <UButton
            v-else
            class="flex-1 rounded-xl h-11"
            @click="nextQuestion"
          >
            Next Question
            <UIcon name="i-lucide-chevron-right" class="ml-1" />
          </UButton>
          <UButton
            variant="soft"
            color="neutral"
            class="rounded-xl h-11"
            :loading="isLoading"
            @click="askForExplanation"
          >
            <UIcon name="i-lucide-lightbulb" class="mr-1" />
            Explain
          </UButton>
        </div>
      </div>

      <!-- Start Quiz -->
      <div v-else class="text-center py-10">
        <div class="w-16 h-16 rounded-2xl bg-zinc-800 mx-auto mb-4 flex items-center justify-center">
          <UIcon name="i-lucide-play" class="text-2xl text-zinc-400" />
        </div>
        <p class="text-zinc-400 mb-5 max-w-xs mx-auto">
          Test your knowledge of <span class="text-zinc-200 font-medium">"{{ selectedTopic.name }}"</span>
        </p>
        <UButton
          size="lg"
          :loading="isLoading"
          :disabled="!hasApiKey"
          class="rounded-xl"
          @click="generateNewQuestion"
        >
          <UIcon name="i-lucide-sparkles" class="mr-2" />
          Start Quiz
        </UButton>
      </div>
    </UCard>

    <!-- Explanation Modal -->
    <UModal v-model="showExplanation">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-lightbulb" class="text-lg text-yellow-400" />
            </div>
            <h3 class="font-semibold text-lg">Explanation</h3>
          </div>
        </template>
        <div class="text-zinc-300 leading-relaxed">
          <p>{{ explanation }}</p>
        </div>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton
              v-if="settings.ttsEnabled"
              variant="soft"
              color="neutral"
              class="rounded-xl"
              @click="speakExplanation"
            >
              <UIcon name="i-lucide-volume-2" class="mr-1" />
              Read Aloud
            </UButton>
            <UButton class="rounded-xl" @click="showExplanation = false">Close</UButton>
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
