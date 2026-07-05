-- ══════════════════════════════════════════════
--  MeyCult — Seed Data
--  Run AFTER migration.sql in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- ── Placeholder quests (so wagers.quest_id FK has targets) ──

INSERT INTO public.quests (question, description, category, closes_in, status)
VALUES
  ('TODO: Replace with real quest', 'Placeholder — will be replaced with real prediction market data.', 'TECH', 'Dec 31, 2026', 'OPEN'),
  ('TODO: Replace with real quest', 'Placeholder — will be replaced with real prediction market data.', 'POLITICS', 'Dec 31, 2026', 'OPEN'),
  ('TODO: Replace with real quest', 'Placeholder — will be replaced with real prediction market data.', 'CRYPTO', 'Dec 31, 2026', 'OPEN'),
  ('TODO: Replace with real quest', 'Placeholder — will be replaced with real prediction market data.', 'CULTURE', 'Dec 31, 2026', 'OPEN');

-- ── Badge chains (8 chains, tiers as JSONB) ──

INSERT INTO public.badges (name, category, description, icon, tiers) VALUES

('Seer', 'VIRTUE', 'Wisdom milestones — seeing beyond the surface.', 'Eye',
 '[{"tier":"bronze","tierIndex":0,"name":"Seer I: Initiate","description":"Reach Wisdom 5","triggerDesc":"Reach Wisdom 5","progressMax":5},
   {"tier":"silver","tierIndex":1,"name":"Seer II: Diviner","description":"Reach Wisdom 10","triggerDesc":"Reach Wisdom 10","progressMax":10},
   {"tier":"gold","tierIndex":2,"name":"Seer III: Clairvoyant","description":"Reach Wisdom 15","triggerDesc":"Reach Wisdom 15","progressMax":15},
   {"tier":"platinum","tierIndex":3,"name":"Seer IV: Omniscient","description":"Reach Wisdom 20","triggerDesc":"Reach Wisdom 20","progressMax":20}]'),

('Vanguard', 'VIRTUE', 'Courage milestones — leading the charge.', 'Swords',
 '[{"tier":"bronze","tierIndex":0,"name":"Vanguard I: Recruit","description":"Reach Courage 5","triggerDesc":"Reach Courage 5","progressMax":5},
   {"tier":"silver","tierIndex":1,"name":"Vanguard II: Soldier","description":"Reach Courage 10","triggerDesc":"Reach Courage 10","progressMax":10},
   {"tier":"gold","tierIndex":2,"name":"Vanguard III: Champion","description":"Reach Courage 15","triggerDesc":"Reach Courage 15","progressMax":15},
   {"tier":"platinum","tierIndex":3,"name":"Vanguard IV: Warlord","description":"Reach Courage 20","triggerDesc":"Reach Courage 20","progressMax":20}]'),

('Sage', 'VIRTUE', 'Intelligence milestones — deeper understanding.', 'Brain',
 '[{"tier":"bronze","tierIndex":0,"name":"Sage I: Student","description":"Reach Wisdom 5","triggerDesc":"Reach Wisdom 5","progressMax":5},
   {"tier":"silver","tierIndex":1,"name":"Sage II: Scholar","description":"Reach Wisdom 10","triggerDesc":"Reach Wisdom 10","progressMax":10},
   {"tier":"gold","tierIndex":2,"name":"Sage III: Master","description":"Reach Wisdom 15","triggerDesc":"Reach Wisdom 15","progressMax":15},
   {"tier":"platinum","tierIndex":3,"name":"Sage IV: Grandmaster","description":"Reach Wisdom 20","triggerDesc":"Reach Wisdom 20","progressMax":20}]'),

('Disciple', 'LOYALTY', 'Follow one hero through many predictions.', 'Heart',
 '[{"tier":"bronze","tierIndex":0,"name":"Disciple I: Acolyte","description":"10 bets with one hero","triggerDesc":"Follow one hero for 10 bets","progressMax":10},
   {"tier":"silver","tierIndex":1,"name":"Disciple II: Devotee","description":"25 bets with one hero","triggerDesc":"25 bets with one hero","progressMax":25},
   {"tier":"gold","tierIndex":2,"name":"Disciple III: Zealot","description":"50 bets with one hero","triggerDesc":"50 bets with one hero","progressMax":50},
   {"tier":"platinum","tierIndex":3,"name":"Disciple IV: Avatar","description":"100 bets with one hero","triggerDesc":"100 bets with one hero","progressMax":100}]'),

('Oracle', 'MARKET', 'Consecutive prediction wins.', 'Flame',
 '[{"tier":"bronze","tierIndex":0,"name":"Oracle I: Lucky","description":"Win 3 in a row","triggerDesc":"Win 3 consecutive predictions","progressMax":3},
   {"tier":"silver","tierIndex":1,"name":"Oracle II: Prescient","description":"Win 5 in a row","triggerDesc":"Win 5 consecutive predictions","progressMax":5},
   {"tier":"gold","tierIndex":2,"name":"Oracle III: Prophet","description":"Win 10 in a row","triggerDesc":"Win 10 consecutive predictions","progressMax":10},
   {"tier":"platinum","tierIndex":3,"name":"Oracle IV: Fateweaver","description":"Win 20 in a row","triggerDesc":"Win 20 consecutive predictions","progressMax":20}]'),

('Collector', 'COLLECTION', 'Build an arsenal of items.', 'Archive',
 '[{"tier":"bronze","tierIndex":0,"name":"Collector I: Hoarder","description":"Own 5 items","triggerDesc":"Own 5 unique items","progressMax":5},
   {"tier":"silver","tierIndex":1,"name":"Collector II: Curator","description":"Own 15 items","triggerDesc":"Own 15 unique items","progressMax":15},
   {"tier":"gold","tierIndex":2,"name":"Collector III: Archivist","description":"Own 30 items","triggerDesc":"Own 30 unique items","progressMax":30},
   {"tier":"platinum","tierIndex":3,"name":"Collector IV: Grand Collector","description":"Own 50 items","triggerDesc":"Own 50 unique items","progressMax":50}]'),

('Whale', 'MARKET', 'Lifetime Insight Points accumulated.', 'Wallet',
 '[{"tier":"bronze","tierIndex":0,"name":"Whale I: Minnow","description":"Earn 500 IP","triggerDesc":"Earn 500 total Insight Points","progressMax":500},
   {"tier":"silver","tierIndex":1,"name":"Whale II: Shark","description":"Earn 2,000 IP","triggerDesc":"Earn 2,000 total IP","progressMax":2000},
   {"tier":"gold","tierIndex":2,"name":"Whale III: Leviathan","description":"Earn 5,000 IP","triggerDesc":"Earn 5,000 total IP","progressMax":5000},
   {"tier":"platinum","tierIndex":3,"name":"Whale IV: Kraken","description":"Earn 20,000 IP","triggerDesc":"Earn 20,000 total IP","progressMax":20000}]'),

('Polymath', 'MARKET', 'Master every prediction category.', 'Compass',
 '[{"tier":"bronze","tierIndex":0,"name":"Polymath I: Dabbler","description":"5 categories in 30 days","triggerDesc":"Bet in 5 categories within 30 days","progressMax":5},
   {"tier":"silver","tierIndex":1,"name":"Polymath II: Explorer","description":"5 categories in 7 days","triggerDesc":"Bet in 5 categories within 7 days","progressMax":5},
   {"tier":"gold","tierIndex":2,"name":"Polymath III: Virtuoso","description":"5 categories in 24h","triggerDesc":"Bet in 5 categories within 24 hours","progressMax":5},
   {"tier":"platinum","tierIndex":3,"name":"Polymath IV: Renaissance","description":"5 categories in 5 bets","triggerDesc":"Bet in 5 unique categories consecutively","progressMax":5}]');

SELECT 'seed complete — ' || count(*) || ' quests, ' || count(*) || ' badge chains'
FROM public.quests, public.badges;
