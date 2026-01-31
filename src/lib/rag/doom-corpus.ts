/**
 * DOOM Corpus - Sample Data Structure
 *
 * This file demonstrates the structure for DOOM lyrics.
 * In production, users would add their own lyrics or this would
 * require proper licensing.
 *
 * These are EXAMPLE/PLACEHOLDER entries showing the data format.
 * They are NOT actual DOOM lyrics.
 */

import type { LyricDocument } from './types';

/**
 * Sample corpus structure - replace with real data
 *
 * To populate with real lyrics:
 * 1. Create a lyrics.json file with proper attributions
 * 2. Ensure you have rights to use the content
 * 3. Call initializeStore() with the data
 */
export const DOOM_CORPUS_SAMPLE: LyricDocument[] = [
  // Examples showing the structure (not real lyrics)
  {
    id: 'sample-1',
    artistId: 'doom',
    alias: 'mf-doom',
    album: 'Example Album',
    song: 'Example Track 1',
    content: `The villain grip the mic with a metal face
Spit fire like a dragon in a special place
Rhymes hit harder than a asteroid belt
The coldest flow you ever felt`,
    type: 'verse',
    metadata: {
      year: 2004,
      themes: ['villainy', 'flow', 'metaphor'],
    },
  },
  {
    id: 'sample-2',
    artistId: 'doom',
    alias: 'viktor-vaughn',
    album: 'Example Album 2',
    song: 'Example Track 2',
    content: `Viktor the director of the lethal injection
Perfection in every inflection and section
No question the best in the session
Teaching lessons while you second-guessing`,
    type: 'verse',
    metadata: {
      year: 2003,
      themes: ['alter-ego', 'wordplay', 'boasts'],
    },
  },
  {
    id: 'sample-3',
    artistId: 'doom',
    alias: 'king-geedorah',
    album: 'Example Album 3',
    song: 'Example Track 3',
    content: `The monster from the stars descending
Never ending saga of the bars he's sending
Bending reality with each verse
Rehearse and disperse the worst curse`,
    type: 'verse',
    metadata: {
      year: 2003,
      themes: ['monster', 'cosmic', 'power'],
    },
  },
  {
    id: 'sample-4',
    artistId: 'doom',
    alias: 'mf-doom',
    album: 'Example Album',
    song: 'Food Rhymes',
    content: `Serve em like a waiter at a five star spot
Pot of gold at the end of every rhyme I got
Hot like wasabi on the sushi roll
Fully in control of the music and soul`,
    type: 'verse',
    metadata: {
      year: 2004,
      themes: ['food', 'wordplay', 'flow'],
    },
  },
  {
    id: 'sample-5',
    artistId: 'doom',
    alias: 'madvillain',
    album: 'Example Collab',
    song: 'Abstract Flow',
    content: `Accordion squeeze of the breeze through trees
Keys freeze degrees of the emcees
Please believe the steeze is diseased
With expertise that leaves enemies on their knees`,
    type: 'verse',
    metadata: {
      year: 2004,
      producer: 'Madlib',
      themes: ['abstract', 'internal-rhymes', 'flow'],
    },
  },
];

/**
 * Themes commonly found in DOOM's work
 */
export const DOOM_THEMES = [
  'villainy',
  'alter-ego',
  'food',
  'comics',
  'abstract',
  'wordplay',
  'internal-rhymes',
  'slant-rhymes',
  'industry-critique',
  'boasts',
  'storytelling',
  'cosmic',
  'monster',
  'mask',
  'flow',
  'metaphor',
  'power',
];

/**
 * DOOM aliases for filtering
 */
export const DOOM_ALIASES = [
  'mf-doom',
  'viktor-vaughn',
  'king-geedorah',
  'metal-fingers',
  'zev-love-x',
  'madvillain',
  'dangerdoom',
  'jj-doom',
  'nehruviandoom',
  'doomstarks',
];

/**
 * Notable albums for reference
 */
export const DOOM_ALBUMS = [
  { alias: 'mf-doom', title: 'Operation: Doomsday', year: 1999 },
  { alias: 'mf-doom', title: 'Mm..Food', year: 2004 },
  { alias: 'mf-doom', title: 'Born Like This', year: 2009 },
  { alias: 'viktor-vaughn', title: 'Vaudeville Villain', year: 2003 },
  { alias: 'viktor-vaughn', title: 'Venomous Villain', year: 2004 },
  { alias: 'king-geedorah', title: 'Take Me to Your Leader', year: 2003 },
  { alias: 'madvillain', title: 'Madvillainy', year: 2004 },
  { alias: 'dangerdoom', title: 'The Mouse and the Mask', year: 2005 },
  { alias: 'jj-doom', title: 'Keys to the Kuffs', year: 2012 },
];
