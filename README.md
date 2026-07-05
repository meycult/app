# <img src="public/favicon.svg" width="28" /> MeyCult — The App

**app.meycult.com** — The gamified prediction market SPA. Oracles predict real-world outcomes. Cults compete. Markets resolve. Built public by [<img src="public/favicon.svg" width="14" /> GodEmperor](https://youtube.com/@godemperorbuddy) as Labor 01 of the **12 Labors** series.

---

## <img src="public/favicon.svg" width="20" /> What Is MeyCult?

A gamified prediction market on Base L2. Players are **Oracles** — part of a cult, preparing heroes for quests, staking insight on real-world event outcomes. Politicians rise and fall. Crypto pumps and dumps. Wager insight, earn glory, join a cult.

---

## <img src="public/favicon.svg" width="18" /> Routes

| Route | Page | Auth | Description |
|---|---|---|---|
| `/` | Landing | Public | Sigil, brand, witty tagline, Register / Sign In CTAs |
| `/login` | Sign In | Guest | Email + Google OAuth login |
| `/register` | Register | Guest | Account creation with email or Google |
| `/auth/callback` | OAuth Callback | Public | Supabase OAuth redirect handler |
| `/onboarding` | Onboarding | Protected | 3-step oracle identity (handle, alias, cult selection) |
| `/coming-soon` | Coming Soon | Protected | Post-auth landing — app not yet live, stay tuned |
| `/network` | Network (Atlas) | Protected | Main dashboard (stub, in development) |
| `/profile` | Profile | Protected | Oracle profile, inventory, virtues, predictions |
| `/quest/:questId` | Quest Detail | Protected | Individual quest view (stub) |
| `/hero/:heroId` | Hero Profile | Protected | Hero details and stats |
| `/build` | Build | Protected | Equipment and deck building (stub) |
| `/store` | Store | Protected | Item shop (stub) |
| `/market` | Market | Protected | Prediction marketplace (stub) |
| `/account` | Account | Protected | Profile settings, appearance, sign out |
| `/admin` | Admin | Protected | Admin panel (stub) |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 8 |
| Framework | React 19 (SPA) |
| Routing | react-router-dom v7 |
| Language | TypeScript 6 (strict) |
| Styling | Tailwind CSS 4 |
| Fonts | Rajdhani (headings), Space Grotesk (body), Chakra Petch (brand), Space Mono (data) |
| Auth | Supabase Auth (email + Google OAuth) |
| State | Zustand 5 (persist middleware) |
| Database | Supabase (Postgres + RLS) |
| Animation | Framer Motion, lightweight-charts |
| Linting | oxlint |
| Package Manager | pnpm |

---

## 🚀 Get Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 📦 Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#22e06a` | Primary jade green |
| `--color-bg` | `#030d07` | Deep black background |
| `--color-surface` | `#071a0f` | Card surfaces |
| `--color-text` | `#d6ffe2` | Primary text |
| `--color-text-muted` | `rgba(214, 255, 226, 0.55)` | Secondary text |
| `--color-line` | `rgba(34, 224, 106, 0.18)` | Borders / dividers |
| `--font-heading` | Rajdhani | Section titles |
| `--font-logo` | Chakra Petch | Brand name "MeyCult" |

Cards use glassmorphism with accent glow. Background features a particle network mesh with 6 bouncing glow orbs across the viewport.

---

## 🚢 Deploy

```bash
pnpm build
pnpm preview
```

Deployed to Vercel at [app.meycult.com](https://app.meycult.com).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🔗 Related

- **Landing**: [meycult.com](https://meycult.com) — Marketing site, whitepaper, merch shop
- **Contracts**: [meycult-contracts](https://github.com/meycult/meycult-contracts) — Base L2 smart contracts
- **YouTube**: [@godemperorbuddy](https://youtube.com/@godemperorbuddy) — 12 Labors of GodEmperor
- **Discord**: [discord.gg/meycult](https://discord.gg/meycult)
- **X**: [@meycult](https://x.com/meycult)

---

Built in public by [GodEmperor](https://youtube.com/@godemperorbuddy). MIT license.
