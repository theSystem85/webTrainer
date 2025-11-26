import { ref, computed, watch } from 'vue'

// Types
export interface SkillTopic {
  id: string
  name: string
  path: string
  category?: string
}

export interface Assessment {
  topicId: string
  level: number
  timestamp: number
}

export interface Technology {
  id: string
  name: string
  url: string
  topics: SkillTopic[]
  createdAt: number
}

export interface QuizResult {
  topicId: string
  question: string
  userAnswer: string
  isCorrect: boolean
  timestamp: number
}

export interface TopicHistory {
  topicId: string
  assessmentCount: number
  lastAssessedAt: number
}

// Confidence levels with descriptions
export const CONFIDENCE_LEVELS = [
  { level: 0, label: 'Never heard of it', shortLabel: 'New', color: 'gray', description: 'This is completely new to me' },
  { level: 1, label: 'Heard the name', shortLabel: 'Heard', color: 'red', description: 'I\'ve seen or heard this term before' },
  { level: 2, label: 'Know what it\'s for', shortLabel: 'Know', color: 'orange', description: 'I understand the general purpose' },
  { level: 3, label: 'Used it once or twice', shortLabel: 'Tried', color: 'yellow', description: 'I\'ve tried it in a basic way' },
  { level: 4, label: 'Can use with docs', shortLabel: 'Docs', color: 'lime', description: 'I can use it while referring to documentation' },
  { level: 5, label: 'Use confidently', shortLabel: 'Good', color: 'green', description: 'I can use it without constantly checking docs' },
  { level: 6, label: 'Can teach others', shortLabel: 'Teach', color: 'teal', description: 'I can explain it clearly to someone else' },
  { level: 7, label: 'Deep expertise', shortLabel: 'Expert', color: 'blue', description: 'I understand internals and edge cases' }
] as const

const STORAGE_KEYS = {
  technologies: 'skillTrainer_technologies',
  assessments: 'skillTrainer_assessments',
  quizResults: 'skillTrainer_quizResults',
  topicHistory: 'skillTrainer_topicHistory',
  settings: 'skillTrainer_settings'
}

// State - use global state to persist across HMR
let technologies = ref<Technology[]>([])
let assessments = ref<Assessment[]>([])
let quizResults = ref<QuizResult[]>([])
let topicHistory = ref<TopicHistory[]>([])
let isLoaded = ref(false)

if (import.meta.hot) {
  if (!import.meta.hot.data.initialized) {
    import.meta.hot.data.initialized = true
    import.meta.hot.data.technologies = technologies
    import.meta.hot.data.assessments = assessments
    import.meta.hot.data.quizResults = quizResults
    import.meta.hot.data.topicHistory = topicHistory
    import.meta.hot.data.isLoaded = isLoaded
  } else {
    technologies = import.meta.hot.data.technologies
    assessments = import.meta.hot.data.assessments
    quizResults = import.meta.hot.data.quizResults
    topicHistory = import.meta.hot.data.topicHistory
    isLoaded = import.meta.hot.data.isLoaded
  }
}

// Load from localStorage
function loadFromStorage() {
  if (typeof window === 'undefined') return
  if (isLoaded.value) return

  try {
    const storedTech = localStorage.getItem(STORAGE_KEYS.technologies)
    if (storedTech) technologies.value = JSON.parse(storedTech)

    const storedAssess = localStorage.getItem(STORAGE_KEYS.assessments)
    if (storedAssess) assessments.value = JSON.parse(storedAssess)

    const storedQuiz = localStorage.getItem(STORAGE_KEYS.quizResults)
    if (storedQuiz) quizResults.value = JSON.parse(storedQuiz)

    const storedHistory = localStorage.getItem(STORAGE_KEYS.topicHistory)
    if (storedHistory) topicHistory.value = JSON.parse(storedHistory)
  }
  catch (e) {
    console.error('Failed to load from storage:', e)
  }

  isLoaded.value = true
}

// Save to localStorage with debounce
function saveToStorage() {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEYS.technologies, JSON.stringify(technologies.value))
    localStorage.setItem(STORAGE_KEYS.assessments, JSON.stringify(assessments.value))
    localStorage.setItem(STORAGE_KEYS.quizResults, JSON.stringify(quizResults.value))
    localStorage.setItem(STORAGE_KEYS.topicHistory, JSON.stringify(topicHistory.value))
  }
  catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

export function useSkillStore() {
  // Initialize on first use
  loadFromStorage()

  // Watch for changes and persist
  watch([technologies, assessments, quizResults, topicHistory], saveToStorage, { deep: true })

  // Computed
  const getTechnologyById = computed(() => {
    return (id: string) => technologies.value.find(t => t.id === id)
  })

  const getLatestAssessment = computed(() => {
    return (topicId: string) => {
      const topicAssessments = assessments.value
        .filter(a => a.topicId === topicId)
        .sort((a, b) => b.timestamp - a.timestamp)
      return topicAssessments[0] || null
    }
  })

  const getTechnologyProgress = computed(() => {
    return (techId: string) => {
      const tech = technologies.value.find(t => t.id === techId)
      if (!tech || tech.topics.length === 0) return { assessed: 0, total: 0, avgLevel: 0 }

      let totalLevel = 0
      let assessedCount = 0

      for (const topic of tech.topics) {
        const assessment = getLatestAssessment.value(topic.id)
        if (assessment) {
          totalLevel += assessment.level
          assessedCount++
        }
      }

      return {
        assessed: assessedCount,
        total: tech.topics.length,
        avgLevel: assessedCount > 0 ? totalLevel / assessedCount : 0
      }
    }
  })

  const getLevelDistribution = computed(() => {
    return (techId: string) => {
      const tech = technologies.value.find(t => t.id === techId)
      if (!tech) return []

      const distribution = CONFIDENCE_LEVELS.map(cl => ({ ...cl, count: 0 }))

      for (const topic of tech.topics) {
        const assessment = getLatestAssessment.value(topic.id)
        const level = assessment?.level ?? 0
        const dist = distribution[level]
        if (dist) dist.count++
      }

      return distribution
    }
  })

  const getUnassessedTopics = computed(() => {
    return (techId: string) => {
      const tech = technologies.value.find(t => t.id === techId)
      if (!tech) return []

      return tech.topics.filter(topic => {
        const assessment = getLatestAssessment.value(topic.id)
        return !assessment
      })
    }
  })

  const getWeakTopics = computed(() => {
    return (techId: string, maxLevel = 2) => {
      const tech = technologies.value.find(t => t.id === techId)
      if (!tech) return []

      return tech.topics.filter(topic => {
        const assessment = getLatestAssessment.value(topic.id)
        return assessment && assessment.level <= maxLevel
      }).map(topic => ({
        ...topic,
        level: getLatestAssessment.value(topic.id)?.level ?? 0
      }))
    }
  })

  const getTopicHistory = computed(() => {
    return (topicId: string): TopicHistory | null => {
      return topicHistory.value.find(h => h.topicId === topicId) || null
    }
  })

  // Actions
  function addTechnology(tech: Omit<Technology, 'id' | 'createdAt'>) {
    const newTech: Technology = {
      ...tech,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }
    technologies.value.push(newTech)
    return newTech
  }

  function updateTechnology(id: string, updates: Partial<Technology>) {
    const index = technologies.value.findIndex(t => t.id === id)
    const existing = technologies.value[index]
    if (index !== -1 && existing) {
      technologies.value[index] = { ...existing, ...updates }
    }
  }

  function deleteTechnology(id: string) {
    technologies.value = technologies.value.filter(t => t.id !== id)
    // Also remove related assessments
    assessments.value = assessments.value.filter(a => {
      const tech = technologies.value.find(t => t.topics.some(topic => topic.id === a.topicId))
      return tech !== undefined
    })
  }

  function addTopicToTechnology(techId: string, topic: Omit<SkillTopic, 'id'>) {
    const tech = technologies.value.find(t => t.id === techId)
    if (tech) {
      tech.topics.push({
        ...topic,
        id: crypto.randomUUID()
      })
    }
  }

  function removeTopicFromTechnology(techId: string, topicId: string) {
    const tech = technologies.value.find(t => t.id === techId)
    if (tech) {
      tech.topics = tech.topics.filter(t => t.id !== topicId)

      // remove related assessments
      assessments.value = assessments.value.filter(a => a.topicId !== topicId)

      // remove related quiz results
      quizResults.value = quizResults.value.filter(q => q.topicId !== topicId)

      // remove topic history entries
      topicHistory.value = topicHistory.value.filter(h => h.topicId !== topicId)
    }
  }

  function saveAssessment(topicId: string, level: number) {
    const now = Date.now()
    assessments.value.push({
      topicId,
      level,
      timestamp: now
    })

    // Update topic history
    const existingHistory = topicHistory.value.find(h => h.topicId === topicId)
    if (existingHistory) {
      existingHistory.assessmentCount++
      existingHistory.lastAssessedAt = now
    } else {
      topicHistory.value.push({
        topicId,
        assessmentCount: 1,
        lastAssessedAt: now
      })
    }
  }

  function saveQuizResult(result: Omit<QuizResult, 'timestamp'>) {
    quizResults.value.push({
      ...result,
      timestamp: Date.now()
    })
  }

  function exportData() {
    return JSON.stringify({
      technologies: technologies.value,
      assessments: assessments.value,
      quizResults: quizResults.value,
      topicHistory: topicHistory.value,
      exportedAt: Date.now()
    }, null, 2)
  }

  function importData(jsonString: string) {
    try {
      const data = JSON.parse(jsonString)
      if (data.technologies) technologies.value = data.technologies
      if (data.assessments) assessments.value = data.assessments
      if (data.quizResults) quizResults.value = data.quizResults
      if (data.topicHistory) topicHistory.value = data.topicHistory
      return true
    }
    catch {
      return false
    }
  }

  function clearAllData() {
    technologies.value = []
    assessments.value = []
    quizResults.value = []
    topicHistory.value = []
  }

  return {
    // State
    technologies,
    assessments,
    quizResults,
    topicHistory,
    isLoaded,

    // Computed
    getTechnologyById,
    getLatestAssessment,
    getTechnologyProgress,
    getLevelDistribution,
    getUnassessedTopics,
    getWeakTopics,
    getTopicHistory,

    // Actions
    addTechnology,
    updateTechnology,
    deleteTechnology,
    addTopicToTechnology,
    removeTopicFromTechnology,
    saveAssessment,
    saveQuizResult,
    exportData,
    importData,
    clearAllData
  }
}
