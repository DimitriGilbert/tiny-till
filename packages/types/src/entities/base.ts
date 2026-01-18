export interface TimestampedEntity {
  id: string
  createdAt: number
  updatedAt: number
}

export type Timestamps = {
  createdAt: number
  updatedAt: number
}
