interface SyncOperation<T> {
  id: string
  data: T
  timestamp: number
  retryCount: number
}

interface SyncQueueOptions {
  maxRetries?: number
  retryDelay?: number
}

export class BackgroundSyncManager<T> {
  private queueName: string
  private storageKey: string
  private maxRetries: number
  private retryDelay: number
  private isOnline: boolean
  private syncInProgress: boolean

  constructor(
    queueName: string,
    options: SyncQueueOptions = {}
  ) {
    this.queueName = queueName
    this.storageKey = `sync-queue-${queueName}`
    this.maxRetries = options.maxRetries ?? 5
    this.retryDelay = options.retryDelay ?? 1000
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true
    this.syncInProgress = false

    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline.bind(this))
      window.addEventListener("offline", this.handleOffline.bind(this))
    }
  }

  private handleOnline(): void {
    this.isOnline = true
    this.processQueue()
  }

  private handleOffline(): void {
    this.isOnline = false
  }

  private getQueue(): SyncOperation<T>[] {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  private saveQueue(queue: SyncOperation<T>[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(queue))
    } catch (error) {
      console.error(`Failed to save sync queue for ${this.queueName}:`, error)
    }
  }

  async enqueue(data: T): Promise<string> {
    const operation: SyncOperation<T> = {
      id: crypto.randomUUID(),
      data,
      timestamp: Date.now(),
      retryCount: 0,
    }

    const queue = this.getQueue()
    queue.push(operation)
    this.saveQueue(queue)

    if (this.isOnline && !this.syncInProgress) {
      await this.processQueue()
    }

    return operation.id
  }

  async dequeue(id: string): Promise<boolean> {
    const queue = this.getQueue()
    const index = queue.findIndex((op) => op.id === id)

    if (index === -1) {
      return false
    }

    queue.splice(index, 1)
    this.saveQueue(queue)
    return true
  }

  async processQueue(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return
    }

    this.syncInProgress = true
    const queue = this.getQueue()

    for (const operation of queue) {
      if (!this.isOnline) {
        break
      }

      try {
        await this.syncOperation(operation)
        await this.dequeue(operation.id)
      } catch (error) {
        operation.retryCount++

        if (operation.retryCount >= this.maxRetries) {
          console.error(
            `Max retries exceeded for operation ${operation.id} in queue ${this.queueName}:`,
            error
          )
          await this.dequeue(operation.id)
        } else {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * operation.retryCount))
        }
      }
    }

    this.syncInProgress = false
  }

  private async syncOperation(operation: SyncOperation<T>): Promise<void> {
    console.log(`Syncing operation ${operation.id} for queue ${this.queueName}`)
  }

  getQueueSize(): number {
    return this.getQueue().length
  }

  clearQueue(): void {
    this.saveQueue([])
  }

  destroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline.bind(this))
      window.removeEventListener("offline", this.handleOffline.bind(this))
    }
    this.clearQueue()
  }
}

export const catalogSyncManager = new BackgroundSyncManager("catalog-sync", {
  maxRetries: 5,
  retryDelay: 1000,
})

export const settingsSyncManager = new BackgroundSyncManager("settings-sync", {
  maxRetries: 3,
  retryDelay: 2000,
})

export const tallySyncManager = new BackgroundSyncManager("tally-sync", {
  maxRetries: 2,
  retryDelay: 500,
})
