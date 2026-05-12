import { toID } from '@pkmn/dex'
import championsData from './championsLearnsets.json'

export const CHAMPIONS_BANNED_MOVES = new Set(championsData.bannedMoves as string[])
export const CHAMPIONS_LEARNSETS: Record<string, string[]> = championsData.learnsets as Record<string, string[]>

export const CHAMPIONS_LEGAL_SPECIES = new Set([
  'venusaur', 'venusaurmega', 'charizard', 'charizardmegax', 'charizardmegay',
  'blastoise', 'blastoisemega', 'beedrill', 'beedrillmega', 'pidgeot', 'pidgeotmega',
  'arbok', 'pikachu', 'raichu', 'raichualola', 'clefable', 'clefablemega',
  'ninetales', 'ninetalesalola', 'arcanine', 'arcaninehisui', 'politoed',
  'alakazam', 'alakazammega', 'machamp', 'victreebel', 'victreebelmega',
  'slowbro', 'slowbromega', 'slowbrogalar', 'slowking', 'slowkinggalar',
  'gengar', 'gengarmega', 'steelix', 'steelixmega', 'rhyperior',
  'kangaskhan', 'kangaskhanmega', 'starmie', 'starmiemega', 'mrrime',
  'scizor', 'scizormega', 'kleavor', 'pinsir', 'pinsirmega',
  'tauros', 'taurospaldeacombat', 'taurospaldeablaze', 'taurospaldeaaqua',
  'gyarados', 'gyaradosmega', 'ditto', 'vaporeon', 'jolteon', 'flareon',
  'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon',
  'aerodactyl', 'aerodactylmega', 'snorlax', 'dragonite', 'dragonitemega',
  'meganium', 'meganiummega', 'typhlosion', 'typhlosionhisui', 'feraligatr', 'feraligatrmega',
  'ariados', 'ampharos', 'ampharosmega', 'azumarill', 'farigiraf',
  'forretress', 'gliscor', 'heracross', 'heracrossmega', 'weavile',
  'sneasler', 'mamoswine', 'skarmory', 'skarmorymega', 'houndoom', 'houndoommega',
  'wyrdeer', 'tyranitar', 'tyranitarmega', 'pelipper',
  'gardevoir', 'gardevoirmega', 'gallade', 'gallademega',
  'sableye', 'sableyemega', 'aggron', 'aggronmega', 'medicham', 'medichammega',
  'manectric', 'manectricmega', 'roserade', 'sharpedo', 'sharpedomega',
  'camerupt', 'cameruptmega', 'torkoal', 'altaria', 'altariamega',
  'milotic', 'castform', 'banette', 'banettemega', 'chimecho', 'chimechomega',
  'absol', 'absolmega', 'glalie', 'glaliemega', 'froslass', 'froslassmega',
  'torterra', 'infernape', 'empoleon', 'luxray', 'rampardos', 'bastiodon',
  'lopunny', 'lopunnymega', 'spiritomb', 'garchomp', 'garchompmega',
  'lucario', 'lucariomega', 'hippowdon', 'toxicroak', 'abomasnow', 'abomasnowmega',
  'rotom', 'rotomheat', 'rotomwash', 'rotomfrost', 'rotomfan', 'rotommow',
  'serperior', 'emboar', 'emboarmega', 'samurott', 'samurotthisui',
  'watchog', 'liepard', 'simisage', 'simisear', 'simipour',
  'excadrill', 'excadrillmega', 'audino', 'audinomega', 'conkeldurr',
  'whimsicott', 'basculegion', 'basculegionf', 'krookodile', 'cofagrigus',
  'runerigus', 'garbodor', 'zoroark', 'zoroarkhisui', 'reuniclus',
  'vanilluxe', 'emolga', 'chandelure', 'chandeluremega', 'beartic',
  'stunfisk', 'stunfiskgalar', 'golurk', 'golurkmega', 'hydreigon', 'volcarona',
  'chesnaught', 'chesnaughtmega', 'delphox', 'delphoxmega', 'greninja', 'greninjamega',
  'diggersby', 'talonflame', 'vivillon', 'floetteeternal', 'floettemega', 'florges',
  'pangoro', 'furfrou', 'meowstic', 'meowsticmmega', 'meowsticfmega',
  'aegislash', 'aromatisse', 'slurpuff', 'clawitzer', 'heliolisk',
  'tyrantrum', 'aurorus', 'hawlucha', 'hawluchamega', 'dedenne', 'goodra', 'goodrahisui',
  'klefki', 'trevenant', 'gourgeist', 'gourgeistsmall', 'gourgeistlarge', 'gourgeistsuper',
  'avalugg', 'avalugghisui', 'noivern',
  'decidueye', 'decidueyehisui', 'incineroar', 'primarina', 'toucannon',
  'crabominable', 'crabominablemega', 'lycanroc', 'lycanrocmidnight', 'lycanrocdusk',
  'toxapex', 'mudsdale', 'araquanid', 'salazzle', 'tsareena',
  'oranguru', 'passimian', 'mimikyu', 'drampa', 'drampamega',
  'kommoo', 'magearnamega', 'magearnaoriginalmega',
  'corviknight', 'flapple', 'appletun', 'sandaconda', 'polteageist',
  'hatterene', 'alcremie', 'morpeko', 'dragapult',
  'meowscarada', 'skeledirge', 'quaquaval', 'espathra', 'palafin',
  'scovillain', 'scovillainmega', 'bellibolt', 'orthworm', 'maushold',
  'garganacl', 'glimmora', 'glimmoramega', 'tinkaton', 'armarouge',
  'ceruledge', 'kingambit', 'sinistcha', 'archaludon', 'hydrapple',
])

// Items explicitly banned by the Champions mod (marked as "Past" in data/mods/champions/items.ts).
// All other items that exist in the base game are legal by inheritance.
export const CHAMPIONS_BANNED_ITEMS = new Set([
  'abilityshield', 'absorbbulb', 'adamantcrystal', 'adamantorb', 'adrenalineorb',
  'aguavberry', 'airballoon', 'apicotberry', 'assaultvest', 'auspiciousarmor',
  'beastball', 'berrysweet', 'bignugget', 'bigroot', 'bindingband', 'blacksludge',
  'blunderpolicy', 'boosterenergy', 'bottlecap', 'cellbattery', 'chippedpot',
  'choiceband', 'choicespecs', 'clearamulet', 'cloversweet', 'cornerstonemask',
  'covertcloak', 'crackedpot', 'custapberry', 'damprock', 'darkranite', 'dawnstone',
  'destinyknot', 'diveball', 'dracoplate', 'dragalgite', 'dragonscale', 'dreadplate',
  'dreamball', 'dubiousdisc', 'duskball', 'duskstone', 'earthplate', 'eelektrossite',
  'ejectbutton', 'ejectpack', 'electirizer', 'electricseed', 'enigmaberry', 'eviolite',
  'expertbelt', 'falinksite', 'fastball', 'figyberry', 'firestone', 'fistplate',
  'flameorb', 'flameplate', 'floatstone', 'flowersweet', 'friendball', 'galaricacuff',
  'galaricawreath', 'ganlonberry', 'goldbottlecap', 'golisopite', 'grassyseed',
  'greatball', 'grepaberry', 'gripclaw', 'griseouscore', 'griseousorb', 'healball',
  'hearthflamemask', 'heatranite', 'heatrock', 'heavyball', 'heavydutyboots',
  'hondewberry', 'iapapaberry', 'icestone', 'icicleplate', 'icyrock', 'insectplate',
  'ironball', 'ironplate', 'jabocaberry', 'keeberry', 'kelpsyberry', 'laggingtail',
  'lansatberry', 'leafstone', 'levelball', 'liechiberry', 'lifeorb', 'lightclay',
  'loadeddice', 'loveball', 'lovesweet', 'luminousmoss', 'lureball', 'lustrousglobe',
  'lustrousorb', 'luxuryball', 'magmarizer', 'magoberry', 'maliciousarmor',
  'marangaberry', 'masterball', 'masterpieceteacup', 'meadowplate', 'metalalloy',
  'metronome', 'micleberry', 'mindplate', 'mirrorherb', 'mistyseed', 'moonball',
  'moonstone', 'muscleband', 'nestball', 'netball', 'normalgem', 'ovalstone',
  'parkball', 'petayaberry', 'pixieplate', 'pokeball', 'pomegberry', 'poweranklet',
  'powerband', 'powerbelt', 'powerbracer', 'powerherb', 'powerlens', 'powerweight',
  'premierball', 'prettyfeather', 'prismscale', 'protectivepads', 'protector',
  'psychicseed', 'punchingglove', 'qualotberry', 'quickball', 'rarebone', 'razorclaw',
  'razorfang', 'reapercloth', 'redcard', 'repeatball', 'ribbonsweet', 'ringtarget',
  'rockyhelmet', 'roomservice', 'rowapberry', 'rustedshield', 'rustedsword',
  'safariball', 'safetygoggles', 'salacberry', 'shedshell', 'shinystone', 'skyplate',
  'smoothrock', 'snowball', 'souldew', 'splashplate', 'spookyplate', 'sportball',
  'starfberry', 'starsweet', 'stickybarb', 'stoneplate', 'strangeball',
  'strawberrysweet', 'sunstone', 'sweetapple', 'syrupyapple', 'tamatoberry',
  'tartapple', 'terrainextender', 'throatspray', 'thunderstone', 'timerball',
  'toxicorb', 'toxicplate', 'ultraball', 'unremarkableteacup', 'upgrade',
  'utilityumbrella', 'waterstone', 'weaknesspolicy', 'wellspringmask', 'widelens',
  'wikiberry', 'wiseglasses', 'zapplate', 'zoomlens',
])

export function isChampionsLegalSpecies(name: string): boolean {
  return CHAMPIONS_LEGAL_SPECIES.has(toID(name))
}

export function isChampionsLegalItem(name: string): boolean {
  return !CHAMPIONS_BANNED_ITEMS.has(toID(name))
}

export const CHAMPIONS_CONFIG = {
  maxStatPointsPerStat: 32,
  totalStatPoints: 66,
  fixedLevel: 50,
  fixedIVs: 31,
} as const
