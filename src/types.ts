export type FieldType = 'signature' | 'initials' | 'date' | 'name' | 'text' | 'checkbox'

export interface Field {
  id: string
  type: FieldType
  recipientId: string
  page: number // índice de página (0-based)
  // Posición y tamaño relativos a la página (0..1)
  x: number
  y: number
  w: number
  h: number
  required: boolean
  label?: string
  value?: string // valor rellenado por el firmante (dataURL para firmas)
}

export type RecipientRole = 'signer' | 'cc'
export type RecipientStatus = 'pending' | 'viewed' | 'signed' | 'declined'

export interface Recipient {
  id: string
  name: string
  email: string
  role: RecipientRole
  order: number
  color: string
  status: RecipientStatus
  signedAt?: string
  declineReason?: string
}

export type EnvelopeStatus = 'draft' | 'sent' | 'completed' | 'declined' | 'voided'

export interface AuditEvent {
  at: string
  action: string
  actor: string
  detail?: string
}

export interface Envelope {
  id: string
  title: string
  message: string
  fileName: string
  pageCount: number
  status: EnvelopeStatus
  sequential: boolean
  createdAt: string
  updatedAt: string
  sentAt?: string
  completedAt?: string
  expiresAt?: string
  originalHash?: string
  recipients: Recipient[]
  fields: Field[]
  audit: AuditEvent[]
}

export interface Profile {
  name: string
  email: string
  firm: string
  signature?: string // dataURL PNG
  initials?: string // dataURL PNG
}
