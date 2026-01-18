import type { TimestampedEntity } from '../entities/base'
import { isTimestamp } from '../utils/timestamps'
import { isValidUUID } from '../utils/uuid'

export function isTimestampedEntity(obj: unknown): obj is TimestampedEntity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'createdAt' in obj &&
    'updatedAt' in obj &&
    isValidUUID((obj as TimestampedEntity).id) &&
    isTimestamp((obj as TimestampedEntity).createdAt) &&
    isTimestamp((obj as TimestampedEntity).updatedAt)
  )
}
