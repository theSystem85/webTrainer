<template>
  <div class="settings-panel animate-fade-in space-y-5">
    <!-- API Key Section -->
    <UCard class="overflow-hidden">
      <template #header>
        <h3 class="font-bold text-lg flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-key" class="text-primary-400" />
          </div>
          OpenAI API Key
        </h3>
      </template>

      <div class="space-y-5">
        <form @submit.prevent>
        <UFormField
          description="Your key is stored locally and never sent to our servers."
        >
          <UInput
            :model-value="maskedKey"
            :type="showKey ? 'text' : 'password'"
            placeholder="sk-..."
            size="xl"
            class="rounded-xl"
            autocomplete="off"
            @update:model-value="handleKeyInput"
          >
            <template #leading>
              <UIcon name="i-lucide-key" class="text-zinc-500" />
            </template>
            <template #trailing>
              <UButton
                :icon="showKey ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                variant="ghost"
                color="neutral"
                size="sm"
                class="rounded-lg"
                @click="showKey = !showKey"
              />
            </template>
          </UInput>
        </UFormField>
        </form>

        <UAlert
          v-if="settings.openaiApiKey"
          color="success"
          variant="soft"
          class="rounded-xl"
          icon="i-lucide-check-circle"
        >
          <span class="font-medium">API key configured.</span> LLM features enabled.
        </UAlert>
      </div>
    </UCard>

    <!-- Text-to-Speech Section -->
    <UCard class="overflow-hidden">
      <template #header>
        <h3 class="font-bold text-lg flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-volume-2" class="text-blue-400" />
          </div>
          Text-to-Speech
        </h3>
      </template>

      <div class="space-y-6">
        <ClientOnly>
        <div class="flex items-center justify-between p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/40">
          <div>
            <div class="font-semibold">Enable TTS</div>
            <div class="text-sm text-zinc-500">Read quiz questions aloud</div>
          </div>
          <USwitch v-model="settings.ttsEnabled" />
        </div>

        <div v-if="settings.ttsEnabled" class="space-y-5 animate-fade-in">
          <UFormField label="Voice">
            <USelectMenu
              v-model="settings.ttsVoice"
              :options="voiceOptions"
              placeholder="Default voice"
              class="rounded-xl"
            />
          </UFormField>

          <UFormField label="Speed">
            <div class="flex items-center gap-4 mt-2">
              <span class="text-sm text-zinc-500 w-10">Slow</span>
              <input
                v-model.number="settings.ttsRate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                class="flex-1 slider-modern bg-zinc-700"
              />
              <span class="text-sm text-zinc-500 w-10">Fast</span>
              <span class="text-sm font-bold w-14 text-right tabular-nums bg-zinc-800 px-2 py-1 rounded-lg">{{ settings.ttsRate.toFixed(1) }}x</span>
            </div>
          </UFormField>

          <UButton
            variant="soft"
            color="neutral"
            size="lg"
            class="rounded-xl"
            @click="testSpeech"
          >
            <UIcon name="i-lucide-play" class="mr-2" />
            Test Voice
          </UButton>
        </div>

          <template #fallback>
            <div class="h-32 bg-zinc-800/50 rounded-xl animate-pulse" />
          </template>
        </ClientOnly>
      </div>
    </UCard>

    <!-- Data Management Section -->
    <UCard class="overflow-hidden">
      <template #header>
        <h3 class="font-bold text-lg flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <UIcon name="i-lucide-database" class="text-zinc-400" />
          </div>
          Data Management
        </h3>
      </template>

      <div class="space-y-3">
        <UButton
          variant="soft"
          color="neutral"
          block
          size="xl"
          class="rounded-xl h-14 font-medium"
          @click="exportData"
        >
          <UIcon name="i-lucide-download" class="mr-3 text-lg" />
          Export All Data
        </UButton>

        <UButton
          variant="soft"
          color="neutral"
          block
          size="xl"
          class="rounded-xl h-14 font-medium"
          @click="triggerImport"
        >
          <UIcon name="i-lucide-upload" class="mr-3 text-lg" />
          Import Data
        </UButton>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        />

        <div class="divider-gradient my-6" />

        <UButton
          color="error"
          variant="soft"
          block
          size="xl"
          class="rounded-xl h-14 font-medium"
          @click="confirmClear"
        >
          <UIcon name="i-lucide-trash-2" class="mr-3 text-lg" />
          Clear All Data
        </UButton>
      </div>
    </UCard>

    <!-- Clear Confirmation Modal -->
    <UModal v-model="showClearConfirm">
      <UCard>
        <template #header>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
              <UIcon name="i-lucide-alert-triangle" class="text-2xl text-red-400" />
            </div>
            <div>
              <h3 class="font-bold text-lg">Clear All Data?</h3>
              <p class="text-sm text-zinc-500">This action cannot be undone</p>
            </div>
          </div>
        </template>
        <p class="text-zinc-300 leading-relaxed">
          This will permanently delete all your technologies, assessments, and quiz history.
        </p>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton variant="ghost" color="neutral" size="lg" class="rounded-xl" @click="showClearConfirm = false">
              Cancel
            </UButton>
            <UButton color="error" size="lg" class="rounded-xl font-medium" @click="clearData">
              <UIcon name="i-lucide-trash-2" class="mr-2" />
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
