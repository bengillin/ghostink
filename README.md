# GhostInk

> A living notebook for lyricists, where every keystroke is sacred and the spirits of the greats write alongside you.

**GhostInk** is a version-controlled creative writing environment for songwriters, focused on rap and lyric writing. AI collaborators called **Masks** — trained on specific artists' bodies of work — write alongside you while maintaining crystal-clear attribution.

## Features

- **Line-by-line editor** with real-time rhyme scheme detection (A/B/C coloring)
- **Full CMU Pronouncing Dictionary** (135k+ words) for comprehensive rhyme matching
- **Rhymebook** with multiple rhyme types: perfect, slant, assonance, consonance, multisyllabic
- **DOOM Mask** - AI collaborator powered by Claude that can:
  - Complete your lines
  - Write the next bar
  - Analyze/critique your verse
  - Generate inspiration
  - Rewrite in DOOM's style
  - Cipher back-and-forth
- **Edit tracking** (Chronicle) - every keystroke recorded
- **Attribution** - see what % came from you vs. the Mask
- **Persistence** - SQLite database for saving songs and edit history

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment (optional - enables Claude API)
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key for live Mask generation | No (falls back to demo mode) |
| `GHOSTINK_DB_PATH` | Custom database path | No (defaults to `./ghostink.db`) |

## Project Structure

```
ghostink/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── rhymes/        # Rhyme lookup API
│   │   │   ├── masks/         # Mask generation API
│   │   │   └── songs/         # Song CRUD API
│   │   ├── page.tsx           # Main editor page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Editor.tsx         # Line-by-line lyric editor
│   │   ├── RhymePanel.tsx     # Rhyme finder UI
│   │   ├── MaskPanel.tsx      # DOOM Mask interaction
│   │   └── AttributionBar.tsx # Human vs Mask %
│   ├── lib/
│   │   ├── rhyme/             # Rhyme engine
│   │   │   ├── phonetics.ts   # ARPAbet handling
│   │   │   ├── dictionary.ts  # Starter dictionary
│   │   │   ├── cmu-loader.ts  # Full CMU dictionary
│   │   │   ├── engine.ts      # Matching algorithms
│   │   │   └── types.ts
│   │   ├── chronicle/         # Edit tracking
│   │   │   ├── store.ts       # Event sourcing
│   │   │   └── types.ts
│   │   ├── masks/             # AI collaborators
│   │   │   ├── types.ts       # Mask definitions
│   │   │   ├── service.ts     # Mock service
│   │   │   └── claude-service.ts # Claude-powered
│   │   └── db/                # Persistence
│   │       ├── schema.ts      # SQLite schema
│   │       └── repository.ts  # CRUD operations
│   └── data/
│       └── cmudict.txt        # CMU Pronouncing Dictionary
├── docs/
│   └── VISION.md              # Full design document
└── package.json
```

## The DOOM Mask

All aliases in scope:
- MF DOOM / DOOM
- Viktor Vaughn
- King Geedorah
- Metal Fingers
- Zev Love X (KMD)
- Madvillain, DANGERDOOM, JJ DOOM, NehruvianDOOM

The Mask knows DOOM's:
- Vocabulary (comic books, food, villainy)
- Rhyme patterns (complex internals, multis)
- Flow style (off-beat, conversational)
- Themes (anti-hero, industry critique)

## API Endpoints

### `GET /api/rhymes?word=xxx`
Find rhymes for a word.

Query params:
- `word` (required): Word to find rhymes for
- `types`: Comma-separated rhyme types (default: all)
- `limit`: Max results per type (default: 15)

### `POST /api/masks/generate`
Generate from a Mask.

Body:
```json
{
  "maskId": "doom",
  "mode": "complete|next|analyze|inspire|transfer|conversation",
  "context": {
    "currentLine": "...",
    "previousLines": ["..."]
  }
}
```

### `GET/POST /api/songs`
List or create songs.

### `GET/PUT/DELETE /api/songs/[id]`
Get, update, or delete a specific song.

## Roadmap

- [ ] RAG pipeline with embedded DOOM lyrics
- [ ] Beat sync (BPM, metronome, syllable timing)
- [ ] Additional Masks (Kendrick, Jay-Z, etc.)
- [ ] Real-time collaboration
- [ ] Mobile app

---

*"The mask is not for him. The mask is for you."*
