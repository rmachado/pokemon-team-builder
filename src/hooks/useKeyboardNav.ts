import { useEffect } from 'react'
import type { EditTarget } from '@/components/TeamBuilder/EditingPanel'

interface KeyboardNavOptions {
  onEditSlot: (slotIndex: number) => void
  onImport: () => void
  onExport: () => void
  onSave: () => void
  editTarget: EditTarget | null
  onClosePanel: () => void
}

export function useKeyboardNav({ onEditSlot, onImport, onExport, onSave, editTarget, onClosePanel }: KeyboardNavOptions) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return

      if (e.key === 'Escape') {
        if (editTarget) {
          e.preventDefault()
          onClosePanel()
        }
        return
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault()
            onSave()
            break
          case 'e':
            e.preventDefault()
            onExport()
            break
          case 'i':
            e.preventDefault()
            onImport()
            break
        }
        return
      }

      if (e.key >= '1' && e.key <= '6') {
        e.preventDefault()
        onEditSlot(parseInt(e.key) - 1)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editTarget, onEditSlot, onImport, onExport, onSave, onClosePanel])
}
