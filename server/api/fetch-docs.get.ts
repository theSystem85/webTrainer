export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'URL parameter is required'
    })
  }

  try {
    // Fetch the documentation page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SkillTrainer/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Simple parsing to extract navigation/sidebar items
    // This is a basic implementation - could be enhanced for specific doc sites
    const topics: Array<{ name: string; path: string }> = []

    // Look for common documentation patterns
    // Pattern 1: Links in nav/sidebar with common class names
    const linkPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi
    let match

    while ((match = linkPattern.exec(html)) !== null) {
      const href = match[1]
      const text = match[2].trim()

      // Filter to likely API/doc links
      if (text && text.length > 1 && text.length < 50) {
        // Skip common navigation items
        const skipWords = ['home', 'github', 'twitter', 'discord', 'blog', 'search']
        if (!skipWords.some(word => text.toLowerCase().includes(word))) {
          topics.push({
            name: text,
            path: href
          })
        }
      }
    }

    // Deduplicate by name
    const uniqueTopics = Array.from(
      new Map(topics.map(t => [t.name, t])).values()
    ).slice(0, 100) // Limit to 100 topics

    return {
      success: true,
      topics: uniqueTopics
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch documentation: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})
