<template>
  <div class="settings-panel animate-fade-in space-y-4">
    <!-- API Key Section -->
    <UCard class="overflow-hidden">
      <template #header>
        <h3 class="font-semibold flex items-center gap-2">
          <UIcon name="i-lucide-key" class="text-zinc-500" />
          OpenAI API Key
        </h3>
      </template>

      <div class="space-y-4">
        <UFormField
          description="Your key is stored locally and never sent to our servers."
        >
          <UInput
            :model-value="maskedKey"
            :type="showKey ? 'text' : 'password'"
            placeholder="sk-..."
            size="lg"
            class="rounded-xl"
            @update:model-value="handleKeyInput"
          >
            <template #trailing>
              <UButton
                :icon="showKey ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                variant="ghost"
                color="neutral"
                size="xs"
                class="rounded-lg"
                @click="showKey = !showKey"
              />
            </template>
          </UInput>
        </UFormField>

        <UAlert
          v-if="settings.openaiApiKey"
          color="success"
          variant="soft"
          class="rounded-xl"
          icon="i-lucide-check-circle"
        >
          API key configured. LLM features enabled.
        </UAlert>
      </div>
    </UCard>

    <!-- Text-to-Speech Section -->
    <UCard class="overflow-hidden">
      <template #header>
        <h3 class="font-semibold flex items-center gap-2">
          <UIcon name="i-lucide-volume-2" class="text-zinc-500" />
          Text-to-Speech
        </h3>
      </template>

      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Enable TTS</div>
            <div class="text-sm text-zinc-500">Read quiz questions aloud</div>
          </div>
          <USwitch v-model="settings.ttsEnabled" />
        </div>

        <div v-if="settings.ttsEnabled" class="space-y-4 pt-2">
          <UFormField label="Voice">
            <USelectMenu
              v-model="settings.ttsVoice"
              :options="voiceOptions"
              placeholder="Default voice"
              class="rounded-xl"
            />
          </UFormField>

          <UFormField label="Speed">
            <div class="flex items-center gap-4">
              <span class="text-sm text-zinc-500">Slow</span>
              <input
                v-model.number="settings.ttsRate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                class="flex-1 slider-modern bg-zinc-700"
              />
              <span class="text-sm text-zinc-500">Fast</span>
              <span class="text-sm font-medium w-10 text-right">{{ settings.ttsRate.toFixed(1) }}x</span>
            </div>
          </UFormField>

          <UButton
            variant="soft"
            color="neutral"
            size="sm"
            class="rounded-xl"
            @click="testSpeech"
          >
            <UIcon name="i-lucide-play" class="mr-1" />
            Test Voice
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Data Management Section -->
    <UCard class="overflow-hidden">
      <template #header>
        <h3 class="font-semibold flex items-center gap-2">
          <UIcon name="i-lucide-database" class="text-zinc-500" />
          Data Management
        </h3>
      </template>

      <div class="space-y-3">
        <UButton
          variant="soft"
          color="neutral"
          block
          class="rounded-xl h-11"
          @click="exportData"
        >
          <UIcon name="i-lucide-download" class="mr-2" />
          Export All Data
        </UButton>

        <UButton
          variant="soft"
          color="neutral"
          block
          class="rounded-xl h-11"
          @click="triggerImport"
        >
          <UIcon name="i-lucide-upload" class="mr-2" />
          Import Data
        </UButton>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        />

        <USeparator class="my-4" />

        <UButton
          color="error"
          variant="soft"
          block
          class="rounded-xl h-11"
          @click="confirmClear"
        >
          <UIcon name="i-lucide-trash-2" class="mr-2" />
          Clear All Data
        </UButton>
      </div>
    </UCard>

    <!-- Clear Confirmation Modal -->
    <UModal v-model="showClearConfirm">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-alert-triangle" class="text-xl text-red-400" />
            </div>
            <h3 class="font-semibold text-lg">Clear All Data?</h3>
          </div>
        </template>
        <p class="text-zinc-400">
          This will permanently delete all your technologies, assessments, and quiz history.
          <span class="text-zinc-200">This action cannot be undone.</span>
        </p>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton variant="ghost" color="neutral" class="rounded-xl" @click="showClearConfirm = false">
              Cancel
            </UButton>
            <UButton color="error" class="rounded-xl" @click="clearData">
              Delete Everything
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettings } from '../composables/useSettings'
import { useSkillStore } from '../composables/useSkillStore'
import { useSpeech } from '../composables/useSpeech'

const { settings, updateSettings } = useSettings()
const { exportData: exportStoreData, importData: importStoreData, clearAllData } = useSkillStore()
const { voices, speak } = useSpeech()

const showKey = ref(false)
const showClearConfirm = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const maskedKey = computed(() => {
  if (showKey.value) return settings.value.openaiApiKey
  if (!settings.value.openaiApiKey) return ''
  return settings.value.openaiApiKey.slice(0, 7) + '...' + settings.value.openaiApiKey.slice(-4)
})

const voiceOptions = computed(() => {
  return [
    { label: 'Default', value: '' },
    ...voices.value.map(v => ({
      label: `${v.name} (${v.lang})`,
      value: v.name
    }))
  ]
})

function handleKeyInput(value: string) {
  // Only update if it looks like a new key being entered
  if (value.startsWith('sk-') || value === '') {
    updateSettings({ openaiApiKey: value })
  }
}

function testSpeech() {
  speak('Hello! This is a test of the text to speech feature.')
}

function exportData() {
  const data = exportStoreData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `skill-trainer-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    const success = importStoreData(content)
    if (success) {
      alert('Data imported successfully!')
    }
    else {
      alert('Failed to import data. Please check the file format.')
    }
  }
  reader.readAsText(file)
}

function confirmClear() {
  showClearConfirm.value = true
}

function clearData() {
  clearAllData()
  showClearConfirm.value = false
}
</script>
