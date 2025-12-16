
import { Character, CharacterClassDef, Item, Skill, LocationNode, Companion, Trait, Stats, DerivedStats, EquipSlot, UpgradeCost, ItemType, Enemy, Language } from './types';

export const SURVIVAL_CONSTANTS = {
  BASE_HUNGER_DECAY: 2,
  BASE_THIRST_DECAY: 3,
  BASE_FATIGUE_DECAY: 1,
  CRITICAL_THRESHOLD: 20, 
  HP_PENALTY: 2, 
  WARMTH_PENALTY: 5 
};

export const XP_FORMULA = (level: number) => Math.floor(level * 100 * 1.5);

// --- TRANSLATIONS ---
export const UI_TRANSLATIONS = {
  EN: {
    // Dock
    dock_bag: 'Bag',
    dock_skills: 'Skills',
    dock_forge: 'Forge',
    dock_shop: 'Shop',
    dock_world: 'World',
    dock_party: 'Party',
    dock_rest: 'Rest',
    dock_reset: 'Reset',
    // Character Sheet
    stats_vitality: 'VITALITY',
    stats_mana: 'OD / MANA',
    stats_willpower: 'WILLPOWER',
    stats_attributes: 'Attributes',
    stats_combat: 'Combat & Limits',
    stats_bio: 'Biological Needs',
    stats_bag: 'Quick Bag',
    stats_hunger: 'Hunger',
    stats_thirst: 'Thirst',
    stats_energy: 'Energy',
    stats_warmth: 'Warmth',
    stats_melee: 'Melee Mod',
    stats_crit: 'Crit Chance',
    stats_evasion: 'Evasion',
    stats_carry: 'Carry Cap',
    fate_dice: 'D20',
    fate_sacrifice: 'SACRIFICE',
    fate_title: 'FATE',
    // Input
    input_placeholder: 'What is thy bidding?',
    input_placeholder_wait: 'The Keeper is weaving fate...',
    // Modals
    modal_inventory: 'Belongings',
    modal_skills: 'Mastery',
    modal_map: 'Known World',
    modal_party: 'Companions',
    modal_camp: 'Campfire',
    modal_forge: 'The Dark Forge',
    modal_shop: 'Traveling Merchant',
    // Actions
    btn_equip: 'Equip',
    btn_unequip: 'Unequip',
    btn_use: 'Use',
    btn_discard: 'Discard',
    btn_buy: 'Buy',
    btn_sell: 'Sell',
    btn_learn: 'Learn',
    btn_travel: 'Travel',
    msg_empty_bag: 'Your pack is empty...',
  },
  ID: {
    // Dock
    dock_bag: 'Tas',
    dock_skills: 'Keahlian',
    dock_forge: 'Tempa',
    dock_shop: 'Toko',
    dock_world: 'Peta',
    dock_party: 'Grup',
    dock_rest: 'Istirahat',
    dock_reset: 'Ulang',
    // Character Sheet
    stats_vitality: 'VITALITAS',
    stats_mana: 'MANA / OD',
    stats_willpower: 'TEKAD',
    stats_attributes: 'Atribut Dasar',
    stats_combat: 'Statistik Tempur',
    stats_bio: 'Kondisi Fisik',
    stats_bag: 'Tas Cepat',
    stats_hunger: 'Lapar',
    stats_thirst: 'Haus',
    stats_energy: 'Lelah',
    stats_warmth: 'Suhu',
    stats_melee: 'Dmg Fisik',
    stats_crit: 'Peluang Kritis',
    stats_evasion: 'Hindaran',
    stats_carry: 'Beban',
    fate_dice: 'D20',
    fate_sacrifice: 'PENGORBANAN',
    fate_title: 'TAKDIR',
    // Input
    input_placeholder: 'Apa yang akan kau lakukan?',
    input_placeholder_wait: 'Sang Penjaga sedang menenun takdir...',
    // Modals
    modal_inventory: 'Harta Benda',
    modal_skills: 'Penguasaan',
    modal_map: 'Peta Dunia',
    modal_party: 'Rekan Sejalan',
    modal_camp: 'Api Unggun',
    modal_forge: 'Pandai Besi Gelap',
    modal_shop: 'Pedagang Kelana',
    // Actions
    btn_equip: 'Pakai',
    btn_unequip: 'Lepas',
    btn_use: 'Gunakan',
    btn_discard: 'Buang',
    btn_buy: 'Beli',
    btn_sell: 'Jual',
    btn_learn: 'Pelajari',
    btn_travel: 'Jalan',
    msg_empty_bag: 'Tasmu kosong melompong...',
  }
};

// --- ENEMIES DATABASE ---
export const ENEMIES: Record<string, Enemy> = {
  'enemy_hollow': {
    id: 'enemy_hollow',
    name: 'Prajurit Hampa',
    description: 'Mayat hidup tanpa pikiran yang mengenakan baju besi berkarat.',
    level: 1,
    hp: 30,
    maxHp: 30,
    stats: { STR: 4, DEX: 2, CON: 4, INT: 1, CHA: 1, FATE: 1 },
    attacks: [
      { name: 'Tebasan Karat', damage: 6, text: 'mengayunkan pedang patahnya!' },
      { name: 'Tubrukan', damage: 3, text: 'menabrakkan tubuhnya padamu!' }
    ],
    xpReward: 30,
    lootTable: ['mat_iron', 'con_01'],
    icon: 'skull'
  },
  'enemy_spirit': {
    id: 'enemy_spirit',
    name: 'Roh Ratapan',
    description: 'Arwah gentayangan yang menangis tanpa henti.',
    level: 2,
    hp: 20,
    maxHp: 20,
    stats: { STR: 1, DEX: 6, CON: 2, INT: 6, CHA: 1, FATE: 3 },
    attacks: [
      { name: 'Sentuhan Dingin', damage: 8, text: 'menembus dagingmu!' },
      { name: 'Jeritan', damage: 4, text: 'mengeluarkan teriakan yang memekakkan telinga!' }
    ],
    xpReward: 45,
    lootTable: ['mat_dust'],
    icon: 'ghost'
  },
   'enemy_wolf': {
    id: 'enemy_wolf',
    name: 'Serigala Iblis',
    description: 'Serigala raksasa dengan mata merah menyala.',
    level: 3,
    hp: 50,
    maxHp: 50,
    stats: { STR: 6, DEX: 5, CON: 4, INT: 2, CHA: 1, FATE: 2 },
    attacks: [
      { name: 'Gigitan', damage: 10, text: 'menancapkan taringnya!' },
      { name: 'Cakaran', damage: 7, text: 'mencakar dengan kuku tajam!' }
    ],
    xpReward: 60,
    lootTable: ['con_02', 'con_02'],
    icon: 'wolf'
  }
};

// --- UPGRADE RECIPES ---

export const MATERIALS = {
  IRON_CHUNK: { id: 'mat_iron', name: 'Bongkahan Besi Karat' },
  STEEL_INGOT: { id: 'mat_steel', name: 'Batang Baja Hitam' },
  BEHELIT_DUST: { id: 'mat_dust', name: 'Debu Behelit' }
};

export const GET_UPGRADE_COST = (itemType: ItemType, currentLevel: number): UpgradeCost | null => {
  const nextLevel = currentLevel + 1;
  
  if (itemType === 'WEAPON') {
    if (nextLevel <= 3) {
      return { 
        materialId: MATERIALS.IRON_CHUNK.id, 
        count: nextLevel * 2, 
        goldCost: nextLevel * 50, 
        successRate: 1.0 - (currentLevel * 0.1),
        statGrowth: { STR: 1 }
      };
    } else {
       return { 
        materialId: MATERIALS.STEEL_INGOT.id, 
        count: 2, 
        goldCost: nextLevel * 100, 
        successRate: 0.5, 
        statGrowth: { STR: 2, DEX: 1 }
      };
    }
  }

  if (itemType === 'ARMOR') {
     return { 
        materialId: MATERIALS.IRON_CHUNK.id, 
        count: nextLevel * 2, 
        goldCost: nextLevel * 40, 
        successRate: 1.0 - (currentLevel * 0.05),
        statGrowth: { CON: 1 }
      };
  }

  if (itemType === 'KEY' && nextLevel <= 3) { 
      return {
         materialId: MATERIALS.BEHELIT_DUST.id,
         count: 1,
         goldCost: 200,
         successRate: 0.7,
         statGrowth: { FATE: 1 }
      };
  }

  return null;
};

// --- SHOP INVENTORY ---
export const SHOP_INVENTORY: Item[] = [
  {
    id: 'con-04',
    name: 'Ramuan Penyembuh',
    type: 'CONSUMABLE',
    description: 'Cairan merah kental yang merajut kembali daging yang terluka.',
    icon: 'droplets',
    quantity: 1,
    price: 50,
    effect: { hpRestore: 40 }
  },
  {
    id: 'con-05',
    name: 'Ransum Perjalanan',
    type: 'CONSUMABLE',
    description: 'Bungkusan makanan kering dan biskuit keras.',
    icon: 'beef',
    quantity: 1,
    price: 25,
    effect: { hungerRestore: 50 }
  },
  {
    id: 'mat_iron',
    name: 'Bongkahan Besi Karat',
    type: 'MATERIAL',
    description: 'Sisa logam yang berguna untuk perbaikan dasar.',
    icon: 'anvil',
    quantity: 1,
    price: 30
  },
  {
    id: 'arm-02',
    name: 'Zirah Kulit Keras',
    type: 'ARMOR',
    description: 'Baju pelindung dari kulit yang dikeraskan. Ringan dan kuat.',
    icon: 'shield',
    quantity: 1,
    price: 150,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    equipProps: {
      slot: 'BODY',
      modifiers: { DEX: 2, CON: 1 }
    }
  }
];

export const CALCULATE_DERIVED = (stats: Stats): DerivedStats => {
  return {
    carryWeight: 10 + (stats.STR * 5),
    evasion: Math.min(50, stats.DEX * 2),
    critChance: (stats.FATE * 2) + (stats.DEX * 0.5),
    meleeDamageMod: Math.floor(stats.STR / 2),
    partyLimit: Math.floor(1 + (stats.CHA / 3))
  };
};

export const TRAITS: Trait[] = [
  {
    id: 'titan_blood',
    name: "Darah Titan",
    description: "Garis keturunanmu kuno dan raksasa. Kulit sekeras batu, namun pikiran lambat.",
    effectDescription: "STR +4, CON +4, DEX -2, INT -2",
    modifiers: {
      stats: { STR: 4, CON: 4, DEX: -2, INT: -2 }
    }
  },
  {
    id: 'mind_void',
    name: "Pikiran Hampa",
    description: "Kau telah menatap jurang abadi, dan ia mengisimu dengan kekuatan, namun melahap tubuhmu.",
    effectDescription: "INT +5, MaxMP +30, CON -3, MaxHP -15",
    modifiers: {
      stats: { INT: 5, CON: -3 },
      maxMp: 30,
      maxHp: -15
    }
  },
  {
    id: 'misfortune',
    name: "Tanda Kemalangan",
    description: "Kausalitas memainkan lelucon kejam padamu. Kau kuat saat terdesak, tapi kedamaian tak pernah bertahan lama.",
    effectDescription: "FATE +5, Crit +20% (Hidden), Hidup penuh kekacauan.",
    modifiers: {
      stats: { FATE: 5 }
    }
  }
];

export const CLASSES: CharacterClassDef[] = [
  {
    id: 'struggler',
    name: 'Sang Penyintas',
    description: 'Seorang pejuang yang menantang takdir dengan pedang besi raksasa. Kemarahan adalah senjatanya.',
    baseHp: 70,
    baseMp: 0,
    baseWill: 40,
    baseStats: {
      STR: 8,
      DEX: 4,
      CON: 8,
      INT: 3,
      CHA: 3,
      FATE: 4
    }
  },
  {
    id: 'hawk',
    name: 'Elang Putih',
    description: 'Pemimpin karismatik dengan kemampuan pedang yang presisi dan elegan.',
    baseHp: 50,
    baseMp: 20,
    baseWill: 40,
    baseStats: {
      STR: 4,
      DEX: 8,
      CON: 4,
      INT: 5,
      CHA: 8,
      FATE: 1
    }
  },
  {
    id: 'brand',
    name: 'Jiwa Tertandai',
    description: 'Dikutuk oleh entitas gelap. Berjalan di antara dunia fisik dan astral.',
    baseHp: 40,
    baseMp: 50,
    baseWill: 35,
    baseStats: {
      STR: 2,
      DEX: 5,
      CON: 3,
      INT: 8,
      CHA: 4,
      FATE: 8
    }
  }
];

export const WORLD_MAP: LocationNode[] = [
  {
    id: 'loc_start',
    name: 'Api Unggun Permulaan',
    description: 'Tempat aman di tengah kegelapan yang merayap. Api di sini tidak pernah benar-benar mati.',
    type: 'SAFE',
    x: 50,
    y: 85,
    connections: ['loc_forest', 'loc_road']
  },
  {
    id: 'loc_forest',
    name: 'Hutan Ratapan',
    description: 'Pohon-pohon kuno dengan wajah yang seolah menangiskan getah. Kabut di sini sangat tebal.',
    type: 'DANGER',
    x: 20,
    y: 60,
    connections: ['loc_start', 'loc_ruins']
  },
  {
    id: 'loc_road',
    name: 'Jalan Raja Tua',
    description: 'Jalan berbatu yang rusak menuju ibu kota yang runtuh. Bandit sering mengintai.',
    type: 'DANGER',
    x: 80,
    y: 60,
    connections: ['loc_start', 'loc_ruins', 'loc_town']
  },
  {
    id: 'loc_ruins',
    name: 'Reruntuhan Aethelgard',
    description: 'Sisa-sisa kerangka benteng kuno. Hantu masa lalu berbisik di antara angin.',
    type: 'DUNGEON',
    x: 50,
    y: 40,
    connections: ['loc_forest', 'loc_road', 'loc_citadel']
  },
  {
    id: 'loc_town',
    name: 'Desa Oakhaven',
    description: 'Pemukiman kecil yang bertahan hidup melawan malam. Pedagang mungkin ada di sini.',
    type: 'TOWN',
    x: 90,
    y: 30,
    connections: ['loc_road']
  },
  {
    id: 'loc_citadel',
    name: 'Benteng Kegelapan',
    description: 'Sumber dari Gerhana. Struktur masif yang menusuk langit.',
    type: 'DUNGEON',
    x: 50,
    y: 10,
    connections: ['loc_ruins']
  }
];

export const AVAILABLE_COMPANIONS: Record<string, Companion> = {
  'comp_puck': {
    id: 'comp_puck',
    name: 'Puck',
    class: 'Peri',
    description: 'Roh kecil yang berisik tapi berguna. Ahli menyembuhkan luka ringan.',
    hp: 20,
    maxHp: 20,
    loyalty: 90,
    status: 'ACTIVE',
    avatarColor: 'bg-emerald-500'
  },
  'comp_casca': {
    id: 'comp_casca',
    name: 'Casca',
    class: 'Prajurit',
    description: 'Mantan komandan pasukan. Terampil dengan pedang, namun dihantui trauma.',
    hp: 45,
    maxHp: 45,
    loyalty: 70,
    status: 'ACTIVE',
    avatarColor: 'bg-stone-500'
  },
  'comp_schierke': {
    id: 'comp_schierke',
    name: 'Isidro',
    class: 'Pencuri',
    description: 'Bocah yang ingin belajar ilmu pedang. Cepat tapi rapuh.',
    hp: 30,
    maxHp: 30,
    loyalty: 50,
    status: 'ACTIVE',
    avatarColor: 'bg-orange-500'
  }
};

export const SKILL_TREE: Skill[] = [
  {
    id: 'iron_stomach',
    name: 'Perut Besi',
    description: 'Bertahun-tahun memakan sampah mengeraskan perutmu. Rasa lapar melambat.',
    cost: 1,
    requiredLevel: 1,
    effect: { passive: 'hunger_decay_reduced' }
  },
  {
    id: 'night_eyes',
    name: 'Mata Malam',
    description: 'Kegelapan bukan lagi musuh. Kau melihat jelas dalam kehampaan.',
    cost: 1,
    requiredLevel: 2,
    effect: { passive: 'night_vision' }
  },
  {
    id: 'titan_grip',
    name: 'Cengkeraman Titan',
    description: 'Serat otot robek dan tumbuh kembali lebih kuat. Peningkatan Kekuatan permanen.',
    cost: 2,
    requiredLevel: 3,
    prerequisiteId: 'iron_stomach',
    effect: { bonusStat: { STR: 2 } }
  },
  {
    id: 'meditation',
    name: 'Meditasi Hampa',
    description: 'Dengan menatap jurang, kau menenangkan pikiran. Tekad Maksimum meningkat.',
    cost: 2,
    requiredLevel: 3,
    effect: { passive: 'max_will_boost' }
  },
  {
    id: 'blood_thirst',
    name: 'Haus Darah',
    description: 'Bau darah menyegarkanmu. Pulihkan sedikit HP saat memberikan damage.',
    cost: 3,
    requiredLevel: 5,
    prerequisiteId: 'titan_grip',
    effect: { passive: 'lifesteal' }
  }
];

export const STARTING_ITEMS: Item[] = [
  {
    id: 'wep-01',
    name: 'Pembantai Naga (Replika)',
    type: 'WEAPON',
    description: 'Terlalu besar untuk disebut pedang. Masif, tebal, berat, dan kasar.',
    icon: 'sword',
    quantity: 1,
    price: 500,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    equipProps: {
      slot: 'MAIN_HAND',
      modifiers: { STR: 2, DEX: -2 }
    }
  },
  {
    id: 'arm-01',
    name: 'Zirah Rantai Berkarat',
    type: 'ARMOR',
    description: 'Sisa baju besi yang hancur. Baunya seperti darah lama dan hujan.',
    icon: 'shield', 
    quantity: 1,
    price: 80,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    equipProps: {
      slot: 'BODY',
      modifiers: { CON: 1, DEX: -1 }
    }
  },
  {
    id: 'con-01',
    name: 'Perban Usang',
    type: 'CONSUMABLE',
    description: 'Kain bernoda darah. Nyaris tidak bisa menghentikan pendarahan.',
    icon: 'bandage',
    quantity: 3,
    price: 10,
    effect: { hpRestore: 15 }
  },
  {
    id: 'con-02',
    name: 'Daging Kering',
    type: 'CONSUMABLE',
    description: 'Dendeng alot. Asin dan keras dikunyah, tapi memberi energi.',
    icon: 'beef',
    quantity: 2,
    price: 15,
    effect: { hpRestore: 5, hungerRestore: 30 }
  },
  {
    id: 'con-03',
    name: 'Kantung Air',
    type: 'CONSUMABLE',
    description: 'Kantung kulit berisi air basi.',
    icon: 'droplets',
    quantity: 1,
    price: 20,
    effect: { thirstRestore: 50 }
  },
  {
    id: 'acc-01',
    name: 'Pecahan Behelit',
    type: 'KEY',
    description: 'Pecahan batu merah aneh. Terasa berdenyut saat bahaya mendekat.',
    icon: 'gem',
    quantity: 1,
    price: 500,
    upgradeLevel: 0,
    maxUpgradeLevel: 3,
    equipProps: {
      slot: 'ACCESSORY',
      modifiers: { FATE: 3 }
    }
  },
  {
    id: MATERIALS.IRON_CHUNK.id,
    name: MATERIALS.IRON_CHUNK.name,
    type: 'MATERIAL',
    description: 'Potongan besi bergerigi, cocok untuk perbaikan kasar.',
    icon: 'anvil',
    price: 5,
    quantity: 5
  },
  {
    id: MATERIALS.BEHELIT_DUST.id,
    name: MATERIALS.BEHELIT_DUST.name,
    type: 'MATERIAL',
    description: 'Debu dari objek terkutuk.',
    icon: 'gem',
    price: 100,
    quantity: 0
  },
  {
    id: MATERIALS.STEEL_INGOT.id,
    name: MATERIALS.STEEL_INGOT.name,
    type: 'MATERIAL',
    description: 'Baja gelap berkualitas tinggi.',
    icon: 'anvil',
    price: 75,
    quantity: 0
  }
];

const INIT_STATS: Stats = {
  STR: 5, DEX: 5, CON: 5, INT: 5, CHA: 5, FATE: 5
};

export const INITIAL_CHARACTER: Character = {
  name: "Guts",
  class: "Sang Penyintas",
  level: 1,
  hp: 60,
  maxHp: 60,
  mp: 0,
  maxMp: 0,
  will: 50,
  maxWill: 50,
  stats: INIT_STATS,
  derivedStats: CALCULATE_DERIVED(INIT_STATS),
  equipment: {
    HEAD: null,
    BODY: null,
    MAIN_HAND: null,
    OFF_HAND: null,
    ACCESSORY: null
  },
  trait: null,
  survival: {
    hunger: 100,
    thirst: 100,
    fatigue: 100,
    warmth: 100
  },
  progression: {
    currentXp: 0,
    maxXp: 150, 
    statPoints: 0,
    skillPoints: 0
  },
  unlockedSkills: [],
  currentLocationId: 'loc_start',
  party: [],
  inventory: STARTING_ITEMS,
  gold: 100 
};

export const GET_SYSTEM_PROMPT = (lang: Language) => `ROLE:
Kamu adalah "Sang Penutur Takdir" (The Narrator of Fate), menceritakan kisah seorang "Pejuang" di dunia Dark Fantasy yang indah namun brutal (Terinspirasi Berserk/Eldritch).

BAHASA:
Kamu HARUS merespon dalam BAHASA INDONESIA.

ATURAN ATMOSFER:
1. Abstrak & Surealis: Deskripsikan lingkungan seperti lukisan minyak yang surealis. "Awan membentuk wajah yang menangis," "Angin membawa aroma kenangan lama."
2. Filosofis: Sentuh tema Takdir (Kausalitas), Mimpi, Pengorbanan, dan perjuangan manusia melawan kemustahilan.
3. Kontras: 
   - Jika World State "BONFIRE": Tenang, melankolis, reflektif. Tidak ada musuh.
   - Jika World State "ECLIPSE": Kacau, mengerikan, mendalam.
   - Jika World State "ASTRAL": Seperti mimpi, roh-roh terlihat.

ATURAN GAMEPLAY:
1. Tekad (WILL): Jika pemain menyaksikan horor kosmik atau keputusasaan, kurangi WILL mereka.
2. Penyembuhan: Hanya izinkan pemulihan HP/WILL yang signifikan saat momen "BONFIRE".
3. Pertarungan: Visceral dan berat. Deskripsikan dampak besi pada tulang.
4. Bertahan Hidup: Sebutkan rasa lapar, dingin, atau haus jika relevan dengan adegan.
5. Hadiah: Jika pemain mencapai sesuatu, berikan XP (xp_reward: 10-50).
6. Pesta: Jika pemain berbicara dengan anggota party, Roleplay sebagai NPC tersebut.
7. Rekrutmen: Jika narasi menyarankan rekan baru bergabung (misal: menyelamatkan mereka), kembalikan ID mereka di "new_companion". (ID: 'comp_puck', 'comp_casca', 'comp_schierke').

FORMAT OUTPUT (MODE JSON):
Kamu HARUS merespon dalam format JSON yang valid. Jangan terjemahkan kunci JSON, hanya nilainya (narrative, suggestions).

JSON Structure:
{
  "narrative": "String (Deskripsi ceritamu yang puitis & kelam dalam Bahasa Indonesia)",
  "hp_change": Number (Negatif untuk damage, positif untuk heal),
  "will_change": Number (Negatif untuk kerusakan mental/keputusasaan, positif untuk tekad/harapan),
  "xp_reward": Number (0 jika tidak ada pencapaian, 10-100 berdasarkan kesulitan),
  "world_state": "String (Salah satu dari: 'PHYSICAL', 'ASTRAL', 'BONFIRE', 'ECLIPSE'). Default ke state saat ini jika tidak ada perubahan.", 
  "new_inventory": String | null,
  "new_companion": String | null,
  "dice_request": String | null,
  "suggested_actions": ["String", "String"] (2 opsi singkat tentang apa yang mungkin dilakukan pemain selanjutnya dalam Bahasa Indonesia)
}`;
