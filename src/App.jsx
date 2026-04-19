import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromFirestore, saveToFirestore, subscribeToFirestore } from "./firebase.js";

// ── THEME COLORS ──────────────────────────────────────────────────────────────
const T = {
  bg:       "#F5F0E8",   // fond principal beige sable
  bg2:      "#EDE6D8",   // fond cartes
  bg3:      "#E5DDD0",   // fond inputs
  bg4:      "#DDD5C5",   // fond nav
  border:   "#C8B89A",   // bordures
  border2:  "#B8A888",   // bordures plus foncées
  text:     "#2C1810",   // texte principal brun foncé
  text2:    "#6B4C3B",   // texte secondaire
  text3:    "#9A7B6A",   // texte discret
  gold:     "#C17F3A",   // or/marron doré (couleur accent principale)
  goldL:    "#D4A017",   // or clair
  card:     "#FFFDF8",   // fond cartes blanches
  shadow:   "rgba(100,60,20,0.15)",
};

// ── BESOINS CATALOGUE ────────────────────────────────────────────────────────
const NEEDS_CATALOG = {
  "Viande": {
    emoji: "🥩", color: "#c0392b",
    products: [
      { name: "Agneau", img: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=120&h=120&fit=crop" },
      { name: "Bœuf haché", img: "https://images.unsplash.com/photo-1588347818036-c4f5c23a8a79?w=120&h=120&fit=crop" },
      { name: "Kefta", img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=120&h=120&fit=crop" },
      { name: "Foie", img: "https://images.unsplash.com/photo-1607198179219-568e8e3e3483?w=120&h=120&fit=crop" },
      { name: "Côtelettes", img: "https://images.unsplash.com/photo-1558030006-450675393462?w=120&h=120&fit=crop" },
      { name: "Brochettes", img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=120&h=120&fit=crop" },
    ]
  },
  "Poulet": {
    emoji: "🍗", color: "#e67e22",
    products: [
      { name: "Poulet entier", img: "https://images.unsplash.com/photo-1604503468506-a8da13d11d36?w=120&h=120&fit=crop" },
      { name: "Ailes", img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=120&h=120&fit=crop" },
      { name: "Cuisses", img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=120&h=120&fit=crop" },
      { name: "Filet poulet", img: "https://images.unsplash.com/photo-1604503468506-a8da13d11d36?w=120&h=120&fit=crop" },
      { name: "Brochettes poulet", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=120&h=120&fit=crop" },
    ]
  },
  "Épicerie": {
    emoji: "🛒", color: "#8b2500",
    products: [
      { name: "Huile d'olive", img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&h=120&fit=crop" },
      { name: "Farine", img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=120&h=120&fit=crop" },
      { name: "Riz", img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=120&h=120&fit=crop" },
      { name: "Lentilles", img: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=120&h=120&fit=crop" },
      { name: "Pois chiches", img: "https://images.unsplash.com/photo-1612257416648-e31dd68b3b44?w=120&h=120&fit=crop" },
      { name: "Tahini", img: "https://images.unsplash.com/photo-1612257416648-e31dd68b3b44?w=120&h=120&fit=crop" },
      { name: "Sel", img: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=120&h=120&fit=crop" },
      { name: "Épices", img: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=120&h=120&fit=crop" },
      { name: "Pain pita", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=120&h=120&fit=crop" },
      { name: "Boulgour", img: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=120&h=120&fit=crop" },
    ]
  },
  "Légumes": {
    emoji: "🥗", color: "#27ae60",
    products: [
      { name: "Tomates", img: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=120&h=120&fit=crop" },
      { name: "Oignons", img: "https://images.unsplash.com/photo-1508747703725-719777637510?w=120&h=120&fit=crop" },
      { name: "Ail", img: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=120&h=120&fit=crop" },
      { name: "Aubergines", img: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=120&h=120&fit=crop" },
      { name: "Courgettes", img: "https://images.unsplash.com/photo-1596187407535-e2a01b2a5fdc?w=120&h=120&fit=crop" },
      { name: "Poivrons", img: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=120&h=120&fit=crop" },
      { name: "Concombres", img: "https://images.unsplash.com/photo-1589621316382-008455b857cd?w=120&h=120&fit=crop" },
      { name: "Persil", img: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=120&h=120&fit=crop" },
      { name: "Menthe", img: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=120&h=120&fit=crop" },
      { name: "Pommes de terre", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=120&h=120&fit=crop" },
      { name: "Chou-fleur", img: "https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=120&h=120&fit=crop" },
      { name: "Salade", img: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=120&h=120&fit=crop" },
    ]
  },
  "Fruits": {
    emoji: "🍋", color: "#f39c12",
    products: [
      { name: "Citrons", img: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=120&h=120&fit=crop" },
      { name: "Oranges", img: "https://images.unsplash.com/photo-1547514701-42782101795e?w=120&h=120&fit=crop" },
      { name: "Grenades", img: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=120&h=120&fit=crop" },
      { name: "Figues", img: "https://images.unsplash.com/photo-1592995202007-e4d4ed9a4d18?w=120&h=120&fit=crop" },
      { name: "Raisins", img: "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?w=120&h=120&fit=crop" },
      { name: "Pastèque", img: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=120&h=120&fit=crop" },
    ]
  }
};

// ── INITIAL DATA ──────────────────────────────────────────────────────────────
const INITIAL_DB = {
  restaurants: [
    { id: "r1", name: "Le Bistro Parisien", logo: "🥐", color: "#8B4513", address: "12 Rue de la Paix, Paris" },
    { id: "r2", name: "La Bella Italia", logo: "🍕", color: "#A0522D", address: "8 Via Roma, Lyon" },
    { id: "r3", name: "Layali Al Cham Laeken", logo: "🌙", color: "#6B3A2A", address: "Rue Fransman 42, 1020 Laeken", logoUrl: "https://i.imgur.com/gIBT9dV.png" }
  ],
  users: [
    { id: "u1", rId: "r1", username: "gerant",  password: "1234", name: "Claire Moreau",  role: "manager", avatar: "📋" },
    { id: "u2", rId: "r1", username: "chef",    password: "1234", name: "Marc Dupont",    role: "chef",    avatar: "👨‍🍳" },
    { id: "u3", rId: "r1", username: "caisse",  password: "1234", name: "Sophie Martin",  role: "cashier", avatar: "💳" },
    { id: "u4", rId: "r1", username: "serveur", password: "1234", name: "Lucas Bernard",  role: "waiter",  avatar: "🍽️" },
    { id: "u5", rId: "r2", username: "chef2",   password: "1234", name: "Giovanni Rossi", role: "chef",    avatar: "👨‍🍳" },
    { id: "u6", rId: "r3", username: "Rkan",    password: "1234", name: "Rkan alssrag",   role: "manager", avatar: "📋" },
    { id: "u7", rId: "r3", username: "chef3",   password: "1234", name: "Chef Layali",    role: "chef",    avatar: "👨‍🍳" },
    { id: "u8", rId: "r3", username: "caisse3", password: "1234", name: "Caissier",       role: "cashier", avatar: "💳" },
  ],
  superAdmin: { username: "admin", password: "admin123" },
  menus: {
    r1: [
      { id: "m1", name: "Soupe à l'oignon", cat: "Entrées",  price: 8.5,  prep: 10, emoji: "🍲" },
      { id: "m2", name: "Foie gras",         cat: "Entrées",  price: 16,   prep: 5,  emoji: "🫙" },
      { id: "m3", name: "Steak Frites",      cat: "Plats",    price: 22,   prep: 20, emoji: "🥩" },
      { id: "m4", name: "Poulet Rôti",       cat: "Plats",    price: 18.5, prep: 25, emoji: "🍗" },
      { id: "m5", name: "Crème Brûlée",      cat: "Desserts", price: 7,    prep: 5,  emoji: "🍮" },
      { id: "m6", name: "Tarte Tatin",       cat: "Desserts", price: 8,    prep: 8,  emoji: "🥧" },
      { id: "m7", name: "Café",              cat: "Boissons", price: 2.5,  prep: 2,  emoji: "☕" },
      { id: "m8", name: "Vin Rouge",         cat: "Boissons", price: 6,    prep: 1,  emoji: "🍷" },
    ],
    r2: [
      { id: "m9",  name: "Bruschetta",       cat: "Entrées",  price: 7,    prep: 8,  emoji: "🍞" },
      { id: "m10", name: "Pizza Margherita", cat: "Plats",    price: 14,   prep: 18, emoji: "🍕" },
      { id: "m11", name: "Pasta Carbonara",  cat: "Plats",    price: 16,   prep: 15, emoji: "🍝" },
      { id: "m12", name: "Tiramisu",         cat: "Desserts", price: 6.5,  prep: 3,  emoji: "🍰" },
    ],
    r3: [
      { id:"r3m1",  name:"Taboulée",               cat:"Mezze",     price:10.0, prep:5,  emoji:"🥗", img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop&q=80" },
      { id:"r3m2",  name:"Kébbé Nayé",             cat:"Mezze",     price:10.0, prep:5,  emoji:"🥩", img:"https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=200&h=200&fit=crop&q=80" },
      { id:"r3m3",  name:"Salade Fatouch",          cat:"Mezze",     price:10.0, prep:5,  emoji:"🥗", img:"https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop&q=80" },
      { id:"r3m4",  name:"Hommos",                  cat:"Mezze",     price:7.0,  prep:5,  emoji:"🫘", img:"https://images.unsplash.com/photo-1577805947697-89e18249d767?w=200&h=200&fit=crop&q=80" },
      { id:"r3m5",  name:"Moutabal",                cat:"Mezze",     price:7.0,  prep:5,  emoji:"🍆", img:"https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=200&h=200&fit=crop&q=80" },
      { id:"r3m6",  name:"Labna",                   cat:"Mezze",     price:6.0,  prep:5,  emoji:"🥛", img:"https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=200&h=200&fit=crop&q=80" },
      { id:"r3m7",  name:"Kébbé Meklié",            cat:"Mezze",     price:10.0, prep:10, emoji:"🥙", img:"https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=200&h=200&fit=crop&q=80" },
      { id:"r3m8",  name:"Foul Medmas",             cat:"Mezze",     price:7.0,  prep:8,  emoji:"🫘", img:"https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=200&h=200&fit=crop&q=80" },
      { id:"r3m9",  name:"Hommos bi lahmi",         cat:"Mezze",     price:12.0, prep:10, emoji:"🫘", img:"https://images.unsplash.com/photo-1577805947697-89e18249d767?w=200&h=200&fit=crop&q=80" },
      { id:"r3m10", name:"Baba Ghanouj",            cat:"Mezze",     price:7.0,  prep:5,  emoji:"🍆", img:"https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=200&h=200&fit=crop&q=80" },
      { id:"r3m11", name:"Awerak Ainabe",           cat:"Mezze",     price:7.0,  prep:10, emoji:"🍃", img:"https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=200&h=200&fit=crop&q=80" },
      { id:"r3m12", name:"Mojadara",                cat:"Mezze",     price:7.0,  prep:8,  emoji:"🌾", img:"https://images.unsplash.com/photo-1535400255456-984b6e9b5cf8?w=200&h=200&fit=crop&q=80" },
      { id:"r3m13", name:"Chou-fleur",              cat:"Mezze",     price:7.0,  prep:8,  emoji:"🥦", img:"https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=200&h=200&fit=crop&q=80" },
      { id:"r3m14", name:"Riz",                     cat:"Mezze",     price:7.0,  prep:5,  emoji:"🍚", img:"https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=200&h=200&fit=crop&q=80" },
      { id:"r3m15", name:"Batata Harra",            cat:"Mezze",     price:7.0,  prep:10, emoji:"🥔", img:"https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop&q=80" },
      { id:"r3m16", name:"Falafel",                 cat:"Mezze",     price:7.0,  prep:10, emoji:"🧆", img:"https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=200&fit=crop&q=80" },
      { id:"r3m17", name:"Musakaa",                 cat:"Mezze",     price:7.0,  prep:10, emoji:"🍆", img:"https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&q=80" },
      { id:"r3m18", name:"Falafel Plat",            cat:"Mezze",     price:14.0, prep:15, emoji:"🧆", img:"https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?w=200&h=200&fit=crop&q=80" },
      { id:"r3m19", name:"Ailes de poulet",         cat:"Grillades", price:18.0, prep:25, emoji:"🍗", img:"https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200&h=200&fit=crop&q=80" },
      { id:"r3m20", name:"Brochettes de poulet",    cat:"Grillades", price:18.0, prep:20, emoji:"🍢", img:"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop&q=80" },
      { id:"r3m21", name:"1/2 Poulet Grillé",       cat:"Grillades", price:18.0, prep:25, emoji:"🍗", img:"https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=200&h=200&fit=crop&q=80" },
      { id:"r3m22", name:"Frrouj Mechwi",           cat:"Grillades", price:18.0, prep:30, emoji:"🍗", img:"https://images.unsplash.com/photo-1604503468506-a8da13d11d36?w=200&h=200&fit=crop&q=80" },
      { id:"r3m23", name:"Plat de Paille",          cat:"Grillades", price:18.0, prep:20, emoji:"🥩", img:"https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop&q=80" },
      { id:"r3m24", name:"Plat Végétarien",         cat:"Grillades", price:14.0, prep:15, emoji:"🥗", img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop&q=80" },
      { id:"r3m25", name:"Brochettes de viande",    cat:"Grillades", price:20.0, prep:20, emoji:"🥩", img:"https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&h=200&fit=crop&q=80" },
      { id:"r3m26", name:"Brochettes de Kefta",     cat:"Grillades", price:18.0, prep:20, emoji:"🍢", img:"https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop&q=80" },
      { id:"r3m27", name:"Brochettes de foie",      cat:"Grillades", price:18.0, prep:20, emoji:"🍢", img:"https://images.unsplash.com/photo-1607198179219-568e8e3e3483?w=200&h=200&fit=crop&q=80" },
      { id:"r3m28", name:"Brochettes Mixte",        cat:"Grillades", price:18.0, prep:20, emoji:"🍢", img:"https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop&q=80" },
      { id:"r3m29", name:"Côtelettes d'agneau",     cat:"Grillades", price:20.0, prep:25, emoji:"🥩", img:"https://images.unsplash.com/photo-1558030006-450675393462?w=200&h=200&fit=crop&q=80" },
      { id:"r3m30", name:"1 Kg Mechwi Mixte",       cat:"Grillades", price:44.0, prep:35, emoji:"🔥", img:"https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop&q=80" },
      { id:"r3m31", name:"Menu Duo Spécial",        cat:"Menus",     price:69.0, prep:35, emoji:"🍽️", img:"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop&q=80" },
      { id:"r3m32", name:"Menu Spécial Layali Cham", cat:"Menus",    price:99.0, prep:40, emoji:"👑", img:"https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop&q=80" },
      { id:"r3m33", name:"Fish Layali Cham Grillé", cat:"Menus",     price:25.0, prep:30, emoji:"🐟", img:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&h=200&fit=crop&q=80" },
      { id:"r3m34", name:"Maria",                   cat:"Sandwichs", price:12.0, prep:10, emoji:"🫓", img:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop&q=80" },
      { id:"r3m35", name:"Durum Falafel",           cat:"Sandwichs", price:9.0,  prep:8,  emoji:"🌯", img:"https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=200&fit=crop&q=80" },
      { id:"r3m36", name:"Durum Poulet",            cat:"Sandwichs", price:9.0,  prep:8,  emoji:"🌯", img:"https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=200&fit=crop&q=80" },
      { id:"r3m37", name:"Durum Kefta",             cat:"Sandwichs", price:9.0,  prep:8,  emoji:"🌯", img:"https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=200&fit=crop&q=80" },
      { id:"r3m38", name:"Durum Viande",            cat:"Sandwichs", price:9.0,  prep:8,  emoji:"🌯", img:"https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=200&fit=crop&q=80" },
      { id:"r3m39", name:"Durum Foie",              cat:"Sandwichs", price:9.0,  prep:8,  emoji:"🌯", img:"https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=200&fit=crop&q=80" },
      { id:"r3m40", name:"Menu Enfants",            cat:"Menus",     price:9.0,  prep:15, emoji:"👶", img:"https://images.unsplash.com/photo-1562802378-063ec186a863?w=200&h=200&fit=crop&q=80" },
      { id:"r3m41", name:"Théière petite",   cat:"Boissons", price:2.5, prep:3, emoji:"🍵", img:"https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=200&h=200&fit=crop&q=80" },
      { id:"r3m42", name:"Théière moyenne",  cat:"Boissons", price:3.5, prep:3, emoji:"🍵", img:"https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=200&h=200&fit=crop&q=80" },
      { id:"r3m43", name:"Théière grande",   cat:"Boissons", price:5.0, prep:3, emoji:"🍵", img:"https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=200&h=200&fit=crop&q=80" },
      { id:"r3m44", name:"Latte",            cat:"Boissons", price:2.8, prep:3, emoji:"☕", img:"https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&h=200&fit=crop&q=80" },
      { id:"r3m45", name:"Café",             cat:"Boissons", price:2.0, prep:2, emoji:"☕", img:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&q=80" },
      { id:"r3m46", name:"Aich Saraya",      cat:"Boissons", price:2.0, prep:3, emoji:"🍮", img:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop&q=80" },
      { id:"r3m47", name:"Coca-Cola",        cat:"Boissons", price:2.0, prep:1, emoji:"🥤", img:"https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop&q=80" },
      { id:"r3m48", name:"Pepsi",            cat:"Boissons", price:2.0, prep:1, emoji:"🥤", img:"https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop&q=80" },
      { id:"r3m49", name:"Fanta",            cat:"Boissons", price:2.0, prep:1, emoji:"🥤", img:"https://images.unsplash.com/photo-1596803244897-e7b45f6e4e67?w=200&h=200&fit=crop&q=80" },
      { id:"r3m50", name:"Sprite",           cat:"Boissons", price:2.0, prep:1, emoji:"🥤", img:"https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=200&h=200&fit=crop&q=80" },
      { id:"r3m51", name:"Oasis",            cat:"Boissons", price:2.0, prep:1, emoji:"🥤", img:"https://images.unsplash.com/photo-1498804103079-a6351b050096?w=200&h=200&fit=crop&q=80" },
      { id:"r3m52", name:"Lipton",           cat:"Boissons", price:2.0, prep:1, emoji:"🥤", img:"https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=200&h=200&fit=crop&q=80" },
      { id:"r3m53", name:"Eau Aquafina",     cat:"Boissons", price:2.0, prep:1, emoji:"💧", img:"https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop&q=80" },
      { id:"r3m54", name:"Schweppes",        cat:"Boissons", price:2.0, prep:1, emoji:"🥤", img:"https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&q=80" },
    ]
  },
  orders: [],
  needs: [],
  shoppingLists: [],
  reservations: [],
  inventory: {
    r1: [
      { id: "i1", name: "Viande bœuf",     unit: "kg", qty: 12, min: 5  },
      { id: "i2", name: "Pommes de terre", unit: "kg", qty: 25, min: 10 },
      { id: "i3", name: "Tomates",         unit: "kg", qty: 8,  min: 5  },
      { id: "i4", name: "Beurre",          unit: "kg", qty: 3,  min: 2  },
    ],
    r2: [
      { id: "i5", name: "Mozzarella", unit: "kg", qty: 6,  min: 2 },
      { id: "i6", name: "Farine",     unit: "kg", qty: 20, min: 8 },
    ],
    r3: [
      { id: "i7",  name: "Viande agneau", unit: "kg",  qty: 10, min: 3  },
      { id: "i8",  name: "Poulet",        unit: "kg",  qty: 8,  min: 3  },
      { id: "i9",  name: "Huile olive",   unit: "L",   qty: 5,  min: 2  },
      { id: "i10", name: "Pois chiches",  unit: "kg",  qty: 6,  min: 2  },
      { id: "i11", name: "Pain pita",     unit: "pcs", qty: 50, min: 20 },
    ]
  }
};

const uid  = () => Math.random().toString(36).substr(2, 8);
const ts   = () => new Date().toISOString();
const fmt  = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmtD = (iso) => new Date(iso).toLocaleDateString("fr-FR");
const fmtDT = (iso) => {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(d); target.setHours(0,0,0,0);
  const diff = (target - today) / 86400000;
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diff === 0) return `Aujourd'hui ${time}`;
  if (diff === 1) return `Demain ${time}`;
  return `${fmtD(iso)} ${time}`;
};

function defaultPickup() {
  const d = new Date(Date.now() + 45 * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return d.toISOString().slice(0, 16);
}
function minsUntil(iso) { return Math.floor((new Date(iso) - Date.now()) / 60000); }

const SC = {
  scheduled: { label: "Programmée", color: "#7c3aed", bg: "#EDE0FF", icon: "🕐", next: "pending"   },
  pending:   { label: "Nouvelle",   color: "#B45309", bg: "#FEF3C7", icon: "🆕", next: "preparing" },
  preparing: { label: "En cuisine", color: "#1d4ed8", bg: "#DBEAFE", icon: "🔥", next: "ready"     },
  ready:     { label: "Prête ✅",   color: "#15803d", bg: "#DCFCE7", icon: "🔔", next: "served"    },
  served:    { label: "Servie",     color: "#6B3A2A", bg: "#F5E6DC", icon: "🍽️", next: "paid"      },
  paid:      { label: "Payée",      color: "#6b7280", bg: "#F3F4F6", icon: "💰", next: null         },
};
const ROLE_ADV = { chef: ["pending","preparing","ready","served","paid"], manager: ["pending","preparing","ready","served","paid"], cashier: ["paid"], waiter: ["served"] };

// ── VOICE HOOK ────────────────────────────────────────────────────────────────
function useVoice(onResult) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition)); }, []);
  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      const r = new SR(); r.lang = "fr-FR"; r.interimResults = true; r.continuous = false;
      r.onresult = (e) => {
        const t = Array.from(e.results).map(x => x[0].transcript).join(" ");
        setTranscript(t);
        if (e.results[e.results.length - 1].isFinal) { onResult(t); setActive(false); }
      };
      r.onend = () => setActive(false); r.onerror = () => setActive(false);
      ref.current = r; r.start(); setActive(true); setTranscript("");
    } catch { setActive(false); }
  }, [onResult]);
  const stop = useCallback(() => { try { ref.current?.stop(); } catch {} setActive(false); }, []);
  return { active, transcript, start, stop, supported };
}

// ── GLOBAL AUDIO CONTEXT ──────────────────────────────────────────────────────
let globalAudioCtx = null;
function getAudioCtx() {
  if (!globalAudioCtx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) globalAudioCtx = new AC();
    } catch(e) {}
  }
  return globalAudioCtx;
}

// ── ORDER ALERT HOOK ──────────────────────────────────────────────────────────
function useOrderAlert(db, session) {
  const [alertOrder, setAlertOrder] = useState(null);
  const dismissedRef = useRef(new Set());
  const intervalRef = useRef(null);
  const seenOrdersRef = useRef(new Set());

  const playAlert = useCallback(() => {
    try {
      let ctx = getAudioCtx();
      if (!ctx) return;
      const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
      resume.then(() => {
        [[880,0],[660,0.22],[880,0.44],[1100,0.66]].forEach(([freq, delay]) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine'; osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.5, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.28);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.32);
        });
      });
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (!session || session.type === 'super' || !db) return;
    const { restaurant: r, user } = session;
    const orders = (db.orders || []).filter(o => o.rId === r.id && o.status === 'pending' && o.by !== user.name && !dismissedRef.current.has(o.id));
    orders.forEach(o => { if (!seenOrdersRef.current.has(o.id)) { seenOrdersRef.current.add(o.id); playAlert(); } });
    if (orders.length > 0) {
      const newest = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      setAlertOrder(newest);
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          const still = (db.orders || []).filter(o => o.rId === r.id && o.status === 'pending' && o.by !== user.name && !dismissedRef.current.has(o.id));
          if (still.length > 0) playAlert();
          else { clearInterval(intervalRef.current); intervalRef.current = null; setAlertOrder(null); }
        }, 8000);
      }
    } else {
      setAlertOrder(null);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => {};
  }, [db, session, playAlert]);

  const dismissAlert = useCallback((orderId) => {
    dismissedRef.current.add(orderId);
    setAlertOrder(null);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  return { alertOrder, dismissAlert };
}

// ── SCHEDULED ALERTS HOOK ─────────────────────────────────────────────────────
function useScheduledAlerts(db, session, mutate) {
  const [alert30, setAlert30] = useState(null);
  const dismissedRef = useRef(new Set());

  useEffect(() => {
    if (!session || session.type === 'super' || !db) return;
    const { restaurant: r } = session;
    const check = () => {
      const scheduled = (db.orders || []).filter(o => o.rId === r.id && o.status === 'scheduled' && !dismissedRef.current.has(o.id));
      const soon = scheduled.find(o => { const m = minsUntil(o.pickupAt); return m <= 30 && m > 0; });
      if (soon) {
        setAlert30(soon);
        mutate(d => { const x = d.orders.find(i => i.id === soon.id); if (x && x.status === 'scheduled') x.status = 'pending'; return d; });
      }
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [db, session, mutate]);

  const dismissAlert = () => { if (alert30) { dismissedRef.current.add(alert30.id); setAlert30(null); } };
  return { alert30, dismissAlert };
}

// ── ORDER ALERT BANNER ────────────────────────────────────────────────────────
function OrderAlertBanner({ order, onAccept }) {
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:10001,background:"linear-gradient(135deg,#7f1d1d,#dc2626)",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 20px rgba(220,38,38,.5)",animation:"slideD .3s ease" }}>
      <div style={{ fontSize:32,animation:"ringBell .4s infinite alternate" }}>🔔</div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:900,fontSize:15,color:"#fff",letterSpacing:1 }}>🆕 NOUVELLE COMMANDE !</div>
        <div style={{ color:"rgba(255,255,255,.9)",fontSize:12,marginTop:2 }}><strong>{order.client}</strong> · {order.items?.length} art. · <strong>{order.total?.toFixed(2)}€</strong></div>
      </div>
      <button onClick={() => onAccept(order.id)} style={{ background:"#fff",border:"none",borderRadius:8,padding:"10px 16px",color:"#dc2626",fontWeight:900,fontSize:13,cursor:"pointer" }}>✅ VU</button>
      <style>{`@keyframes ringBell{from{transform:rotate(-20deg)}to{transform:rotate(20deg)}} @keyframes slideD{from{transform:translateY(-100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [db, setDb] = useState(null);
  const [session, setSession] = useState(null);
  const [flash, setFlash] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unlock = () => { const ctx = getAudioCtx(); if (ctx && ctx.state === 'suspended') ctx.resume(); };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });
  }, []);

  // Notifications push
  useEffect(() => {
    if (session && session.type !== 'super') {
      import('./firebase.js').then(({ requestNotificationPermission, saveFCMToken }) => {
        requestNotificationPermission().then(token => {
          if (token) saveFCMToken(session.user.id, token);
        });
      });
    }
  }, [session]);

  const flashTimer = useRef(null);
  const saveTimer = useRef(null);
  const localVersion = useRef(0);
  const remoteVersion = useRef(0);

  useEffect(() => {
    loadFromFirestore().then(data => {
      if (data) {
        setDb({ ...INITIAL_DB, ...data, restaurants: data.restaurants?.length ? data.restaurants : INITIAL_DB.restaurants, users: data.users?.length ? data.users : INITIAL_DB.users, orders: data.orders || [], needs: data.needs || [], menus: { ...INITIAL_DB.menus, ...data.menus }, inventory: { ...INITIAL_DB.inventory, ...data.inventory }, superAdmin: data.superAdmin || INITIAL_DB.superAdmin });
      } else { setDb(INITIAL_DB); saveToFirestore(INITIAL_DB); }
    });
  }, []);

  useEffect(() => {
    const unsub = subscribeToFirestore((remoteDb, remoteTs) => {
      if (remoteTs && remoteTs <= localVersion.current) return;
      remoteVersion.current = remoteTs || 0;
      setDb(remoteDb);
    });
    return unsub;
  }, []);

  const scheduleSave = useCallback((data) => {
    clearTimeout(saveTimer.current);
    setSyncing(true);
    const version = Date.now();
    localVersion.current = version;
    saveTimer.current = setTimeout(async () => { await saveToFirestore(data, version); setSyncing(false); }, 500);
  }, []);

  const mutate = useCallback((fn, flashData) => {
    setDb(prev => {
      if (!prev) return prev;
      const next = fn(JSON.parse(JSON.stringify(prev)));
      scheduleSave(next);
      if (flashData) { clearTimeout(flashTimer.current); setFlash(flashData); flashTimer.current = setTimeout(() => setFlash(null), 8000); }
      return next;
    });
  }, [scheduleSave]);

  const { alert30, dismissAlert } = useScheduledAlerts(db || INITIAL_DB, session, mutate);
  const { alertOrder, dismissAlert: dismissOrderAlert } = useOrderAlert(db || INITIAL_DB, session);

  if (!db) return (
    <div style={{ minHeight:"100vh",background:`linear-gradient(135deg,${T.bg} 0%,#E8DDD0 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif" }}>
      <img src="https://i.imgur.com/hAaiZjt.png" alt="KamEat" style={{ width:180,height:180,objectFit:"contain",marginBottom:16,animation:"fadeIn 0.8s ease" }} onError={e=>e.target.style.display="none"} />
      <h1 style={{ fontSize:32,fontWeight:900,color:T.text,letterSpacing:4,margin:"0 0 4px" }}>Kam<span style={{ color:T.gold }}>Eat</span></h1>
      <div style={{ color:T.text3,fontSize:11,letterSpacing:6,marginBottom:32 }}>GESTION RESTAURANT</div>
      <div style={{ width:120,height:3,borderRadius:2,background:T.border,overflow:"hidden" }}>
        <div style={{ height:"100%",background:T.gold,animation:"loadBar 1.5s ease-in-out infinite",borderRadius:2 }} />
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
        @keyframes loadBar{0%{width:0;margin-left:0}50%{width:100%;margin-left:0}100%{width:0;margin-left:100%}}
      `}</style>
    </div>
  );

  if (!session) return <LoginScreen db={db} onLogin={setSession} />;
  const props = { db, mutate, session, onLogout: () => setSession(null), syncing };

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      {flash && <FlashBanner flash={flash} onClose={() => setFlash(null)} />}
      {alertOrder && <OrderAlertBanner order={alertOrder} onAccept={dismissOrderAlert} />}
      {alert30 && <Alert30Banner order={alert30} onClose={dismissAlert} />}
      <div style={{ paddingTop: (flash || alert30 || alertOrder) ? 72 : 0 }}>
        {session.type === "super"        ? <SuperAdmin  {...props} /> :
         session.user.role === "manager" ? <ManagerApp  {...props} /> :
         session.user.role === "chef"    ? <ChefApp     {...props} /> :
         session.user.role === "cashier" ? <CashierApp  {...props} /> :
                                           <WaiterApp   {...props} />}
      </div>
    </div>
  );
}

// ── BANNERS ───────────────────────────────────────────────────────────────────
function Alert30Banner({ order, onClose }) {
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:10000,background:"linear-gradient(135deg,#5b21b6,#7c3aed)",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 20px rgba(124,58,237,.4)",animation:"slideD .35s ease" }}>
      <span style={{ fontSize:32,animation:"ringBell .5s infinite alternate" }}>🔔</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:900,fontSize:14,color:"#fff" }}>COMMANDE DANS 30 MIN — {order.client}</div>
        <div style={{ color:"rgba(255,255,255,.85)",fontSize:12,marginTop:2 }}>Prête pour <strong>{fmtDT(order.pickupAt)}</strong> · ✅ Envoyée en cuisine</div>
      </div>
      <button onClick={onClose} style={{ background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:14 }}>✕</button>
    </div>
  );
}

function FlashBanner({ flash, onClose }) {
  const isOrder = flash.type === "order";
  const bg = isOrder ? "linear-gradient(135deg,#92400e,#d97706)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:9999,background:bg,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 20px rgba(0,0,0,.2)",animation:"slideD .35s ease" }}>
      <span style={{ fontSize:32 }}>{isOrder?"📞":"🛒"}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:900,fontSize:14,color:"#fff" }}>{isOrder ? `NOUVELLE COMMANDE — ${flash.data.client}` : "BESOIN SIGNALÉ"}</div>
        <div style={{ color:"rgba(255,255,255,.85)",fontSize:12,marginTop:2 }}>
          {isOrder ? `${flash.data.items?.length} art. · ${flash.data.total?.toFixed(2)}€` : `${flash.data.avatar} ${flash.data.by} : "${flash.data.text}"`}
        </div>
      </div>
      <button onClick={onClose} style={{ background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:14 }}>✕</button>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ db, onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const login = () => {
    setErr("");
    if (user === db.superAdmin.username && pass === db.superAdmin.password) { onLogin({ type:"super" }); return; }
    const found = (db.users||[]).find(u => u.username === user && u.password === pass);
    if (found) {
      const rest = (db.restaurants||[]).find(r => r.id === found.rId);
      if (rest) { onLogin({ type:"user", user:found, restaurant:rest }); return; }
    }
    setErr("Identifiants incorrects");
  };

  return (
    <div style={{ minHeight:"100vh",background:`linear-gradient(160deg,${T.bg} 0%,#E0D5C5 50%,#D5C8B5 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center",marginBottom:32 }}>
        <img src="https://i.imgur.com/hAaiZjt.png" alt="KamEat" style={{ width:100,height:100,objectFit:"contain",marginBottom:8 }} onError={e=>e.target.style.display="none"} />
        <h1 style={{ margin:"4px 0 2px",fontSize:28,fontWeight:900,color:T.text,letterSpacing:5 }}>Kam<span style={{ color:T.gold }}>Eat</span></h1>
        <div style={{ color:T.text3,fontSize:10,letterSpacing:5 }}>GESTION RESTAURANT</div>
      </div>
      <div style={{ width:"100%",maxWidth:360,background:T.card,borderRadius:20,border:`1px solid ${T.border}`,padding:28,boxShadow:`0 20px 60px ${T.shadow}` }}>
        <Lbl style={{ textAlign:"center",marginBottom:20,color:T.gold }}>CONNEXION</Lbl>
        <FInp label="IDENTIFIANT" val={user} set={setUser} icon="👤" />
        <FInp label="MOT DE PASSE" val={pass} set={setPass} icon="🔑" type="password" onEnter={login} />
        {err && <div style={{ color:"#dc2626",fontSize:13,textAlign:"center",marginBottom:12,fontWeight:600 }}>{err}</div>}
        <button onClick={login} style={{ width:"100%",background:`linear-gradient(135deg,${T.gold},#A0652A)`,border:"none",borderRadius:12,padding:15,fontSize:15,fontWeight:900,color:"#fff",cursor:"pointer",letterSpacing:2,boxShadow:`0 4px 15px ${T.shadow}` }}>
          SE CONNECTER →
        </button>
        <div style={{ color:T.text3,fontSize:11,textAlign:"center",marginTop:14,lineHeight:1.8 }}>
          🔔 Touchez l'écran pour activer les alertes sonores
        </div>
      </div>
    </div>
  );
}

// ── SHELL ─────────────────────────────────────────────────────────────────────
function Shell({ session, onLogout, tabs, activeTab, setTab, children, syncing }) {
  const { user, restaurant:r } = session;
  const rL = { manager:"Gérant", chef:"Cuisinier", cashier:"Caissier", waiter:"Serveur" };
  return (
    <div style={{ minHeight:"100vh",background:T.bg,fontFamily:"Georgia,serif",color:T.text }}>
      <header style={{ background:`linear-gradient(135deg,${T.card},${r.color}22)`,borderBottom:`2px solid ${r.color}44`,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:50,boxShadow:`0 2px 10px ${T.shadow}` }}>
        {r.logoUrl ? <img src={r.logoUrl} alt={r.name} style={{ width:40,height:40,borderRadius:8,objectFit:"cover" }} /> : <span style={{ fontSize:32 }}>{r.logo}</span>}
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800,fontSize:13,letterSpacing:1,color:T.text }}>{r.name}</div>
          <div style={{ fontSize:11,color:T.text2 }}>{user.avatar} {user.name} · {rL[user.role]}</div>
        </div>
        {syncing && <span style={{ fontSize:11,color:T.text3 }}>⏳</span>}
        <button onClick={onLogout} style={{ background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",color:T.text2,cursor:"pointer",fontSize:12 }}>🚪</button>
      </header>
      {tabs?.length > 1 && (
        <nav style={{ display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`,boxShadow:`0 1px 4px ${T.shadow}` }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:1,padding:"11px 4px",background:"none",border:"none",borderBottom:activeTab===t.id?`3px solid ${r.color}`:"3px solid transparent",color:activeTab===t.id?r.color:T.text3,cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:.3,position:"relative",transition:"color .2s" }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span style={{ position:"absolute",top:5,right:"calc(50% - 20px)",background:"#dc2626",color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900 }}>{t.badge}</span>}
            </button>
          ))}
        </nav>
      )}
      <main style={{ padding:14,maxWidth:860,margin:"0 auto" }}>{children}</main>
    </div>
  );
}

// ── PICKUP TIME PICKER ────────────────────────────────────────────────────────
function PickupPicker({ value, onChange, color }) {
  const mins = minsUntil(value);
  const labelColor = mins <= 0 ? "#dc2626" : mins <= 30 ? "#15803d" : "#7c3aed";
  const label = mins <= 0 ? "⚠️ Heure passée" : mins <= 30 ? `⚡ Dans ${mins} min → cuisine immédiate` : `🕐 Dans ${mins} min`;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ color:T.text2,fontSize:10,letterSpacing:2,marginBottom:6,fontWeight:700 }}>PRÊTE POUR QUELLE HEURE ? *</div>
      <input type="datetime-local" value={value} onChange={e=>onChange(e.target.value)} min={new Date().toISOString().slice(0,16)}
        style={{ width:"100%",background:T.bg3,border:`2px solid ${color}55`,borderRadius:9,padding:"12px 14px",color:T.text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",colorScheme:"light" }} />
      <div style={{ fontSize:12,color:labelColor,marginTop:6,fontWeight:700 }}>{label}</div>
      <div style={{ display:"flex",gap:6,marginTop:8,flexWrap:"wrap" }}>
        {[15,30,45,60,90,120].map(m => {
          const d = new Date(Date.now() + m*60000); d.setSeconds(0,0);
          const v = d.toISOString().slice(0,16);
          return <button key={m} onClick={()=>onChange(v)} style={{ padding:"5px 10px",borderRadius:20,border:`1px solid ${color}55`,background:value===v?color:"transparent",color:value===v?"#fff":T.text2,cursor:"pointer",fontSize:11,fontWeight:700 }}>+{m>=60?`${m/60}h`:`${m}min`}</button>;
        })}
      </div>
    </div>
  );
}

// ── VOICE INPUT ───────────────────────────────────────────────────────────────
function VoiceInput({ onSubmit, placeholder, buttonLabel }) {
  const [text, setText] = useState("");
  const handleVoice = useCallback((t) => setText(t), []);
  const voice = useVoice(handleVoice);
  return (
    <div style={{ display:"flex",gap:8,alignItems:"center" }}>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder={placeholder}
        onKeyDown={e=>{ if(e.key==="Enter"&&text.trim()){onSubmit(text);setText("");} }}
        style={{ flex:1,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 12px",color:T.text,fontSize:14,outline:"none",fontFamily:"Georgia,serif" }} />
      {voice.supported && (
        <button onClick={voice.active?voice.stop:voice.start}
          style={{ width:40,height:40,borderRadius:"50%",border:`2px solid ${voice.active?"#dc2626":T.gold}`,background:voice.active?"#fef2f2":T.bg2,cursor:"pointer",fontSize:18,flexShrink:0 }}>
          {voice.active?"⏹":"🎤"}
        </button>
      )}
      <button onClick={()=>{ if(text.trim()){onSubmit(text);setText("");} }}
        style={{ padding:"10px 16px",borderRadius:9,border:"none",background:T.gold,color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,flexShrink:0 }}>
        {buttonLabel}
      </button>
    </div>
  );
}

// ── MANAGER APP ───────────────────────────────────────────────────────────────
function ManagerApp({ db, mutate, session, onLogout, syncing }) {
  const [tab, setTab] = useState("call");
  const { restaurant:r, user } = session;
  const menu   = db.menus?.[r.id] || [];
  const orders = (db.orders||[]).filter(o => o.rId === r.id);
  const needs  = (db.needs||[]).filter(n => n.rId === r.id);
  const [calling, setCalling] = useState(false);
  const [step, setStep] = useState("info");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [orderType, setOrderType] = useState("phone");
  const [cart, setCart] = useState([]);
  const [catFilter, setCatFilter] = useState("Tous");
  const [pickupAt, setPickupAt] = useState(defaultPickup);

  const addToCart = (item) => setCart(p => { const ex = p.find(x => x.mid === item.id); return ex ? p.map(x => x.mid===item.id?{...x,qty:x.qty+1}:x) : [...p,{mid:item.id,name:item.name,price:item.price,qty:1,emoji:item.emoji,img:item.img||null}]; });
  const handleVoice = useCallback((text) => {
    const lower = text.toLowerCase();
    menu.forEach(item => { if (lower.includes(item.name.toLowerCase())) addToCart(item); });
    const nm = text.match(/(?:pour|client|c'est|monsieur|madame|nom)\s+([A-ZÀ-Üa-zà-ü]+(?:\s+[A-ZÀ-Üa-zà-ü]+)?)/i);
    if (nm) setClientName(nm[1].charAt(0).toUpperCase() + nm[1].slice(1));
  }, [menu]);
  const voice = useVoice(handleVoice);
  const resetForm = () => { setCart([]); setClientName(""); setClientPhone(""); setCalling(false); setStep("info"); setPickupAt(defaultPickup()); };

  const submitOrder = () => {
    if (!clientName || !cart.length || !pickupAt) return;
    const mins = minsUntil(pickupAt);
    const status = mins > 30 ? "scheduled" : "pending";
    const prepMin = Math.min(Math.max(...cart.map(c => (menu.find(m=>m.id===c.mid)?.prep||15))), 45);
    const order = { id:uid(), rId:r.id, client:clientName, phone:clientPhone, type:orderType, items:cart, total:cart.reduce((s,c)=>s+c.price*c.qty,0), prepMin, status, pickupAt, createdAt:ts(), by:user.name };
    mutate(d => { d.orders.push(order); return d; }, { type:"order", data:order });
    resetForm(); setTab("orders");
  };

  const cats = ["Tous", ...new Set(menu.map(m=>m.cat))];
  const menuItems = catFilter==="Tous" ? menu : menu.filter(m=>m.cat===catFilter);
  const scheduled = orders.filter(o => o.status==="scheduled");
  const active = orders.filter(o => !["paid","scheduled"].includes(o.status));

  const tabs = [
    { id:"call",   icon:"📞", label:"Appel",        badge:0 },
    { id:"orders", icon:"📋", label:"Commandes",    badge:active.length },
    { id:"sched",  icon:"🕐", label:"Programmées",  badge:scheduled.length },
    { id:"needs",  icon:"🛒", label:"Besoins",      badge:needs.filter(n=>!n.done).length },
    { id:"res",    icon:"🪑", label:"Réservations", badge:(db.reservations||[]).filter(rv=>rv.rId===r.id&&!rv.done&&new Date(rv.date)>=new Date()).length },
  ];
  const reservations = (db.reservations||[]).filter(rv => rv.rId===r.id);

  return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>
      {tab==="call" && !calling && (
        <div style={{ textAlign:"center",paddingTop:36 }}>
          <div style={{ color:T.text3,fontSize:10,letterSpacing:3,marginBottom:36 }}>GÉRANT · HORS RESTAURANT</div>
          <div style={{ position:"relative",display:"inline-block",marginBottom:44 }}>
            <div style={{ position:"absolute",inset:-18,borderRadius:"50%",background:"#16a34a18",animation:"ring1 2s ease-out infinite" }} />
            <button onClick={()=>setCalling(true)} style={{ position:"relative",width:170,height:170,borderRadius:"50%",border:"none",background:"linear-gradient(145deg,#16a34a,#15803d)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 8px 30px rgba(22,163,74,.4)" }}>
              <span style={{ fontSize:60 }}>📞</span>
              <span style={{ color:"#fff",fontWeight:900,fontSize:12,letterSpacing:3 }}>APPEL</span>
            </button>
          </div>
          <p style={{ color:T.text2,fontSize:13,maxWidth:260,margin:"0 auto 28px" }}>Un client appelle ? Appuyez pour prendre sa commande.</p>
          {active.length > 0 && (
            <div style={{ textAlign:"left" }}>
              <Lbl>COMMANDES EN COURS</Lbl>
              {active.slice(0,3).map(o => (
                <div key={o.id} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:`0 2px 8px ${T.shadow}` }}>
                  <div><span style={{ fontWeight:700,color:T.text }}>{o.client}</span><span style={{ color:T.text3,fontSize:12,marginLeft:8 }}>{fmt(o.createdAt)}</span></div>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <span style={{ color:r.color,fontWeight:700 }}>{o.total.toFixed(2)}€</span>
                    <span style={{ background:SC[o.status].bg,color:SC[o.status].color,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700 }}>{SC[o.status].icon}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <style>{`@keyframes ring1{0%{transform:scale(.85);opacity:.7}100%{transform:scale(1.7);opacity:0}}`}</style>
        </div>
      )}

      {tab==="call" && calling && (
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:"#16a34a",display:"inline-block",animation:"blink 1s infinite" }} />
              <span style={{ color:"#16a34a",fontWeight:900,fontSize:12,letterSpacing:2 }}>APPEL EN COURS</span>
            </div>
            <button onClick={resetForm} style={{ background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,padding:"6px 12px",color:"#dc2626",cursor:"pointer",fontWeight:700,fontSize:12 }}>✕ Raccrocher</button>
          </div>
          <div style={{ display:"flex",gap:4,marginBottom:16 }}>
            {[["info","1 · Client"],["items","2 · Articles"],["time","3 · Heure"],["confirm","4 · Confirmer"]].map(([id,lb]) => (
              <button key={id} onClick={()=>setStep(id)} style={{ flex:1,padding:"8px 2px",borderRadius:8,border:`1px solid ${T.border}`,background:step===id?r.color:T.card,color:step===id?"#fff":T.text2,cursor:"pointer",fontWeight:800,fontSize:10 }}>{lb}</button>
            ))}
          </div>
          {step==="info" && (
            <Pane color={r.color} title="👤 CLIENT">
              <FInp label="NOM DU CLIENT *" val={clientName} set={setClientName} icon="👤" />
              <FInp label="TÉLÉPHONE" val={clientPhone} set={setClientPhone} icon="📱" />
              <div style={{ display:"flex",gap:6,marginBottom:14 }}>
                {[["phone","📞 Tél"],["dine-in","🪑 Place"],["takeaway","🥡 Emporter"]].map(([v,lb]) => (
                  <button key={v} onClick={()=>setOrderType(v)} style={{ flex:1,padding:"9px 4px",borderRadius:8,border:`2px solid ${orderType===v?r.color:T.border}`,background:orderType===v?`${r.color}18`:T.card,color:orderType===v?r.color:T.text2,cursor:"pointer",fontWeight:700,fontSize:11 }}>{lb}</button>
                ))}
              </div>
              <BigBtn color={r.color} onClick={()=>setStep("items")} disabled={!clientName}>Articles →</BigBtn>
            </Pane>
          )}
          {step==="items" && (
            <div>
              <Pane color="#16a34a" title="🎤 DICTER LA COMMANDE">
                <div style={{ textAlign:"center" }}>
                  {voice.supported ? (
                    <>
                      <button onClick={voice.active?voice.stop:voice.start} style={{ width:68,height:68,borderRadius:"50%",border:`3px solid ${voice.active?"#dc2626":"#16a34a"}`,background:voice.active?"#fef2f2":"#f0fdf4",cursor:"pointer",fontSize:28,outline:"none" }}>
                        {voice.active?"⏹":"🎤"}
                      </button>
                      <p style={{ color:voice.active?"#dc2626":T.text3,fontSize:12,marginTop:8 }}>{voice.active?"🔴 En écoute...":'Ex: "un steak frites pour Jean"'}</p>
                      {voice.transcript && <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:10,color:"#15803d",fontSize:13 }}>"{voice.transcript}"</div>}
                    </>
                  ) : <div style={{ color:"#92400e",fontSize:12,background:"#fffbeb",borderRadius:8,padding:12,border:"1px solid #fde68a" }}>⚠️ Micro disponible sur Chrome/Edge</div>}
                </div>
              </Pane>
              <Pane color={r.color} title="🍽️ MENU">
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:12 }}>
                  {cats.map(c => <button key={c} onClick={()=>setCatFilter(c)} style={{ padding:"5px 11px",borderRadius:20,border:`1px solid ${catFilter===c?r.color:T.border}`,background:catFilter===c?r.color:T.card,color:catFilter===c?"#fff":T.text2,cursor:"pointer",fontSize:11,fontWeight:700 }}>{c}</button>)}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8 }}>
                  {menuItems.map(item => (
                    <button key={item.id} onClick={()=>addToCart(item)} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:0,cursor:"pointer",textAlign:"center",color:T.text,overflow:"hidden",boxShadow:`0 1px 4px ${T.shadow}` }}
                      onMouseOver={e=>{e.currentTarget.style.borderColor=r.color;e.currentTarget.style.boxShadow=`0 2px 8px ${T.shadow}`;}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow=`0 1px 4px ${T.shadow}`;}}>
                      {item.img ? <img src={item.img} alt={item.name} style={{ width:"100%",height:75,objectFit:"cover",display:"block" }} onError={e=>e.target.style.display="none"} /> : <div style={{ fontSize:26,padding:"10px 0" }}>{item.emoji}</div>}
                      <div style={{ padding:"5px 4px" }}>
                        <div style={{ fontSize:10,fontWeight:700,marginBottom:1,color:T.text }}>{item.name}</div>
                        <div style={{ color:r.color,fontSize:12,fontWeight:900 }}>{item.price.toFixed(2)}€</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Pane>
              {cart.length > 0 && (
                <Pane color={r.color} title={`🛒 PANIER (${cart.length})`}>
                  {cart.map(c => (
                    <div key={c.mid} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:18 }}>{c.emoji}</span><span style={{ flex:1,fontSize:13,color:T.text }}>{c.name}</span>
                      <QB onClick={()=>setCart(p=>{const e=p.find(x=>x.mid===c.mid);return e.qty>1?p.map(x=>x.mid===c.mid?{...x,qty:x.qty-1}:x):p.filter(x=>x.mid!==c.mid)})}>−</QB>
                      <span style={{ width:22,textAlign:"center",fontWeight:800,color:T.text }}>{c.qty}</span>
                      <QB onClick={()=>setCart(p=>p.map(x=>x.mid===c.mid?{...x,qty:x.qty+1}:x))}>+</QB>
                      <span style={{ color:r.color,fontWeight:700,width:52,textAlign:"right",fontSize:13 }}>{(c.price*c.qty).toFixed(2)}€</span>
                    </div>
                  ))}
                  <BigBtn color={r.color} onClick={()=>setStep("time")} style={{ marginTop:12 }}>Heure →</BigBtn>
                </Pane>
              )}
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            </div>
          )}
          {step==="time" && (
            <Pane color="#7c3aed" title="🕐 HEURE DE RETRAIT">
              <PickupPicker value={pickupAt} onChange={setPickupAt} color="#7c3aed" />
              <div style={{ background:"#f5f3ff",borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:"#6d28d9",border:"1px solid #ddd6fe" }}>
                ℹ️ Si l'heure est dans plus de 30 min → commande <strong>programmée</strong>.
              </div>
              <BigBtn color="#7c3aed" onClick={()=>setStep("confirm")} disabled={!pickupAt||minsUntil(pickupAt)<0}>Confirmer →</BigBtn>
            </Pane>
          )}
          {step==="confirm" && (
            <Pane color="#16a34a" title="✅ RÉCAPITULATIF">
              <div style={{ background:"#f0fdf4",borderRadius:10,padding:14,marginBottom:14,border:"1px solid #bbf7d0" }}>
                <RR l="Client" v={clientName} c={T.text} bold />
                <RR l="Téléphone" v={clientPhone||"—"} c={T.text2} />
                <RR l="Type" v={{phone:"📞 Téléphone","dine-in":"🪑 Sur place",takeaway:"🥡 Emporter"}[orderType]} c={T.text} />
                <RR l="Prête pour" v={fmtDT(pickupAt)} c="#7c3aed" bold />
                <div style={{ borderTop:`1px solid ${T.border}`,margin:"10px 0" }} />
                {cart.map(c=><RR key={c.mid} l={`${c.emoji} ${c.name} ×${c.qty}`} v={`${(c.price*c.qty).toFixed(2)}€`} c={r.color} />)}
                <div style={{ borderTop:`1px solid ${T.border}`,margin:"10px 0" }} />
                <RR l="TOTAL" v={`${cart.reduce((s,c)=>s+c.price*c.qty,0).toFixed(2)}€`} c="#16a34a" bold />
              </div>
              <button onClick={submitOrder} style={{ width:"100%",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:14,padding:16,fontSize:15,fontWeight:900,color:"#fff",cursor:"pointer",letterSpacing:2,boxShadow:"0 4px 15px rgba(22,163,74,.3)" }}>
                📡 VALIDER LA COMMANDE
              </button>
            </Pane>
          )}
        </div>
      )}
      {tab==="orders" && <OrdersPanel orders={orders.filter(o=>o.status!=="scheduled")} color={r.color} userRole="manager" mutate={mutate} userName={user.name} />}
      {tab==="sched"  && <ScheduledPanel orders={scheduled} color={r.color} mutate={mutate} />}
      {tab==="needs"  && <NeedsPanel needs={needs} rId={r.id} user={user} mutate={mutate} color={r.color} isManager db={db} />}
      {tab==="res"    && <ReservationsPanel reservations={reservations||[]} rId={r.id} user={user} mutate={mutate} color={r.color} />}
    </Shell>
  );
}

// ── CHEF APP ──────────────────────────────────────────────────────────────────
function ChefApp({ db, mutate, session, onLogout, syncing }) {
  const [tab, setTab] = useState("orders");
  const { restaurant:r, user } = session;
  const orders = (db.orders||[]).filter(o => o.rId===r.id && ["pending","preparing","ready","scheduled"].includes(o.status));
  const needs  = (db.needs||[]).filter(n => n.rId===r.id);
  const scheduled = orders.filter(o => o.status==="scheduled");
  const reservations = (db.reservations||[]).filter(rv => rv.rId===r.id);

  const tabs = [
    { id:"orders", icon:"📋", label:"Commandes",   badge:orders.filter(o=>!["paid","scheduled"].includes(o.status)).length },
    { id:"sched",  icon:"🕐", label:"Programmées", badge:scheduled.length },
    { id:"needs",  icon:"🛒", label:"Besoins",     badge:needs.filter(n=>!n.done).length },
    { id:"res",    icon:"🪑", label:"Réserv.",      badge:reservations.filter(rv=>!rv.done&&new Date(rv.date)>=new Date()).length },
  ];

  return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>
      {tab==="orders" && <OrdersPanel orders={orders.filter(o=>o.status!=="scheduled")} color={r.color} userRole="chef" mutate={mutate} userName={user.name} />}
      {tab==="sched"  && <ScheduledPanel orders={scheduled} color={r.color} mutate={mutate} />}
      {tab==="needs"  && <NeedsPanel needs={needs} rId={r.id} user={user} mutate={mutate} color={r.color} isManager db={db} />}
      {tab==="res"    && <ReservationsPanel reservations={reservations||[]} rId={r.id} user={user} mutate={mutate} color={r.color} />}
    </Shell>
  );
}

// ── CASHIER APP ───────────────────────────────────────────────────────────────
function CashierApp({ db, mutate, session, onLogout, syncing }) {
  const [tab, setTab] = useState("cash");
  const { restaurant:r, user } = session;
  const orders = (db.orders||[]).filter(o => o.rId===r.id);
  const toEnc  = orders.filter(o => ["ready","served"].includes(o.status));
  const paidToday = orders.filter(o => o.status==="paid" && fmtD(o.createdAt)===fmtD(ts()));
  const todayCA = paidToday.reduce((s,o)=>s+o.total,0);
  const tabs = [{ id:"cash", icon:"💳", label:"Caisse", badge: toEnc.length }];

  return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>
      {tab==="cash" && (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
            <StatCard icon="💰" label="CA Aujourd'hui" val={`${todayCA.toFixed(2)}€`} color={r.color} />
            <StatCard icon="✅" label="Payées" val={paidToday.length} color="#15803d" />
            <StatCard icon="⏳" label="À encaisser" val={toEnc.length} color="#B45309" />
          </div>
          <Lbl>💳 À ENCAISSER ({toEnc.length})</Lbl>
          {toEnc.length===0 ? <Empty icon="☕" text="Rien à encaisser" /> :
            toEnc.map(o => <CashierOrderCard key={o.id} order={o} color={r.color} mutate={mutate} userName={user.name} rId={r.id} />)}
          <Lbl style={{ marginTop:20 }}>📜 PAYÉES AUJOURD'HUI</Lbl>
          {paidToday.length===0 ? <Empty icon="📋" text="Aucune" /> :
            paidToday.map(o => <OrderCard key={o.id} order={o} color="#15803d" userRole="cashier" mutate={mutate} userName={user.name} readonly />)}
        </div>
      )}
    </Shell>
  );
}

// ── WAITER APP ────────────────────────────────────────────────────────────────
function WaiterApp({ db, mutate, session, onLogout, syncing }) {
  const { restaurant:r, user } = session;
  const toServe = (db.orders||[]).filter(o => o.rId===r.id && o.status==="ready");
  const served  = (db.orders||[]).filter(o => o.rId===r.id && o.status==="served" && fmtD(o.createdAt)===fmtD(ts()));
  return (
    <Shell session={session} onLogout={onLogout} tabs={[]} activeTab="" setTab={()=>{}} syncing={syncing}>
      <Lbl>🍽️ À SERVIR ({toServe.length})</Lbl>
      {toServe.length===0?<Empty icon="😊" text="Rien à servir" />:toServe.map(o=><OrderCard key={o.id} order={o} color={r.color} userRole="waiter" mutate={mutate} userName={user.name} />)}
      <Lbl style={{ marginTop:18 }}>✅ SERVIES AUJOURD'HUI ({served.length})</Lbl>
      {served.map(o=><OrderCard key={o.id} order={o} color="#15803d" userRole="waiter" mutate={mutate} userName={user.name} readonly />)}
    </Shell>
  );
}

// ── CASHIER ORDER CARD ────────────────────────────────────────────────────────
function CashierOrderCard({ order:o, color, mutate, userName }) {
  const [open, setOpen] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState("cash");
  const [received, setReceived] = useState("");
  const sc = SC[o.status]; if (!sc) return null;
  const change = payMethod === "cash" && received ? Math.max(0, parseFloat(received) - o.total) : 0;

  const confirmPayment = () => {
    mutate(d => { const ord = d.orders.find(x => x.id === o.id); if (ord) { ord.status = "paid"; ord.payMethod = payMethod; ord.paidAt = ts(); ord.paidBy = userName; } return d; });
    setPaying(false);
  };

  return (
    <div style={{ background:T.card,borderRadius:14,marginBottom:12,border:`2px solid ${color}44`,overflow:"hidden",boxShadow:`0 2px 10px ${T.shadow}` }}>
      {paying && (
        <div style={{ position:"fixed",inset:0,background:"rgba(44,24,16,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:T.card,borderRadius:20,padding:24,width:"100%",maxWidth:380,border:`2px solid ${T.border}`,boxShadow:`0 20px 60px ${T.shadow}` }}>
            <div style={{ color:color,fontSize:11,letterSpacing:2,fontWeight:700,marginBottom:16 }}>💳 ENCAISSER LA COMMANDE</div>
            <div style={{ background:"#f0fdf4",borderRadius:10,padding:14,marginBottom:16,border:"1px solid #bbf7d0" }}>
              <div style={{ fontSize:13,color:T.text2,marginBottom:4 }}>Client</div>
              <div style={{ fontSize:18,fontWeight:900,color:T.text,marginBottom:8 }}>{o.client}</div>
              <div style={{ fontSize:28,fontWeight:900,color:color,textAlign:"center",padding:"8px 0" }}>{o.total.toFixed(2)} €</div>
            </div>
            <div style={{ color:T.text3,fontSize:10,letterSpacing:2,marginBottom:10 }}>MODE DE PAIEMENT</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16 }}>
              {[["cash","💵","Espèces"],["card","💳","Carte"],["bancontact","📱","Bancontact"]].map(([v,ic,lb]) => (
                <button key={v} onClick={()=>setPayMethod(v)}
                  style={{ padding:"12px 6px",borderRadius:10,border:`2px solid ${payMethod===v?color:T.border}`,background:payMethod===v?`${color}18`:T.bg2,cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:22 }}>{ic}</div>
                  <div style={{ color:payMethod===v?color:T.text2,fontSize:11,fontWeight:700,marginTop:3 }}>{lb}</div>
                </button>
              ))}
            </div>
            {payMethod === "cash" && (
              <div style={{ marginBottom:16 }}>
                <div style={{ color:T.text3,fontSize:10,letterSpacing:2,marginBottom:8 }}>MONTANT REÇU</div>
                <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                  <input type="number" value={received} onChange={e=>setReceived(e.target.value)}
                    style={{ flex:1,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:"12px",color:T.text,fontSize:18,outline:"none",textAlign:"right" }} />
                  <span style={{ display:"flex",alignItems:"center",color:T.text,fontSize:18,fontWeight:700 }}>€</span>
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {[Math.ceil(o.total), Math.ceil(o.total/5)*5, Math.ceil(o.total/10)*10, Math.ceil(o.total/20)*20, Math.ceil(o.total/50)*50].filter((v,i,a)=>a.indexOf(v)===i).slice(0,5).map(amt => (
                    <button key={amt} onClick={()=>setReceived(amt.toString())}
                      style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${received==amt?color:T.border}`,background:received==amt?`${color}18`:T.bg2,color:received==amt?color:T.text2,cursor:"pointer",fontSize:13,fontWeight:700 }}>
                      {amt}€
                    </button>
                  ))}
                </div>
                {received && parseFloat(received) >= o.total && (
                  <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ color:T.text2,fontSize:13 }}>Rendu monnaie</span>
                    <span style={{ color:"#15803d",fontSize:22,fontWeight:900 }}>{change.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            )}
            {(payMethod !== "cash" || (received && parseFloat(received) >= o.total)) && (
              <button onClick={confirmPayment} style={{ width:"100%",background:`linear-gradient(135deg,${color},${color}bb)`,border:"none",borderRadius:12,padding:15,color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer" }}>
                ✅ CONFIRMER LE PAIEMENT
              </button>
            )}
            <button onClick={()=>setPaying(false)} style={{ width:"100%",background:"transparent",border:"none",color:T.text3,cursor:"pointer",padding:"10px",marginTop:8,fontSize:13 }}>← Annuler</button>
          </div>
        </div>
      )}
      <div style={{ padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10 }} onClick={()=>setOpen(!open)}>
        <div style={{ width:10,height:10,borderRadius:"50%",background:sc.color,flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <span style={{ fontWeight:800,fontSize:14,color:T.text }}>{o.client}</span>
            <span style={{ color:sc.color,fontSize:11,fontWeight:700,background:sc.bg,padding:"2px 8px",borderRadius:6 }}>{sc.icon} {sc.label}</span>
          </div>
          <div style={{ fontSize:11,color:T.text2,marginTop:2 }}>
            {fmt(o.createdAt)}{o.phone?` · ${o.phone}`:""}&nbsp;·&nbsp;<strong style={{ color }}>{o.total.toFixed(2)}€</strong>
          </div>
        </div>
        <span style={{ color:T.text3,fontSize:11 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 14px 14px",borderTop:`1px solid ${T.border}` }}>
          {o.items.map((it,i)=>(
            <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:13,color:T.text }}>
              <span>{it.emoji} {it.name} <span style={{ color:T.text3 }}>×{it.qty}</span></span>
              <span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span>
            </div>
          ))}
          <div style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",fontWeight:900,fontSize:14,color:T.text }}><span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span></div>
          <button onClick={()=>setPaying(true)} style={{ width:"100%",background:`linear-gradient(135deg,${color},${color}bb)`,border:"none",borderRadius:10,padding:13,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:14,boxShadow:`0 3px 12px ${color}44` }}>
            💳 ENCAISSER
          </button>
        </div>
      )}
    </div>
  );
}

// ── RESERVATIONS PANEL ────────────────────────────────────────────────────────
function ReservationsPanel({ reservations = [], rId, user, mutate, color }) {
  const [showAdd, setShowAdd] = useState(false);
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(() => { const d = new Date(); d.setHours(d.getHours()+1,0,0,0); return d.toISOString().slice(0,16); });
  const [tables, setTables] = useState(1);
  const [persons, setPersons] = useState(2);
  const [note, setNote] = useState("");

  const addRes = () => {
    if (!client || !date) return;
    const res = { id:uid(), rId, client, phone, date, tables, persons, note, createdAt:ts(), by:user.name, done:false };
    mutate(d => { d.reservations = [...(d.reservations||[]), res]; return d; });
    setClient(""); setPhone(""); setNote(""); setShowAdd(false);
  };

  const today = new Date(); today.setHours(0,0,0,0);
  const safeRes = Array.isArray(reservations) ? reservations : [];
  const upcoming = [...safeRes].filter(r => new Date(r.date) >= today && !r.done).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const past = [...safeRes].filter(r => new Date(r.date) < today || r.done).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10);

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <Lbl>🪑 RÉSERVATIONS À VENIR ({upcoming.length})</Lbl>
        <button onClick={()=>setShowAdd(!showAdd)} style={{ background:`${color}18`,border:`1px solid ${color}55`,borderRadius:8,padding:"7px 14px",color,cursor:"pointer",fontWeight:700,fontSize:12 }}>+ Nouvelle</button>
      </div>
      {showAdd && (
        <Pane color={color} title="🪑 NOUVELLE RÉSERVATION">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <FInp label="NOM CLIENT *" val={client} set={setClient} icon="👤" />
            <FInp label="TÉLÉPHONE" val={phone} set={setPhone} icon="📱" />
          </div>
          <div style={{ marginBottom:13 }}>
            <div style={{ color:T.text2,fontSize:10,letterSpacing:2,marginBottom:4,fontWeight:700 }}>DATE & HEURE *</div>
            <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}
              style={{ width:"100%",background:T.bg3,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 12px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",colorScheme:"light" }} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <div>
              <div style={{ color:T.text2,fontSize:10,letterSpacing:2,marginBottom:4,fontWeight:700 }}>TABLES</div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <QB onClick={()=>setTables(t=>Math.max(1,t-1))}>−</QB>
                <span style={{ width:30,textAlign:"center",fontWeight:800,color:T.text,fontSize:18 }}>{tables}</span>
                <QB onClick={()=>setTables(t=>t+1)}>+</QB>
              </div>
            </div>
            <div>
              <div style={{ color:T.text2,fontSize:10,letterSpacing:2,marginBottom:4,fontWeight:700 }}>PERSONNES</div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <QB onClick={()=>setPersons(p=>Math.max(1,p-1))}>−</QB>
                <span style={{ width:30,textAlign:"center",fontWeight:800,color:T.text,fontSize:18 }}>{persons}</span>
                <QB onClick={()=>setPersons(p=>p+1)}>+</QB>
              </div>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ color:T.text2,fontSize:10,letterSpacing:2,marginBottom:4,fontWeight:700 }}>NOTE</div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex: Anniversaire, végétarien..."
              style={{ width:"100%",background:T.bg3,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 12px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box" }} />
          </div>
          <BigBtn color={color} onClick={addRes} disabled={!client}>✅ Confirmer la réservation</BigBtn>
        </Pane>
      )}
      {upcoming.length === 0 ? <Empty icon="🪑" text="Aucune réservation à venir" /> :
        upcoming.map(res => {
          const d = new Date(res.date);
          const isToday = d.toDateString() === new Date().toDateString();
          const isSoon = (d - Date.now()) < 3600000 && (d - Date.now()) > 0;
          return (
            <div key={res.id} style={{ background:isSoon?"#fffbeb":T.card, borderRadius:14, padding:16, marginBottom:10, border:`2px solid ${isSoon?"#f59e0b":color+"33"}`,boxShadow:`0 2px 8px ${T.shadow}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:800,fontSize:16,color:T.text }}>{res.client}</div>
                  <div style={{ color:T.text3,fontSize:12,marginTop:2 }}>{res.phone}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:isSoon?"#B45309":color,fontWeight:900,fontSize:14 }}>{isToday?`Aujourd'hui ${fmt(res.date)}`:fmtDT(res.date)}</div>
                  {isSoon && <div style={{ color:"#B45309",fontSize:11,fontWeight:700 }}>⚠️ Dans moins d'1h !</div>}
                </div>
              </div>
              <div style={{ display:"flex",gap:12,marginBottom:12 }}>
                <div style={{ background:T.bg2,borderRadius:8,padding:"8px 14px",textAlign:"center",border:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:18 }}>🪑</div>
                  <div style={{ color:T.text,fontWeight:700,fontSize:15 }}>{res.tables}</div>
                  <div style={{ color:T.text3,fontSize:10 }}>table(s)</div>
                </div>
                <div style={{ background:T.bg2,borderRadius:8,padding:"8px 14px",textAlign:"center",border:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:18 }}>👥</div>
                  <div style={{ color:T.text,fontWeight:700,fontSize:15 }}>{res.persons}</div>
                  <div style={{ color:T.text3,fontSize:10 }}>pers.</div>
                </div>
                {res.note && <div style={{ flex:1,background:"#fffbeb",borderRadius:8,padding:"8px 12px",border:"1px solid #fde68a" }}><div style={{ color:T.text3,fontSize:10,marginBottom:2 }}>NOTE</div><div style={{ color:"#92400e",fontSize:13 }}>{res.note}</div></div>}
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>mutate(d=>{const r=d.reservations?.find(x=>x.id===res.id);if(r)r.done=true;return d;})}
                  style={{ flex:1,background:"linear-gradient(135deg,#15803d,#166534)",border:"none",borderRadius:10,padding:12,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13 }}>
                  ✅ Client arrivé
                </button>
                <button onClick={()=>mutate(d=>{d.reservations=d.reservations?.filter(x=>x.id!==res.id);return d;})}
                  style={{ background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:10,padding:"0 14px",color:"#dc2626",cursor:"pointer",fontSize:18 }}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      {past.length > 0 && (
        <>
          <Lbl style={{ marginTop:20 }}>📜 PASSÉES ({past.length})</Lbl>
          {past.map(res => (
            <div key={res.id} style={{ background:T.card,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:.7 }}>
              <div>
                <div style={{ fontWeight:700,color:T.text }}>{res.client}</div>
                <div style={{ color:T.text3,fontSize:12 }}>{fmtDT(res.date)} · {res.persons} pers. · {res.tables} table(s)</div>
              </div>
              <button onClick={()=>mutate(d=>{d.reservations=d.reservations?.filter(x=>x.id!==res.id);return d;})}
                style={{ background:"none",border:"none",color:T.text3,cursor:"pointer",fontSize:18 }}>🗑️</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── ORDER CARD ────────────────────────────────────────────────────────────────
function OrderCard({ order:o, color, userRole, mutate, userName, readonly }) {
  const [open, setOpen] = useState(o.status==="pending");
  const sc = SC[o.status]; if (!sc) return null;
  const canAdv = !readonly && ROLE_ADV[userRole]?.includes(sc.next);
  const elapsed = Math.floor((Date.now()-new Date(o.createdAt))/60000);
  const late = elapsed>(o.prepMin||20) && ["pending","preparing"].includes(o.status);
  const advance = () => mutate(d=>{ const x=d.orders.find(i=>i.id===o.id); if(x) x.status=sc.next; return d; });
  return (
    <div style={{ background:T.card,borderRadius:14,marginBottom:10,border:`1px solid ${late?"#fca5a5":open?color+"44":T.border}`,overflow:"hidden",boxShadow:`0 2px 8px ${T.shadow}` }}>
      <div style={{ padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10 }} onClick={()=>setOpen(!open)}>
        <div style={{ width:10,height:10,borderRadius:"50%",background:sc.color,flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <span style={{ fontWeight:800,fontSize:14,color:T.text }}>{o.client}</span>
            <span style={{ color:sc.color,fontSize:11,fontWeight:700,background:sc.bg,padding:"2px 8px",borderRadius:6 }}>{sc.icon} {sc.label}</span>
          </div>
          <div style={{ fontSize:11,color:T.text2,marginTop:2 }}>
            {o.type==="phone"?"📞":o.type==="dine-in"?"🪑":"🥡"} {fmt(o.createdAt)}
            {o.phone?` · ${o.phone}`:""}&nbsp;·&nbsp;<strong style={{ color }}>{o.total.toFixed(2)}€</strong>
            {o.pickupAt && <span style={{ color:"#7c3aed",marginLeft:6,fontWeight:700 }}>🕐 {fmtDT(o.pickupAt)}</span>}
            {late && <span style={{ color:"#dc2626",marginLeft:8,fontWeight:700 }}>⚠️ {elapsed}min</span>}
          </div>
        </div>
        <span style={{ color:T.text3,fontSize:11 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 14px 14px",borderTop:`1px solid ${T.border}` }}>
          {o.pickupAt && <div style={{ background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8,padding:"8px 12px",margin:"10px 0",fontSize:12,color:"#6d28d9" }}>🕐 Prête pour : <strong>{fmtDT(o.pickupAt)}</strong></div>}
          {o.items.map((it,i)=>(
            <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:13,color:T.text }}>
              <span>{it.emoji} {it.name} <span style={{ color:T.text3 }}>×{it.qty}</span></span>
              <span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span>
            </div>
          ))}
          <div style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",fontWeight:900,fontSize:14,color:T.text }}><span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span></div>
          <div style={{ color:T.text3,fontSize:11,marginBottom:12 }}>⏱ Estimé: <strong style={{ color:"#B45309" }}>{o.prepMin||15} min</strong> · par <strong style={{ color:T.text2 }}>{o.by}</strong></div>
          {canAdv && <button onClick={advance} style={{ width:"100%",background:`linear-gradient(135deg,${SC[sc.next].color},${SC[sc.next].color}cc)`,border:"none",borderRadius:10,padding:13,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:13,letterSpacing:1 }}>{SC[sc.next].icon} {SC[sc.next].label.toUpperCase()}</button>}
        </div>
      )}
    </div>
  );
}

// ── SCHEDULED PANEL ───────────────────────────────────────────────────────────
function ScheduledPanel({ orders, color, mutate }) {
  const sorted = [...orders].sort((a,b)=>new Date(a.pickupAt)-new Date(b.pickupAt));
  return (
    <div>
      <Lbl>COMMANDES PROGRAMMÉES ({orders.length})</Lbl>
      {orders.length===0?<Empty icon="🕐" text="Aucune commande programmée" />:
        sorted.map(o => {
          const m = minsUntil(o.pickupAt);
          return (
            <div key={o.id} style={{ background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:14,padding:14,marginBottom:10,boxShadow:`0 2px 8px ${T.shadow}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div><div style={{ fontWeight:800,fontSize:15,color:T.text }}>{o.client}</div><div style={{ color:T.text3,fontSize:12 }}>{o.phone} · par {o.by}</div></div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:"#7c3aed",fontWeight:900,fontSize:14 }}>{fmtDT(o.pickupAt)}</div>
                  <div style={{ fontSize:11,color:m<=60?"#B45309":"#7c3aed" }}>{m>=60?`dans ${Math.floor(m/60)}h${m%60>0?m%60+"min":""}`:`dans ${m} min`}</div>
                </div>
              </div>
              {o.items.map((it,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:13,color:T.text }}><span>{it.emoji} {it.name} ×{it.qty}</span><span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span></div>)}
              <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",fontWeight:900,color:T.text }}><span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span></div>
              <button onClick={()=>mutate(d=>{const x=d.orders.find(i=>i.id===o.id);if(x)x.status="pending";return d;})} style={{ width:"100%",background:"linear-gradient(135deg,#B45309,#92400e)",border:"none",borderRadius:10,padding:12,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:13,marginTop:6 }}>
                🚀 Envoyer maintenant en cuisine
              </button>
            </div>
          );
        })}
    </div>
  );
}

// ── ORDERS PANEL ──────────────────────────────────────────────────────────────
function OrdersPanel({ orders, color, userRole, mutate, userName }) {
  const [f, setF] = useState("active");
  const shown = f==="active"?orders.filter(o=>o.status!=="paid"):orders;
  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:12 }}>
        {[["active","⚡ En cours"],["all","📋 Toutes"]].map(([id,lb])=>(
          <button key={id} onClick={()=>setF(id)} style={{ padding:"6px 14px",borderRadius:20,border:`1px solid ${f===id?color:T.border}`,background:f===id?`${color}18`:T.card,color:f===id?color:T.text2,cursor:"pointer",fontSize:12,fontWeight:700 }}>{lb}</button>
        ))}
      </div>
      {shown.length===0?<Empty icon="✨" text="Aucune commande" />:shown.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(o=><OrderCard key={o.id} order={o} color={color} userRole={userRole} mutate={mutate} userName={userName} />)}
    </div>
  );
}

// ── NEEDS PANEL ───────────────────────────────────────────────────────────────
function NeedsPanel({ needs, rId, user, mutate, color, isManager, db }) {
  const [activecat, setActiveCat] = useState(null);
  const [qty, setQty] = useState("1");
  const [view, setView] = useState("current");
  const [showHistoryList, setShowHistoryList] = useState(null);

  const shoppingLists = (db?.shoppingLists||[]).filter(l => l.rId === rId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const addNeed = useCallback((text, category) => {
    if (!text?.trim()) return;
    const need = { id:uid(), rId, text:text.trim(), category:category||"Autre", by:user.name, avatar:user.avatar, createdAt:ts(), done:false, received:false };
    mutate(d=>{ d.needs.push(need); return d; }, { type:"need", data:need });
    setQty("1");
  }, [rId, user, mutate]);

  const addProduct = (product, cat) => { addNeed(qty && qty !== "1" ? `${product.name} × ${qty}` : product.name, cat); };
  const toggleReceived = (id) => { mutate(d=>{ const x=d.needs.find(i=>i.id===id); if(x) x.received=!x.received; return d; }); };

  const validateList = () => {
    const pending = needs.filter(n=>!n.done && n.rId===rId);
    if (!pending.length) return;
    const list = { id:uid(), rId, num:shoppingLists.length+1, items:pending.map(n=>({...n,received:n.received||false})), createdAt:ts(), by:user.name, total:pending.length, received:pending.filter(n=>n.received).length };
    mutate(d=>{ d.shoppingLists=[...(d.shoppingLists||[]),list]; d.needs=d.needs.filter(n=>n.rId!==rId||n.done); return d; });
  };

  const reuseList = (list) => {
    list.items.forEach(item => { const need={id:uid(),rId,text:item.text,category:item.category||"Autre",by:user.name,avatar:user.avatar,createdAt:ts(),done:false,received:false}; mutate(d=>{d.needs.push(need);return d;}); });
    setShowHistoryList(null); setView("current");
  };

  const pending = needs.filter(n=>!n.done);
  const cats = Object.keys(NEEDS_CATALOG);
  const receivedCount = pending.filter(n=>n.received).length;

  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
        <button onClick={()=>setView("current")} style={{ flex:1,padding:"10px",borderRadius:10,border:`2px solid ${view==="current"?"#1d4ed8":T.border}`,background:view==="current"?"#dbeafe":T.card,color:view==="current"?"#1d4ed8":T.text2,cursor:"pointer",fontWeight:700,fontSize:12 }}>
          🛒 Liste actuelle ({pending.length})
        </button>
        <button onClick={()=>setView("history")} style={{ flex:1,padding:"10px",borderRadius:10,border:`2px solid ${view==="history"?"#B45309":T.border}`,background:view==="history"?"#fffbeb":T.card,color:view==="history"?"#B45309":T.text2,cursor:"pointer",fontWeight:700,fontSize:12 }}>
          📋 Historique ({shoppingLists.length})
        </button>
      </div>

      {view === "current" && (
        <div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
            {cats.map(cat => {
              const c = NEEDS_CATALOG[cat];
              return (
                <button key={cat} onClick={()=>setActiveCat(activecat===cat?null:cat)}
                  style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 14px",borderRadius:12,border:`2px solid ${activecat===cat?c.color:T.border}`,background:activecat===cat?`${c.color}15`:T.card,cursor:"pointer",minWidth:70 }}>
                  <span style={{ fontSize:24 }}>{c.emoji}</span>
                  <span style={{ color:activecat===cat?c.color:T.text2,fontSize:11,fontWeight:700 }}>{cat}</span>
                </button>
              );
            })}
          </div>

          {activecat && (
            <div style={{ background:T.card,borderRadius:14,padding:14,marginBottom:16,border:`1px solid ${NEEDS_CATALOG[activecat].color}44`,boxShadow:`0 2px 8px ${T.shadow}` }}>
              <div style={{ color:NEEDS_CATALOG[activecat].color,fontSize:10,letterSpacing:2,fontWeight:700,marginBottom:12 }}>
                {NEEDS_CATALOG[activecat].emoji} {activecat.toUpperCase()} — CLIQUEZ POUR AJOUTER
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
                <span style={{ color:T.text2,fontSize:12 }}>Qté :</span>
                <QB onClick={()=>setQty(q=>String(Math.max(1,parseInt(q||1)-1)))}>−</QB>
                <input value={qty} onChange={e=>setQty(e.target.value)} style={{ width:50,textAlign:"center",background:T.bg3,border:`1px solid ${T.border}`,borderRadius:6,padding:"6px",color:T.text,fontSize:15,fontWeight:700,outline:"none" }} />
                <QB onClick={()=>setQty(q=>String(parseInt(q||1)+1))}>+</QB>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))",gap:10 }}>
                {NEEDS_CATALOG[activecat].products.map(product => (
                  <button key={product.name} onClick={()=>addProduct(product, activecat)}
                    style={{ background:T.bg2,border:`1px solid ${T.border}`,borderRadius:10,padding:8,cursor:"pointer",textAlign:"center",overflow:"hidden" }}
                    onMouseOver={e=>{e.currentTarget.style.borderColor=NEEDS_CATALOG[activecat].color;}}
                    onMouseOut={e=>{e.currentTarget.style.borderColor=T.border;}}>
                    <img src={product.img} alt={product.name} style={{ width:"100%",height:60,objectFit:"cover",borderRadius:6,marginBottom:4,display:"block" }} onError={e=>e.target.style.display="none"} />
                    <div style={{ color:T.text,fontSize:10,fontWeight:600 }}>{product.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Pane color="#1d4ed8" title="✍️ SAISIE MANUELLE OU VOCALE">
            <VoiceInput onSubmit={(t)=>addNeed(t, activecat||"Autre")} placeholder='Ex: "sauce tomate × 3"' buttonLabel="Ajouter" />
          </Pane>

          {pending.length > 0 && (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <Lbl>À ACHETER ({pending.length}) — {receivedCount} reçus</Lbl>
                {isManager && <button onClick={validateList} style={{ background:"linear-gradient(135deg,#15803d,#166534)",border:"none",borderRadius:8,padding:"8px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:12 }}>✅ Valider & archiver</button>}
              </div>
              {receivedCount > 0 && <div style={{ background:T.border,borderRadius:20,height:6,marginBottom:12,overflow:"hidden" }}><div style={{ background:"#15803d",height:"100%",width:`${(receivedCount/pending.length)*100}%`,transition:"width .3s",borderRadius:20 }} /></div>}
              {cats.concat(["Autre"]).map(cat => {
                const catNeeds = pending.filter(n => (n.category||"Autre") === cat);
                if (!catNeeds.length) return null;
                const c = NEEDS_CATALOG[cat] || { emoji:"📦", color:T.gold };
                return (
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"6px 10px",background:`${c.color}12`,borderRadius:8 }}>
                      <span style={{ fontSize:16 }}>{c.emoji}</span>
                      <span style={{ color:c.color,fontSize:11,letterSpacing:2,fontWeight:700,flex:1 }}>{cat.toUpperCase()}</span>
                      <span style={{ color:c.color,fontSize:11 }}>{catNeeds.filter(n=>n.received).length}/{catNeeds.length}</span>
                    </div>
                    {catNeeds.map(n=>(
                      <div key={n.id} style={{ background:n.received?"#f0fdf4":T.card,border:`1px solid ${n.received?"#bbf7d0":T.border}`,borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10 }}>
                        <button onClick={()=>toggleReceived(n.id)} style={{ width:26,height:26,borderRadius:6,border:`2px solid ${n.received?"#15803d":c.color}`,background:n.received?"#15803d":"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff" }}>
                          {n.received?"✓":""}
                        </button>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14,fontWeight:600,textDecoration:n.received?"line-through":"none",color:n.received?T.text3:T.text }}>{n.text}</div>
                          <div style={{ color:T.text3,fontSize:11,marginTop:1 }}>{n.avatar} {n.by} · {fmt(n.createdAt)}</div>
                        </div>
                        {isManager && <button onClick={()=>mutate(d=>{d.needs=d.needs.filter(x=>x.id!==n.id);return d;})} style={{ background:"none",border:"none",color:T.text3,cursor:"pointer",fontSize:16 }}>🗑️</button>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          {!pending.length && <Empty icon="✅" text="Rien à acheter !" />}
        </div>
      )}

      {view === "history" && (
        <div>
          {!shoppingLists.length ? <Empty icon="📋" text="Aucun historique" /> :
            showHistoryList ? (
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                  <span style={{ color:"#B45309",fontWeight:700 }}>📋 Liste #{showHistoryList.num}</span>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>reuseList(showHistoryList)} style={{ background:"linear-gradient(135deg,#B45309,#92400e)",border:"none",borderRadius:8,padding:"8px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:12 }}>🔄 Réutiliser</button>
                    <button onClick={()=>setShowHistoryList(null)} style={{ background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",color:T.text2,cursor:"pointer",fontSize:12 }}>← Retour</button>
                  </div>
                </div>
                {showHistoryList.items.map((item,i) => (
                  <div key={i} style={{ background:T.card,borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,border:`1px solid ${T.border}` }}>
                    <div style={{ width:24,height:24,borderRadius:6,background:item.received?"#15803d":T.bg3,border:`2px solid ${item.received?"#15803d":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff" }}>{item.received?"✓":""}</div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:13,color:item.received?T.text3:T.text,textDecoration:item.received?"line-through":"none" }}>{item.text}</span>
                      <span style={{ color:T.text3,fontSize:11,marginLeft:8 }}>{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : shoppingLists.map(list => (
              <div key={list.id} onClick={()=>setShowHistoryList(list)}
                style={{ background:T.card,borderRadius:12,padding:"14px 16px",marginBottom:10,border:`1px solid ${T.border}`,cursor:"pointer",boxShadow:`0 1px 4px ${T.shadow}` }}
                onMouseOver={e=>e.currentTarget.style.borderColor="#B45309"}
                onMouseOut={e=>e.currentTarget.style.borderColor=T.border}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"4px 10px",color:"#B45309",fontWeight:900,fontSize:14 }}>#{list.num}</div>
                    <div>
                      <div style={{ fontWeight:700,color:T.text }}>{list.total} articles</div>
                      <div style={{ color:T.text3,fontSize:12 }}>{fmtD(list.createdAt)} · {list.by}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:"#15803d",fontSize:13,fontWeight:700 }}>{list.received}/{list.total} reçus</div>
                    <div style={{ color:T.text3,fontSize:11 }}>→ voir</div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── SUPER ADMIN ───────────────────────────────────────────────────────────────
function SuperAdmin({ db, mutate, onLogout, syncing }) {
  const [tab, setTab] = useState("restaurants");
  const [nr, setNr] = useState({ name:"",logo:"🍽️",color:T.gold,address:"" });
  const [nu, setNu] = useState({ name:"",username:"",password:"",role:"chef",rId:"" });
  const [showNr,setShowNr]=useState(false);
  const [showNu,setShowNu]=useState(false);
  const rEmoji = { chef:"👨‍🍳",cashier:"💳",waiter:"🍽️",manager:"📋" };
  const addRest=()=>{ if(!nr.name)return; const id=uid(); mutate(d=>{d.restaurants.push({...nr,id});d.menus[id]=[];d.inventory[id]=[];return d;}); setNr({name:"",logo:"🍽️",color:T.gold,address:""}); setShowNr(false); };
  const addUser=()=>{ if(!nu.name||!nu.username||!nu.rId)return; mutate(d=>{d.users.push({...nu,id:uid(),avatar:rEmoji[nu.role]||"👤"});return d;}); setNu({name:"",username:"",password:"",role:"chef",rId:""}); setShowNu(false); };

  return (
    <div style={{ minHeight:"100vh",background:T.bg,fontFamily:"Georgia,serif",color:T.text }}>
      <header style={{ background:`linear-gradient(135deg,${T.card},#EDE0C8)`,borderBottom:`2px solid ${T.border}`,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 2px 8px ${T.shadow}` }}>
        <span style={{ fontSize:32 }}>👑</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900,letterSpacing:2,fontSize:14,color:T.text }}>SUPER ADMINISTRATEUR</div>
          <div style={{ color:T.text3,fontSize:11 }}>KamEat · Toutes les données en temps réel ✅</div>
        </div>
        {syncing && <span style={{ color:T.text3,fontSize:11 }}>⏳</span>}
        <button onClick={onLogout} style={{ background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",color:T.text2,cursor:"pointer" }}>🚪</button>
      </header>
      <div style={{ display:"flex",background:T.card,borderBottom:`1px solid ${T.border}` }}>
        {[["restaurants","🏪","Restaurants"],["users","👥","Utilisateurs"]].map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1,padding:12,background:"none",border:"none",borderBottom:tab===id?`3px solid ${T.gold}`:"3px solid transparent",color:tab===id?T.gold:T.text3,cursor:"pointer",fontWeight:700 }}>{ic} {lb}</button>
        ))}
      </div>
      <div style={{ padding:14,maxWidth:700,margin:"0 auto" }}>
        {tab==="restaurants" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <Lbl>RESTAURANTS ({(db.restaurants||[]).length})</Lbl>
              <button onClick={()=>setShowNr(!showNr)} style={addBtnS}>+ Nouveau</button>
            </div>
            {showNr && (
              <div style={{ background:T.card,borderRadius:12,padding:14,marginBottom:14,border:`1px solid ${T.border}`,boxShadow:`0 2px 8px ${T.shadow}` }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}>
                  <SI ph="Nom" val={nr.name} set={v=>setNr(p=>({...p,name:v}))} />
                  <SI ph="Emoji logo" val={nr.logo} set={v=>setNr(p=>({...p,logo:v}))} />
                  <SI ph="Adresse" val={nr.address} set={v=>setNr(p=>({...p,address:v}))} />
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <input type="color" value={nr.color} onChange={e=>setNr(p=>({...p,color:e.target.value}))} style={{ width:44,height:40,border:"none",borderRadius:6,cursor:"pointer" }} />
                    <span style={{ color:T.text2,fontSize:12 }}>Couleur</span>
                  </div>
                </div>
                <BigBtn color={T.gold} onClick={addRest}>✅ Créer</BigBtn>
              </div>
            )}
            {(db.restaurants||[]).map(r=>(
              <div key={r.id} style={{ background:T.card,borderRadius:14,padding:14,marginBottom:10,border:`1px solid ${r.color}44`,display:"flex",alignItems:"center",gap:14,boxShadow:`0 2px 8px ${T.shadow}` }}>
                {r.logoUrl ? <img src={r.logoUrl} alt={r.name} style={{ width:46,height:46,borderRadius:8,objectFit:"cover" }} /> : <span style={{ fontSize:38 }}>{r.logo}</span>}
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800,fontSize:15,color:T.text }}>{r.name}</div>
                  <div style={{ color:T.text3,fontSize:12 }}>{r.address}</div>
                  <div style={{ fontSize:11,color:T.text3,marginTop:3 }}>👥 {(db.users||[]).filter(u=>u.rId===r.id).length} · 🍽️ {(db.menus?.[r.id]||[]).length} plats</div>
                </div>
                <button onClick={()=>mutate(d=>{d.restaurants=d.restaurants.filter(x=>x.id!==r.id);d.users=d.users.filter(u=>u.rId!==r.id);delete d.menus[r.id];delete d.inventory[r.id];return d;})}
                  style={{ background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,padding:"7px 11px",color:"#dc2626",cursor:"pointer" }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
        {tab==="users" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <Lbl>UTILISATEURS ({(db.users||[]).length})</Lbl>
              <button onClick={()=>setShowNu(!showNu)} style={addBtnS}>+ Nouveau</button>
            </div>
            {showNu && (
              <div style={{ background:T.card,borderRadius:12,padding:14,marginBottom:14,border:`1px solid ${T.border}`,boxShadow:`0 2px 8px ${T.shadow}` }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}>
                  <SI ph="Nom complet" val={nu.name} set={v=>setNu(p=>({...p,name:v}))} />
                  <SI ph="Identifiant" val={nu.username} set={v=>setNu(p=>({...p,username:v}))} />
                  <SI ph="Mot de passe" val={nu.password} set={v=>setNu(p=>({...p,password:v}))} type="password" />
                  <select value={nu.role} onChange={e=>setNu(p=>({...p,role:e.target.value}))} style={selS}>
                    <option value="chef">👨‍🍳 Cuisinier</option>
                    <option value="cashier">💳 Caissier</option>
                    <option value="waiter">🍽️ Serveur</option>
                    <option value="manager">📋 Gérant</option>
                  </select>
                  <select value={nu.rId} onChange={e=>setNu(p=>({...p,rId:e.target.value}))} style={{...selS,gridColumn:"1/-1"}}>
                    <option value="">-- Restaurant --</option>
                    {(db.restaurants||[]).map(r=><option key={r.id} value={r.id}>{r.logo} {r.name}</option>)}
                  </select>
                </div>
                <BigBtn color={T.gold} onClick={addUser}>✅ Créer</BigBtn>
              </div>
            )}
            {(db.users||[]).map(u => {
              const rest=(db.restaurants||[]).find(r=>r.id===u.rId);
              const rL={chef:"Cuisinier",cashier:"Caissier",waiter:"Serveur",manager:"Gérant"};
              return (
                <div key={u.id} style={{ background:T.card,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12,boxShadow:`0 1px 4px ${T.shadow}` }}>
                  <span style={{ fontSize:26 }}>{u.avatar}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,color:T.text }}>{u.name}</div>
                    <div style={{ fontSize:12,color:T.text2 }}>@{u.username} · {rL[u.role]}</div>
                    {rest && <div style={{ fontSize:11,color:T.text3 }}>{rest.logo} {rest.name}</div>}
                  </div>
                  <button onClick={()=>mutate(d=>{d.users=d.users.filter(x=>x.id!==u.id);return d;})}
                    style={{ background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,padding:"7px 11px",color:"#dc2626",cursor:"pointer" }}>🗑️</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MICRO HELPERS ─────────────────────────────────────────────────────────────
function Pane({ color, title, children }) {
  return (
    <div style={{ background:T.card,border:`1px solid ${color}33`,borderRadius:14,padding:14,marginBottom:14,boxShadow:`0 2px 8px ${T.shadow}` }}>
      <div style={{ color,fontSize:10,letterSpacing:2,fontWeight:700,marginBottom:12 }}>{title}</div>
      {children}
    </div>
  );
}
function FInp({ label, val, set, icon, type="text", onEnter }) {
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ color:T.text2,fontSize:10,letterSpacing:2,marginBottom:4,fontWeight:700 }}>{label}</div>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:16 }}>{icon}</span>
        <input type={type} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onEnter?.()}
          style={{ width:"100%",background:T.bg3,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 11px 11px 38px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif" }} />
      </div>
    </div>
  );
}
function SI({ ph, val, set, type="text" }) {
  return <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
    style={{ background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:"Georgia,serif",width:"100%",boxSizing:"border-box" }} />;
}
function BigBtn({ color, onClick, children, disabled, style={} }) {
  return <button onClick={onClick} disabled={disabled}
    style={{ width:"100%",background:disabled?T.bg3:`linear-gradient(135deg,${color},${color}bb)`,border:"none",borderRadius:10,padding:13,color:disabled?T.text3:"#fff",fontWeight:900,cursor:disabled?"not-allowed":"pointer",fontSize:14,letterSpacing:1,fontFamily:"Georgia,serif",boxShadow:disabled?"none":`0 3px 12px ${color}44`,...style }}>
    {children}
  </button>;
}
function QB({ onClick, children }) {
  return <button onClick={onClick}
    style={{ width:28,height:28,borderRadius:6,border:`1px solid ${T.border}`,background:T.bg3,color:T.text,cursor:"pointer",fontWeight:900,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",padding:0 }}>
    {children}
  </button>;
}
function RR({ l, v, c, bold }) {
  return <div style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13 }}>
    <span style={{ color:T.text2 }}>{l}</span>
    <span style={{ color:c||T.text,fontWeight:bold?900:400 }}>{v}</span>
  </div>;
}
function StatCard({ icon, label, val, color }) {
  return <div style={{ background:T.card,borderRadius:12,padding:14,border:`1px solid ${color}33`,textAlign:"center",boxShadow:`0 2px 8px ${T.shadow}` }}>
    <div style={{ fontSize:22 }}>{icon}</div>
    <div style={{ fontSize:20,fontWeight:900,color,margin:"4px 0" }}>{val}</div>
    <div style={{ fontSize:11,color:T.text3 }}>{label}</div>
  </div>;
}
function Lbl({ children, style={} }) {
  return <div style={{ color:T.text3,fontSize:10,letterSpacing:3,marginBottom:9,fontWeight:700,...style }}>{children}</div>;
}
function Empty({ icon, text }) {
  return <div style={{ textAlign:"center",padding:"36px 20px",color:T.text3 }}>
    <div style={{ fontSize:42,marginBottom:10 }}>{icon}</div>
    <div style={{ fontSize:14 }}>{text}</div>
  </div>;
}
const addBtnS = { background:`${T.gold}18`,border:`1px solid ${T.gold}44`,borderRadius:8,padding:"6px 14px",color:T.gold,cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"Georgia,serif" };
const selS = { background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:13,fontFamily:"Georgia,serif",outline:"none",width:"100%",boxSizing:"border-box" };
