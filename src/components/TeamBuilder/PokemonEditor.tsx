import { SmartSearch } from '../SmartSearch'

interface PokemonEditorProps {
  onSelect: (species: string) => void
  exclude?: string[]
}

export function PokemonEditor({ onSelect, exclude }: PokemonEditorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">Search by name, type (:fire), or ability (@intimidate)</p>
      <SmartSearch onSelect={onSelect} exclude={exclude} />
    </div>
  )
}
