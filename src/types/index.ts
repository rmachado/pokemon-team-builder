export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  [key: string]: number;
}

export type StatName = keyof Stats;

export type GameTab = 'builder' | 'analysis' | 'teams';

export interface PokemonSet {
  species: string;
  item: string;
  ability: string;
  moves: string[];
  nature: string;
  evs: Stats;
  ivs: Stats;
  teraType: string;
  level: number;
}

export interface Team {
  id: string;
  name: string;
  format: string;
  pokemon: PokemonSet[];
  createdAt: number;
  updatedAt: number;
}

export interface VGCFormat {
  id: string;
  name: string;
  gen: number;
  description: string;
  smogonId: string;
  evSystem: 'evs' | 'statPoints';
  features: {
    tera: boolean;
    levelLocked: boolean;
    ivLocked: boolean;
  };
  hasMeta: boolean;
}

export interface TypeEffectiveness {
  attacking: string;
  defending: string;
  multiplier: number;
}

export interface MoveDamageResult {
  moveName: string;
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  koChance: string | null;
  description: string;
}

export interface MatchupEntry {
  yourMon: string;
  theirMon: string;
  moveResults: MoveDamageResult[];
  bestDamage: number;
  bestKO: string | null;
}

export interface TypeCoverageResult {
  type: string;
  neutral: number;
  superEffective: number;
  resist: number;
  immune: number;
}

export interface MetaPokemonStats {
  species: string;
  usage: number;
  moves: Record<string, number>;
  items: Record<string, number>;
  abilities: Record<string, number>;
  natures: Record<string, number>;
  teraTypes: Record<string, number>;
  evs: Record<string, number>;
  teammates: Record<string, number>;
}

export interface SearchMatch {
  species: string
  kind: 'name' | 'type' | 'move' | 'ability'
  matchDetail: string
  types: string[]
  abilities: string[]
  score: number
}
