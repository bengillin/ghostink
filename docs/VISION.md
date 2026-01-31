# GhostInk

> A living notebook for lyricists, where every keystroke is sacred and the spirits of the greats write alongside you.

---

## The Core Idea

GhostInk is a **version-controlled creative writing environment** built for songwriters, with a focus on **rap and lyric writing**. Every character, word, and edit is tracked — not just for undo/redo, but as a **creative archaeology** of how a piece came to be.

At its heart: **AI collaborators trained on specific artists' bodies of work** that can complete your lines, suggest rhymes, write in conversation with you, and help you create in the tradition of the masters — while maintaining **crystal-clear attribution** of what came from you versus the machine.

---

## The Name

**GhostInk**

- **Ghost**: The phantom collaborators. The tradition of ghostwriting. The spirits of artists channeled through AI. The invisible hand that helps shape the work.
- **Ink**: Permanence. The written word. Tattoo-level commitment to your bars. The physical act of writing made digital.

Aesthetic: Dark, elegant, mysterious. Think weathered notebooks, quill pens trailing smoke, masks emerging from shadow.

---

## Core Components

### 1. The Notebook

The writing surface itself. Not just a text editor — a **living document** that understands lyrics.

**Features:**
- Line-by-line structure (verses, hooks, bridges)
- Syllable counting (automatic)
- Stress pattern detection
- Rhyme scheme visualization (color-coded)
- Beat/tempo sync (optional metronome, BPM tagging)
- Markdown-like formatting for annotations

**The Infinite Canvas:**
- Multiple songs in one notebook
- Scratch space / "graveyard" for killed darlings
- Reference panel for inspiration snippets

---

### 2. The Chronicle (Edit Tracking)

Every change is recorded. Every. Single. One.

**Granularity:**
- Character insertions/deletions
- Word replacements
- Line moves/swaps
- Verse restructuring

**Why it matters:**
- Watch a verse evolve from first draft to final
- Replay the writing session like a time-lapse
- Study your own creative process
- Never lose a version you wish you'd kept
- **Attribution**: Know exactly which words came from you vs. a Mask

**Technical approach:**
- Event sourcing architecture
- Every edit is an immutable event with timestamp + author
- Can reconstruct any point in history
- Branching possible (try two directions, merge or pick)

---

### 3. The Rhymebook

A living reference integrated into the writing experience.

**Features:**
- **Rhyme finder**: Input a word, get rhymes organized by type
  - Perfect rhymes
  - Slant/near rhymes
  - Assonance matches
  - Consonance matches
  - Multisyllabic rhymes
  - Identity rhymes
- **Rhyme type glossary**: Learn the terminology
- **Pattern templates**: Common schemes (AABB, ABAB, ABBA, etc.)
- **Custom dictionaries**: Save your invented words, slang, aliases

**Advanced:**
- Phonetic search (find words that *sound* like X)
- Stress pattern matching
- Regional accent variants (DOOM's British-NY hybrid)

---

### 4. The Structure Lab

Tools for understanding and applying lyrical architecture.

**Rhyme Structures:**
- End rhymes (basic)
- Internal rhymes
- Chain rhymes
- Multisyllabic compound rhymes
- Mosaic rhymes (multiple words rhyming with one)

**Flow Patterns:**
- On-beat vs. off-beat phrasing
- Enjambment (running lines together)
- Syncopation mapping
- Rest/pause notation

**Poetic Devices:**
- Alliteration detection/suggestion
- Assonance highlighting
- Metaphor tagging
- Simile identification
- Wordplay annotation (punchlines, double meanings)
- Callback tracking (references to earlier lines)

---

### 5. The Masks (AI Artist Collaborators)

This is the heart of GhostInk's innovation.

**What is a Mask?**

A Mask is an AI model that embodies the creative spirit of a specific artist. It has learned from their:
- Lyrics (word choice, themes, vocabulary)
- Rhyme patterns (their signature moves)
- Flow and cadence (how they ride beats)
- References and allusions (their cultural universe)
- Song structures (how they build verses)

**How Masks Work:**

1. **Line Completion**: You write half a bar, the Mask completes it
2. **Next Line**: You finish a line, the Mask writes the response
3. **Conversation Mode**: Back-and-forth co-writing session
4. **Analysis Mode**: Mask critiques your verse in the artist's voice
5. **Inspiration Mode**: Generate seed lines/concepts to spark ideas
6. **Style Transfer**: Rewrite your verse in the artist's style

**Attribution:**
- Every Mask contribution is tagged with:
  - Which Mask generated it
  - Confidence score
  - Timestamp
  - What prompt/context triggered it
- Visual distinction in the editor (ghost text, different color, icon)
- Export can include or exclude Mask contributions
- Percentage breakdown: "This song is 73% you, 27% DOOM Mask"

---

## Mask Name Alternatives

The AI collaborators need a name. "Masks" fits DOOM perfectly, but here are alternatives to consider:

### Ghost/Spirit Theme
| Name | Vibe |
|------|------|
| **Masks** | DOOM's literal mask, persona, alter-ego |
| **Specters** | Haunting presence, whispers in your ear |
| **Phantoms** | Classic ghost, elegant |
| **Shades** | Ghosts + cool factor |
| **Echoes** | Reverberations of the original artist |
| **Whispers** | Subtle suggestions, intimate |
| **Apparitions** | Fleeting appearances |
| **Wraiths** | Darker, more intense |
| **Revenants** | The returned, undying influence |
| **Spirits** | Classic, spiritual channeling |

### Writing/Creative Theme
| Name | Vibe |
|------|------|
| **Muses** | Classical inspiration |
| **Scribes** | The ones who write |
| **Voices** | Speaking through you |
| **Channels** | Channeling the artist |
| **Vessels** | Container for their spirit |
| **Imprints** | What they left behind |
| **Traces** | Following their path |

### Persona/Identity Theme
| Name | Vibe |
|------|------|
| **Aliases** | DOOM had many — Viktor Vaughn, King Geedorah... |
| **Personas** | The face they wear |
| **Alter Egos** | The other self |
| **Avatars** | Digital embodiment |
| **Doppelgangers** | Your shadow twin |
| **Familiars** | Witch's companion, always by your side |

### Playful/Modern
| Name | Vibe |
|------|------|
| **Ghosts** | Direct, literal |
| **Sidekicks** | Collaborative, friendly |
| **Co-Pilots** | Tech-forward |
| **Shadows** | Following your lead |

**Current Recommendation:**

**"Masks"** — it's perfect for DOOM as the flagship artist, it captures the persona/alter-ego concept beautifully, and it has that mysterious villain energy. When you "summon a Mask," you're putting on a different creative identity.

Alternative: **"Specters"** if you want something that scales better beyond DOOM (not every artist has a mask association).

---

## The DOOM Mask: Scope

MF DOOM's universe is vast. Here's the full scope:

### Core Aliases (All In Scope)
| Alias | Era/Context | Notable Works |
|-------|-------------|---------------|
| **Zev Love X** | KMD (1989-1993) | Mr. Hood, Bl_ck B_st_rds |
| **MF DOOM** | Solo (1999-2020) | Operation: Doomsday, MM..FOOD, Born Like This |
| **Viktor Vaughn** | Alter-ego | Vaudeville Villain, Venomous Villain |
| **King Geedorah** | Alter-ego (monster) | Take Me To Your Leader |
| **Metal Fingers** | Producer alias | Special Herbs series |
| **DOOM** | Post-2009 | Various features |

### Collaborations (All In Scope)
| Project | Collaborator | Works |
|---------|--------------|-------|
| **Madvillain** | Madlib | Madvillainy (masterpiece) |
| **DANGERDOOM** | Danger Mouse | The Mouse and the Mask |
| **NehruvianDOOM** | Bishop Nehru | NehruvianDOOM |
| **JJ DOOM** | Jneiro Jarel | Keys to the Kuffs |
| **DOOMSTARKS** | Ghostface Killah | Scattered tracks |
| **KMD** | Subroc (RIP) | Full discography |

### What the DOOM Mask Knows
- **Vocabulary**: Comic books, food, villainy, cartoons, abstract nouns
- **References**: Marvel/DC deep cuts, 60s-70s soul samples, B-movies
- **Rhyme Style**: Complex internals, multisyllabic chains, slant rhymes
- **Flow**: Off-beat, conversational, unexpected pauses
- **Themes**: Anti-hero narrative, industry critique, alter-ego mythology
- **Production Style**: (Metal Fingers) soul loops, vinyl crackle, cartoon samples

---

## Tech Stack (Proposed)

### Frontend
- **Framework**: SvelteKit or Next.js
  - SvelteKit: Lighter, faster, great for real-time
  - Next.js: More ecosystem, easier hiring
- **Editor**: Custom built on ProseMirror or TipTap
  - Rich text with custom nodes for lyrics
  - Real-time collaboration ready
- **State**: Zustand or Jotai (lightweight)

### Backend
- **API**: Node.js (Express/Fastify) or Go
- **Real-time**: WebSockets via Socket.io or native WS
- **Queue**: Redis + BullMQ for AI job processing

### Database
- **Primary**: PostgreSQL
  - Songs, users, projects
  - Edit events (append-only event store)
- **Search**: Elasticsearch or Meilisearch
  - Lyric search, rhyme lookup
- **Cache**: Redis
  - Session, real-time presence, hot data

### AI/ML Layer
- **Base Models**: Claude API, GPT-4, or fine-tuned Llama
- **Fine-tuning**: Modal, Replicate, or self-hosted
- **RAG Pipeline**:
  - Vector DB (Pinecone, Weaviate, or pgvector)
  - Embed all DOOM lyrics + analysis
  - Retrieve relevant context for generation
- **Rhyme Engine**: Custom phonetic matching (CMU Pronouncing Dictionary base)

### Infrastructure
- **Hosting**: Vercel (frontend), Railway/Render/Fly.io (backend)
- **File Storage**: S3 or Cloudflare R2
- **Auth**: Clerk, Auth0, or custom JWT

### Desktop (Phase 2)
- **Framework**: Tauri (Rust-based, lighter than Electron)
- **Offline**: SQLite local DB, sync on reconnect

### Mobile (Phase 3)
- **Approach**: PWA first, then React Native if needed

---

## Data Model: The Chronicle

### Core Entities

```
User
├── id
├── username
├── email
└── created_at

Project (a collection of songs)
├── id
├── user_id
├── title
├── description
└── created_at

Song
├── id
├── project_id
├── title
├── current_content (computed from events)
├── created_at
└── updated_at

EditEvent (immutable, append-only)
├── id
├── song_id
├── user_id (nullable — null means Mask)
├── mask_id (nullable — which Mask if AI)
├── event_type (insert, delete, replace, move)
├── position (line, character offset)
├── content (what was added/removed)
├── timestamp
├── session_id (group events by writing session)
└── metadata (confidence score, prompt context, etc.)

Mask
├── id
├── name (e.g., "DOOM")
├── artist_name
├── description
├── model_config (which base model, fine-tuning params)
├── status (active, training, deprecated)
└── created_at

MaskContribution
├── id
├── edit_event_id
├── mask_id
├── prompt (what triggered this)
├── confidence
└── alternatives (other options that weren't picked)
```

### Event Sourcing Flow

1. User types "Villain, grip the mic" → InsertEvent created
2. User invokes DOOM Mask: "complete this line"
3. Mask generates: "with a brutal like" → InsertEvent with mask_id
4. User edits "brutal" to "ice cold" → ReplaceEvent (user)
5. All events stored, never deleted
6. Current state = replay all events in order
7. Any historical state = replay events up to timestamp T

### Attribution Calculation

```
For a song:
- Count characters from user events
- Count characters from mask events
- Subtract deletions appropriately
- Result: "78% human, 22% DOOM Mask"
```

---

## AI Architecture: How Masks Think

### Approach: Hybrid RAG + Style Model

**Layer 1: Knowledge Base (RAG)**
- All DOOM lyrics embedded as vectors
- Album liner notes, interviews
- Fan analyses, Genius annotations
- Organized by alias, album, theme

**Layer 2: Style Encoding**
- Fine-tuned model (or strong prompt engineering)
- Captures: vocabulary, rhyme patterns, flow, themes
- NOT just copying lyrics — understanding the *style*

**Layer 3: Context Engine**
- What has the user written so far?
- What's the song's theme/mood?
- What rhyme scheme is emerging?
- What syllable count fits the line?

### Generation Flow

```
User input: "Villain, grip the mic with a"
     │
     ▼
┌─────────────────────────────┐
│   Context Analysis          │
│   - Current line syllables  │
│   - Established rhymes      │
│   - Song theme so far       │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│   RAG Retrieval             │
│   - Find similar DOOM lines │
│   - Pull rhyme patterns     │
│   - Get vocabulary seeds    │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│   Style Model Generation    │
│   - Generate completions    │
│   - Score by DOOM-ness      │
│   - Filter/rank options     │
└─────────────────────────────┘
     │
     ▼
Output: ["fistful of ice", "stone cold vice", "type of raw"]
User picks or regenerates
```

### Training Data (DOOM)

| Source | Content |
|--------|---------|
| Lyrics | All songs, all aliases (~300+ tracks) |
| Genius | Annotations, explanations |
| Interviews | His explanations of process |
| Analysis | Academic papers, YouTube breakdowns |
| Samples | What he sampled (cultural context) |

---

## The Game: Expand the Idea

What makes this sticky? What brings people back?

### Progression System
- **Levels**: Based on writing activity, not just usage
- **Achievements**: "Wrote 1000 bars", "Used 50 internal rhymes", "Collaborated with 5 Masks"
- **Streaks**: Daily writing streaks, weekly goals

### Challenges
- **Daily Prompt**: Write 8 bars on today's theme
- **Style Match**: Given a Mask, write a verse, get scored on similarity
- **Rhyme Gauntlet**: Chain rhymes as long as possible
- **Flow Challenge**: Match syllables to a beat pattern

### Social (Optional)
- **Cipher Mode**: Round-robin writing with friends
- **Battle Mode**: Head-to-head, same prompt, community votes
- **Share Verses**: Post completed work (with attribution stats)

### Learning Path
- **Tutorials**: Learn rhyme types, study DOOM breakdowns
- **Analysis Mode**: AI explains why a DOOM verse works
- **Practice Drills**: Targeted exercises for weak areas

---

## Monetization Thoughts (Early)

| Tier | Features |
|------|----------|
| **Free** | Basic notebook, limited Mask calls/day, core rhymebook |
| **Pro** | Unlimited Masks, full Chronicle history, export, sync |
| **Studio** | Team collaboration, custom Masks, API access |

**Mask Expansion Packs**: Additional artists as they're developed
**Ethical Consideration**: Artist estates, licensing, or charity tie-ins?

---

## Phase 1: MVP Scope

**What we build first:**

1. ✍️ **Basic Notebook**: Write lyrics, line-by-line, verse structure
2. 📝 **Simple Chronicle**: Track edits, basic undo/redo, history view
3. 📖 **Rhymebook v1**: Rhyme finder with types, basic phonetic matching
4. 🎭 **DOOM Mask v1**: RAG-based, complete lines, suggest next lines
5. 📊 **Attribution Display**: Show human vs. Mask percentages
6. 💾 **Save/Load**: PostgreSQL backend, user accounts

**What waits:**
- Real-time collab
- Mobile apps
- Additional Masks
- Gamification
- Beat sync

---

## Open Questions

1. **Legal**: Training on lyrics — fair use? Licensing needed?
2. **Artist Relations**: Estates, managers — partner or ask forgiveness?
3. **Originality Detection**: How to prevent Masks from copying lines verbatim?
4. **Voice**: Should Masks ever generate in first-person AS the artist?
5. **Community**: How much social features? Core to product or add-on?

---

## Next Steps

1. [ ] Finalize Mask naming decision
2. [ ] Set up repo, basic project structure
3. [ ] Build rhyme engine prototype
4. [ ] Collect + clean DOOM lyrics corpus
5. [ ] Design editor data model
6. [ ] Prototype Chronicle event system
7. [ ] First Mask experiments (RAG with Claude/GPT-4)

---

*"The mask is not for him. The mask is for you."*
