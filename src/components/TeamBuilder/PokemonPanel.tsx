import { SmartSearch } from '../SmartSearch'

interface PokemonPanelProps {
  slotIndex: number
  onSelect: (species: string) => void
  exclude?: string[]
}

export function PokemonPanel({ onSelect, exclude }: PokemonPanelProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">Search for a Pokémon to add to this slot</p>
      <SmartSearch onSelect={onSelect} exclude={exclude} />
    </div>
  )
}
