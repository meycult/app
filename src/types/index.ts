export type Alignment = 'LG' | 'NG' | 'CG' | 'LN' | 'TN' | 'CN' | 'LE' | 'NE' | 'CE'

export type Cult = string

export type Faction = 'architects' | 'wardens' | 'legion' | 'operatives' | 'tribunal' | 'monastics'

export type VirtueName = 'clarity' | 'humility' | 'endurance' | 'overcoming'

export type Virtues = Record<VirtueName, number>

export type VirtueXP = Record<VirtueName, number>

export type VirtueTierLevel = 0 | 1 | 2 | 3

export type Category = 'POLITICS' | 'TECH' | 'CRYPTO' | 'SPORTS' | 'CULTURE' | 'WORLD' | 'FINANCE' | 'SCIENCE' | 'AI' | 'GAMING' | 'ENTERTAINMENT'

export type VirtueTierLabel = 'shifting' | 'refined' | 'uncommon' | 'rare' | 'mythic'

export type QuestStatus = 'DRAFT' | 'ACTIVE' | 'LOCKED' | 'RESOLVING' | 'RESOLVED' | 'SETTLED' | 'CANCELLED'

export type HeroType = 'person' | 'nation' | 'sports_team' | 'crypto' | 'corporation' | 'organization'

export type SourceType = 'polymarket' | 'manual' | 'community'

export type ResolutionOutcome = 'YES' | 'NO' | null

export type PredictionResult = 'PENDING' | 'WON' | 'LOST'

export type ItemClass = 'equipment' | 'weapon' | 'active' | 'consumable' | 'support'

export type SlotType = 'vision' | 'algorithm' | 'network' | 'conduit' | 'capital' | 'data' | 'narrative' | 'resonance' | 'cascade' | 'anomaly'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic'

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type BadgeCategory = 'VIRTUE' | 'LOYALTY' | 'COLLECTION' | 'MARKET'

export interface UniqueEffect {
  id: string
  name: string
  description: string
  mechanic: string
  mechanicValue: number
  mechanicTarget?: string
}

export interface WeaponAbility {
  name: string
  description: string
  mechanic: string
  mechanicValue: number
  cooldownType: 'per_quest' | 'per_hour' | 'per_prediction'
  cooldownValue: number
  ipCost?: number
}

export interface Durability {
  current: number
  max: number
  depleted: boolean
  rechargeCostPerCharge: number
}

export type CardType = 'power' | 'support' | 'sustained'

export interface DeckCard {
  id: string
  name: string
  description: string
  virtue: VirtueName
  tier: 1 | 2 | 3
  cardType: CardType
  powerCost: number
  powerGrant: number
  sustainCost: number
  unlockCost: number
  prerequisites: string[]
}

export interface Item {
  id: string
  name: string
  description: string
  icon: string
  flavorText: string
  itemClass: ItemClass
  slotType: SlotType
  rarity: Rarity
  statBonuses: Partial<Record<VirtueName, number>>
  passiveCost: number
  uniqueEffect?: UniqueEffect
  weaponAbility?: WeaponAbility
  durability?: Durability
  requiredHero?: string
  requiredVirtue?: VirtueName
  requiredValue?: number
  source?: string
  createdAt?: string
}

export interface SkillEffect {
  id: string
  name: string
  description: string
  modifierType: 'multiplier' | 'flat' | 'chance' | 'reveal'
  modifierValue: number
  category?: Category
}

export interface QuestEffect {
  id: string
  name: string
  description: string
  icon: string
  rarity: Rarity
  effect: SkillEffect
  source: 'quest-condition' | 'hero-item'
  heroId?: string
}

export interface SkillEffect {
  slot: SlotType
  itemId: string
  itemName: string
  itemIcon: string
  rarity: Rarity
  effectDescription: string
}

export interface PredictionEquippedItem {
  slot: string
  itemId: string
  itemName: string
  itemIcon: string
  rarity: Rarity
  effectDescription: string
}

export interface PredictionVirtueBonus {
  virtue: VirtueName
  virtueValue: number
  bonusDescription: string
  modifierType: 'multiplier' | 'flat' | 'chance' | 'reveal'
  modifierValue: number
}

export interface Prediction {
  id: string
  questId: string
  questQuestion: string
  questCategory: Category
  outcome: 'YES' | 'NO'
  amount: number
  entryProbability: number
  yesProbabilityAtEntry: number
  noProbabilityAtEntry: number
  placedAt: string
  resolvedAt?: string
  result: PredictionResult
  payout: number
  netProfit: number
  heroFollowedId?: string
  heroFollowedName?: string
  heroFollowedAvatarUrl?: string
  heroFollowedTitle?: string
  heroFollowedFaction?: Faction
  equippedItems: PredictionEquippedItem[]
  virtueBonuses: PredictionVirtueBonus[]
}

export interface Badge {
  id: string
  chainId: string
  name: string
  description: string
  icon: string
  tier: BadgeTier
  tierIndex: number
  category: BadgeCategory
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  progressMax?: number
  triggerDescription: string
}

export interface BadgeChain {
  id: string
  name: string
  category: BadgeCategory
  description: string
  icon: string
  tiers: [Badge, Badge, Badge, Badge]
}

export interface SkillTreeNode {
  id: string
  name: string
  description: string
  icon: string
  virtue: VirtueName
  tier: number
  cost: number
  prerequisites: string[]
  effect: SkillEffect
  position: { x: number; y: number }
}

export interface Hero {
  heroId: string
  handle: string
  name: string
  title: string | null
  bio: string | null
  cult: string
  avatarUrl: string | null
  virtues: Virtues
  mp: number
  heroType: HeroType
  typeData: Record<string, unknown>
  autoGenerated: boolean
}

export interface PlayerHero {
  playerHeroId: string
  playerId: string
  heroId: string
  level: number
  xp: number
  virtues: Virtues
}

export interface Quest {
  questId: string
  question: string
  description: string | null
  category: Category
  status: QuestStatus
  volume: number
  engagement: number
  closesIn: string
  rarityDensity: number
  heroes: Hero[]
  lootTable: LootEntry[]
  market: QuestMarket | null
  sourceType: SourceType
  sourceUrl: string | null
  confidenceScore: number
  resolutionOutcome: ResolutionOutcome
}

export interface QuestMarket {
  marketId: string
  questId: string
  yesProbability: number
  noProbability: number
  yesVolume: number
  noVolume: number
}

export interface LootEntry {
  lootId: string
  questId: string
  itemId: string | null
  itemName: string
  itemRarity: string
  chance: number
  item?: Item
}

export interface Wager {
  wagerId: string
  questId: string
  playerId: string
  playerHeroId: string | null
  outcome: 'YES' | 'NO'
  amount: number
  entryProbability: number | null
  result: 'PENDING' | 'WON' | 'LOST'
  payout: number
  netProfit: number
  placedAt: string
  resolvedAt: string | null
}

export interface QuestComment {
  commentId: string
  questId: string
  playerId: string
  parentId: string | null
  text: string
  upvotes: number
  downvotes: number
  createdAt: string
  replies: QuestComment[]
}

export interface QuestActivity {
  activityId: string
  questId: string
  type: string
  text: string
  playerId: string | null
  amount: number | null
  createdAt: string
}

export interface TierVoteOption {
  optionId: string
  questId: string
  tier: string
  label: string
  description: string | null
  status: string
  voteCount: number
}

export interface HeroItem {
  heroItemId: string
  heroId: string
  itemId: string
  slotType: string
  playerId: string | null
}

export interface Player {
  id: string
  handle: string
  alias?: string
  avatarUrl: string
  onboardingComplete: boolean
  joinedAt: string
  isAdmin: boolean
  walletAddresses: WalletAddress[]
}

export interface WalletAddress {
  id: string
  address: string
  chainId: number
  label?: string
  verified: boolean
  createdAt: string
}

export interface OracleProfile {
  playerId: string
  cult: string
  level: number
  xp: number
}

export interface QuestRelic {
  name: string
  description: string
  icon: string
  rarity: string
  heroName: string
  effectName: string | null
  effectDescription: string | null
}

export interface QuestDetail extends Quest {
  relics: QuestRelic[]
  comments: QuestComment[]
  leaderboard: Wager[]
  activities: QuestActivity[]
}

export type StoreCategory = 'currency' | 'cosmetic'

export type CosmeticType = 'title' | 'frame' | 'nameColor' | 'profileBackground' | 'predictionFlair' | 'avatarDecoration' | 'badgeEffect'

export interface StoreItem {
  id: string
  name: string
  description: string
  category: StoreCategory
  cosmeticType?: CosmeticType
  icon: string
  rarity: Rarity
  priceGlyph: number
  priceFate: number
  stock: number
  fateAmount?: number
  glyphAmount?: number
  bonusPercent?: number
  pack?: boolean
  packContents?: Partial<Record<CosmeticType, string>>
  starterPack?: boolean
}

export type MarketListingType = 'WTS' | 'WTB'

export interface MarketListing {
  id: string
  sellerId: string
  sellerName: string
  sellerFaction: Faction
  itemId: string
  itemName: string
  itemRarity: Rarity
  itemType: 'item' | 'card'
  slotType?: string
  virtue?: VirtueName
  listingType: MarketListingType
  price: number
  currency: 'glyph' | 'fate'
  listedAt: string
}

export type AdminTab = 'heroes' | 'quests' | 'items' | 'cards' | 'players' | 'store' | 'economy' | 'system'

export type MarketTab = 'items' | 'exchange' | 'my-listings'

export interface ExchangeOrder {
  id: string
  userId: string
  userName: string
  userFaction: Faction
  side: 'BUY_GLYPH' | 'SELL_GLYPH'
  rate: number
  amount: number
  total: number
  filled: number
  status: 'OPEN' | 'FILLED' | 'CANCELLED'
  createdAt: string
  filledAt?: string
}

export interface ExchangeTick {
  id: string
  rate: number
  amount: number
  side: 'BUY' | 'SELL'
  timestamp: string
}
