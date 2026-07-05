export type Alignment = 'LG' | 'NG' | 'CG' | 'LN' | 'TN' | 'CN' | 'LE' | 'NE' | 'CE'

export type Faction = 'architects' | 'wardens' | 'legion' | 'operatives' | 'tribunal' | 'monastics'

export type VirtueName = 'wisdom' | 'courage' | 'prudence' | 'skill' | 'temperance' | 'justice'

export type Virtues = Record<VirtueName, number>

export type VirtueXP = Record<VirtueName, number>

export type VirtueTierLevel = 0 | 1 | 2 | 3

export type Category = 'POLITICS' | 'TECH' | 'CRYPTO' | 'SPORTS' | 'CULTURE' | 'WORLD' | 'FINANCE' | 'SCIENCE' | 'AI' | 'GAMING' | 'ENTERTAINMENT'

export type VirtueTierLabel = 'shifting' | 'refined' | 'uncommon' | 'rare' | 'mythic'

export type QuestStatus = 'OPEN' | 'RESOLVED_YES' | 'RESOLVED_NO'

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

export interface Hero {
  id: string
  handle: string
  name: string
  title: string
  alignment: Alignment
  virtues: Virtues
  bio: string
  faction: Faction
  equippedItems: Item[]
  slotType: SlotType
  avatarUrl: string
  primaryVirtue: VirtueName
  secondaryVirtue: VirtueName
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

export interface TierVoteOption {
  id: string
  label: string
  description: string
  voteCount: number
  statBonuses?: Partial<Record<VirtueName, number>>
  uniqueEffect?: string
}

export type TierVoteStatus = 'active' | 'resolved' | 'locked'

export interface TierVote {
  tier: VirtueTierLabel
  status: TierVoteStatus
  options: TierVoteOption[]
  winningOption?: string
  totalVotes: number
  resolvedAt?: string
}

export interface QuestPlayer {
  id: string
  username: string
  faction: Faction
  wagerAmount: number
  wagerOutcome: 'YES' | 'NO'
  virtues: Virtues
  equippedItems: string[]
  deckSlots: (string | null)[]
  wageredAt: string
}

export interface QuestComment {
  id: string
  authorId: string
  authorName: string
  authorFaction: Faction
  text: string
  upvotes: number
  downvotes: number
  replies: QuestComment[]
  createdAt: string
}

export type HeroTab = 'overview' | 'quests' | 'leaderboard' | 'community' | 'activity'
export type CommunitySubtab = 'discussion' | 'feed'

export interface HeroPost {
  id: string
  heroId: string
  authorName: string
  authorFaction: Faction
  text: string
  upvotes: number
  downvotes: number
  createdAt: string
  linkedQuestId?: string
}

export interface HeroLeaderboardPlayer {
  id: string
  username: string
  faction: Faction
  totalWagered: number
  winRate: number
  heroEquipped: boolean
  followedAt: string
}

export type QuestActivityType = 'wager' | 'price_move' | 'hero_action' | 'effect_trigger' | 'resolution'

export interface QuestActivity {
  id: string
  questId: string
  type: QuestActivityType
  text: string
  detail?: string
  username?: string
  faction?: Faction
  amount?: number
  createdAt: string
}

export interface Quest {
  id: string
  question: string
  description: string
  category: Category
  yesProbability: number
  noProbability: number
  volume: number
  engagement: number
  closesIn: string
  status: QuestStatus
  heroes: string[]
  rarityDensity: number
  lootTable: { item: Item; chance: number }[]
  effects: QuestEffect[]
  priceHistory: { time: string; yesPrice: number }[]
  fateVolume: number
  glyphVolume: number
  tierVotes: TierVote[]
  questPlayers: QuestPlayer[]
  comments: QuestComment[]
  activities: QuestActivity[]
}

export interface PredictionEquippedItem {
  slot: SlotType
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

export interface Player {
  id: string
  username: string
  avatarUrl: string
  level: number
  xp: number
  insightPoints: number
  faction: Faction
  virtues: Virtues
  virtueXP: VirtueXP
  badges: Badge[]
  inventory: Item[]
  equippedItems: Partial<Record<SlotType, string>>
  followedHeroes: string[]
  skillPoints: number
  unlockedCards: string[]
  deckSlots: (string | null)[]
  maxDeckSlots: number
  predictions: Prediction[]
  totalPredictions: number
  correctPredictions: number
  joinedAt: string
  glyph: number
  fate: number
  marketListings: MarketListing[]
  mythicVotes: { questId: string; tier: VirtueTierLabel; optionId: string; weight: number }[]
  title?: string
  frame?: string
  nameColor?: string
  profileBackground?: string
  predictionFlair?: string
  avatarDecoration?: string
  badgeEffect?: string
  starterPackPurchased?: boolean
  status?: 'active' | 'banned'
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
