<template>
  <div class="technology-list animate-fade-in">
    <!-- Empty State -->
    <div v-if="technologies.length === 0" class="flex flex-col items-center justify-center py-16 px-4">
      <div class="empty-state-icon mb-6">
        <UIcon name="i-lucide-code-2" class="text-5xl text-zinc-500" />
      </div>
      <h3 class="text-xl font-semibold mb-2">No Technologies Yet</h3>
      <p class="text-zinc-400 text-center mb-6 max-w-xs">
        Add your first technology to start tracking your coding skills.
      </p>
      <UButton size="lg" class="rounded-xl px-6" @click="$emit('add')">
        <UIcon name="i-lucide-plus" class="mr-2" />
        Add Technology
      </UButton>
    </div>

    <!-- Technology Cards -->
    <div v-else class="space-y-3">
      <UCard
        v-for="tech in technologies"
        :key="tech.id"
        class="card-interactive cursor-pointer overflow-hidden"
        @click="$emit('select', tech.id)"
      >
        <div class="flex items-center gap-4">
          <!-- Tech Icon -->
          <div class="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-code-2" class="text-xl text-zinc-400" />
          </div>

          <!-- Tech Info -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-base truncate">{{ tech.name }}</h3>
            <p class="text-sm text-zinc-500">
              {{ tech.topics.length }} topic{{ tech.topics.length !== 1 ? 's' : '' }}
            </p>
          </div>

          <!-- Progress Ring -->
          <div class="relative w-14 h-14 flex-shrink-0">
            <svg class="w-14 h-14 -rotate-90 progress-ring">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke-width="4"
                fill="none"
                class="stroke-zinc-800"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke-width="4"
                fill="none"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset(tech.id)"
                stroke-linecap="round"
                class="stroke-primary"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold text-zinc-300">
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
            class="rounded-xl opacity-60 hover:opacity-100"
            @click.stop="confirmDelete(tech)"
          />
        </div>
      </UCard>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteConfirm">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-alert-triangle" class="text-xl text-red-400" />
            </div>
            <h3 class="font-semibold text-lg">Delete Technology?</h3>
          </div>
        </template>
        <p class="text-zinc-400">
          Are you sure you want to delete <span class="text-zinc-200 font-medium">"{{ techToDelete?.name }}"</span>?
          This will also remove all assessments and quiz history.
        </p>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton variant="ghost" color="neutral" class="rounded-xl" @click="showDeleteConfirm = false">
              Cancel
            </UButton>
            <UButton color="error" class="rounded-xl" @click="doDelete">
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
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

const circumference = 2 * Math.PI * 24

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
  showDeleteConfirm.value = false
  techToDelete.value = null
}
</script>
