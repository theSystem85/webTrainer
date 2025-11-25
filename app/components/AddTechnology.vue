<template>
  <div class="add-technology animate-fade-in">
    <UCard class="overflow-hidden">
      <div class="space-y-5">
        <!-- Technology Name -->
        <UFormField label="Technology Name" required>
          <UInput
            v-model="name"
            placeholder="e.g., Nuxt, React, Vue..."
            size="lg"
            class="rounded-xl"
            :disabled="isLoading"
          />
        </UFormField>

        <!-- URL Input -->
        <UFormField label="Documentation URL" description="Optional: Paste a docs URL to auto-fetch topics">
          <UInput
            v-model="url"
            placeholder="https://docs.example.com/api"
            size="lg"
            class="rounded-xl"
            :disabled="isLoading"
          />
        </UFormField>

        <!-- Fetch Button -->
        <UButton
          v-if="url"
          block
          size="lg"
          variant="soft"
          :loading="isLoading"
          :disabled="!url || !name"
          class="rounded-xl h-12"
          @click="fetchStructure"
        >
          <UIcon name="i-lucide-download" class="mr-2" />
          Fetch Documentation Structure
        </UButton>

        <!-- Manual Entry Section -->
        <div class="pt-2">
          <USeparator label="OR ADD MANUALLY" />
        </div>

        <!-- Manual Topic Entry -->
        <div class="space-y-3">
          <div class="flex gap-2">
            <UInput
              v-model="newTopic"
              placeholder="Topic name (e.g., useAsyncData)"
              class="flex-1 rounded-xl"
              size="lg"
              @keyup.enter="addManualTopic"
            />
            <UButton
              icon="i-lucide-plus"
              size="lg"
              class="rounded-xl"
              :disabled="!newTopic.trim()"
              @click="addManualTopic"
            />
          </div>

          <!-- Topics List -->
          <div v-if="manualTopics.length > 0" class="space-y-2">
            <TransitionGroup name="list">
              <div
                v-for="(topic, index) in manualTopics"
                :key="topic"
                class="flex items-center gap-2 px-3 py-2.5 bg-zinc-800/50 rounded-xl border border-zinc-700/50"
              >
                <UIcon name="i-lucide-hash" class="text-zinc-500 text-sm" />
                <span class="flex-1 text-sm">{{ topic }}</span>
                <UButton
                  icon="i-lucide-x"
                  variant="ghost"
                  color="error"
                  size="xs"
                  class="rounded-lg opacity-60 hover:opacity-100"
                  @click="manualTopics.splice(index, 1)"
                />
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Fetched Topics Preview -->
        <div v-if="fetchedTopics.length > 0" class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-sm text-zinc-400">
              Found <span class="text-zinc-200 font-medium">{{ fetchedTopics.length }}</span> topics
            </p>
            <UButton
              variant="ghost"
              size="xs"
              class="rounded-lg"
              @click="toggleAllFetched"
            >
              {{ allFetchedSelected ? 'Deselect All' : 'Select All' }}
            </UButton>
          </div>

          <div class="max-h-64 overflow-y-auto space-y-1 pr-1">
            <label
              v-for="topic in fetchedTopics"
              :key="topic.path"
              class="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-zinc-800/50 transition-colors"
            >
              <UCheckbox v-model="topic.selected" />
              <span class="text-sm">{{ topic.name }}</span>
            </label>
          </div>
        </div>

        <!-- Error Message -->
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          icon="i-lucide-alert-circle"
          class="rounded-xl"
        />
      </div>

      <!-- Footer -->
      <template #footer>
        <UButton
          v-if="canSave"
          block
          size="lg"
          class="rounded-xl h-12 font-medium"
          @click="saveTechnology"
        >
          <UIcon name="i-lucide-check" class="mr-2" />
          Save Technology ({{ totalTopics }} topic{{ totalTopics !== 1 ? 's' : '' }})
        </UButton>
        <p v-else class="text-center text-sm text-zinc-500">
          Add a name and at least one topic to save
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSkillStore } from '../composables/useSkillStore'

const emit = defineEmits<{
  saved: [techId: string]
}>()

const { addTechnology } = useSkillStore()

const url = ref('')
const name = ref('')
const isLoading = ref(false)
const error = ref('')
const newTopic = ref('')
const manualTopics = ref<string[]>([])
const fetchedTopics = ref<Array<{ name: string; path: string; selected: boolean }>>([])

const totalTopics = computed(() => {
  const fetchedCount = fetchedTopics.value.filter(t => t.selected).length
  return fetchedCount + manualTopics.value.length
})

const canSave = computed(() => {
  return name.value.trim() && totalTopics.value > 0
})

const allFetchedSelected = computed(() => {
  return fetchedTopics.value.length > 0 && fetchedTopics.value.every(t => t.selected)
})

function toggleAllFetched() {
  const newValue = !allFetchedSelected.value
  fetchedTopics.value.forEach(t => t.selected = newValue)
}

function addManualTopic() {
  if (newTopic.value.trim()) {
    manualTopics.value.push(newTopic.value.trim())
    newTopic.value = ''
  }
}

async function fetchStructure() {
  if (!url.value) return

  isLoading.value = true
  error.value = ''
  fetchedTopics.value = []

  try {
    const response = await fetch(`/api/fetch-docs?url=${encodeURIComponent(url.value)}`)

    if (response.ok) {
      const data = await response.json()
      fetchedTopics.value = data.topics.map((t: { name: string; path: string }) => ({
        ...t,
        selected: true
      }))
    }
    else {
      throw new Error('Could not fetch documentation')
    }
  }
  catch {
    error.value = 'Could not auto-fetch structure. Please add topics manually below.'
  }
  finally {
    isLoading.value = false
  }
}

function saveTechnology() {
  if (!canSave.value) return

  const topics = [
    ...fetchedTopics.value
      .filter(t => t.selected)
      .map(t => ({ name: t.name, path: t.path })),
    ...manualTopics.value.map(topicName => ({ name: topicName, path: '' }))
  ]

  const tech = addTechnology({
    name: name.value.trim(),
    url: url.value.trim(),
    topics: topics.map(t => ({
      id: crypto.randomUUID(),
      name: t.name,
      path: t.path
    }))
  })

  emit('saved', tech.id)

  // Reset form
  url.value = ''
  name.value = ''
  manualTopics.value = []
  fetchedTopics.value = []
  error.value = ''
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 200ms ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
