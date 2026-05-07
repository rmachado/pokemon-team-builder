import { X } from 'lucide-react'
import type { PokemonSet } from '../../types'
import { getPokemon, getLearnableMoveNames } from '../../lib/pkmn'
import { PokemonPanel } from './PokemonPanel'
import { MovePanel } from './MovePanel'
import { ItemPanel } from './ItemPanel'
import { AbilityPanel } from './AbilityPanel'
import { StatPanel } from './StatPanel'

interface EditTarget {
  slotIndex: number
  field: 'pokemon' | 'move' | 'item' | 'ability' | 'stats'
  moveIndex?: number
}

interface SharedPanelProps {
  editTarget: EditTarget | null
  team: PokemonSet[]
  onUpdate: (index: number, pokemon: PokemonSet) => void
  onClose: () => void
}

const FIELD_LABELS: Record<string, string> = {
  pokemon: 'Pokémon',
  move: 'Move',
  item: 'Item',
  ability: 'Ability',
  stats: 'Stats',
}

export function SharedPanel({ editTarget, team, onUpdate, onClose }: SharedPanelProps) {
  if (!editTarget) {
    return (
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <p className="text-gray-500 text-sm text-center">Click on a slot in the team card above to edit</p>
      </div>
    )
  }

  const { slotIndex, field, moveIndex } = editTarget
  const pokemon = team[slotIndex]

  if (!pokemon) {
    return (
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <p className="text-gray-500 text-sm">Invalid slot</p>
      </div>
    )
  }

  const headerLabel = moveIndex !== undefined
    ? `${FIELD_LABELS[field]} ${moveIndex + 1}`
    : FIELD_LABELS[field]

  function updatePokemon(updated: PokemonSet) {
    onUpdate(slotIndex, updated)
  }

  const dexSpecies = pokemon.species ? getPokemon(pokemon.species) : null
  const dexAny = dexSpecies as unknown as Record<string, unknown> | null
  const speciesAbilities = dexAny?.abilities
    ? Object.values(dexAny.abilities as Record<string, string>).filter(Boolean)
    : []
  const learnableMoves = pokemon.species ? getLearnableMoveNames(pokemon.species) : []
  const usedSpecies = team.filter(p => p.species).map(p => p.species)

  return (
    <div className="bg-gray-900 border-t border-gray-700">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-300">
          Slot {slotIndex + 1}: {pokemon.species || 'Empty'} — <span className="text-blue-400">{headerLabel}</span>
        </span>
        <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3 max-h-64 overflow-y-auto">
        {field === 'pokemon' && (
          <PokemonPanel
            slotIndex={slotIndex}
            onSelect={species => {
              const newDex = getPokemon(species)
              const newDexAny = newDex as unknown as Record<string, unknown> | undefined
              const abilities = newDexAny?.abilities
                ? Object.values(newDexAny.abilities as Record<string, string>).filter(Boolean)
                : []
              const types = newDexAny?.types as string[] | undefined || []
              updatePokemon({
                ...pokemon,
                species,
                ability: abilities[0] || '',
                teraType: types[0] || '',
                moves: ['', '', '', ''],
              })
            }}
            exclude={usedSpecies}
          />
        )}
        {field === 'move' && moveIndex !== undefined && (
          <MovePanel
            current={pokemon.moves[moveIndex]}
            learnableMoves={learnableMoves}
            onSelect={move => {
              const moves = [...pokemon.moves]
              moves[moveIndex] = move
              updatePokemon({ ...pokemon, moves })
            }}
          />
        )}
        {field === 'item' && (
          <ItemPanel
            current={pokemon.item}
            onSelect={item => updatePokemon({ ...pokemon, item })}
          />
        )}
        {field === 'ability' && (
          <AbilityPanel
            current={pokemon.ability}
            onSelect={ability => updatePokemon({ ...pokemon, ability })}
            speciesAbilities={speciesAbilities}
          />
        )}
        {field === 'stats' && (
          <StatPanel
            pokemon={pokemon}
            onChange={updatePokemon}
          />
        )}
      </div>
    </div>
  )
}

export type { EditTarget }
