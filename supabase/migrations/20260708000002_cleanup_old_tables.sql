-- Drop remaining tables from old schema (not covered by initial migration)
DROP TABLE IF EXISTS oracle_badges CASCADE;
DROP TABLE IF EXISTS oracle_equipped CASCADE;
DROP TABLE IF EXISTS oracle_follows CASCADE;
DROP TABLE IF EXISTS oracle_inventory CASCADE;
DROP TABLE IF EXISTS hero_items CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS wagers CASCADE;
