<script setup lang="ts">
import type { Note } from '@/types'

defineProps<{ note: Note }>()

const emit = defineEmits<{
  edit: [note: Note]
  delete: [note: Note]
  view: [note: Note]
}>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div
    class="group bg-white dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/60 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    @click="emit('view', note)">
    <div class="p-5 flex-1">
      <h3 class="font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug line-clamp-2 mb-2">
        {{ note.title }}
      </h3>
      <p v-if="note.content" class="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
        {{ note.content }}
      </p>
      <p v-else class="text-gray-300 dark:text-gray-600 text-sm italic">No content</p>
    </div>

    <div class="px-5 py-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
      <span class="text-xs text-gray-400">{{ formatDate(note.createdAt) }}</span>

      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="emit('edit', note)"
          class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
          title="Edit">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click.stop="emit('delete', note)"
          class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          title="Delete">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
