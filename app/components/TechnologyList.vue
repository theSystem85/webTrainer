<template>
  <div class="technology-list animate-fade-in">
    <ClientOnly>
    <!-- Empty State -->
    <div v-if="technologies.length === 0" class="flex flex-col items-center justify-center py-20 px-6">
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
        <div class="relative empty-state-icon animate-float">
          <UIcon name="i-lucide-code-2" class="text-5xl text-zinc-400" />
        </div>
      </div>
      <h3 class="text-2xl font-bold mb-3 text-gradient">No Technologies Yet</h3>
      <p class="text-zinc-400 text-center mb-8 max-w-sm leading-relaxed">
        Start your learning journey by adding your first technology to track.
      </p>
      <UButton size="xl" class="rounded-2xl px-8 h-14 font-semibold btn-glow gradient-primary border-0" @click="$emit('add')">
        <UIcon name="i-lucide-plus" class="mr-2 text-lg" />
        Add Your First Technology
      </UButton>
    </div>

    <!-- Technology Cards -->
    <div v-else class="space-y-4">
      <UCard
        v-for="(tech, index) in technologies"
        :key="tech.id"
        class="card-interactive cursor-pointer overflow-hidden group animate-fade-in"
        :class="[`stagger-${Math.min(index + 1, 5)}`]"
        @click="$emit('select', tech.id)"
      >
        <div class="flex items-center gap-4">
          <!-- Tech Icon with gradient -->
          <div class="relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:from-primary-500/20 group-hover:to-blue-500/20 transition-all duration-300" />
            <UIcon name="i-lucide-code-2" class="relative text-2xl text-zinc-300 group-hover:text-primary-400 transition-colors" />
          </div>

          <!-- Tech Info -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-lg truncate text-zinc-100 group-hover:text-white transition-colors">{{ tech.name }}</h3>
            <p class="text-sm text-zinc-500 flex items-center gap-1.5">
              <UIcon name="i-lucide-layers" class="text-xs" />
              {{ tech.topics.length }} topic{{ tech.topics.length !== 1 ? 's' : '' }}
            </p>
          </div>

          <!-- Progress Ring -->
          <div class="relative w-16 h-16 flex-shrink-0">
            <svg class="w-16 h-16 -rotate-90 progress-ring">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke-width="5"
                fill="none"
                class="stroke-zinc-800"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke-width="5"
                fill="none"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset(tech.id)"
                stroke-linecap="round"
                class="stroke-primary-500 transition-all duration-700"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-sm font-bold text-zinc-200">
                {{ Math.round(getProgress(tech.id).avgLevel * 14.3) }}%
              </span>
            </div>
          </div>

          <!-- Delete Button -->
          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            color="error"
            size="sm"
            class="rounded-xl opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity ml-1"
            @click.stop="confirmDelete(tech)"
          />
        </div>
      </UCard>
    </div>

      <template #fallback>
        <div class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-24 bg-zinc-800/50 rounded-2xl animate-pulse" />
        </div>
      </template>
    </ClientOnly>

    <!-- Delete Confirmation Modal (render only when we have a topic selected) -->
    <UModal v-if="showDeleteConfirm && techToDelete" v-model="showDeleteConfirm">
      <UCard>
        <template #header>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
              <UIcon name="i-lucide-alert-triangle" class="text-2xl text-red-400" />
            </div>
            <div>
              <h3 class="font-bold text-lg">Delete Technology?</h3>
              <p class="text-sm text-zinc-500">This action cannot be undone</p>
            </div>
          </div>
        </template>
        <p class="text-zinc-300 leading-relaxed">
          Are you sure you want to delete <span class="text-white font-semibold">"{{ techToDelete?.name }}"</span>?
          This will also remove all assessments and quiz history.
        </p>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton variant="ghost" color="neutral" size="lg" class="rounded-xl" @click="cancelDelete">
              Cancel
            </UButton>
            <UButton color="error" size="lg" class="rounded-xl font-medium" @click="doDelete">
              <UIcon name="i-lucide-trash-2" class="mr-2" />
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Success message after delete -->
    <div v-if="successMessage" class="mt-4">
      <UAlert color="success" variant="soft" class="rounded-xl">
        {{ successMessage }}
      </UAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSkillStore, type Technology } from '../composables/useSkillStore'

defineEmits<{
  add: []
  select: [techId: string]
}>()

const { technologies, getTechnologyProgress, deleteTechnology } = useSkillStore()

const showDeleteConfirm = ref(false)
const techToDelete = ref<Technology | null>(null)
const successMessage = ref('')

const circumference = 2 * Math.PI * 26

function getProgress(techId: string) {
  return getTechnologyProgress.value(techId)
}

function dashOffset(techId: string) {
  const progress = getProgress(techId)
  const percent = progress.avgLevel / 7 // Max level is 7
  return circumference * (1 - percent)
}

function confirmDelete(tech: Technology) {
  techToDelete.value = tech
  showDeleteConfirm.value = true
}

function doDelete() {
  if (techToDelete.value) {
    deleteTechnology(techToDelete.value.id)
  }
  // show success message and cleanup after closing modal
  const name = techToDelete.value?.name || 'Technology'
  // close modal (unmount thanks to v-if)
  showDeleteConfirm.value = false

  // set success message
  successMessage.value = `${name} deleted`

  // clear selected tech after short delay to avoid UI flash
  setTimeout(() => {
    techToDelete.value = null
  }, 200)

  // clear success message after a few seconds
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function cancelDelete() {
  showDeleteConfirm.value = false
  // clear selected tech in case user cancelled
  techToDelete.value = null
}
</script>
