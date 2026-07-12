-- Migration: 4 Virtues + 4 Cults
-- Update heroes defaults and seed data to new virtue system

-- Update table defaults
ALTER TABLE heroes ALTER COLUMN virtues SET DEFAULT '{"clarity":8,"humility":8,"endurance":8,"overcoming":8}';
ALTER TABLE player_heroes ALTER COLUMN virtues SET DEFAULT '{"clarity":8,"humility":8,"endurance":8,"overcoming":8}';

-- Remap cults: 6 old → 4 new
UPDATE heroes SET cult = 'driftless'  WHERE cult IN ('architects', 'operatives');
UPDATE heroes SET cult = 'masonry'    WHERE cult IN ('wardens', 'monastics');
UPDATE heroes SET cult = 'recurrence' WHERE cult = 'legion';
UPDATE heroes SET cult = 'leviathan'  WHERE cult = 'tribunal';

-- Elvis Musk — Recurrence (Overcoming) — was legion, high courage+skill
UPDATE heroes SET virtues = '{"clarity":12,"humility":6,"endurance":8,"overcoming":18}' WHERE handle = '@elonmusk';
-- Donald Trump — Recurrence (Overcoming)
UPDATE heroes SET virtues = '{"clarity":6,"humility":4,"endurance":8,"overcoming":16}' WHERE handle = '@realdonaldtrump';
-- Greta Thunberg — Masonry (Endurance)
UPDATE heroes SET virtues = '{"clarity":12,"humility":14,"endurance":18,"overcoming":8}' WHERE handle = '@gretathunberg';
-- Sam Altman — Driftless (Clarity)
UPDATE heroes SET virtues = '{"clarity":20,"humility":8,"endurance":10,"overcoming":6}' WHERE handle = '@sama';
-- Vladimir Putin — Leviathan (Humility) — irony, but fits tribunal→leviathan
UPDATE heroes SET virtues = '{"clarity":16,"humility":4,"endurance":12,"overcoming":18}' WHERE handle = '@putin';
-- Taylor Swift — Driftless (Clarity)
UPDATE heroes SET virtues = '{"clarity":16,"humility":12,"endurance":10,"overcoming":10}' WHERE handle = '@taylorswift13';
-- Warren Buffett — Driftless (Clarity)
UPDATE heroes SET virtues = '{"clarity":18,"humility":10,"endurance":14,"overcoming":4}' WHERE handle = '@warrenbuffett';
-- Satoshi Nakamoto — Driftless (Clarity)
UPDATE heroes SET virtues = '{"clarity":20,"humility":8,"endurance":14,"overcoming":6}' WHERE handle = '@satoshi';
-- Mark Zuckerberg — Driftless (Clarity)
UPDATE heroes SET virtues = '{"clarity":16,"humility":6,"endurance":8,"overcoming":12}' WHERE handle = '@zuck';
-- Beyonce — Masonry (Endurance)
UPDATE heroes SET virtues = '{"clarity":12,"humility":14,"endurance":16,"overcoming":10}' WHERE handle = '@beyonce';

-- Update hero_items to use new cult colors — no action needed, colors in frontend only
