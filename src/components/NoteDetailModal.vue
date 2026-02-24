<script setup lang="ts">
import type { Note } from '@/types'

defineProps<{ note: Note | null; open: boolean }>()

const emit = defineEmits<{
  close: []
  edit: [note: Note]
}>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open && note" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[80vh]">
          <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 pr-4 leading-snug">{{ note.title }}</h2>
            <button @click="emit('close')"
              class="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 overflow-y-auto flex-1">
            <p v-if="note.content" class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {{ note.content }}
            </p>
            <p v-else class="text-gray-400 italic text-sm">No content.</p>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div class="text-xs text-gray-400 space-y-0.5">
              <p>Created: {{ formatDate(note.createdAt) }}</p>
              <p>Updated: {{ formatDate(note.updatedAt) }}</p>
            </div>
            <button @click="emit('edit', note)"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
              Edit
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
