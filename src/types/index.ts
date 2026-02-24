export interface Note {
  id: number
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateNotePayload {
  title: string
  content: string | null
}

export interface UpdateNotePayload {
  title: string
  content: string | null
}

export interface AuthResponse {
  token: string
  username: string
  email: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface NoteQueryParams {
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}
