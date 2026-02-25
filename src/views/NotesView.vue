<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotesStore } from "@/stores/notes";
import NoteCard from "@/components/NoteCard.vue";
import NoteModal from "@/components/NoteModal.vue";
import NoteDetailModal from "@/components/NoteDetailModal.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import type { Note, NoteQueryParams } from "@/types";

const router = useRouter();
const auth = useAuthStore();
const notesStore = useNotesStore();

// ── Filters & Sorting ────────────────────────────────────────
const search = ref("");
const sortBy = ref<NoteQueryParams["sortBy"]>("createdAt");
const sortOrder = ref<NoteQueryParams["sortOrder"]>("desc");

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function loadNotes() {
  notesStore.fetchNotes({
    search: search.value.trim() || undefined,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  });
}

onMounted(loadNotes);

watch([sortBy, sortOrder], loadNotes);

watch(search, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadNotes, 420);
});

watch(sortBy, (newVal) => {
  if (newVal === "title" && sortOrder.value === "desc") {
    sortOrder.value = "asc"; // title usually makes more sense A→Z by default
  }
});

// ── Modal / Action handlers ─────────────────────────────────
const showForm = ref(false);
const showDetail = ref(false);
const showDelete = ref(false);
const selectedNote = ref<Note | null>(null);

function openCreate() {
  selectedNote.value = null;
  showForm.value = true;
}

function openEdit(note: Note) {
  selectedNote.value = note;
  showDetail.value = false;
  showForm.value = true;
}

function openView(note: Note) {
  selectedNote.value = note;
  showDetail.value = true;
}

function openDelete(note: Note) {
  selectedNote.value = note;
  showDelete.value = true;
}

async function handleSave(title: string, content: string) {
  try {
    if (selectedNote.value) {
      await notesStore.updateNote(selectedNote.value.id, { title, content });
    } else {
      await notesStore.createNote({ title, content });
    }
    showForm.value = false;
  } catch {
    // error already handled in store / toast
  }
}

async function handleDelete() {
  if (!selectedNote.value) return;
  await notesStore.deleteNote(selectedNote.value.id);
  showDelete.value = false;
  selectedNote.value = null;
}

function logout() {
  auth.logout();
  router.push("/login");
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50/50 dark:bg-gray-950/70 transition-colors duration-300"
  >
    <!-- ── Navbar ─────────────────────────────────────────────── -->
    <header
      class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/70 dark:border-gray-800/70"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-md flex items-center justify-center ring-1 ring-indigo-400/30"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <span
            class="font-bold text-xl tracking-tight text-gray-900 dark:text-gray-100"
            >Notes</span
          >
        </div>

        <div class="flex items-center gap-4">
          <span
            class="hidden md:inline text-sm text-gray-600 dark:text-gray-400"
          >
            Hi,
            <span class="font-semibold text-gray-800 dark:text-gray-200">{{
              auth.username
            }}</span>
          </span>
          <button
            @click="logout"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <!-- ── Controls Bar ──────────────────────────────────────── -->
      <div
        class="mb-8 bg-white dark:bg-gray-800/60 rounded-2xl p-4 shadow-sm border border-gray-200/70 dark:border-gray-700/50 backdrop-blur-sm"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <!-- Search -->
          <div class="relative flex-1">
            <svg
              class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-5.2-5.2m1.2-4.8a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="search"
              type="search"
              placeholder="Search notes..."
              class="w-full pl-12 pr-5 py-3.5 bg-gray-50/70 dark:bg-gray-800/50 border border-gray-300/80 dark:border-gray-600/70 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-200"
            />
          </div>

          <!-- Sort + New -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="relative">
              <select
                v-model="sortBy"
                class="min-w-[150px] pl-4 pr-10 py-3.5 bg-gray-50/70 dark:bg-gray-800/50 border border-gray-300/80 dark:border-gray-600/70 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none cursor-pointer"
              >
                <option value="createdAt">Created date</option>
                <option value="updatedAt">Last updated</option>
                <option value="title">Title</option>
              </select>
              <svg
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <button
              @click="toggleSortOrder"
              class="flex items-center justify-center gap-2 min-w-[130px] px-4 py-3.5 bg-gray-50/70 dark:bg-gray-800/50 border border-gray-300/80 dark:border-gray-600/70 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/60 transition-all"
              :title="sortBy === 'title' ? (sortOrder === 'asc' ? 'A → Z' : 'Z → A') : (sortOrder === 'desc' ? 'Newest first' : 'Oldest first')"
            >
              <svg
                class="w-4.5 h-4.5 transition-transform duration-300"
                :class="{ 'rotate-180': sortOrder === 'asc' }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
              <span>{{ sortBy === "title" ? (sortOrder === "asc" ? "A → Z" : "Z → A") : (sortOrder === "desc" ? "Newest" : "Oldest") }}</span>
            </button>

            <button
              @click="openCreate"
              class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Note
            </button>
          </div>
        </div>
      </div>

      <!-- Stats line -->
      <div
        class="flex flex-wrap items-center justify-between mb-6 text-sm text-gray-500 dark:text-gray-400"
      >
        <p>
          <strong class="text-gray-700 dark:text-gray-300">{{
            notesStore.notes.length
          }}</strong>
          {{ notesStore.notes.length === 1 ? "note" : "notes" }}
          <span v-if="search" class="text-gray-400 dark:text-gray-500"
            >• matching “{{ search }}”</span
          >
        </p>
        <span v-if="notesStore.notes.length" class="text-xs opacity-75">
          Sorted by
          {{
            sortBy === "createdAt"
              ? "creation"
              : sortBy === "updatedAt"
                ? "last update"
                : "title"
          }}
        </span>
      </div>

      <!-- ── Content States ────────────────────────────────────── -->
      <div
        v-if="notesStore.loading"
        class="flex justify-center items-center min-h-[50vh]"
      >
        <div class="loader"></div>
      </div>

      <div v-else-if="notesStore.error" class="text-center py-24">
        <p class="text-red-600 dark:text-red-400 text-lg font-medium">
          {{ notesStore.error }}
        </p>
        <button
          @click="loadNotes"
          class="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md transition"
        >
          Try Again
        </button>
      </div>

      <div v-else-if="!notesStore.notes.length" class="text-center py-24">
        <div
          class="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 rounded-3xl flex items-center justify-center shadow-sm"
        >
          <svg
            class="w-12 h-12 text-indigo-400/80 dark:text-indigo-500/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3
          class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
        >
          {{ search ? "No matching notes" : "Your notes collection is empty" }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {{
            search
              ? "Try a different keyword or clear the search."
              : "Start capturing ideas — create your first note now."
          }}
        </p>
        <button
          v-if="!search"
          @click="openCreate"
          class="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create First Note
        </button>
      </div>

      <!-- Notes Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
      >
        <NoteCard
          v-for="note in notesStore.notes"
          :key="note.id"
          :note="note"
          class="transform transition-all duration-300 hover:scale-[1.025] hover:shadow-xl active:scale-[0.99] will-change-transform"
          @view="openView"
          @edit="openEdit"
          @delete="openDelete"
        />
      </div>
    </main>

    <!-- Modals -->
    <NoteModal
      :open="showForm"
      :note="selectedNote"
      @close="showForm = false"
      @save="handleSave"
    />
    <NoteDetailModal
      :open="showDetail"
      :note="selectedNote"
      @close="showDetail = false"
      @edit="openEdit"
    />
    <DeleteConfirmModal
      :open="showDelete"
      :title="selectedNote?.title ?? 'this note'"
      @confirm="handleDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<style scoped>
@keyframes loader-spin {
  to { transform: rotate(360deg); }
}

.loader {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 4px solid #e0e7ff;
  border-top-color: #4f46e5;
  animation: loader-spin 0.8s linear infinite;
}
</style>
