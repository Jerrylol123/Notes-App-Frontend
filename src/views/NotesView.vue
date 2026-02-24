<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import NoteCard from '@/components/NoteCard.vue'
import NoteModal from '@/components/NoteModal.vue'
import NoteDetailModal from '@/components/NoteDetailModal.vue'
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'
import type { Note, NoteQueryParams } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const notesStore = useNotesStore()

// Query state
const search = ref('')
const sortBy = ref<NoteQueryParams['sortBy']>('createdAt')
const sortOrder = ref<NoteQueryParams['sortOrder']>('desc')

// Modal state
const showForm = ref(false)
const showDetail = ref(false)
const showDelete = ref(false)
const selectedNote = ref<Note | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function loadNotes() {
  notesStore.fetchNotes({
    search: search.value || undefined,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  })
}

onMounted(loadNotes)

watch([sortBy, sortOrder], loadNotes)

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadNotes, 400)
})

function openCreate() {
  selectedNote.value = null
  showForm.value = true
}

function openEdit(note: Note) {
  selectedNote.value = note
  showDetail.value = false
  showForm.value = true
}

function openView(note: Note) {
  selectedNote.value = note
  showDetail.value = true
}

function openDelete(note: Note) {
  selectedNote.value = note
  showDelete.value = true
}

async function handleSave(title: string, content: string) {
  try {
    if (selectedNote.value) {
      await notesStore.updateNote(selectedNote.value.id, { title, content })
    } else {
      await notesStore.createNote({ title, content })
    }
    showForm.value = false
  } catch {
    // error handled in store
  }
}

async function handleDelete() {
  if (!selectedNote.value) return
  await notesStore.deleteNote(selectedNote.value.id)
  showDelete.value = false
  selectedNote.value = null
}

function logout() {
  auth.logout()
  router.push('/login')
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span class="font-bold text-gray-900 text-lg">Notes</span>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600 hidden sm:block">
            Hi, <span class="font-medium">{{ auth.username }}</span>
          </span>
          <button @click="logout"
            class="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" type="text" placeholder="Search notes..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white" />
        </div>

        <!-- Sort by -->
        <select v-model="sortBy"
          class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700">
          <option value="createdAt">Created Date</option>
          <option value="updatedAt">Updated Date</option>
          <option value="title">Title</option>
        </select>

        <!-- Sort order toggle -->
        <button @click="toggleSortOrder"
          class="flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 bg-white transition-colors"
          :title="sortOrder === 'desc' ? 'Descending' : 'Ascending'">
          <svg class="w-4 h-4 transition-transform" :class="sortOrder === 'asc' ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          {{ sortOrder === 'desc' ? 'Newest' : 'Oldest' }}
        </button>

        <!-- New Note button -->
        <button @click="openCreate"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>

      <!-- Notes count -->
      <p class="text-sm text-gray-500 mb-4">
        {{ notesStore.notes.length }} {{ notesStore.notes.length === 1 ? 'note' : 'notes' }}
        <span v-if="search">matching "{{ search }}"</span>
      </p>

      <!-- Loading -->
      <div v-if="notesStore.loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>

      <!-- Error -->
      <div v-else-if="notesStore.error" class="text-center py-20">
        <p class="text-red-500 text-sm">{{ notesStore.error }}</p>
        <button @click="loadNotes" class="mt-3 text-indigo-600 text-sm hover:underline">Try again</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="notesStore.notes.length === 0" class="text-center py-20">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-gray-700 font-medium mb-1">{{ search ? 'No notes found' : 'No notes yet' }}</h3>
        <p class="text-gray-400 text-sm mb-4">
          {{ search ? 'Try a different search term.' : 'Create your first note to get started.' }}
        </p>
        <button v-if="!search" @click="openCreate"
          class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Create Note
        </button>
      </div>

      <!-- Notes grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NoteCard
          v-for="note in notesStore.notes"
          :key="note.id"
          :note="note"
          @view="openView"
          @edit="openEdit"
          @delete="openDelete" />
      </div>
    </main>

    <!-- Modals -->
    <NoteModal
      :open="showForm"
      :note="selectedNote"
      @close="showForm = false"
      @save="handleSave" />

    <NoteDetailModal
      :open="showDetail"
      :note="selectedNote"
      @close="showDetail = false"
      @edit="openEdit" />

    <DeleteConfirmModal
      :open="showDelete"
      :title="selectedNote?.title ?? ''"
      @confirm="handleDelete"
      @cancel="showDelete = false" />
  </div>
</template>
