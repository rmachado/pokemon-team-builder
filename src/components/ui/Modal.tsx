import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  trigger?: ReactNode
}

export function Modal({ open, onClose, title, children, trigger }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={o => { if (!o) onClose() }}>
      {trigger && (
        <Dialog.Trigger asChild>
          {trigger}
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85dvh] bg-gray-900 border border-gray-700 rounded-xl shadow-xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
          {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <Dialog.Title className="text-lg font-semibold text-gray-100">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="overflow-y-auto p-4 flex-1">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
