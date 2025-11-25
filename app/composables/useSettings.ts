import { ref, watch, computed } from 'vue'

export interface Settings {
  openaiApiKey: string
  ttsEnabled: boolean
  ttsVoice: string
  ttsRate: number
  ttsPitch: number
}

const STORAGE_KEY = 'skillTrainer_settings'

const defaultSettings: Settings = {
  openaiApiKey: '',
  ttsEnabled: true,
  ttsVoice: '',
  ttsRate: 1.0,
  ttsPitch: 1.0
}

let settings = ref<Settings>({ ...defaultSettings })
let isLoaded = ref(false)

if (import.meta.hot) {
  if (!import.meta.hot.data.settingsInitialized) {
    import.meta.hot.data.settingsInitialized = true
    import.meta.hot.data.settings = settings
    import.meta.hot.data.isLoaded = isLoaded
  } else {
    settings = import.meta.hot.data.settings
    isLoaded = import.meta.hot.data.isLoaded
  }
}

function loadSettings() {
  if (typeof window === 'undefined') return
  if (isLoaded.value) return

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      settings.value = { ...defaultSettings, ...JSON.parse(stored) }
    }
  }
  catch (e) {
    console.error('Failed to load settings:', e)
  }

  isLoaded.value = true
}

function saveSettings() {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  }
  catch (e) {
    console.error('Failed to save settings:', e)
  }
}

export function useSettings() {
  loadSettings()

  watch(settings, saveSettings, { deep: true })

  function updateSettings(updates: Partial<Settings>) {
    settings.value = { ...settings.value, ...updates }
  }

  function resetSettings() {
    settings.value = { ...defaultSettings }
  }

  const hasApiKey = computed(() => !!settings.value.openaiApiKey)

  return {
    settings,
    hasApiKey,
    updateSettings,
    resetSettings
  }
}
