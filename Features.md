# Skill Trainer - Features Documentation

A personal coding skills tracker that helps you assess and improve your knowledge across different technologies.

## Core Features

### 1. Technology Management ✅ Implemented
- **Add Technology**: Paste a documentation URL (e.g., `https://nuxt.com/docs/4.x/api`) to add a new technology
- **Auto-fetch Structure**: Attempts to scrape the documentation structure/table of contents
- **Manual Entry**: Fallback to manually add skill topics if scraping fails
- **Technology List**: View all added technologies with progress indicators
- **Delete Technology**: Remove technologies you no longer want to track

### 2. Self-Assessment Survey ✅ Implemented
- **Confidence Slider**: 7-level slider for each skill topic with descriptive labels:
  - Level 0: "Never heard of it"
  - Level 1: "Heard the name"
  - Level 2: "Know what it's for"
  - Level 3: "Used it once or twice"
  - Level 4: "Can use it with docs"
  - Level 5: "Can use it confidently"
  - Level 6: "Can explain it to others"
  - Level 7: "Deep internal knowledge"
- **Progress Tracking**: Save assessments with timestamps
- **Batch Assessment**: Efficiently assess multiple topics in sequence
- **Skip Option**: Skip topics you want to assess later

### 3. Skills Overview Dashboard ✅ Implemented
- **Overall Score**: Aggregate confidence score per technology
- **Category Breakdown**: Visual breakdown by skill level distribution
- **Progress Over Time**: Track how your knowledge improves
- **Weak Areas**: Highlight topics needing improvement
- **Strong Areas**: Celebrate mastered topics

### 4. LLM Integration (OpenAI) ✅ Implemented
- **Optional Setup**: Works without API key, enabled when key is provided
- **API Key Storage**: Securely stored in localStorage (client-side only)
- **Quiz Mode**: AI generates questions about specific topics
- **Explanations**: Ask the AI to explain concepts you're weak on
- **Adaptive Difficulty**: Questions based on your current confidence level

### 5. Text-to-Speech ✅ Implemented
- **Chrome Speech API**: Uses browser's native speechSynthesis
- **Read Questions**: AI questions are read aloud
- **Read Explanations**: Explanations can be spoken
- **Voice Selection**: Choose from available system voices
- **Speed Control**: Adjust speech rate
- **Pause/Resume**: Control playback

### 6. Settings ✅ Implemented
- **OpenAI API Key**: Configure your API key
- **Voice Settings**: TTS voice and speed preferences
- **Data Export**: Export your progress as JSON
- **Data Import**: Import previously exported data
- **Clear Data**: Reset all stored data

## Data Storage

All data is stored in browser localStorage:
- `skillTrainer_technologies`: Array of technology objects
- `skillTrainer_assessments`: Assessment history
- `skillTrainer_settings`: User preferences
- `skillTrainer_apiKey`: OpenAI API key (encrypted client-side)

## Tech Stack

- **Framework**: Nuxt 4 with Vue 3
- **UI**: Nuxt UI components
- **State**: Vue Composables with localStorage persistence
- **Styling**: Dark mode first, mobile responsive
- **APIs**: OpenAI Chat Completions, Web Speech API

## Mobile-First Design

- Touch-friendly slider controls
- Bottom navigation for easy thumb access
- Collapsible sections to reduce scrolling
- Large tap targets (44px minimum)
- Swipe gestures for navigation

## Future Enhancements (Planned)

- [ ] Spaced repetition for quiz scheduling
- [ ] Multiple documentation source parsers
- [ ] Skill sharing/export to portfolio
- [ ] Team/organization features
- [ ] Offline PWA support
- [ ] Additional LLM providers (Claude, Gemini)
