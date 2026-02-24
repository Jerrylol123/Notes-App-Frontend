import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'
import type { Note, CreateNotePayload, UpdateNotePayload, NoteQueryParams } from '@/types'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchNotes(params: NoteQueryParams = {}): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get<Note[]>('/notes', { params })
      notes.value = data
    } catch {
      error.value = 'Failed to load notes.'
    } finally {
      loading.value = false
    }
  }

  async function createNote(payload: CreateNotePayload): Promise<Note> {
    const { data } = await api.post<Note>('/notes', payload)
    notes.value.unshift(data)
    return data
  }

  async function updateNote(id: number, payload: UpdateNotePayload): Promise<Note> {
    const { data } = await api.put<Note>(`/notes/${id}`, payload)
    const index = notes.value.findIndex((n) => n.id === id)
    if (index !== -1) notes.value[index] = data
    return data
  }

  async function deleteNote(id: number): Promise<void> {
    await api.delete(`/notes/${id}`)
    notes.value = notes.value.filter((n) => n.id !== id)
  }

  return { notes, loading, error, fetchNotes, createNote, updateNote, deleteNote }
})
