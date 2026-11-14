export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
export const POLLING_INTERVAL = 3000
export const QUERY_STALE_TIME = 30_000
export const MAX_FILE_SIZE = 100 * 1024 * 1024

export const ACCEPTED_MIME_TYPES: Record<string, string[]> = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'message/rfc822': ['.eml'],
  'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
  'video/*': ['.mp4', '.mov', '.avi'],
}
