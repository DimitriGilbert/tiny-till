# Task 3.6: Backup Reminder System with Settings Integration - Implementation Plan

## Overview
Implement a comprehensive backup reminder tracking system that helps users maintain regular backups of their catalog data. The system will track the last backup timestamp, provide visual warnings for outdated backups, warn users before importing data without recent backups, and allow configurable reminder frequencies.

## Requirements Analysis
Based on task requirements:
1. Track and store last backup timestamp in local storage
2. Display prominent UI indicator in settings panel with visual warnings
3. Add pre-import backup check with warning if no recent backup exists
4. User-configurable reminder frequency settings
5. Automatic reminder dismissal after successful backups

## Existing Codebase Review

### Current Infrastructure
- **Settings Types**: `packages/types/src/entities/settings.ts` - Already has `backupReminder?: number` field
- **Storage Utilities**: `apps/web/src/lib/storage.ts` - IndexedDB-based storage (not localStorage)
- **Storage Keys**: `apps/web/src/lib/storage-keys.ts` - Defines constant storage keys
- **Settings Page**: `apps/web/src/routes/settings.tsx` - Basic placeholder structure
- **Export Hook**: `apps/web/src/hooks/useCatalogExport.ts` - Handles catalog export
- **Import Component**: `apps/web/src/components/CatalogImport.tsx` - Handles catalog import

### Key Observations
- Settings use IndexedDB via `idb-keyval`, not localStorage
- `backupReminder` field already exists in Settings type but is unused
- Settings panel has placeholder sections that need implementation
- Export hook triggers successful exports but doesn't track timestamp
- Import flow shows preview before import - good insertion point for warning

## Implementation Plan

### Phase 1: Storage Infrastructure

#### Step 1.1: Add Backup Timestamp Storage Key
**File**: `apps/web/src/lib/storage-keys.ts`

Add new storage key constant:
```typescript
export const STORAGE_KEYS = {
  CATALOG: 'tiny-till-catalog',
  TALLY: 'tiny-till-tally',
  SETTINGS: 'tiny-till-settings',
  VERSION: 'tiny-till-version',
  LAST_BACKUP_TIMESTAMP: 'tiny-till-last-backup-timestamp', // NEW
} as const
```

**Rationale**: Establishes a dedicated key for storing the last backup timestamp separate from settings, ensuring it's always available even if settings are reset.

#### Step 1.2: Create Backup Reminder Utilities
**File**: `apps/web/src/lib/backup-reminder.ts` (NEW)

Create utility functions for backup reminder management:
```typescript
import { safeGet, safeSet } from './storage'
import { STORAGE_KEYS } from './storage-keys'

export interface BackupReminderConfig {
  lastBackupTimestamp: number | null
  reminderFrequency: number // hours between reminders
  isBackupOverdue: boolean
  daysSinceLastBackup: number | null
}

export async function getLastBackupTimestamp(): Promise<number | null>
export async function setLastBackupTimestamp(timestamp: number): Promise<boolean>
export async function getBackupReminderConfig(
  frequencyHours: number
): Promise<BackupReminderConfig>
export function formatLastBackupDate(timestamp: number): string
export function calculateDaysSinceBackup(timestamp: number): number
export function isBackupOverdue(
  timestamp: number | null,
  frequencyHours: number
): boolean
```

**Rationale**: Centralizes all backup reminder logic, making it reusable across components and easy to test.

### Phase 2: Settings Type Updates

#### Step 2.1: Update Settings Type
**File**: `packages/types/src/entities/settings.ts`

The `backupReminder?: number` field already exists. Verify its usage:
```typescript
export interface Settings {
  theme: Theme
  gridDensity: GridDensity
  columnCountOverride?: ColumnCount
  backupReminder?: number // Hours between backup reminders (e.g., 24, 168 for week)
}
```

**Rationale**: Type is already defined, ensure it represents hours for frequency. Add default value logic in settings store.

#### Step 2.2: Add Default Backup Reminder Value
**File**: `apps/web/src/stores/settings-store.ts` (CHECK EXISTING IMPLEMENTATION)

Add default value for backupReminder in initial state:
```typescript
const defaultSettings: Settings = {
  theme: 'system',
  gridDensity: 'normal',
  backupReminder: 168, // Default: 1 week (7 * 24 hours)
}
```

**Rationale**: Provides sensible default behavior without requiring user configuration.

### Phase 3: Export Integration

#### Step 3.1: Update Export Hook to Track Backups
**File**: `apps/web/src/hooks/useCatalogExport.ts`

Modify the `exportCatalog` function to save timestamp after successful export:
```typescript
import { setLastBackupTimestamp } from '@/lib/backup-reminder'

export function useCatalogExport(): UseCatalogExportReturn {
  // ... existing code ...

  const exportCatalog = React.useCallback(async () => {
    // ... existing validation and export logic ...

    try {
      const success = await downloadExportFile(exportData)

      if (!success) {
        setExportError('Failed to download export file')
        setIsExporting(false)
        return
      }

      // NEW: Track backup timestamp
      await setLastBackupTimestamp(Date.now())

      setExportError(null)
      toast.success('Backup completed', {
        description: 'Your catalog has been exported successfully',
      })
    } catch (error) {
      // ... existing error handling ...
    }
  }, [])

  // ... existing return ...
}
```

**Rationale**: Automatically tracks when backups are made, eliminating manual user action.

### Phase 4: Settings Panel UI

#### Step 4.1: Create Backup Reminder Card Component
**File**: `apps/web/src/components/backup-reminder-card.tsx` (NEW)

Create a prominent card displaying backup status:
```typescript
export interface BackupReminderCardProps {
  className?: string
}

export function BackupReminderCard({ className }: BackupReminderCardProps) {
  const { settings } = useSettingsStore()
  const [backupConfig, setBackupConfig] = useState<BackupReminderConfig | null>(null)

  // Fetch backup config on mount and when settings change
  useEffect(() => {
    async function loadConfig() {
      const config = await getBackupReminderConfig(settings.backupReminder ?? 168)
      setBackupConfig(config)
    }
    loadConfig()
  }, [settings.backupReminder])

  // Display logic with visual warnings:
  // - Green: Recent backup (within frequency)
  // - Yellow: Approaching overdue (50-80% of frequency)
  // - Red: Overdue (> frequency)
  // - Gray: Never backed up

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Backup Status</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display last backup date, days since backup, warning indicator */}
      </CardContent>
    </Card>
  )
}
```

**Rationale**: Reusable component that can be placed prominently in settings and potentially other locations.

#### Step 4.2: Create Backup Frequency Selector
**File**: `apps/web/src/components/backup-frequency-select.tsx` (NEW)

Create a select component for configuring reminder frequency:
```typescript
const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 24, description: 'Remind if no backup in 24 hours' },
  { label: 'Weekly', value: 168, description: 'Remind if no backup in 1 week' },
  { label: 'Bi-weekly', value: 336, description: 'Remind if no backup in 2 weeks' },
  { label: 'Monthly', value: 720, description: 'Remind if no backup in 30 days' },
  { label: 'Never', value: -1, description: 'Don\'t remind about backups' },
] as const

export interface BackupFrequencySelectProps {
  value: number
  onChange: (value: number) => void
}

export function BackupFrequencySelect({ value, onChange }: BackupFrequencySelectProps) {
  return (
    <Select value={value.toString()} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FREQUENCY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

**Rationale**: Provides user-friendly interface for configuring backup reminders with clear descriptions.

#### Step 4.3: Update Settings Page
**File**: `apps/web/src/routes/settings.tsx`

Replace placeholder sections with implemented components:
```typescript
function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="grid gap-6">
        {/* NEW: Backup Reminder Card - Prominent position */}
        <BackupReminderCard />

        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Backup Reminders</h2>
          <div className="space-y-4">
            <div>
              <Label>Reminder Frequency</Label>
              <BackupFrequencySelect
                value={settings.backupReminder ?? 168}
                onChange={(value) => updateSettings({ backupReminder: value })}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Data Portability</h2>
          <div className="space-y-2">
            <Link to="/catalog">
              <Button variant="outline" className="w-full justify-start">
                Manage Catalog & Backups
              </Button>
            </Link>
          </div>
        </section>

        {/* Theme and display sections can remain as placeholders for now */}
      </div>
    </div>
  )
}
```

**Rationale**: Places backup reminder prominently while organizing settings logically.

### Phase 5: Pre-Import Warning

#### Step 5.1: Create Backup Warning Dialog
**File**: `apps/web/src/components/backup-warning-dialog.tsx` (NEW)

Create a warning dialog shown before import if no recent backup exists:
```typescript
export interface BackupWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  daysSinceBackup: number | null
  lastBackupDate: string | null
  isOverdue: boolean
}

export function BackupWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  daysSinceBackup,
  lastBackupDate,
  isOverdue,
}: BackupWarningDialogProps) {
  // Show warning message based on backup status
  // - "No backup found"
  // - "Last backup was X days ago"
  // - Offer options: "Create backup first" or "Proceed anyway"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>No Recent Backup Found</AlertDialogTitle>
          <AlertDialogDescription>
            {lastBackupDate
              ? `Your last backup was ${daysSinceBackup} days ago. It's recommended to create a fresh backup before importing.`
              : 'No backup has been created yet. It\'s strongly recommended to create a backup before importing data.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel Import</AlertDialogCancel>
          <AlertDialogAction onClick={onOpenChange}>
            Create Backup First
          </AlertDialogAction>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

**Rationale**: Provides clear warning with safe default (create backup) while allowing experienced users to proceed.

#### Step 5.2: Update CatalogImport Component
**File**: `apps/web/src/components/CatalogImport.tsx`

Add backup check before showing import preview:
```typescript
import { BackupWarningDialog } from '@/components/backup-warning-dialog'
import { getBackupReminderConfig } from '@/lib/backup-reminder'
import { useSettingsStore } from '@/stores/settings-store'
import { useCatalogExport } from '@/hooks/useCatalogExport'

export function CatalogImport({
  open,
  onOpenChange,
  disabled = false,
}: CatalogImportProps) {
  // ... existing state ...

  // NEW: Backup warning state
  const [showBackupWarning, setShowBackupWarning] = React.useState(false)
  const { settings } = useSettingsStore()
  const { exportCatalog, isExporting } = useCatalogExport()

  // ... existing handlers ...

  const handleReviewAndImport = React.useCallback(async () => {
    if (!previewData) return

    // NEW: Check for recent backup
    const backupConfig = await getBackupReminderConfig(settings.backupReminder ?? 168)

    if (backupConfig.isBackupOverdue || backupConfig.lastBackupTimestamp === null) {
      setShowBackupWarning(true)
      return
    }

    setShowPreview(true)
  }, [previewData, settings.backupReminder])

  const handleCreateBackup = React.useCallback(async () => {
    setShowBackupWarning(false)
    await exportCatalog()
  }, [exportCatalog])

  const handleProceedAnyway = React.useCallback(() => {
    setShowBackupWarning(false)
    setShowPreview(true)
  }, [])

  const handleBackupWarningCancel = React.useCallback(() => {
    setShowBackupWarning(false)
  }, [])

  return (
    <>
      {/* Existing Dialog */}
      <Dialog open={open && !showPreview} onOpenChange={onOpenChange}>
        {/* ... existing content ... */}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleReviewAndImport} // NEW: Check backup first
            disabled={disabled || !validationResult?.isValid || isProcessing || isImporting}
          >
            Review & Import
          </Button>
        </DialogFooter>
      </Dialog>

      {/* NEW: Backup Warning Dialog */}
      <BackupWarningDialog
        open={showBackupWarning}
        onOpenChange={setShowBackupWarning}
        onConfirm={handleProceedAnyway}
        onCancel={handleBackupWarningCancel}
        onCreateBackup={handleCreateBackup}
        daysSinceBackup={null} // Calculate from backupConfig
        lastBackupDate={null} // Calculate from backupConfig
        isOverdue={true} // Calculate from backupConfig
      />

      {/* Existing ImportPreview */}
      {previewData && <ImportPreview ... />}
    </>
  )
}
```

**Rationale**: Integrates backup check seamlessly into import flow without breaking existing functionality.

### Phase 6: Additional Enhancements

#### Step 6.1: Add Quick Backup Button to Reminder Card
**File**: `apps/web/src/components/backup-reminder-card.tsx`

Add a button to create backup directly from the card:
```typescript
const { exportCatalog, isExporting } = useCatalogExport()

<Button
  onClick={exportCatalog}
  disabled={isExporting}
  className="w-full"
>
  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
  Create Backup Now
</Button>
```

**Rationale**: Provides easy access to create backup from the reminder interface.

#### Step 6.2: Add Backup Warning to Catalog Management Page
**File**: `apps/web/src/routes/settings.catalog.tsx`

Add backup status indicator to catalog management:
```typescript
<BackupReminderCard className="mb-4" />
```

**Rationale**: Ensures users see backup status when managing catalog, not just in settings.

#### Step 6.3: Persist Backup Warning Dismissal
**File**: `apps/web/src/lib/backup-reminder.ts`

Add functionality to dismiss warnings temporarily:
```typescript
export async function dismissBackupWarning(hours: number = 24): Promise<boolean>
export async function getBackupWarningDismissal(): Promise<number | null>
export async function shouldShowBackupWarning(frequencyHours: number): Promise<boolean>
```

**Rationale**: Allows users to dismiss reminders temporarily without permanently disabling them.

### Phase 7: Testing & Validation

#### Step 7.1: Unit Tests
Create tests for backup reminder utilities:
- Test timestamp storage and retrieval
- Test backup age calculations
- Test overdue detection logic
- Test warning dismissal logic

#### Step 7.2: Integration Tests
Test the full workflow:
- Export catalog → verify timestamp saved
- Check settings page → verify status displayed correctly
- Configure frequency → verify overdue calculation
- Import without backup → verify warning shown
- Create backup → verify warning dismissed
- Import after backup → verify no warning shown

#### Step 7.3: Edge Cases
Test edge cases:
- First-time user (no backup ever)
- Very old backup (years ago)
- Frequency set to "Never"
- Storage quota issues
- Concurrent backup operations
- Settings reset while backup exists

### Phase 8: TypeScript Validation

#### Step 8.1: Type Safety
Ensure all new code is properly typed:
- No `any` types
- Proper interface definitions
- Type-safe utility functions
- Correct React component prop types

#### Step 8.2: Type Checking
Run type checking before considering task complete:
```bash
npm run check-types
```

#### Step 8.3: Build Validation
Ensure build succeeds:
```bash
npm run build
```

## File Changes Summary

### New Files Created
1. `apps/web/src/lib/backup-reminder.ts` - Backup reminder utilities
2. `apps/web/src/components/backup-reminder-card.tsx` - Backup status display card
3. `apps/web/src/components/backup-frequency-select.tsx` - Frequency selector component
4. `apps/web/src/components/backup-warning-dialog.tsx` - Pre-import warning dialog

### Modified Files
1. `apps/web/src/lib/storage-keys.ts` - Add backup timestamp key
2. `apps/web/src/stores/settings-store.ts` - Ensure default backupReminder value
3. `apps/web/src/hooks/useCatalogExport.ts` - Track backup timestamp on export
4. `apps/web/src/routes/settings.tsx` - Add backup reminder UI
5. `apps/web/src/routes/settings.catalog.tsx` - Add backup status indicator
6. `apps/web/src/components/CatalogImport.tsx` - Add pre-import backup check

### No Changes Required
- `packages/types/src/entities/settings.ts` - Type already has backupReminder field

## Implementation Order

1. Phase 1: Storage Infrastructure (Steps 1.1-1.2)
2. Phase 2: Settings Type Updates (Steps 2.1-2.2)
3. Phase 3: Export Integration (Step 3.1)
4. Phase 4: Settings Panel UI (Steps 4.1-4.3)
5. Phase 5: Pre-Import Warning (Steps 5.1-5.2)
6. Phase 6: Additional Enhancements (Steps 6.1-6.3)
7. Phase 7: Testing & Validation (Steps 7.1-7.3)
8. Phase 8: TypeScript Validation (Steps 8.1-8.3)

## Success Criteria

✅ Backup timestamp stored after successful export
✅ Settings panel displays last backup date prominently
✅ Visual warnings (green/yellow/red) based on backup age
✅ User can configure reminder frequency (daily/weekly/bi-weekly/monthly/never)
✅ Pre-import warning shown when no recent backup exists
✅ User can create backup from warning dialog or proceed anyway
✅ Reminder automatically dismissed after successful backup
✅ All TypeScript types are correct (no `any`)
✅ `npm run check-types` passes
✅ `npm run build` passes

## Dependencies
- None (standalone feature)
- Uses existing: settings-store, useCatalogExport, CatalogImport, storage utilities
- Uses existing UI components: Card, Button, Select, AlertDialog, Dialog from shadcn/ui

## Notes
- Uses IndexedDB for storage (consistent with rest of app), not localStorage as mentioned in task title
- Existing `backupReminder` field in Settings type is appropriate for this use case
- Default frequency of 1 week provides good balance between security and annoyance
- Warning is non-blocking: users can proceed without backup if desired
- All new components follow shadcn/ui patterns and Tailwind CSS styling
- Implementation respects existing code style and TypeScript strict mode
