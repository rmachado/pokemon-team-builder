import { useRef, useMemo, useCallback, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { PokemonSet } from '@/types'
import { getPokemonNum } from '@/lib/pkmn'
import { useLearnableMoves } from '@/hooks/useLearnableMoves'
import { Pokemon } from '@/domain'
import { useFormatStore } from '@/stores'
import { PokemonEditor } from './PokemonEditor'
import { MoveEditor } from './MoveEditor'
import { ItemEditor } from './ItemEditor'
import { AbilityEditor } from './AbilityEditor'
import { StatEditor } from './StatEditor'

export interface EditTarget {
  slotIndex: number
  field: 'pokemon' | 'move' | 'item' | 'ability' | 'stats'
  moveIndex?: number
}

interface EditingPanelProps {
  editTarget: EditTarget | null
  team: PokemonSet[]
  onUpdate: (index: number, pokemon: PokemonSet) => void
  onClose: () => void
  onAdvanceMove?: () => void
}

const FIELD_LABELS: Record<string, string> = {
  pokemon: 'Pokémon', move: 'Move', item: 'Item', ability: 'Ability', stats: 'Stats',
}

export function EditingPanel({ editTarget, team, onUpdate, onClose, onAdvanceMove }: EditingPanelProps) {
  const slotIndex = editTarget?.slotIndex ?? -1
  const pokemon = slotIndex >= 0 ? team[slotIndex] : null
  const { currentFormat } = useFormatStore()
  const learnableMoves = useLearnableMoves(pokemon?.species ?? '', currentFormat.id)

  return (
    <div className="h-full border border-gray-700/60 rounded-xl bg-gray-900/60 backdrop-blur-sm flex flex-col overflow-hidden">
      {!editTarget || !pokemon ? (
        <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center">
              <span className="text-2xl text-gray-600">?</span>
            </div>
            <p className="text-sm text-gray-500">Click on a Pokémon card to start editing</p>
            <p className="text-xs text-gray-600">Use 1-6 keys to quickly jump between slots</p>
          </div>
        </div>
      ) : (
        <PanelContent
          key={`edit-${slotIndex}-${editTarget.field}-${editTarget.moveIndex ?? ''}`}
          editTarget={editTarget}
          pokemon={pokemon}
          team={team}
          learnableMoves={learnableMoves}
          onUpdate={onUpdate}
          onClose={onClose}
          onAdvance={onAdvanceMove}
        />
      )}
    </div>
  )
}

interface PanelContentProps {
  editTarget: EditTarget
  pokemon: PokemonSet
  team: PokemonSet[]
  learnableMoves: string[]
  onUpdate: (index: number, pokemon: PokemonSet) => void
  onClose: () => void
  onAdvance?: () => void
}

function PanelContent({ editTarget, pokemon, team, learnableMoves, onUpdate, onClose, onAdvance }: PanelContentProps) {
  const { slotIndex, field, moveIndex } = editTarget
  const headerLabel = moveIndex !== undefined
    ? `${FIELD_LABELS[field]} ${moveIndex + 1}`
    : FIELD_LABELS[field]

  const pokemonRef = useRef(pokemon)
  useEffect(() => { pokemonRef.current = pokemon }, [pokemon])
  const teamRef = useRef(team)
  useEffect(() => { teamRef.current = team }, [team])

  const speciesAbilities = useMemo(() => Pokemon.getSpeciesAbilities(pokemon.species), [pokemon.species])
  const usedSpecies = useMemo(() => team.filter(p => p.species).map(p => p.species), [team])
  const num = pokemon.species ? getPokemonNum(pokemon.species) : 0

  const handlePokemonSelect = useCallback((species: string) => {
    const p = Pokemon.fromJSON(pokemonRef.current)
    onUpdate(slotIndex, p.withSpecies(species).toJSON())
    onAdvance?.()
  }, [onUpdate, slotIndex, onAdvance])

  const handleMoveSelect = useCallback((move: string) => {
    const p = Pokemon.fromJSON(pokemonRef.current)
    if (moveIndex !== undefined) {
      onUpdate(slotIndex, p.withMove(moveIndex, move).toJSON())
    }
  }, [onUpdate, slotIndex, moveIndex])

  const handleItemSelect = useCallback((item: string) => {
    const p = Pokemon.fromJSON(pokemonRef.current)
    onUpdate(slotIndex, p.withItem(item).toJSON())
    onAdvance?.()
  }, [onUpdate, slotIndex, onAdvance])

  const handleAbilitySelect = useCallback((ability: string) => {
    const p = Pokemon.fromJSON(pokemonRef.current)
    onUpdate(slotIndex, p.withAbility(ability).toJSON())
    onAdvance?.()
  }, [onUpdate, slotIndex, onAdvance])

  const handleStatChange = useCallback((updated: PokemonSet) => {
    onUpdate(slotIndex, updated)
  }, [onUpdate, slotIndex])

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-slide-in-right">
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-700/50 shrink-0">
        {num > 0 && (
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`}
            alt={pokemon.species}
            className="w-8 h-8 object-contain"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-100 truncate">
            {pokemon.species || `Slot ${slotIndex + 1}`}
          </div>
          <div className="text-xs text-blue-400">{headerLabel}</div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white hover:bg-gray-700 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 p-3">
        {field === 'pokemon' && (
          <PokemonEditor
            onSelect={handlePokemonSelect}
            exclude={usedSpecies}
          />
        )}
        {field === 'move' && moveIndex !== undefined && (
          learnableMoves.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading moves...
            </div>
          ) : (
            <MoveEditor
              current={pokemon.moves[moveIndex]}
              learnableMoves={learnableMoves}
              onSelect={handleMoveSelect}
              onAdvance={onAdvance}
            />
          )
        )}
        {field === 'item' && (
            <ItemEditor
              current={pokemon.item}
              onSelect={handleItemSelect}
              onAdvance={onAdvance}
            />
          )}
          {field === 'ability' && (
            <AbilityEditor
              current={pokemon.ability}
              onSelect={handleAbilitySelect}
              speciesAbilities={speciesAbilities}
              onAdvance={onAdvance}
            />
          )}
        {field === 'stats' && (
          <StatEditor pokemon={pokemon} onChange={handleStatChange} />
        )}
      </div>
    </div>
  )
}
