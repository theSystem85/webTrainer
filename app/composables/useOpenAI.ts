import { ref } from 'vue'
import { useSettings } from './useSettings'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export function useOpenAI() {
  const { settings } = useSettings()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function chat(messages: ChatMessage[]): Promise<string | null> {
    if (!settings.value.openaiApiKey) {
      error.value = 'No API key configured'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.value.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || null
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  async function generateQuestion(techName: string, topicName: string, currentLevel: number): Promise<string | null> {
    const difficultyMap: Record<number, string> = {
      0: 'very basic introductory',
      1: 'simple conceptual',
      2: 'basic understanding',
      3: 'practical usage',
      4: 'intermediate',
      5: 'advanced',
      6: 'expert-level',
      7: 'deep technical internals'
    }

    const difficulty = difficultyMap[currentLevel] || 'intermediate'

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a helpful programming tutor. Generate a single ${difficulty} question about the topic "${topicName}" in ${techName}. The question should test practical understanding. Keep it concise and clear. Only output the question, nothing else.`
      },
      {
        role: 'user',
        content: `Generate a ${difficulty} question about "${topicName}" in ${techName}.`
      }
    ]

    return chat(messages)
  }

  async function evaluateAnswer(
    techName: string,
    topicName: string,
    question: string,
    answer: string
  ): Promise<{ isCorrect: boolean; feedback: string } | null> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a helpful programming tutor evaluating a student's answer about ${techName}. Be encouraging but accurate. Provide brief feedback (2-3 sentences max). Start your response with either "✓ Correct!" or "✗ Not quite." followed by your feedback.`
      },
      {
        role: 'user',
        content: `Topic: ${topicName}\nQuestion: ${question}\nStudent's answer: ${answer}\n\nEvaluate this answer.`
      }
    ]

    const response = await chat(messages)
    if (!response) return null

    const isCorrect = response.toLowerCase().startsWith('✓') || response.toLowerCase().includes('correct')
    return { isCorrect, feedback: response }
  }

  async function explainTopic(techName: string, topicName: string, level: number): Promise<string | null> {
    const depthMap: Record<number, string> = {
      0: 'a complete beginner who has never heard of this',
      1: 'someone who has only heard the term',
      2: 'someone who knows the general purpose',
      3: 'someone who has tried it once or twice',
      4: 'someone who can use it with documentation',
      5: 'someone who uses it regularly',
      6: 'someone who can teach it',
      7: 'someone seeking deep internal knowledge'
    }

    const audience = depthMap[level] || 'an intermediate developer'

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a helpful programming tutor. Explain the topic clearly and concisely for the specified audience level. Use examples when helpful. Keep explanations under 200 words.`
      },
      {
        role: 'user',
        content: `Explain "${topicName}" in ${techName} for ${audience}.`
      }
    ]

    return chat(messages)
  }

  return {
    isLoading,
    error,
    chat,
    generateQuestion,
    evaluateAnswer,
    explainTopic
  }
}
