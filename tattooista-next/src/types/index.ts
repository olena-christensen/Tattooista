// User types
export type PlatformRole = "USER" | "PLATFORM_ADMIN"
export type StudioRole = "OWNER" | "STAFF"
export type Plan = "FREE" | "PRO"

export interface Studio {
  id: string
  name: string
  slug: string
  logo: string | null
  customDomain: string | null
  plan: Plan
  paddleCustomerId: string | null
  paddleSubscriptionId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface StudioMembership {
  id: string
  userId: string
  studioId: string
  role: StudioRole
}

export interface User {
  id: string
  email: string
  emailVerified: Date | null
  password: string
  displayName: string
  avatar: string | null
  platformRole: PlatformRole
  isActivated: boolean
  createdAt: Date
  updatedAt: Date
}

// Client types
export interface Contact {
  id: string
  type: string // instagram, phone, email, whatsapp, messenger
  value: string
  clientId: string
  studioId: string
}

export interface ClientGalleryItem {
  id: string
  fileName: string
  clientId: string
  studioId: string
}

export interface Client {
  id: string
  fullName: string
  avatar: string | null
  isFavourite: boolean
  isArchived: boolean
  contacts: Contact[]
  gallery: ClientGalleryItem[]
  studioId: string
  createdAt: Date
  updatedAt: Date
}

// Booking types
export type BookingStatus = "PENDING" | "CONTACTED" | "COMPLETED" | "CANCELLED"

export interface Booking {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  instagram: string | null
  message: string | null
  status: BookingStatus
  isArchived: boolean
  studioId: string
  createdAt: Date
  updatedAt: Date
}

// Review types
export interface ReviewGalleryItem {
  id: string
  fileName: string
  reviewId: string
  studioId: string
}

export interface Review {
  id: string
  rate: number // 1-5
  content: string
  isArchived: boolean
  userId: string
  user?: Omit<User, "password">
  gallery: ReviewGalleryItem[]
  studioId: string
  createdAt: Date
  updatedAt: Date
}

// Portfolio types
export interface TattooStyle {
  id: string
  value: string
  description: string | null
  wallPaper: string | null
  nonStyle: boolean
  isArchived: boolean
  galleryItems?: GalleryItem[]
  studioId: string
  createdAt: Date
  updatedAt: Date
}

export interface GalleryItem {
  id: string
  fileName: string
  isArchived: boolean
  styles: TattooStyle[]
  studioId: string
  createdAt: Date
}

export interface GalleryItemStyle {
  galleryItemId: string
  tattooStyleId: string
  studioId: string
}

// CMS types
export interface Service {
  id: string
  title: string
  wallPaper: string | null
  conditions: string | null
  order: number
  studioId: string
  createdAt: Date
  updatedAt: Date
}

export interface Page {
  id: string
  name: string // about, contacts, etc.
  isActive: boolean
  title: string | null
  wallPaper: string | null
  content: string | null
  studioId: string
  createdAt: Date
  updatedAt: Date
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  order: number
  studioId: string
  createdAt: Date
  updatedAt: Date
}

// Form types
export interface BookingFormValues {
  fullName: string
  email?: string
  phone?: string
  instagram?: string
  message?: string
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  email: string
  password: string
  confirmPassword: string
  displayName: string
}

export interface ClientFormValues {
  fullName: string
  avatar?: string
  contacts: Array<{ type: string; value: string }>
}

export interface ReviewFormValues {
  rate: number
  content: string
  gallery?: string[]
}

export interface ServiceFormValues {
  title: string
  wallPaper?: string
  conditions?: string
  order?: number
}

export interface StyleFormValues {
  value: string
  description?: string
  wallPaper?: string
  nonStyle?: boolean
}

export interface FaqFormValues {
  question: string
  answer: string
  order?: number
}

export interface PageFormValues {
  name: string
  isActive?: boolean
  title?: string
  wallPaper?: string
  content?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Session types for NextAuth
export interface SessionUser {
  id: string
  email: string
  displayName: string
  avatar: string | null
  platformRole: PlatformRole
  isActivated: boolean
}
