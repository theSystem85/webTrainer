<template>
  <div class="add-technology animate-fade-in">
    <UCard class="overflow-hidden">
      <div class="space-y-6">
        <!-- Technology Name -->
        <UFormField label="Technology Name" required>
          <UInput
            v-model="name"
            placeholder="e.g., Nuxt, React, Vue..."
            size="xl"
            class="rounded-xl"
            :disabled="isLoading"
          >
            <template #leading>
              <UIcon name="i-lucide-code-2" class="text-zinc-500" />
            </template>
          </UInput>
        </UFormField>

        <!-- Input Mode Toggle -->
        <div class="flex gap-2 p-1 bg-zinc-800/50 rounded-xl">
          <UButton
            :variant="inputMode === 'url' ? 'solid' : 'ghost'"
            size="sm"
            class="flex-1 rounded-lg"
            @click="inputMode = 'url'"
          >
            <UIcon name="i-lucide-link" class="mr-2" />
            Fetch from URL
          </UButton>
          <UButton
            :variant="inputMode === 'text' ? 'solid' : 'ghost'"
            size="sm"
            class="flex-1 rounded-lg"
            @click="inputMode = 'text'"
          >
            <UIcon name="i-lucide-file-text" class="mr-2" />
            Paste Docs Text
          </UButton>
        </div>

        <!-- URL Input Mode -->
        <template v-if="inputMode === 'url'">
          <UFormField label="Documentation URL" description="Paste a docs URL to auto-fetch topics">
            <UInput
              v-model="url"
              placeholder="https://docs.example.com/api"
              size="xl"
              class="rounded-xl"
              :disabled="isLoading"
            >
              <template #leading>
                <UIcon name="i-lucide-link" class="text-zinc-500" />
              </template>
            </UInput>
          </UFormField>

          <UButton
            v-if="url"
            block
            size="xl"
            variant="soft"
            :loading="isLoading"
            :disabled="!url || !name"
            class="rounded-xl h-14 font-medium"
            @click="fetchStructure"
          >
            <UIcon name="i-lucide-download" class="mr-2 text-lg" />
            Fetch Documentation Structure
          </UButton>
        </template>

        <!-- Text Paste Mode -->
        <template v-if="inputMode === 'text'">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Text Input Side -->
            <div class="space-y-3">
              <UFormField label="Docs Content" description="Paste text from a documentation page (sidebar, ToC, etc.)">
                <UTextarea
                  v-model="docsText"
                  placeholder="Paste documentation text here...

Examples of formats that work:
• useAsyncData
• useFetch
• useHead

Or: useAsyncData | useFetch | useHead

Or:
- useAsyncData
- useFetch
- useHead

Or:
1. useAsyncData
2. useFetch
3. useHead"
                  :rows="12"
                  class="rounded-xl font-mono text-sm"
                  :disabled="isLoading"
                />
              </UFormField>
              <UButton
                block
                size="lg"
                variant="soft"
                :disabled="!docsText.trim()"
                class="rounded-xl"
                @click="parseDocsText"
              >
                <UIcon name="i-lucide-scan-text" class="mr-2" />
                Parse Topics
              </UButton>
            </div>

            <!-- Preview Side -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-zinc-300">
                  Parse Preview
                  <span v-if="parsedTopics.length > 0" class="text-zinc-500 ml-2">
                    ({{ parsedTopics.length }} topics)
                  </span>
                </label>
                <div v-if="parsedTopics.length > 0" class="flex gap-2">
                  <UButton
                    variant="ghost"
                    size="xs"
                    class="rounded-lg"
                    @click="toggleAllParsed"
                  >
                    {{ allParsedSelected ? 'Deselect All' : 'Select All' }}
                  </UButton>
                  <UButton
                    variant="soft"
                    color="primary"
                    size="xs"
                    class="rounded-lg"
                    :disabled="!parsedTopics.some(t => t.selected)"
                    @click="addParsedToFetched"
                  >
                    <UIcon name="i-lucide-plus" class="mr-1" />
                    Add Selected
                  </UButton>
                </div>
              </div>
              
              <div class="h-[300px] overflow-y-auto bg-zinc-800/40 rounded-xl border border-zinc-700/40 p-3 space-y-1">
                <template v-if="parsedTopics.length > 0">
                  <label
                    v-for="(topic, idx) in parsedTopics"
                    :key="idx"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-700/40 transition-colors"
                  >
                    <UCheckbox v-model="topic.selected" />
                    <span class="text-sm font-mono">{{ topic.name }}</span>
                  </label>
                </template>
                <div v-else class="h-full flex items-center justify-center text-zinc-500 text-sm">
                  <div class="text-center space-y-2">
                    <UIcon name="i-lucide-scan-text" class="text-2xl opacity-50" />
                    <p>Paste docs text and click "Parse Topics"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Manual Entry Section -->
        <div class="pt-2">
          <div class="divider-gradient my-6" />
          <p class="text-center text-xs text-zinc-500 font-medium tracking-wide uppercase -mt-9 mb-4">
            <span class="bg-zinc-900 px-4">Or Add Manually</span>
          </p>
        </div>

        <!-- Manual Topic Entry -->
        <div class="space-y-4">
          <div class="flex gap-3">
            <UInput
              v-model="newTopic"
              placeholder="Topic name (e.g., useAsyncData)"
              class="flex-1 rounded-xl"
              size="xl"
              @keyup.enter="addManualTopic"
            >
              <template #leading>
                <UIcon name="i-lucide-hash" class="text-zinc-500" />
              </template>
            </UInput>
            <UButton
              icon="i-lucide-plus"
              size="xl"
              class="rounded-xl w-14"
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
                class="flex items-center gap-3 px-4 py-3 bg-zinc-800/60 rounded-xl border border-zinc-700/40 group hover:border-zinc-600/60 transition-all"
              >
                <div class="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <UIcon name="i-lucide-hash" class="text-primary-400 text-sm" />
                </div>
                <span class="flex-1 text-sm font-medium">{{ topic }}</span>
                <UButton
                  icon="i-lucide-x"
                  variant="ghost"
                  color="error"
                  size="xs"
                  class="rounded-lg opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity"
                  @click="manualTopics.splice(index, 1)"
                />
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Fetched Topics Preview -->
        <div v-if="fetchedTopics.length > 0" class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-zinc-400">
              Found <span class="text-white font-semibold">{{ fetchedTopics.length }}</span> topics
            </p>
            <UButton
              variant="ghost"
              size="sm"
              class="rounded-lg"
              @click="toggleAllFetched"
            >
              {{ allFetchedSelected ? 'Deselect All' : 'Select All' }}
            </UButton>
          </div>

          <div class="max-h-72 overflow-y-auto space-y-1 pr-2 -mr-2">
            <label
              v-for="topic in fetchedTopics"
              :key="topic.path"
              class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-700/40"
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
          size="xl"
          class="rounded-xl h-14 font-semibold gradient-primary border-0"
          @click="saveTechnology"
        >
          <UIcon name="i-lucide-check" class="mr-2 text-lg" />
          Save Technology ({{ totalTopics }} topic{{ totalTopics !== 1 ? 's' : '' }})
        </UButton>
        <div v-else class="text-center py-2">
          <p class="text-sm text-zinc-500">
            Add a name and at least one topic to save
          </p>
        </div>
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

const inputMode = ref<'url' | 'text'>('url')
const url = ref('')
const name = ref('')
const isLoading = ref(false)
const error = ref('')
const newTopic = ref('')
const manualTopics = ref<string[]>([])
const fetchedTopics = ref<Array<{ name: string; path: string; selected: boolean }>>([])
const docsText = ref('')
const parsedTopics = ref<Array<{ name: string; selected: boolean }>>([])

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

const allParsedSelected = computed(() => {
  return parsedTopics.value.length > 0 && parsedTopics.value.every(t => t.selected)
})

function toggleAllFetched() {
  const newValue = !allFetchedSelected.value
  fetchedTopics.value.forEach(t => t.selected = newValue)
}

function toggleAllParsed() {
  const newValue = !allParsedSelected.value
  parsedTopics.value.forEach(t => t.selected = newValue)
}

function addManualTopic() {
  if (newTopic.value.trim()) {
    manualTopics.value.push(newTopic.value.trim())
    newTopic.value = ''
  }
}

/**
 * Generic topic parser that handles various separator patterns:
 * - Line breaks (one topic per line)
 * - Bullet points (•, -, *, ▪, ▸, ►, etc.)
 * - Numbered lists (1., 2., 1), 2), etc.)
 * - Pipe separators (|)
 * - Comma separators
 * - Tab separators
 * - Markdown headers (##, ###)
 * - Link text patterns [text](url)
 */
function parseDocsText() {
  const text = docsText.value.trim()
  if (!text) {
    parsedTopics.value = []
    return
  }

  // Set of topics to avoid duplicates
  const topicSet = new Set<string>()

  // First, try to detect the primary separator pattern
  const lines = text.split(/\n/)
  
  for (const line of lines) {
    let cleanLine = line.trim()
    
    // Skip empty lines
    if (!cleanLine) continue
    
    // Remove markdown header prefixes (##, ###, etc.)
    cleanLine = cleanLine.replace(/^#{1,6}\s+/, '')
    
    // Remove bullet point prefixes (various styles)
    cleanLine = cleanLine.replace(/^[•\-*▪▸►→➤◦○●◆◇★☆✓✔✗✘]\s*/, '')
    
    // Remove numbered list prefixes (1., 2., 1), 2), etc.)
    cleanLine = cleanLine.replace(/^\d+[.)]\s*/, '')
    
    // Remove checkbox patterns [ ], [x], [X]
    cleanLine = cleanLine.replace(/^\[[\sxX]?\]\s*/, '')
    
    // Extract text from markdown links [text](url)
    const linkMatch = cleanLine.match(/\[([^\]]+)\]\([^)]+\)/)
    if (linkMatch) {
      cleanLine = linkMatch[1]
    }
    
    // Check if line contains inline separators (|, commas, tabs)
    if (cleanLine.includes('|')) {
      // Pipe-separated values
      const parts = cleanLine.split('|').map(p => p.trim()).filter(p => p && p.length > 1)
      parts.forEach(p => topicSet.add(cleanTopic(p)))
    } else if (cleanLine.includes('\t')) {
      // Tab-separated values
      const parts = cleanLine.split('\t').map(p => p.trim()).filter(p => p && p.length > 1)
      parts.forEach(p => topicSet.add(cleanTopic(p)))
    } else if (cleanLine.includes(',') && !cleanLine.includes(' ')) {
      // Comma-separated (only if no spaces, to avoid breaking sentences)
      const parts = cleanLine.split(',').map(p => p.trim()).filter(p => p && p.length > 1)
      parts.forEach(p => topicSet.add(cleanTopic(p)))
    } else if (cleanLine.includes(', ') && cleanLine.split(', ').length > 2) {
      // Comma-space separated list (at least 3 items suggests it's a list)
      const parts = cleanLine.split(', ').map(p => p.trim()).filter(p => p && p.length > 1)
      parts.forEach(p => topicSet.add(cleanTopic(p)))
    } else {
      // Single topic on this line
      const cleaned = cleanTopic(cleanLine)
      if (cleaned) {
        topicSet.add(cleaned)
      }
    }
  }

  // Convert to array and create topic objects
  parsedTopics.value = Array.from(topicSet)
    .filter(t => t.length >= 2 && t.length <= 100) // Reasonable length limits
    .map(name => ({ name, selected: true }))
}

/**
 * Clean up a topic string by removing common unwanted patterns
 */
function cleanTopic(text: string): string {
  let cleaned = text.trim()
  
  // Remove trailing punctuation (except parentheses which might be part of function names)
  cleaned = cleaned.replace(/[:.,;]+$/, '')
  
  // Remove leading/trailing quotes
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '')
  
  // Remove common noise words that appear alone
  const noisePatterns = [
    /^(home|github|twitter|discord|blog|search|menu|navigation|sidebar|footer|header|copyright|all rights reserved)$/i,
    /^(next|prev|previous|back|forward|skip|close|open|expand|collapse|toggle)$/i,
    /^(loading|please wait|error|success|warning|info)$/i,
    /^\d+$/, // Just numbers
    /^[^\w]+$/, // No word characters
  ]
  
  for (const pattern of noisePatterns) {
    if (pattern.test(cleaned)) {
      return ''
    }
  }
  
  return cleaned
}

/**
 * Add selected parsed topics to the fetched topics list
 */
function addParsedToFetched() {
  const selectedParsed = parsedTopics.value.filter(t => t.selected)
  const existingNames = new Set(fetchedTopics.value.map(t => t.name.toLowerCase()))
  
  for (const topic of selectedParsed) {
    if (!existingNames.has(topic.name.toLowerCase())) {
      fetchedTopics.value.push({
        name: topic.name,
        path: '',
        selected: true
      })
      existingNames.add(topic.name.toLowerCase())
    }
  }
  
  // Clear parsed topics after adding
  parsedTopics.value = []
  docsText.value = ''
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
  parsedTopics.value = []
  docsText.value = ''
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
