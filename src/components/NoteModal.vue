<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Note } from '@/types'

const props = defineProps<{
  note: Note | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [title: string, content: string]
}>()

const title = ref('')
const content = ref('')
const error = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      title.value = props.note?.title ?? ''
      content.value = props.note?.content ?? ''
      error.value = ''
    }
  },
)

function handleSave() {
  if (!title.value.trim()) {
    error.value = 'Title is required.'
    return
  }
  emit('save', title.value.trim(), content.value.trim())
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ note ? 'Edit Note' : 'New Note' }}
            </h2>
            <button @click="emit('close')"
              class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Title <span class="text-red-500">*</span>
              </label>
              <input v-model="title" type="text" placeholder="Note title..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                @keydown.enter.prevent />
              <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Content <span class="text-gray-400 font-normal">(optional)</span></label>
              <textarea v-model="content" placeholder="Write your note here..." rows="6"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none" />
            </div>
          </div>

          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button @click="emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button @click="handleSave"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
              {{ note ? 'Save Changes' : 'Create Note' }}
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
