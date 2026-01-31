/**
 * GhostInk Phonetic Dictionary
 *
 * Stores word-to-phoneme mappings. In production, this would load
 * the full CMU Pronouncing Dictionary (~134k words).
 *
 * For now, we include a curated set focused on:
 * - Common words
 * - Hip-hop/rap vocabulary
 * - DOOM-relevant terms
 */

import { PhoneticWord, countSyllables } from './phonetics';

// Type for raw dictionary data
type DictionaryData = Record<string, string[]>;

// Starter dictionary with phoneme representations
// Format: WORD -> [phonemes in ARPAbet]
const STARTER_DICT: DictionaryData = {
  // Common words
  'the': ['DH', 'AH0'],
  'a': ['AH0'],
  'is': ['IH1', 'Z'],
  'it': ['IH1', 'T'],
  'in': ['IH1', 'N'],
  'on': ['AA1', 'N'],
  'to': ['T', 'UW1'],
  'you': ['Y', 'UW1'],
  'i': ['AY1'],
  'me': ['M', 'IY1'],
  'we': ['W', 'IY1'],
  'be': ['B', 'IY1'],
  'he': ['HH', 'IY1'],
  'she': ['SH', 'IY1'],
  'my': ['M', 'AY1'],
  'your': ['Y', 'AO1', 'R'],
  'our': ['AW1', 'ER0'],
  'they': ['DH', 'EY1'],
  'them': ['DH', 'EH1', 'M'],

  // Rhyme-friendly words
  'cat': ['K', 'AE1', 'T'],
  'hat': ['HH', 'AE1', 'T'],
  'bat': ['B', 'AE1', 'T'],
  'rat': ['R', 'AE1', 'T'],
  'mat': ['M', 'AE1', 'T'],
  'sat': ['S', 'AE1', 'T'],
  'fat': ['F', 'AE1', 'T'],
  'flat': ['F', 'L', 'AE1', 'T'],
  'that': ['DH', 'AE1', 'T'],

  'flow': ['F', 'L', 'OW1'],
  'show': ['SH', 'OW1'],
  'know': ['N', 'OW1'],
  'go': ['G', 'OW1'],
  'no': ['N', 'OW1'],
  'so': ['S', 'OW1'],
  'low': ['L', 'OW1'],
  'blow': ['B', 'L', 'OW1'],
  'grow': ['G', 'R', 'OW1'],
  'throw': ['TH', 'R', 'OW1'],

  'mic': ['M', 'AY1', 'K'],
  'like': ['L', 'AY1', 'K'],
  'strike': ['S', 'T', 'R', 'AY1', 'K'],
  'spike': ['S', 'P', 'AY1', 'K'],
  'bike': ['B', 'AY1', 'K'],
  'hike': ['HH', 'AY1', 'K'],
  'psych': ['S', 'AY1', 'K'],

  'beat': ['B', 'IY1', 'T'],
  'heat': ['HH', 'IY1', 'T'],
  'meat': ['M', 'IY1', 'T'],
  'seat': ['S', 'IY1', 'T'],
  'feat': ['F', 'IY1', 'T'],
  'treat': ['T', 'R', 'IY1', 'T'],
  'street': ['S', 'T', 'R', 'IY1', 'T'],
  'sweet': ['S', 'W', 'IY1', 'T'],
  'repeat': ['R', 'IH0', 'P', 'IY1', 'T'],
  'defeat': ['D', 'IH0', 'F', 'IY1', 'T'],
  'complete': ['K', 'AH0', 'M', 'P', 'L', 'IY1', 'T'],

  'rhyme': ['R', 'AY1', 'M'],
  'time': ['T', 'AY1', 'M'],
  'crime': ['K', 'R', 'AY1', 'M'],
  'climb': ['K', 'L', 'AY1', 'M'],
  'dime': ['D', 'AY1', 'M'],
  'prime': ['P', 'R', 'AY1', 'M'],
  'slime': ['S', 'L', 'AY1', 'M'],
  'sublime': ['S', 'AH0', 'B', 'L', 'AY1', 'M'],

  'verse': ['V', 'ER1', 'S'],
  'curse': ['K', 'ER1', 'S'],
  'nurse': ['N', 'ER1', 'S'],
  'purse': ['P', 'ER1', 'S'],
  'worse': ['W', 'ER1', 'S'],
  'first': ['F', 'ER1', 'S', 'T'],
  'burst': ['B', 'ER1', 'S', 'T'],
  'thirst': ['TH', 'ER1', 'S', 'T'],

  'word': ['W', 'ER1', 'D'],
  'heard': ['HH', 'ER1', 'D'],
  'bird': ['B', 'ER1', 'D'],
  'third': ['TH', 'ER1', 'D'],
  'absurd': ['AH0', 'B', 'S', 'ER1', 'D'],

  // DOOM vocabulary
  'villain': ['V', 'IH1', 'L', 'AH0', 'N'],
  'killin': ['K', 'IH1', 'L', 'IH0', 'N'],
  'chillin': ['CH', 'IH1', 'L', 'IH0', 'N'],
  'fillin': ['F', 'IH1', 'L', 'IH0', 'N'],
  'willin': ['W', 'IH1', 'L', 'IH0', 'N'],
  'illin': ['IH1', 'L', 'IH0', 'N'],
  'spillin': ['S', 'P', 'IH1', 'L', 'IH0', 'N'],
  'thrillin': ['TH', 'R', 'IH1', 'L', 'IH0', 'N'],
  'grillin': ['G', 'R', 'IH1', 'L', 'IH0', 'N'],
  'drillin': ['D', 'R', 'IH1', 'L', 'IH0', 'N'],

  'doom': ['D', 'UW1', 'M'],
  'room': ['R', 'UW1', 'M'],
  'boom': ['B', 'UW1', 'M'],
  'zoom': ['Z', 'UW1', 'M'],
  'bloom': ['B', 'L', 'UW1', 'M'],
  'gloom': ['G', 'L', 'UW1', 'M'],
  'tomb': ['T', 'UW1', 'M'],
  'womb': ['W', 'UW1', 'M'],
  'consume': ['K', 'AH0', 'N', 'S', 'UW1', 'M'],
  'assume': ['AH0', 'S', 'UW1', 'M'],
  'costume': ['K', 'AA1', 'S', 'T', 'UW0', 'M'],
  'perfume': ['P', 'ER0', 'F', 'Y', 'UW1', 'M'],

  'mask': ['M', 'AE1', 'S', 'K'],
  'task': ['T', 'AE1', 'S', 'K'],
  'ask': ['AE1', 'S', 'K'],
  'flask': ['F', 'L', 'AE1', 'S', 'K'],
  'bask': ['B', 'AE1', 'S', 'K'],

  'metal': ['M', 'EH1', 'T', 'AH0', 'L'],
  'petal': ['P', 'EH1', 'T', 'AH0', 'L'],
  'settle': ['S', 'EH1', 'T', 'AH0', 'L'],
  'kettle': ['K', 'EH1', 'T', 'AH0', 'L'],

  'finger': ['F', 'IH1', 'NG', 'G', 'ER0'],
  'linger': ['L', 'IH1', 'NG', 'G', 'ER0'],
  'singer': ['S', 'IH1', 'NG', 'ER0'],
  'ringer': ['R', 'IH1', 'NG', 'ER0'],
  'bringer': ['B', 'R', 'IH1', 'NG', 'ER0'],

  'special': ['S', 'P', 'EH1', 'SH', 'AH0', 'L'],
  'herbs': ['ER1', 'B', 'Z'],

  // Hip-hop essentials
  'rap': ['R', 'AE1', 'P'],
  'cap': ['K', 'AE1', 'P'],
  'trap': ['T', 'R', 'AE1', 'P'],
  'clap': ['K', 'L', 'AE1', 'P'],
  'slap': ['S', 'L', 'AE1', 'P'],
  'snap': ['S', 'N', 'AE1', 'P'],
  'wrap': ['R', 'AE1', 'P'],
  'strap': ['S', 'T', 'R', 'AE1', 'P'],

  'spit': ['S', 'P', 'IH1', 'T'],
  'hit': ['HH', 'IH1', 'T'],
  'bit': ['B', 'IH1', 'T'],
  'fit': ['F', 'IH1', 'T'],
  'kit': ['K', 'IH1', 'T'],
  'wit': ['W', 'IH1', 'T'],
  'grit': ['G', 'R', 'IH1', 'T'],
  'split': ['S', 'P', 'L', 'IH1', 'T'],
  'quit': ['K', 'W', 'IH1', 'T'],
  'legit': ['L', 'AH0', 'JH', 'IH1', 'T'],
  'submit': ['S', 'AH0', 'B', 'M', 'IH1', 'T'],

  'bars': ['B', 'AA1', 'R', 'Z'],
  'cars': ['K', 'AA1', 'R', 'Z'],
  'stars': ['S', 'T', 'AA1', 'R', 'Z'],
  'scars': ['S', 'K', 'AA1', 'R', 'Z'],
  'jars': ['JH', 'AA1', 'R', 'Z'],
  'mars': ['M', 'AA1', 'R', 'Z'],

  'fire': ['F', 'AY1', 'ER0'],
  'wire': ['W', 'AY1', 'ER0'],
  'higher': ['HH', 'AY1', 'ER0'],
  'liar': ['L', 'AY1', 'ER0'],
  'buyer': ['B', 'AY1', 'ER0'],
  'desire': ['D', 'IH0', 'Z', 'AY1', 'ER0'],
  'empire': ['EH1', 'M', 'P', 'AY0', 'ER0'],
  'inspire': ['IH0', 'N', 'S', 'P', 'AY1', 'ER0'],

  'real': ['R', 'IY1', 'L'],
  'deal': ['D', 'IY1', 'L'],
  'feel': ['F', 'IY1', 'L'],
  'steal': ['S', 'T', 'IY1', 'L'],
  'heal': ['HH', 'IY1', 'L'],
  'reveal': ['R', 'IH0', 'V', 'IY1', 'L'],
  'appeal': ['AH0', 'P', 'IY1', 'L'],

  'cold': ['K', 'OW1', 'L', 'D'],
  'gold': ['G', 'OW1', 'L', 'D'],
  'bold': ['B', 'OW1', 'L', 'D'],
  'told': ['T', 'OW1', 'L', 'D'],
  'sold': ['S', 'OW1', 'L', 'D'],
  'hold': ['HH', 'OW1', 'L', 'D'],
  'old': ['OW1', 'L', 'D'],
  'unfold': ['AH0', 'N', 'F', 'OW1', 'L', 'D'],

  'soul': ['S', 'OW1', 'L'],
  'role': ['R', 'OW1', 'L'],
  'goal': ['G', 'OW1', 'L'],
  'hole': ['HH', 'OW1', 'L'],
  'whole': ['HH', 'OW1', 'L'],
  'control': ['K', 'AH0', 'N', 'T', 'R', 'OW1', 'L'],
  'patrol': ['P', 'AH0', 'T', 'R', 'OW1', 'L'],

  'game': ['G', 'EY1', 'M'],
  'name': ['N', 'EY1', 'M'],
  'fame': ['F', 'EY1', 'M'],
  'same': ['S', 'EY1', 'M'],
  'blame': ['B', 'L', 'EY1', 'M'],
  'flame': ['F', 'L', 'EY1', 'M'],
  'shame': ['SH', 'EY1', 'M'],
  'claim': ['K', 'L', 'EY1', 'M'],
  'frame': ['F', 'R', 'EY1', 'M'],
  'aim': ['EY1', 'M'],

  'mind': ['M', 'AY1', 'N', 'D'],
  'find': ['F', 'AY1', 'N', 'D'],
  'kind': ['K', 'AY1', 'N', 'D'],
  'blind': ['B', 'L', 'AY1', 'N', 'D'],
  'grind': ['G', 'R', 'AY1', 'N', 'D'],
  'behind': ['B', 'IH0', 'HH', 'AY1', 'N', 'D'],
  'remind': ['R', 'IY0', 'M', 'AY1', 'N', 'D'],
  'designed': ['D', 'IH0', 'Z', 'AY1', 'N', 'D'],

  'night': ['N', 'AY1', 'T'],
  'right': ['R', 'AY1', 'T'],
  'light': ['L', 'AY1', 'T'],
  'fight': ['F', 'AY1', 'T'],
  'sight': ['S', 'AY1', 'T'],
  'tight': ['T', 'AY1', 'T'],
  'might': ['M', 'AY1', 'T'],
  'white': ['W', 'AY1', 'T'],
  'write': ['R', 'AY1', 'T'],
  'bright': ['B', 'R', 'AY1', 'T'],
  'flight': ['F', 'L', 'AY1', 'T'],
  'ignite': ['IH0', 'G', 'N', 'AY1', 'T'],
  'tonight': ['T', 'AH0', 'N', 'AY1', 'T'],
  'delight': ['D', 'IH0', 'L', 'AY1', 'T'],

  'life': ['L', 'AY1', 'F'],
  'wife': ['W', 'AY1', 'F'],
  'knife': ['N', 'AY1', 'F'],
  'strife': ['S', 'T', 'R', 'AY1', 'F'],

  'head': ['HH', 'EH1', 'D'],
  'dead': ['D', 'EH1', 'D'],
  'said': ['S', 'EH1', 'D'],
  'bed': ['B', 'EH1', 'D'],
  'red': ['R', 'EH1', 'D'],
  'fed': ['F', 'EH1', 'D'],
  'led': ['L', 'EH1', 'D'],
  'spread': ['S', 'P', 'R', 'EH1', 'D'],
  'bread': ['B', 'R', 'EH1', 'D'],
  'dread': ['D', 'R', 'EH1', 'D'],
  'thread': ['TH', 'R', 'EH1', 'D'],
  'ahead': ['AH0', 'HH', 'EH1', 'D'],
  'instead': ['IH0', 'N', 'S', 'T', 'EH1', 'D'],

  'deep': ['D', 'IY1', 'P'],
  'keep': ['K', 'IY1', 'P'],
  'sleep': ['S', 'L', 'IY1', 'P'],
  'creep': ['K', 'R', 'IY1', 'P'],
  'steep': ['S', 'T', 'IY1', 'P'],
  'leap': ['L', 'IY1', 'P'],

  'world': ['W', 'ER1', 'L', 'D'],
  'girl': ['G', 'ER1', 'L'],
  'swirl': ['S', 'W', 'ER1', 'L'],
  'pearl': ['P', 'ER1', 'L'],
  'curl': ['K', 'ER1', 'L'],
  'hurl': ['HH', 'ER1', 'L'],

  'black': ['B', 'L', 'AE1', 'K'],
  'back': ['B', 'AE1', 'K'],
  'track': ['T', 'R', 'AE1', 'K'],
  'stack': ['S', 'T', 'AE1', 'K'],
  'crack': ['K', 'R', 'AE1', 'K'],
  'attack': ['AH0', 'T', 'AE1', 'K'],
  'pack': ['P', 'AE1', 'K'],
  'lack': ['L', 'AE1', 'K'],
  'smack': ['S', 'M', 'AE1', 'K'],
  'whack': ['W', 'AE1', 'K'],

  'raw': ['R', 'AO1'],
  'saw': ['S', 'AO1'],
  'law': ['L', 'AO1'],
  'jaw': ['JH', 'AO1'],
  'draw': ['D', 'R', 'AO1'],
  'flaw': ['F', 'L', 'AO1'],
  'claw': ['K', 'L', 'AO1'],
  'awe': ['AO1'],

  'skill': ['S', 'K', 'IH1', 'L'],
  'kill': ['K', 'IH1', 'L'],
  'will': ['W', 'IH1', 'L'],
  'still': ['S', 'T', 'IH1', 'L'],
  'fill': ['F', 'IH1', 'L'],
  'ill': ['IH1', 'L'],
  'bill': ['B', 'IH1', 'L'],
  'chill': ['CH', 'IH1', 'L'],
  'thrill': ['TH', 'R', 'IH1', 'L'],
  'drill': ['D', 'R', 'IH1', 'L'],
  'spill': ['S', 'P', 'IH1', 'L'],
  'grill': ['G', 'R', 'IH1', 'L'],

  'way': ['W', 'EY1'],
  'day': ['D', 'EY1'],
  'say': ['S', 'EY1'],
  'play': ['P', 'L', 'EY1'],
  'stay': ['S', 'T', 'EY1'],
  'pay': ['P', 'EY1'],
  'lay': ['L', 'EY1'],
  'ray': ['R', 'EY1'],
  'grey': ['G', 'R', 'EY1'],
  'slay': ['S', 'L', 'EY1'],
  'display': ['D', 'IH0', 'S', 'P', 'L', 'EY1'],
  'away': ['AH0', 'W', 'EY1'],
  'today': ['T', 'AH0', 'D', 'EY1'],
  'okay': ['OW2', 'K', 'EY1'],

  'man': ['M', 'AE1', 'N'],
  'can': ['K', 'AE1', 'N'],
  'plan': ['P', 'L', 'AE1', 'N'],
  'fan': ['F', 'AE1', 'N'],
  'ran': ['R', 'AE1', 'N'],
  'van': ['V', 'AE1', 'N'],
  'scan': ['S', 'K', 'AE1', 'N'],
  'span': ['S', 'P', 'AE1', 'N'],
  'ban': ['B', 'AE1', 'N'],

  'face': ['F', 'EY1', 'S'],
  'place': ['P', 'L', 'EY1', 'S'],
  'space': ['S', 'P', 'EY1', 'S'],
  'race': ['R', 'EY1', 'S'],
  'case': ['K', 'EY1', 'S'],
  'base': ['B', 'EY1', 'S'],
  'chase': ['CH', 'EY1', 'S'],
  'trace': ['T', 'R', 'EY1', 'S'],
  'grace': ['G', 'R', 'EY1', 'S'],
  'embrace': ['EH0', 'M', 'B', 'R', 'EY1', 'S'],
  'replace': ['R', 'IY0', 'P', 'L', 'EY1', 'S'],

  'thing': ['TH', 'IH1', 'NG'],
  'king': ['K', 'IH1', 'NG'],
  'ring': ['R', 'IH1', 'NG'],
  'bring': ['B', 'R', 'IH1', 'NG'],
  'sing': ['S', 'IH1', 'NG'],
  'swing': ['S', 'W', 'IH1', 'NG'],
  'string': ['S', 'T', 'R', 'IH1', 'NG'],
  'bling': ['B', 'L', 'IH1', 'NG'],
  'spring': ['S', 'P', 'R', 'IH1', 'NG'],
  'wing': ['W', 'IH1', 'NG'],

  'money': ['M', 'AH1', 'N', 'IY0'],
  'honey': ['HH', 'AH1', 'N', 'IY0'],
  'funny': ['F', 'AH1', 'N', 'IY0'],
  'sunny': ['S', 'AH1', 'N', 'IY0'],
  'bunny': ['B', 'AH1', 'N', 'IY0'],
  'runny': ['R', 'AH1', 'N', 'IY0'],

  'power': ['P', 'AW1', 'ER0'],
  'hour': ['AW1', 'ER0'],
  'tower': ['T', 'AW1', 'ER0'],
  'shower': ['SH', 'AW1', 'ER0'],
  'flower': ['F', 'L', 'AW1', 'ER0'],
  'devour': ['D', 'IH0', 'V', 'AW1', 'ER0'],

  'love': ['L', 'AH1', 'V'],
  'above': ['AH0', 'B', 'AH1', 'V'],
  'shove': ['SH', 'AH1', 'V'],
  'dove': ['D', 'AH1', 'V'],
  'glove': ['G', 'L', 'AH1', 'V'],

  'move': ['M', 'UW1', 'V'],
  'prove': ['P', 'R', 'UW1', 'V'],
  'groove': ['G', 'R', 'UW1', 'V'],
  'smooth': ['S', 'M', 'UW1', 'DH'],

  'true': ['T', 'R', 'UW1'],
  'through': ['TH', 'R', 'UW1'],
  'new': ['N', 'UW1'],
  'do': ['D', 'UW1'],
  'who': ['HH', 'UW1'],
  'blue': ['B', 'L', 'UW1'],
  'clue': ['K', 'L', 'UW1'],
  'crew': ['K', 'R', 'UW1'],
  'flew': ['F', 'L', 'UW1'],
  'grew': ['G', 'R', 'UW1'],
  'knew': ['N', 'UW1'],
  'view': ['V', 'Y', 'UW1'],
  'pursue': ['P', 'ER0', 'S', 'UW1'],

  'hand': ['HH', 'AE1', 'N', 'D'],
  'stand': ['S', 'T', 'AE1', 'N', 'D'],
  'land': ['L', 'AE1', 'N', 'D'],
  'band': ['B', 'AE1', 'N', 'D'],
  'brand': ['B', 'R', 'AE1', 'N', 'D'],
  'sand': ['S', 'AE1', 'N', 'D'],
  'grand': ['G', 'R', 'AE1', 'N', 'D'],
  'demand': ['D', 'IH0', 'M', 'AE1', 'N', 'D'],
  'expand': ['IH0', 'K', 'S', 'P', 'AE1', 'N', 'D'],
  'command': ['K', 'AH0', 'M', 'AE1', 'N', 'D'],
  'understand': ['AH2', 'N', 'D', 'ER0', 'S', 'T', 'AE1', 'N', 'D'],

  'end': ['EH1', 'N', 'D'],
  'friend': ['F', 'R', 'EH1', 'N', 'D'],
  'send': ['S', 'EH1', 'N', 'D'],
  'spend': ['S', 'P', 'EH1', 'N', 'D'],
  'bend': ['B', 'EH1', 'N', 'D'],
  'tend': ['T', 'EH1', 'N', 'D'],
  'blend': ['B', 'L', 'EH1', 'N', 'D'],
  'defend': ['D', 'IH0', 'F', 'EH1', 'N', 'D'],
  'pretend': ['P', 'R', 'IY0', 'T', 'EH1', 'N', 'D'],
  'offend': ['AH0', 'F', 'EH1', 'N', 'D'],
  'extend': ['IH0', 'K', 'S', 'T', 'EH1', 'N', 'D'],
  'transcend': ['T', 'R', 'AE0', 'N', 'S', 'EH1', 'N', 'D'],

  'ghost': ['G', 'OW1', 'S', 'T'],
  'most': ['M', 'OW1', 'S', 'T'],
  'post': ['P', 'OW1', 'S', 'T'],
  'host': ['HH', 'OW1', 'S', 'T'],
  'coast': ['K', 'OW1', 'S', 'T'],
  'toast': ['T', 'OW1', 'S', 'T'],
  'boast': ['B', 'OW1', 'S', 'T'],
  'roast': ['R', 'OW1', 'S', 'T'],

  'ink': ['IH1', 'NG', 'K'],
  'think': ['TH', 'IH1', 'NG', 'K'],
  'link': ['L', 'IH1', 'NG', 'K'],
  'drink': ['D', 'R', 'IH1', 'NG', 'K'],
  'sink': ['S', 'IH1', 'NG', 'K'],
  'pink': ['P', 'IH1', 'NG', 'K'],
  'blink': ['B', 'L', 'IH1', 'NG', 'K'],
  'brink': ['B', 'R', 'IH1', 'NG', 'K'],
  'stink': ['S', 'T', 'IH1', 'NG', 'K'],
  'shrink': ['SH', 'R', 'IH1', 'NG', 'K'],
};

/**
 * In-memory dictionary class
 */
export class PhoneticDictionary {
  private words: Map<string, PhoneticWord> = new Map();
  private byRhymeSuffix: Map<string, Set<string>> = new Map();

  constructor(data: DictionaryData = STARTER_DICT) {
    this.loadDictionary(data);
  }

  /**
   * Load dictionary data
   */
  loadDictionary(data: DictionaryData): void {
    for (const [word, phonemes] of Object.entries(data)) {
      const normalized = word.toLowerCase();
      const phoneticWord: PhoneticWord = {
        word: normalized,
        phonemes,
        syllableCount: countSyllables(phonemes),
      };
      this.words.set(normalized, phoneticWord);

      // Index by rhyme suffix (last 2-3 phonemes)
      const suffix = phonemes.slice(-3).join('-');
      if (!this.byRhymeSuffix.has(suffix)) {
        this.byRhymeSuffix.set(suffix, new Set());
      }
      this.byRhymeSuffix.get(suffix)!.add(normalized);
    }
  }

  /**
   * Look up a word
   */
  lookup(word: string): PhoneticWord | undefined {
    return this.words.get(word.toLowerCase());
  }

  /**
   * Check if word exists
   */
  has(word: string): boolean {
    return this.words.has(word.toLowerCase());
  }

  /**
   * Get all words
   */
  getAllWords(): PhoneticWord[] {
    return Array.from(this.words.values());
  }

  /**
   * Get word count
   */
  get size(): number {
    return this.words.size;
  }

  /**
   * Add a word to the dictionary
   */
  addWord(word: string, phonemes: string[]): void {
    const normalized = word.toLowerCase();
    const phoneticWord: PhoneticWord = {
      word: normalized,
      phonemes,
      syllableCount: countSyllables(phonemes),
    };
    this.words.set(normalized, phoneticWord);
  }
}

// Singleton instance with starter dictionary
export const dictionary = new PhoneticDictionary();
