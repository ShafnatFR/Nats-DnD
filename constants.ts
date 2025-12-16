
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
    name: { EN: "Hollow Soldier", ID: "Prajurit Hampa" },
    description: { EN: "A mindless husk clad in rusting armor.", ID: "Mayat hidup tanpa pikiran yang mengenakan baju besi berkarat." },
    level: 1,
    hp: 30,
    maxHp: 30,
    stats: { STR: 4, DEX: 2, CON: 4, INT: 1, CHA: 1, FATE: 1 },
    attacks: [
      { name: 'Slash', damage: 6, text: { EN: 'swings a broken blade!', ID: 'mengayunkan pedang patahnya!' } },
      { name: 'Tackle', damage: 3, text: { EN: 'throws its body weight at you!', ID: 'menabrakkan tubuhnya padamu!' } }
    ],
    xpReward: 30,
    lootTable: ['mat_iron', 'con_01'],
    icon: 'skull'
  },
  'enemy_spirit': {
    id: 'enemy_spirit',
    name: { EN: "Weeping Spirit", ID: "Roh Ratapan" },
    description: { EN: "A floating apparition sobbing uncontrollably.", ID: "Arwah gentayangan yang menangis tanpa henti." },
    level: 2,
    hp: 20,
    maxHp: 20,
    stats: { STR: 1, DEX: 6, CON: 2, INT: 6, CHA: 1, FATE: 3 },
    attacks: [
      { name: 'Chilling Touch', damage: 8, text: { EN: 'passes through your flesh!', ID: 'menembus dagingmu!' } },
      { name: 'Scream', damage: 4, text: { EN: 'unleashes a deafening wail!', ID: 'mengeluarkan teriakan yang memekakkan telinga!' } }
    ],
    xpReward: 45,
    lootTable: ['mat_dust'],
    icon: 'ghost'
  },
   'enemy_wolf': {
    id: 'enemy_wolf',
    name: { EN: "Dire Wolf", ID: "Serigala Iblis" },
    description: { EN: "A massive wolf with burning red eyes.", ID: "Serigala raksasa dengan mata merah menyala." },
    level: 3,
    hp: 50,
    maxHp: 50,
    stats: { STR: 6, DEX: 5, CON: 4, INT: 2, CHA: 1, FATE: 2 },
    attacks: [
      { name: 'Bite', damage: 10, text: { EN: 'sinks its fangs into you!', ID: 'menancapkan taringnya!' } },
      { name: 'Claw', damage: 7, text: { EN: 'rakes with sharp claws!', ID: 'mencakar dengan kuku tajam!' } }
    ],
    xpReward: 60,
    lootTable: ['con_02', 'con_02'],
    icon: 'wolf'
  }
};

// --- UPGRADE RECIPES ---

export const MATERIALS = {
  IRON_CHUNK: { id: 'mat_iron', name: { EN: 'Rusted Iron Chunk', ID: 'Bongkahan Besi Karat' } },
  STEEL_INGOT: { id: 'mat_steel', name: { EN: 'Dark Steel Ingot', ID: 'Batang Baja Hitam' } },
  BEHELIT_DUST: { id: 'mat_dust', name: { EN: 'Behelit Dust', ID: 'Debu Behelit' } }
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
    name: { EN: 'Healing Potion', ID: 'Ramuan Penyembuh' },
    type: 'CONSUMABLE',
    description: { EN: 'A vial of red liquid that knits flesh back together.', ID: 'Cairan merah kental yang merajut kembali daging yang terluka.' },
    icon: 'droplets',
    quantity: 1,
    price: 50,
    effect: { hpRestore: 40 }
  },
  {
    id: 'con-05',
    name: { EN: 'Rations', ID: 'Ransum Perjalanan' },
    type: 'CONSUMABLE',
    description: { EN: 'A standard pack of dried food and biscuit.', ID: 'Bungkusan makanan kering dan biskuit keras.' },
    icon: 'beef',
    quantity: 1,
    price: 25,
    effect: { hungerRestore: 50 }
  },
  {
    id: 'mat_iron',
    name: MATERIALS.IRON_CHUNK.name,
    type: 'MATERIAL',
    description: { EN: 'Scrap metal useful for basic repairs.', ID: 'Sisa logam yang berguna untuk perbaikan dasar.' },
    icon: 'anvil',
    quantity: 1,
    price: 30
  },
  {
    id: 'arm-02',
    name: { EN: 'Leather Cuirass', ID: 'Zirah Kulit Keras' },
    type: 'ARMOR',
    description: { EN: 'Hardened leather armor. Light and durable.', ID: 'Baju pelindung dari kulit yang dikeraskan. Ringan dan kuat.' },
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
    name: { EN: "Titan's Blood", ID: "Darah Titan" },
    description: { EN: "Your lineage is ancient and giant. Skin hard as rock, but mind slow as stone.", ID: "Garis keturunanmu kuno dan raksasa. Kulit sekeras batu, namun pikiran lambat." },
    effectDescription: "STR +4, CON +4, DEX -2, INT -2",
    modifiers: {
      stats: { STR: 4, CON: 4, DEX: -2, INT: -2 }
    }
  },
  {
    id: 'mind_void',
    name: { EN: "Mind of the Void", ID: "Pikiran Hampa" },
    description: { EN: "You have stared into the abyss, and it filled you with power, consuming your frail body.", ID: "Kau telah menatap jurang abadi, dan ia mengisimu dengan kekuatan, namun melahap tubuhmu." },
    effectDescription: "INT +5, MaxMP +30, CON -3, MaxHP -15",
    modifiers: {
      stats: { INT: 5, CON: -3 },
      maxMp: 30,
      maxHp: -15
    }
  },
  {
    id: 'misfortune',
    name: { EN: "Mark of Misfortune", ID: "Tanda Kemalangan" },
    description: { EN: "Causality plays cruel jokes on you. You strike true when desperate, but peace never lasts.", ID: "Kausalitas memainkan lelucon kejam padamu. Kau kuat saat terdesak, tapi kedamaian tak pernah bertahan lama." },
    effectDescription: "FATE +5, Crit +20% (Hidden), Events are chaotic.",
    modifiers: {
      stats: { FATE: 5 }
    }
  }
];

export const CLASSES: CharacterClassDef[] = [
  {
    id: 'struggler',
    name: { EN: "The Struggler", ID: "Sang Penyintas" },
    description: { EN: "A survivor who defies fate with a colossal iron blade. Rage is their weapon.", ID: "Seorang pejuang yang menantang takdir dengan pedang besi raksasa. Kemarahan adalah senjatanya." },
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
    name: { EN: "White Hawk", ID: "Elang Putih" },
    description: { EN: "A charismatic leader wielding a saber with surgical precision. Elegant and deadly.", ID: "Pemimpin karismatik dengan kemampuan pedang yang presisi dan elegan." },
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
    name: { EN: "Branded Soul", ID: "Jiwa Tertandai" },
    description: { EN: "Cursed by dark entities. Walks between the physical and astral worlds.", ID: "Dikutuk oleh entitas gelap. Berjalan di antara dunia fisik dan astral." },
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
    name: { EN: "Campfire of Beginnings", ID: "Api Unggun Permulaan" },
    description: { EN: "A safe haven amidst the encroaching dark. The fire never truly dies here.", ID: "Tempat aman di tengah kegelapan yang merayap. Api di sini tidak pernah benar-benar mati." },
    type: 'SAFE',
    x: 50,
    y: 85,
    connections: ['loc_forest', 'loc_road']
  },
  {
    id: 'loc_forest',
    name: { EN: "The Weeping Woods", ID: "Hutan Ratapan" },
    description: { EN: "Ancient trees with faces that seem to cry sap. The fog is thick here.", ID: "Pohon-pohon kuno dengan wajah yang seolah menangiskan getah. Kabut di sini sangat tebal." },
    type: 'DANGER',
    x: 20,
    y: 60,
    connections: ['loc_start', 'loc_ruins']
  },
  {
    id: 'loc_road',
    name: { EN: "Old King's Road", ID: "Jalan Raja Tua" },
    description: { EN: "A broken cobblestone path leading to the fallen capital. Bandits lurk.", ID: "Jalan berbatu yang rusak menuju ibu kota yang runtuh. Bandit sering mengintai." },
    type: 'DANGER',
    x: 80,
    y: 60,
    connections: ['loc_start', 'loc_ruins', 'loc_town']
  },
  {
    id: 'loc_ruins',
    name: { EN: "Ruins of Aethelgard", ID: "Reruntuhan Aethelgard" },
    description: { EN: "The skeletal remains of a fortress. Ghosts of the past whisper in the wind.", ID: "Sisa-sisa kerangka benteng kuno. Hantu masa lalu berbisik di antara angin." },
    type: 'DUNGEON',
    x: 50,
    y: 40,
    connections: ['loc_forest', 'loc_road', 'loc_citadel']
  },
  {
    id: 'loc_town',
    name: { EN: "Hamlet of Oakhaven", ID: "Desa Oakhaven" },
    description: { EN: "A small settlement barely holding on against the night. Traders might be found here.", ID: "Pemukiman kecil yang bertahan hidup melawan malam. Pedagang mungkin ada di sini." },
    type: 'TOWN',
    x: 90,
    y: 30,
    connections: ['loc_road']
  },
  {
    id: 'loc_citadel',
    name: { EN: "The Dark Citadel", ID: "Benteng Kegelapan" },
    description: { EN: "The source of the Eclipse. A massive structure piercing the sky.", ID: "Sumber dari Gerhana. Struktur masif yang menusuk langit." },
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
    class: 'Fairy',
    description: { EN: "A small, annoying, but helpful spirit. Great at healing light wounds.", ID: "Roh kecil yang berisik tapi berguna. Ahli menyembuhkan luka ringan." },
    hp: 20,
    maxHp: 20,
    loyalty: 90,
    status: 'ACTIVE',
    avatarColor: 'bg-emerald-500'
  },
  'comp_casca': {
    id: 'comp_casca',
    name: 'Casca',
    class: 'Warrior',
    description: { EN: "A former commander. Skilled with a sword, but haunted by trauma.", ID: "Mantan komandan pasukan. Terampil dengan pedang, namun dihantui trauma." },
    hp: 45,
    maxHp: 45,
    loyalty: 70,
    status: 'ACTIVE',
    avatarColor: 'bg-stone-500'
  },
  'comp_isidro': {
    id: 'comp_isidro',
    name: 'Isidro',
    class: 'Thief',
    description: { EN: "A young boy wanting to learn swordsmanship. Fast but fragile.", ID: "Bocah yang ingin belajar ilmu pedang. Cepat tapi rapuh." },
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
    name: { EN: "Iron Stomach", ID: "Perut Besi" },
    description: { EN: "Years of scavenging have hardened your gut. Hunger grows slower.", ID: "Bertahun-tahun memakan sampah mengeraskan perutmu. Rasa lapar melambat." },
    cost: 1,
    requiredLevel: 1,
    effect: { passive: 'hunger_decay_reduced' }
  },
  {
    id: 'night_eyes',
    name: { EN: "Night Eyes", ID: "Mata Malam" },
    description: { EN: "The darkness is no longer an enemy. You see clearly in the void.", ID: "Kegelapan bukan lagi musuh. Kau melihat jelas dalam kehampaan." },
    cost: 1,
    requiredLevel: 2,
    effect: { passive: 'night_vision' }
  },
  {
    id: 'titan_grip',
    name: { EN: "Titan Grip", ID: "Cengkeraman Titan" },
    description: { EN: "Muscle fibers tear and rebuild stronger. Permanent Strength increase.", ID: "Serat otot robek dan tumbuh kembali lebih kuat. Peningkatan Kekuatan permanen." },
    cost: 2,
    requiredLevel: 3,
    prerequisiteId: 'iron_stomach',
    effect: { bonusStat: { STR: 2 } }
  },
  {
    id: 'meditation',
    name: { EN: "Void Meditation", ID: "Meditasi Hampa" },
    description: { EN: "By staring into the abyss, you calm your mind. Max Willpower increased.", ID: "Dengan menatap jurang, kau menenangkan pikiran. Tekad Maksimum meningkat." },
    cost: 2,
    requiredLevel: 3,
    effect: { passive: 'max_will_boost' }
  },
  {
    id: 'blood_thirst',
    name: { EN: "Blood Thirst", ID: "Haus Darah" },
    description: { EN: "The smell of blood invigorates you. Recover small HP when dealing damage.", ID: "Bau darah menyegarkanmu. Pulihkan sedikit HP saat memberikan damage." },
    cost: 3,
    requiredLevel: 5,
    prerequisiteId: 'titan_grip',
    effect: { passive: 'lifesteal' }
  }
];

export const STARTING_ITEMS: Item[] = [
  {
    id: 'wep-01',
    name: { EN: "Dragon Slayer (Replica)", ID: "Pembantai Naga (Replika)" },
    type: 'WEAPON',
    description: { EN: "Too big to be called a sword. Massive, thick, heavy, and far too rough.", ID: "Terlalu besar untuk disebut pedang. Masif, tebal, berat, dan kasar." },
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
    name: { EN: "Rusted Chainmail", ID: "Zirah Rantai Berkarat" },
    type: 'ARMOR',
    description: { EN: "A remnant of shattered armor. It smells of old blood and rain.", ID: "Sisa baju besi yang hancur. Baunya seperti darah lama dan hujan." },
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
    name: { EN: "Old Bandage", ID: "Perban Usang" },
    type: 'CONSUMABLE',
    description: { EN: "Bloodstained cloth. It barely stops the bleeding.", ID: "Kain bernoda darah. Nyaris tidak bisa menghentikan pendarahan." },
    icon: 'bandage',
    quantity: 3,
    price: 10,
    effect: { hpRestore: 15 }
  },
  {
    id: 'con-02',
    name: { EN: "Dried Meat", ID: "Daging Kering" },
    type: 'CONSUMABLE',
    description: { EN: "Tough jerky. Salty and hard to chew, but it fuels the body.", ID: "Dendeng alot. Asin dan keras dikunyah, tapi memberi energi." },
    icon: 'beef',
    quantity: 2,
    price: 15,
    effect: { hpRestore: 5, hungerRestore: 30 }
  },
  {
    id: 'con-03',
    name: { EN: "Waterskin", ID: "Kantung Air" },
    type: 'CONSUMABLE',
    description: { EN: "A leather skin filled with stale water.", ID: "Kantung kulit berisi air basi." },
    icon: 'droplets',
    quantity: 1,
    price: 20,
    effect: { thirstRestore: 50 }
  },
  {
    id: 'acc-01',
    name: { EN: "Behelit Shard", ID: "Pecahan Behelit" },
    type: 'KEY',
    description: { EN: "A fragment of a red stone. It seems to pulse when you are in danger.", ID: "Pecahan batu merah aneh. Terasa berdenyut saat bahaya mendekat." },
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
    description: { EN: "A jagged piece of iron, suitable for crude repairs.", ID: "Potongan besi bergerigi, cocok untuk perbaikan kasar." },
    icon: 'anvil',
    price: 5,
    quantity: 5
  },
  {
    id: MATERIALS.BEHELIT_DUST.id,
    name: MATERIALS.BEHELIT_DUST.name,
    type: 'MATERIAL',
    description: { EN: "Dust from a cursed object.", ID: "Debu dari objek terkutuk." },
    icon: 'gem',
    price: 100,
    quantity: 0
  },
  {
    id: MATERIALS.STEEL_INGOT.id,
    name: MATERIALS.STEEL_INGOT.name,
    type: 'MATERIAL',
    description: { EN: "High quality dark steel.", ID: "Baja gelap berkualitas tinggi." },
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
  class: CLASSES[0].name,
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
Kamu HARUS merespon dalam BAHASA ${lang === 'ID' ? 'INDONESIA' : 'INGGRIS'}.

ATURAN ATMOSFER:
1. Abstrak & Surealis: Deskripsikan lingkungan seperti lukisan minyak yang surealis.
2. Filosofis: Sentuh tema Takdir (Kausalitas), Mimpi, Pengorbanan.
3. Kontras: 
   - Jika World State "BONFIRE": Tenang, melankolis, reflektif.
   - Jika World State "ECLIPSE": Kacau, mengerikan, mendalam.
   - Jika World State "ASTRAL": Seperti mimpi, roh-roh terlihat.

ATURAN GAMEPLAY:
1. Tekad (WILL): Jika pemain menyaksikan horor kosmik atau keputusasaan, kurangi WILL mereka.
2. Penyembuhan: Hanya izinkan pemulihan HP/WILL yang signifikan saat momen "BONFIRE".
3. Pertarungan: Visceral dan berat.
4. Bertahan Hidup: Sebutkan rasa lapar, dingin, atau haus jika relevan dengan adegan.
5. Hadiah: Jika pemain mencapai sesuatu, berikan XP (xp_reward: 10-50).
6. Pesta: Jika pemain berbicara dengan anggota party, Roleplay sebagai NPC tersebut.
7. Rekrutmen: Jika narasi menyarankan rekan baru bergabung, kembalikan ID mereka di "new_companion".

FORMAT OUTPUT (MODE JSON):
Kamu HARUS merespon dalam format JSON yang valid. Jangan terjemahkan kunci JSON, hanya nilainya (narrative, suggestions).

JSON Structure:
{
  "narrative": "String (Deskripsi cerita dalam Bahasa ${lang})",
  "hp_change": Number,
  "will_change": Number,
  "xp_reward": Number,
  "world_state": "String", 
  "new_inventory": String | null,
  "new_companion": String | null,
  "dice_request": String | null,
  "suggested_actions": ["String", "String"]
}`;
