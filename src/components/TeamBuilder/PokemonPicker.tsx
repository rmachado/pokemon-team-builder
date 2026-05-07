import { Modal } from '../ui/Modal'
import { SmartSearch } from '../SmartSearch'

interface PokemonPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (species: string) => void
  exclude?: string[]
}

export function PokemonPicker({ open, onClose, onSelect, exclude }: PokemonPickerProps) {
  return (
    <Modal open={open} onClose={onClose} title="Select Pokémon">
      <SmartSearch
        onSelect={name => {
          onSelect(name)
          onClose()
        }}
        exclude={exclude}
      />
    </Modal>
  )
}
