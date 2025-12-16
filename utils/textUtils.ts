
import { Language } from '../types';

export const getLogText = (lang: Language, key: string, params?: Record<string, string | number>) => {
  const templates: Record<string, Record<Language, string>> = {
    // Combat
    attack_hit: { EN: "You hit {target} for {dmg} damage!", ID: "Kamu menyerang {target} sebesar {dmg} damage!" },
    attack_miss: { EN: "You missed {target}!", ID: "Seranganmu meleset dari {target}!" },
    enemy_hit: { EN: "{enemy} hits you for {dmg} damage!", ID: "{enemy} menyerangmu sebesar {dmg} damage!" },
    victory: { EN: "Victory! Defeated {target}. (+{xp} XP)", ID: "Menang! {target} dikalahkan. (+{xp} XP)" },
    defeat: { EN: "Defeat... Darkness takes you.", ID: "Kalah... Kegelapan melahapmu." },
    flee_success: { EN: "You escaped successfully!", ID: "Kamu berhasil kabur!" },
    flee_fail: { EN: "Failed to escape!", ID: "Gagal melarikan diri!" },
    
    // Items
    use_item: { EN: "Used {item}.", ID: "Menggunakan {item}." },
    equip_item: { EN: "Equipped {item}.", ID: "Memasang {item}." },
    unequip_item: { EN: "Unequipped {item}.", ID: "Melepas {item}." },
    drop_item: { EN: "Discarded {item}.", ID: "Membuang {item}." },
    buy_item: { EN: "Bought {item} for {price}G.", ID: "Membeli {item} seharga {price}G." },
    sell_item: { EN: "Sold {item} for {price}G.", ID: "Menjual {item} seharga {price}G." },
    craft_success: { EN: "Forged {item} successfully!", ID: "Sukses menempa {item}!" },
    craft_fail: { EN: "Forging failed. Materials lost.", ID: "Gagal menempa. Material hancur." },
    
    // Exploration
    travel: { EN: "Traveled to {loc}. (-{h} Hunger, -{t} Thirst)", ID: "Perjalanan ke {loc}. (-{h} Lapar, -{t} Haus)" },
    level_up: { EN: "LEVEL UP! You are now Level {lvl}.", ID: "NAIK LEVEL! Kamu sekarang Level {lvl}." },
    gain_xp: { EN: "Gained {xp} XP.", ID: "Mendapatkan {xp} XP." },
    respawn: { EN: "You wake up at the bonfire...", ID: "Kamu terbangun di api unggun..." },
    learn_skill: { EN: "Learned Skill: {skill}", ID: "Mempelajari Skill: {skill}" },
    
    // Status
    starving: { EN: "You are starving...", ID: "Kamu kelaparan..." },
    dehydrated: { EN: "You are dehydrated...", ID: "Kamu kehausan..." },
    freezing: { EN: "You are freezing...", ID: "Kamu kedinginan..." },
    
    // NPC
    npc_joined: { EN: "{name} joined the party.", ID: "{name} bergabung dengan grup." },
    npc_left: { EN: "{name} left the party.", ID: "{name} meninggalkan grup." }
  };

  let text = templates[key]?.[lang] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
};

export const getLocName = (obj: any, lang: Language): string => {
  if (!obj) return "";
  if (typeof obj.name === 'string') return obj.name;
  return obj.name[lang] || obj.name['EN'];
};

export const getLocDesc = (obj: any, lang: Language): string => {
  if (!obj) return "";
  if (typeof obj.description === 'string') return obj.description;
  return obj.description[lang] || obj.description['EN'];
};
