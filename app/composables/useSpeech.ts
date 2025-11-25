import { ref, onMounted } from 'vue'
import { useSettings } from './useSettings'

export function useSpeech() {
  const { settings } = useSettings()
  const isSpeaking = ref(false)
  const isPaused = ref(false)
  const voices = ref<SpeechSynthesisVoice[]>([])
  const isSupported = ref(false)

  function loadVoices() {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) return

    isSupported.value = true
    voices.value = window.speechSynthesis.getVoices()

    // Voices may load async
    window.speechSynthesis.onvoiceschanged = () => {
      voices.value = window.speechSynthesis.getVoices()
    }
  }

  onMounted(loadVoices)

  function speak(text: string) {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) return
    if (!settings.value.ttsEnabled) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Set voice if specified
    if (settings.value.ttsVoice) {
      const voice = voices.value.find(v => v.name === settings.value.ttsVoice)
      if (voice) utterance.voice = voice
    }

    utterance.rate = settings.value.ttsRate
    utterance.pitch = settings.value.ttsPitch

    utterance.onstart = () => {
      isSpeaking.value = true
      isPaused.value = false
    }

    utterance.onend = () => {
      isSpeaking.value = false
      isPaused.value = false
    }

    utterance.onerror = () => {
      isSpeaking.value = false
      isPaused.value = false
    }

    window.speechSynthesis.speak(utterance)
  }

  function pause() {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) return

    window.speechSynthesis.pause()
    isPaused.value = true
  }

  function resume() {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) return

    window.speechSynthesis.resume()
    isPaused.value = false
  }

  function stop() {
    if (typeof window === 'undefined') return
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()
    isSpeaking.value = false
    isPaused.value = false
  }

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    speak,
    pause,
    resume,
    stop
  }
}
