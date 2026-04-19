import { useState, useEffect, useRef, useCallback } from "react";
import { loadFromFirestore, saveToFirestore, subscribeToFirestore } from "./firebase.js";


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
    { id: "r1", name: "Le Bistro Parisien", logo: "🥐", color: "#D4A017", address: "12 Rue de la Paix, Paris" },
    { id: "r2", name: "La Bella Italia", logo: "🍕", color: "#C0392B", address: "8 Via Roma, Lyon" },
    { id: "r3", name: "Layali Al Cham Laeken", logo: "🌙", color: "#8B2500", address: "Rue Fransman 42, 1020 Laeken", logoUrl: "https://i.imgur.com/gIBT9dV.png" }
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
  shoppingLists: [], // historique des listes validées
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
      { id: "i7", name: "Viande agneau",  unit: "kg", qty: 10, min: 3 },
      { id: "i8", name: "Poulet",         unit: "kg", qty: 8,  min: 3 },
      { id: "i9", name: "Huile olive",    unit: "L",  qty: 5,  min: 2 },
      { id: "i10", name: "Pois chiches", unit: "kg", qty: 6,  min: 2 },
      { id: "i11", name: "Pain pita",    unit: "pcs", qty: 50, min: 20 },
    ]
  }
};

const uid  = () => Math.random().toString(36).substr(2, 8);
const ts   = () => new Date().toISOString();
const fmt  = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmtD = (iso) => new Date(iso).toLocaleDateString("fr-FR");
const fmtDT= (iso) => {
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
  scheduled: { label: "Programmée", color: "#8b5cf6", bg: "#10081a", icon: "🕐", next: "pending"   },
  pending:   { label: "Nouvelle",   color: "#f59e0b", bg: "#201800", icon: "🆕", next: "preparing" },
  preparing: { label: "En cuisine", color: "#3b82f6", bg: "#001020", icon: "🔥", next: "ready"     },
  ready:     { label: "Prête ✅",   color: "#10b981", bg: "#002010", icon: "🔔", next: "served"    },
  served:    { label: "Servie",     color: "#a78bfa", bg: "#100018", icon: "🍽️", next: "paid"      },
  paid:      { label: "Payée",      color: "#6b7280", bg: "#111",    icon: "💰", next: null         },
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
// ── ORDER ALERT HOOK ─────────────────────────────────────────────────────────
function useOrderAlert(db, session) {
  const [alertOrder, setAlertOrder] = useState(null);
  const dismissedRef = useRef(new Set());
  const intervalRef = useRef(null);
  const seenOrdersRef = useRef(new Set());

  const playAlert = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      // Belle mélodie d'alerte 4 notes
      [[880,0],[660,0.25],[880,0.5],[1100,0.75]].forEach(([freq, delay]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.45, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.35);
      });
    } catch(e) { console.log('Audio error:', e); }
  }, []);

  useEffect(() => {
    if (!session || session.type === 'super' || !db) return;
    const { restaurant: r, user } = session;
    
    const orders = (db.orders || []).filter(o =>
      o.rId === r.id &&
      o.status === 'pending' &&
      o.by !== user.name &&
      !dismissedRef.current.has(o.id)
    );

    // Detect NEW orders (not seen before)
    orders.forEach(o => {
      if (!seenOrdersRef.current.has(o.id)) {
        seenOrdersRef.current.add(o.id);
        // New order! trigger alert immediately
        playAlert();
      }
    });

    if (orders.length > 0) {
      const newest = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      setAlertOrder(newest);
      
      // Repeat sound every 8 seconds until dismissed
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          const stillPending = (db.orders || []).filter(o =>
            o.rId === r.id &&
            o.status === 'pending' &&
            o.by !== user.name &&
            !dismissedRef.current.has(o.id)
          );
          if (stillPending.length > 0) {
            playAlert();
          } else {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setAlertOrder(null);
          }
        }, 8000);
      }
    } else {
      setAlertOrder(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {};
  }, [db, session, playAlert]);

  const dismissAlert = useCallback((orderId) => {
    dismissedRef.current.add(orderId);
    setAlertOrder(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { alertOrder, dismissAlert };
}

// ── ORDER ALERT BANNER ────────────────────────────────────────────────────────
function OrderAlertBanner({ order, onAccept }) {
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:10001,
      background:"linear-gradient(135deg,#991b1b,#dc2626,#ef4444)",
      padding:"14px 16px",
      display:"flex", alignItems:"center", gap:12,
      boxShadow:"0 4px 40px rgba(220,38,38,.9)",
      animation:"slideD .3s cubic-bezier(.34,1.56,.64,1)"
    }}>
      <div style={{ fontSize:36, animation:"ringBell .4s infinite alternate" }}>🔔</div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:900, fontSize:16, color:"#fff", letterSpacing:1 }}>
          🆕 NOUVELLE COMMANDE !
        </div>
        <div style={{ color:"rgba(255,255,255,.9)", fontSize:13, marginTop:2 }}>
          <strong>{order.client}</strong> · {order.items?.length} article(s) · <strong>{order.total?.toFixed(2)}€</strong> · par {order.by}
        </div>
      </div>
      <button onClick={() => onAccept(order.id)}
        style={{
          background:"#fff", border:"none", borderRadius:10,
          padding:"12px 20px", color:"#dc2626",
          fontWeight:900, fontSize:14, cursor:"pointer",
          boxShadow:"0 2px 12px rgba(0,0,0,.3)",
          flexShrink:0, letterSpacing:1
        }}>
        ✅ VU
      </button>
      <style>{`
        @keyframes ringBell{from{transform:rotate(-20deg)}to{transform:rotate(20deg)}}
      `}</style>
    </div>
  );
}


// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [db, setDb] = useState(null); // null = loading
  const [session, setSession] = useState(null);
  const [flash, setFlash] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const flashTimer = useRef(null);
  const saveTimer = useRef(null);
  const localVersion = useRef(0);
  const remoteVersion = useRef(0);

  // Load initial data from Firestore — NEVER overwrite existing Firebase data
  useEffect(() => {
    loadFromFirestore().then(data => {
      if (data) {
        const merged = {
          ...INITIAL_DB,
          ...data,
          restaurants: data.restaurants?.length ? data.restaurants : INITIAL_DB.restaurants,
          users: data.users?.length ? data.users : INITIAL_DB.users,
          orders: data.orders || [],
          needs: data.needs || [],
          menus: { ...INITIAL_DB.menus, ...data.menus },
          inventory: { ...INITIAL_DB.inventory, ...data.inventory },
          superAdmin: data.superAdmin || INITIAL_DB.superAdmin,
        };
        setDb(merged);
      } else {
        setDb(INITIAL_DB);
        saveToFirestore(INITIAL_DB);
      }
    });
  }, []);

  // Subscribe to real-time Firestore updates — ALWAYS apply remote changes
  useEffect(() => {
    const unsub = subscribeToFirestore((remoteDb, remoteTs) => {
      // Only skip if we saved MORE recently than the remote update
      if (remoteTs && remoteTs <= localVersion.current) return;
      remoteVersion.current = remoteTs || 0;
      setDb(remoteDb);
    });
    return unsub;
  }, []);

  // Debounced save to Firestore
  const scheduleSave = useCallback((data) => {
    clearTimeout(saveTimer.current);
    setSyncing(true);
    const version = Date.now();
    localVersion.current = version;
    saveTimer.current = setTimeout(async () => {
      await saveToFirestore(data, version);
      setSyncing(false);
    }, 500);
  }, []);

  const mutate = useCallback((fn, flashData) => {
    setDb(prev => {
      if (!prev) return prev;
      const next = fn(JSON.parse(JSON.stringify(prev)));
      scheduleSave(next);
      if (flashData) {
        clearTimeout(flashTimer.current);
        setFlash(flashData);
        flashTimer.current = setTimeout(() => setFlash(null), 8000);
      }
      return next;
    });
  }, [scheduleSave]);

  const { alert30, dismissAlert } = useScheduledAlerts(db || INITIAL_DB, session, mutate);
  const { alertOrder, dismissAlert: dismissOrderAlert } = useOrderAlert(db || INITIAL_DB, session);

  // Loading screen
  if (!db) return (
    <div style={{ minHeight:"100vh", background:"#060606", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", color:"#fff", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center, #1a0800 0%, #060606 70%)" }} />
      <div style={{ position:"relative", textAlign:"center" }}>
        <img src="https://i.imgur.com/hAaiZjt.png" alt="KamEat"
          style={{ width:220, height:220, objectFit:"contain", marginBottom:8, animation:"fadeIn 0.8s ease, pulse 2s ease-in-out infinite" }}
          onError={e=>{ e.target.style.display="none"; }} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:6 }}>
          <div style={{ width:40, height:1, background:"#D4A017", opacity:0.6 }} />
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#D4A017" }} />
          <div style={{ width:40, height:1, background:"#D4A017", opacity:0.6 }} />
        </div>
        <div style={{ color:"#C9920A", fontSize:11, letterSpacing:6, marginBottom:28, opacity:0.8 }}>GESTION RESTAURANT</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
          <div style={{ width:28, height:2, borderRadius:1, background:"#D4A017", animation:"loading 1.5s ease-in-out infinite" }} />
          <div style={{ color:"#888", fontSize:12, letterSpacing:2 }}>CHARGEMENT</div>
          <div style={{ width:28, height:2, borderRadius:1, background:"#D4A017", animation:"loading 1.5s ease-in-out infinite 0.3s" }} />
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{filter:drop-shadow(0 0 8px #D4A01744)} 50%{filter:drop-shadow(0 0 22px #D4A01799)} }
        @keyframes loading { 0%,100%{opacity:0.3;transform:scaleX(0.6)} 50%{opacity:1;transform:scaleX(1)} }
      `}</style>
    </div>
  );

  if (!session) return <LoginScreen db={db} onLogin={setSession} />;
  const props = { db, mutate, session, onLogout: () => setSession(null), syncing };

  return (
    <div>
      {flash && <FlashBanner flash={flash} onClose={() => setFlash(null)} />}
      {alertOrder && <OrderAlertBanner order={alertOrder} onAccept={dismissOrderAlert} color="#dc2626" />}
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
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:10000,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 40px rgba(124,58,237,.6)",animation:"slideD .35s cubic-bezier(.34,1.56,.64,1)" }}>
      <span style={{ fontSize:36, animation:"ringBell .5s infinite alternate" }}>🔔</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:900,fontSize:15,color:"#fff" }}>COMMANDE DANS 30 MIN — {order.client}</div>
        <div style={{ color:"rgba(255,255,255,.8)",fontSize:12,marginTop:2 }}>Prête pour <strong>{fmtDT(order.pickupAt)}</strong> · ✅ Envoyée en cuisine</div>
      </div>
      <button onClick={onClose} style={{ background:"rgba(0,0,0,.3)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:14 }}>✕</button>
      <style>{`@keyframes slideD{from{transform:translateY(-100%)}to{transform:translateY(0)}} @keyframes ringBell{from{transform:rotate(-15deg)}to{transform:rotate(15deg)}}`}</style>
    </div>
  );
}

function FlashBanner({ flash, onClose }) {
  const isOrder = flash.type === "order";
  const isAlert = flash.type === "alert30";
  const bg = isOrder ? "linear-gradient(135deg,#b45309,#d97706)" : isAlert ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  return (
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:9999,background:bg,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 40px rgba(0,0,0,.8)",animation:"slideD .35s cubic-bezier(.34,1.56,.64,1)" }}>
      <span style={{ fontSize:36, animation:"wobble .4s ease" }}>{isOrder?"📞":isAlert?"🔔":"🛒"}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:900,fontSize:15,color:"#fff" }}>
          {isOrder ? `NOUVELLE COMMANDE — ${flash.data.client}` : isAlert ? `⚠️ COMMANDE DANS 30 MIN — ${flash.data.client}` : "BESOIN SIGNALÉ"}
        </div>
        <div style={{ color:"rgba(255,255,255,.8)",fontSize:12,marginTop:2 }}>
          {isOrder ? `${flash.data.items?.length} art. · ${flash.data.total?.toFixed(2)}€ · Prête pour ${fmtDT(flash.data.pickupAt)}` :
           isAlert ? `Prête pour ${fmtDT(flash.data.pickupAt)}` :
           `${flash.data.avatar} ${flash.data.by} : "${flash.data.text}"`}
        </div>
      </div>
      <button onClick={onClose} style={{ background:"rgba(0,0,0,.3)",border:"none",borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:14 }}>✕</button>
      <style>{`@keyframes wobble{0%{transform:scale(1)}40%{transform:scale(1.3) rotate(-8deg)}100%{transform:scale(1)}}`}</style>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ db, onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");

  const login = () => {
    setErr("");
    // Super admin
    if (user === db.superAdmin.username && pass === db.superAdmin.password) { onLogin({ type:"super" }); return; }
    // Find user across ALL restaurants — staff only sees their own restaurant
    const found = (db.users||[]).find(u => u.username === user && u.password === pass);
    if (found) {
      const rest = (db.restaurants||[]).find(r => r.id === found.rId);
      if (rest) { onLogin({ type:"user", user:found, restaurant:rest }); return; }
    }
    setErr("Identifiants incorrects");
  };

  return (
    <div style={{ minHeight:"100vh",background:"#060606",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center",marginBottom:36 }}>
        <div style={{ fontSize:64 }}>🍽️</div>
        <h1 style={{ margin:"8px 0 4px",fontSize:30,fontWeight:900,color:"#fff",letterSpacing:5 }}>Kam<span style={{ color:"#D4A017" }}>Eat</span></h1>
        <div style={{ color:"#333",fontSize:10,letterSpacing:4 }}>GESTION RESTAURANT</div>
      </div>
      <div style={{ width:"100%",maxWidth:380,background:"#0f0f0f",borderRadius:20,border:"1px solid #1e1e1e",padding:26,boxShadow:"0 30px 80px rgba(0,0,0,.9)" }}>
        <Lbl style={{ textAlign:"center",marginBottom:20 }}>CONNEXION</Lbl>
        <FInp label="IDENTIFIANT" val={user} set={setUser} icon="👤" />
        <FInp label="MOT DE PASSE" val={pass} set={setPass} icon="🔑" type="password" onEnter={login} />
        {err && <div style={{ color:"#ef4444",fontSize:13,textAlign:"center",marginBottom:12 }}>{err}</div>}
        <button onClick={login} style={{ width:"100%",background:"linear-gradient(135deg,#D4A017,#b8860b)",border:"none",borderRadius:12,padding:15,fontSize:15,fontWeight:900,color:"#060606",cursor:"pointer",letterSpacing:2 }}>
          SE CONNECTER →
        </button>
        <div style={{ color:"#333",fontSize:11,textAlign:"center",marginTop:16,lineHeight:1.8 }}>
          Chaque membre du staff se connecte avec<br/>son identifiant personnel unique
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
    <div style={{ minHeight:"100vh",background:"#080808",fontFamily:"Georgia,serif",color:"#fff" }}>
      <header style={{ background:`linear-gradient(135deg,#0d0d0d,${r.color}18)`,borderBottom:`2px solid ${r.color}33`,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:50 }}>
        {r.logoUrl ? <img src={r.logoUrl} alt={r.name} style={{ width:40,height:40,borderRadius:8,objectFit:"cover" }} /> : <span style={{ fontSize:34 }}>{r.logo}</span>}
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800,fontSize:13,letterSpacing:1 }}>{r.name}</div>
          <div style={{ fontSize:11,color:`${r.color}bb` }}>{user.avatar} {user.name} · {rL[user.role]}</div>
        </div>
        {syncing && <span style={{ fontSize:11,color:"#555",animation:"pulse 1s infinite" }}>⏳ sync</span>}
        <button onClick={onLogout} style={{ background:"#111",border:"1px solid #222",borderRadius:8,padding:"6px 10px",color:"#666",cursor:"pointer",fontSize:12 }}>🚪</button>
      </header>
      {tabs?.length > 1 && (
        <nav style={{ display:"flex",background:"#0a0a0a",borderBottom:"1px solid #161616" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:1,padding:"11px 4px",background:"none",border:"none",borderBottom:activeTab===t.id?`3px solid ${r.color}`:"3px solid transparent",color:activeTab===t.id?r.color:"#444",cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:.3,position:"relative",transition:"color .2s" }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span style={{ position:"absolute",top:5,right:"calc(50% - 20px)",background:"#ef4444",color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900 }}>{t.badge}</span>}
            </button>
          ))}
        </nav>
      )}
      <main style={{ padding:14,maxWidth:860,margin:"0 auto" }}>{children}</main>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}

// ── PICKUP TIME PICKER ────────────────────────────────────────────────────────
function PickupPicker({ value, onChange, color }) {
  const mins = minsUntil(value);
  const labelColor = mins <= 0 ? "#ef4444" : mins <= 30 ? "#10b981" : "#8b5cf6";
  const label = mins <= 0 ? "⚠️ Heure passée" : mins <= 30 ? `⚡ Dans ${mins} min → cuisine immédiate` : `🕐 Dans ${mins} min`;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:6 }}>PRÊTE POUR QUELLE HEURE ? *</div>
      <input type="datetime-local" value={value} onChange={e=>onChange(e.target.value)} min={new Date().toISOString().slice(0,16)}
        style={{ width:"100%",background:"#141414",border:`2px solid ${color}44`,borderRadius:9,padding:"12px 14px",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",colorScheme:"dark" }} />
      <div style={{ fontSize:12,color:labelColor,marginTop:6,fontWeight:700 }}>{label}</div>
      <div style={{ display:"flex",gap:6,marginTop:8,flexWrap:"wrap" }}>
        {[15,30,45,60,90,120].map(m => {
          const d = new Date(Date.now() + m*60000); d.setSeconds(0,0);
          const v = d.toISOString().slice(0,16);
          return <button key={m} onClick={()=>onChange(v)} style={{ padding:"5px 10px",borderRadius:20,border:`1px solid ${color}44`,background:value===v?`${color}33`:"transparent",color:value===v?color:"#666",cursor:"pointer",fontSize:11,fontWeight:700 }}>+{m>=60?`${m/60}h`:`${m}min`}</button>;
        })}
      </div>
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
    { id:"call",   icon:"📞", label:"Appel",       badge:0 },
    { id:"orders", icon:"📋", label:"Commandes",   badge:active.length },
    { id:"sched",  icon:"🕐", label:"Programmées", badge:scheduled.length },
    { id:"needs",  icon:"🛒", label:"Besoins",     badge:needs.filter(n=>!n.done).length },
    { id:"res",    icon:"🪑", label:"Réservations", badge:(db.reservations||[]).filter(rv=>rv.rId===r.id&&!rv.done&&new Date(rv.date)>=new Date()).length },
  ];

  const reservations = (db.reservations||[]).filter(rv => rv.rId===r.id);

  return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>
      {tab==="call" && !calling && (
        <div style={{ textAlign:"center",paddingTop:36 }}>
          <div style={{ color:"#333",fontSize:10,letterSpacing:3,marginBottom:36 }}>GÉRANT · HORS RESTAURANT</div>
          <div style={{ position:"relative",display:"inline-block",marginBottom:44 }}>
            <div style={{ position:"absolute",inset:-18,borderRadius:"50%",background:"#16a34a0e",animation:"ring1 2s ease-out infinite" }} />
            <div style={{ position:"absolute",inset:-36,borderRadius:"50%",background:"#16a34a06",animation:"ring1 2s ease-out infinite .5s" }} />
            <button onClick={()=>setCalling(true)} style={{ position:"relative",width:180,height:180,borderRadius:"50%",border:"none",background:"linear-gradient(145deg,#16a34a,#15803d)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 0 50px #16a34a33" }}>
              <span style={{ fontSize:66 }}>📞</span>
              <span style={{ color:"#fff",fontWeight:900,fontSize:13,letterSpacing:3 }}>APPEL</span>
              <span style={{ color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:2 }}>ENTRANT</span>
            </button>
          </div>
          <p style={{ color:"#444",fontSize:13,maxWidth:260,margin:"0 auto 32px" }}>Un client appelle ? Appuyez pour prendre sa commande.</p>
          {scheduled.length > 0 && (
            <div style={{ textAlign:"left",background:"#0d0820",border:"1px solid #8b5cf644",borderRadius:12,padding:14,marginBottom:16 }}>
              <Lbl style={{ color:"#8b5cf6" }}>🕐 COMMANDES PROGRAMMÉES</Lbl>
              {scheduled.sort((a,b)=>new Date(a.pickupAt)-new Date(b.pickupAt)).slice(0,3).map(o => {
                const m = minsUntil(o.pickupAt);
                return (
                  <div key={o.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1a1030" }}>
                    <div><span style={{ fontWeight:700 }}>{o.client}</span><span style={{ color:"#555",fontSize:12,marginLeft:8 }}>{o.phone}</span></div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:"#8b5cf6",fontWeight:700,fontSize:13 }}>{fmtDT(o.pickupAt)}</div>
                      <div style={{ color:m<=60?"#f59e0b":"#555",fontSize:11 }}>dans {m>=60?`${Math.floor(m/60)}h${m%60>0?m%60+"min":""}`:`${m} min`}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {active.length > 0 && (
            <div style={{ textAlign:"left" }}>
              <Lbl>COMMANDES EN COURS</Lbl>
              {active.slice(0,3).map(o => (
                <div key={o.id} style={{ background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:10,padding:"11px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div><span style={{ fontWeight:700 }}>{o.client}</span><span style={{ color:"#444",fontSize:12,marginLeft:8 }}>{fmt(o.createdAt)}</span></div>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <span style={{ color:r.color,fontWeight:700 }}>{o.total.toFixed(2)}€</span>
                    <span style={{ background:SC[o.status].bg,color:SC[o.status].color,borderRadius:6,padding:"3px 8px",fontSize:11 }}>{SC[o.status].icon}</span>
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
            <button onClick={resetForm} style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:8,padding:"6px 12px",color:"#ef4444",cursor:"pointer",fontWeight:700,fontSize:12 }}>✕ Raccrocher</button>
          </div>
          <div style={{ display:"flex",gap:4,marginBottom:16 }}>
            {[["info","1 · Client"],["items","2 · Articles"],["time","3 · Heure"],["confirm","4 · Confirmer"]].map(([id,lb]) => (
              <button key={id} onClick={()=>setStep(id)} style={{ flex:1,padding:"8px 2px",borderRadius:8,border:"none",background:step===id?r.color:"#141414",color:step===id?"#060606":"#444",cursor:"pointer",fontWeight:800,fontSize:10 }}>{lb}</button>
            ))}
          </div>
          {step==="info" && (
            <Pane color={r.color} title="👤 CLIENT">
              <FInp label="NOM DU CLIENT *" val={clientName} set={setClientName} icon="👤" />
              <FInp label="TÉLÉPHONE" val={clientPhone} set={setClientPhone} icon="📱" />
              <div style={{ display:"flex",gap:6,marginBottom:14 }}>
                {[["phone","📞 Tél"],["dine-in","🪑 Place"],["takeaway","🥡 Emporter"]].map(([v,lb]) => (
                  <button key={v} onClick={()=>setOrderType(v)} style={{ flex:1,padding:"9px 4px",borderRadius:8,border:`2px solid ${orderType===v?r.color:"#1e1e1e"}`,background:orderType===v?`${r.color}22`:"transparent",color:orderType===v?r.color:"#444",cursor:"pointer",fontWeight:700,fontSize:11 }}>{lb}</button>
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
                      <button onClick={voice.active?voice.stop:voice.start} style={{ width:72,height:72,borderRadius:"50%",border:`3px solid ${voice.active?"#ef4444":"#16a34a"}`,background:voice.active?"#ef444412":"#16a34a12",cursor:"pointer",fontSize:30,outline:"none",animation:voice.active?"voicePulse 1.2s infinite":"none" }}>
                        {voice.active?"⏹":"🎤"}
                      </button>
                      <p style={{ color:voice.active?"#ef4444":"#555",fontSize:12,marginTop:8 }}>{voice.active?"🔴 En écoute...":'Ex: "un steak frites pour Jean"'}</p>
                      {voice.transcript && <div style={{ background:"#080f08",border:"1px solid #16a34a33",borderRadius:8,padding:10,color:"#86efac",fontSize:13,fontStyle:"italic" }}>"{voice.transcript}"</div>}
                    </>
                  ) : <div style={{ color:"#f59e0b",fontSize:12,background:"#1a1500",borderRadius:8,padding:12,border:"1px solid #f59e0b33" }}>⚠️ Micro disponible sur Chrome/Edge · Utilisez le menu ci-dessous</div>}
                </div>
              </Pane>
              <Pane color={r.color} title="🍽️ MENU">
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:12 }}>
                  {cats.map(c => <button key={c} onClick={()=>setCatFilter(c)} style={{ padding:"5px 11px",borderRadius:20,border:`1px solid ${catFilter===c?r.color:"#1e1e1e"}`,background:catFilter===c?r.color:"transparent",color:catFilter===c?"#060606":"#555",cursor:"pointer",fontSize:11,fontWeight:700 }}>{c}</button>)}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8 }}>
                  {menuItems.map(item => (
                    <button key={item.id} onClick={()=>addToCart(item)} style={{ background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:0,cursor:"pointer",textAlign:"center",color:"#fff",transition:"all .15s",overflow:"hidden" }}
                      onMouseOver={e=>{e.currentTarget.style.borderColor=r.color;e.currentTarget.style.background=`${r.color}11`;}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor="#1a1a1a";e.currentTarget.style.background="#111";}}>
                      {item.img ? <img src={item.img} alt={item.name} style={{ width:"100%",height:80,objectFit:"cover",display:"block" }} onError={e=>e.target.style.display="none"} /> : <div style={{ fontSize:28,padding:"10px 0" }}>{item.emoji}</div>}
                      <div style={{ padding:"6px 4px" }}>
                        <div style={{ fontSize:10,fontWeight:700,marginBottom:2,lineHeight:1.2 }}>{item.name}</div>
                        <div style={{ color:r.color,fontSize:12,fontWeight:900 }}>{item.price.toFixed(2)}€</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Pane>
              {cart.length > 0 && (
                <Pane color={r.color} title={`🛒 PANIER (${cart.length})`}>
                  {cart.map(c => (
                    <div key={c.mid} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #141414" }}>
                      <span style={{ fontSize:20 }}>{c.emoji}</span><span style={{ flex:1,fontSize:13 }}>{c.name}</span>
                      <QB onClick={()=>setCart(p=>{const e=p.find(x=>x.mid===c.mid);return e.qty>1?p.map(x=>x.mid===c.mid?{...x,qty:x.qty-1}:x):p.filter(x=>x.mid!==c.mid)})}>−</QB>
                      <span style={{ width:22,textAlign:"center",fontWeight:800 }}>{c.qty}</span>
                      <QB onClick={()=>setCart(p=>p.map(x=>x.mid===c.mid?{...x,qty:x.qty+1}:x))}>+</QB>
                      <span style={{ color:r.color,fontWeight:700,width:50,textAlign:"right",fontSize:13 }}>{(c.price*c.qty).toFixed(2)}€</span>
                    </div>
                  ))}
                  <BigBtn color={r.color} onClick={()=>setStep("time")} style={{ marginTop:12 }}>Heure →</BigBtn>
                </Pane>
              )}
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
            </div>
          )}
          {step==="time" && (
            <Pane color="#8b5cf6" title="🕐 HEURE DE RETRAIT">
              <PickupPicker value={pickupAt} onChange={setPickupAt} color="#8b5cf6" />
              <div style={{ background:"#0d0820",borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:"#a78bfa" }}>
                ℹ️ Si l'heure est dans plus de 30 min → commande <strong>programmée</strong>, envoyée en cuisine 30 min avant automatiquement.
              </div>
              <BigBtn color="#8b5cf6" onClick={()=>setStep("confirm")} disabled={!pickupAt||minsUntil(pickupAt)<0}>Confirmer →</BigBtn>
            </Pane>
          )}
          {step==="confirm" && (
            <Pane color="#16a34a" title="✅ RÉCAPITULATIF">
              <div style={{ background:"#0a140a",borderRadius:10,padding:14,marginBottom:14 }}>
                <RR l="Client" v={clientName} c="#fff" bold /><RR l="Téléphone" v={clientPhone||"—"} c="#888" />
                <RR l="Type" v={{phone:"📞 Téléphone","dine-in":"🪑 Sur place",takeaway:"🥡 Emporter"}[orderType]} c="#fff" />
                <RR l="Prête pour" v={fmtDT(pickupAt)} c="#8b5cf6" bold />
                <div style={{ background:minsUntil(pickupAt)>30?"#0d0820":"#0a140a",border:`1px solid ${minsUntil(pickupAt)>30?"#8b5cf633":"#16a34a33"}`,borderRadius:8,padding:"8px 12px",margin:"8px 0",fontSize:12,color:minsUntil(pickupAt)>30?"#a78bfa":"#86efac" }}>
                  {minsUntil(pickupAt)>30?"🕐 Commande programmée — cuisine alertée 30 min avant":"⚡ Commande immédiate — envoyée en cuisine maintenant"}
                </div>
                <div style={{ borderTop:"1px solid #1a2e1a",margin:"10px 0" }} />
                {cart.map(c=><RR key={c.mid} l={`${c.emoji} ${c.name} ×${c.qty}`} v={`${(c.price*c.qty).toFixed(2)}€`} c={r.color} />)}
                <div style={{ borderTop:"1px solid #1a2e1a",margin:"10px 0" }} />
                <RR l="TOTAL" v={`${cart.reduce((s,c)=>s+c.price*c.qty,0).toFixed(2)}€`} c="#16a34a" bold />
              </div>
              <button onClick={submitOrder} style={{ width:"100%",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:14,padding:17,fontSize:15,fontWeight:900,color:"#fff",cursor:"pointer",letterSpacing:2,textTransform:"uppercase",boxShadow:"0 8px 30px #16a34a44" }}>
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
  const [tab, setTab] = useState("call");
  const [calling, setCalling] = useState(false);
  const [step, setStep] = useState("info");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [orderType, setOrderType] = useState("phone");
  const [cart, setCart] = useState([]);
  const [catFilter, setCatFilter] = useState("Tous");
  const [pickupAt, setPickupAt] = useState(defaultPickup);
  const { restaurant:r, user } = session;
  const orders = (db.orders||[]).filter(o => o.rId===r.id && ["pending","preparing","ready","scheduled"].includes(o.status));
  const needs  = (db.needs||[]).filter(n => n.rId===r.id);
  const menu   = db.menus?.[r.id] || [];
  const scheduled = orders.filter(o => o.status==="scheduled");
  const reservations = (db.reservations||[]).filter(rv => rv.rId===r.id);

  const addToCart = (item) => setCart(p => { const ex = p.find(x => x.mid===item.id); return ex ? p.map(x=>x.mid===item.id?{...x,qty:x.qty+1}:x) : [...p,{mid:item.id,name:item.name,price:item.price,qty:1,emoji:item.emoji}]; });
  const handleVoiceChef = useCallback((text) => {
    const lower = text.toLowerCase();
    menu.forEach(item => { if (lower.includes(item.name.toLowerCase())) addToCart(item); });
    const nm = text.match(/(?:pour|client|monsieur|madame)\s+([A-Za-zÀ-ɏ]+(?:\s+[A-Za-zÀ-ɏ]+)?)/i);
    if (nm) setClientName(nm[1].charAt(0).toUpperCase() + nm[1].slice(1));
  }, [menu]);
  const voiceChef = useVoice(handleVoiceChef);
  const resetChefForm = () => { setCart([]); setClientName(""); setClientPhone(""); setCalling(false); setStep("info"); setPickupAt(defaultPickup()); };
  const submitChefOrder = () => {
    if (!clientName || !cart.length || !pickupAt) return;
    const mins = minsUntil(pickupAt);
    const status = mins > 30 ? "scheduled" : "pending";
    const prepMin = Math.min(Math.max(...cart.map(c=>(menu.find(m=>m.id===c.mid)?.prep||15))),45);
    const order = { id:uid(), rId:r.id, client:clientName, phone:clientPhone, type:orderType, items:cart, total:cart.reduce((s,c)=>s+c.price*c.qty,0), prepMin, status, pickupAt, createdAt:ts(), by:user.name };
    mutate(d=>{ d.orders.push(order); return d; }, { type:"order", data:order });
    resetChefForm(); setTab("orders");
  };
  const cats = ["Tous", ...new Set(menu.map(m=>m.cat))];
  const menuItems = catFilter==="Tous" ? menu : menu.filter(m=>m.cat===catFilter);

  const tabs = [
    { id:"call",   icon:"📞", label:"Appel",        badge:0 },
    { id:"orders", icon:"📋", label:"Commandes",    badge:orders.filter(o=>!["paid","scheduled"].includes(o.status)).length },
    { id:"sched",  icon:"🕐", label:"Programmées",  badge:scheduled.length },
    { id:"needs",  icon:"🛒", label:"Besoins",      badge:needs.filter(n=>!n.done).length },
    { id:"res",    icon:"🪑", label:"Réserv.",       badge:reservations.filter(rv=>!rv.done&&new Date(rv.date)>=new Date()).length },
  ];
    return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>

      {tab==="call" && !calling && (
        <div style={{ textAlign:"center",paddingTop:60,minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
          <div style={{ color:"#555",fontSize:10,letterSpacing:3,marginBottom:36 }}>CUISINIER · PRISE DE COMMANDE</div>
          <div style={{ position:"relative",display:"inline-block",marginBottom:44 }}>
            <div style={{ position:"absolute",inset:-18,borderRadius:"50%",background:"#16a34a0e",animation:"ring1 2s ease-out infinite" }} />
            <button onClick={()=>setCalling(true)} style={{ position:"relative",width:160,height:160,borderRadius:"50%",border:"none",background:"linear-gradient(145deg,#16a34a,#15803d)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 0 50px #16a34a33" }}>
              <span style={{ fontSize:58 }}>📞</span>
              <span style={{ color:"#fff",fontWeight:900,fontSize:12,letterSpacing:3 }}>APPEL</span>
              <span style={{ color:"rgba(255,255,255,.5)",fontSize:10 }}>ENTRANT</span>
            </button>
          </div>
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
            <button onClick={resetChefForm} style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:8,padding:"6px 12px",color:"#ef4444",cursor:"pointer",fontSize:12 }}>✕ Raccrocher</button>
          </div>
          <div style={{ display:"flex",gap:4,marginBottom:16 }}>
            {[["info","1.Client"],["items","2.Articles"],["time","3.Heure"],["confirm","4.Confirmer"]].map(([id,lb])=>(
              <button key={id} onClick={()=>setStep(id)} style={{ flex:1,padding:"8px 2px",borderRadius:8,border:"none",background:step===id?r.color:"#141414",color:step===id?"#060606":"#444",cursor:"pointer",fontWeight:800,fontSize:10 }}>{lb}</button>
            ))}
          </div>
          {step==="info" && (
            <Pane color={r.color} title="CLIENT">
              <FInp label="NOM DU CLIENT *" val={clientName} set={setClientName} icon="👤" />
              <FInp label="TELEPHONE" val={clientPhone} set={setClientPhone} icon="📱" />
              <div style={{ display:"flex",gap:6,marginBottom:14 }}>
                {[["phone","Tel"],["dine-in","Place"],["takeaway","Emporter"]].map(([v,lb])=>(
                  <button key={v} onClick={()=>setOrderType(v)} style={{ flex:1,padding:"9px 4px",borderRadius:8,border:`2px solid ${orderType===v?r.color:"#1e1e1e"}`,background:orderType===v?`${r.color}22`:"transparent",color:orderType===v?r.color:"#444",cursor:"pointer",fontWeight:700,fontSize:11 }}>{lb}</button>
                ))}
              </div>
              <BigBtn color={r.color} onClick={()=>setStep("items")} disabled={!clientName}>Articles</BigBtn>
            </Pane>
          )}
          {step==="items" && (
            <div>
              <Pane color={r.color} title="MENU">
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:12 }}>
                  {cats.map(c=><button key={c} onClick={()=>setCatFilter(c)} style={{ padding:"5px 11px",borderRadius:20,border:`1px solid ${catFilter===c?r.color:"#1e1e1e"}`,background:catFilter===c?r.color:"transparent",color:catFilter===c?"#060606":"#555",cursor:"pointer",fontSize:11,fontWeight:700 }}>{c}</button>)}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8 }}>
                  {menuItems.map(item=>(
                    <button key={item.id} onClick={()=>addToCart(item)} style={{ background:"#111",border:"1px solid #1a1a1a",borderRadius:10,padding:9,cursor:"pointer",textAlign:"center",color:"#fff" }}
                      onMouseOver={e=>{e.currentTarget.style.borderColor=r.color;}} onMouseOut={e=>{e.currentTarget.style.borderColor="#1a1a1a";}}>
                      <div style={{ fontSize:24 }}>{item.emoji}</div>
                      <div style={{ fontSize:10,fontWeight:700,margin:"3px 0" }}>{item.name}</div>
                      <div style={{ color:r.color,fontSize:11,fontWeight:800 }}>{item.price.toFixed(2)}€</div>
                    </button>
                  ))}
                </div>
              </Pane>
              {cart.length > 0 && (
                <Pane color={r.color} title={`PANIER (${cart.length})`}>
                  {cart.map(c=>(
                    <div key={c.mid} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #141414" }}>
                      <span style={{ fontSize:20 }}>{c.emoji}</span><span style={{ flex:1,fontSize:13 }}>{c.name}</span>
                      <QB onClick={()=>setCart(p=>{const e=p.find(x=>x.mid===c.mid);return e.qty>1?p.map(x=>x.mid===c.mid?{...x,qty:x.qty-1}:x):p.filter(x=>x.mid!==c.mid)})}>-</QB>
                      <span style={{ width:22,textAlign:"center",fontWeight:800 }}>{c.qty}</span>
                      <QB onClick={()=>setCart(p=>p.map(x=>x.mid===c.mid?{...x,qty:x.qty+1}:x))}>+</QB>
                      <span style={{ color:r.color,fontWeight:700,width:50,textAlign:"right",fontSize:13 }}>{(c.price*c.qty).toFixed(2)}€</span>
                    </div>
                  ))}
                  <BigBtn color={r.color} onClick={()=>setStep("time")} style={{ marginTop:12 }}>Heure</BigBtn>
                </Pane>
              )}
            </div>
          )}
          {step==="time" && (
            <Pane color="#8b5cf6" title="HEURE DE RETRAIT">
              <PickupPicker value={pickupAt} onChange={setPickupAt} color="#8b5cf6" />
              <BigBtn color="#8b5cf6" onClick={()=>setStep("confirm")} disabled={!pickupAt||minsUntil(pickupAt)<0}>Confirmer</BigBtn>
            </Pane>
          )}
          {step==="confirm" && (
            <Pane color="#16a34a" title="RECAPITULATIF">
              <div style={{ background:"#0a140a",borderRadius:10,padding:14,marginBottom:14 }}>
                <RR l="Client" v={clientName} c="#fff" bold />
                <RR l="Type" v={{phone:"Tel","dine-in":"Sur place",takeaway:"Emporter"}[orderType]} c="#fff" />
                <RR l="Prete pour" v={fmtDT(pickupAt)} c="#8b5cf6" bold />
                <div style={{ borderTop:"1px solid #1a2e1a",margin:"10px 0" }} />
                {cart.map(c=><RR key={c.mid} l={`${c.emoji} ${c.name} x${c.qty}`} v={`${(c.price*c.qty).toFixed(2)}€`} c={r.color} />)}
                <div style={{ borderTop:"1px solid #1a2e1a",margin:"10px 0" }} />
                <RR l="TOTAL" v={`${cart.reduce((s,c)=>s+c.price*c.qty,0).toFixed(2)}€`} c="#16a34a" bold />
              </div>
              <button onClick={submitChefOrder} style={{ width:"100%",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:14,padding:16,fontSize:15,fontWeight:900,color:"#fff",cursor:"pointer",letterSpacing:2 }}>
                VALIDER LA COMMANDE
              </button>
            </Pane>
          )}
        </div>
      )}

      {tab==="orders" && <OrdersPanel orders={orders.filter(o=>o.status!=="scheduled")} color={r.color} userRole="chef" mutate={mutate} userName={user.name} />}
      {tab==="sched"  && <ScheduledPanel orders={scheduled} color={r.color} mutate={mutate} />}
      {tab==="needs"  && <NeedsPanel needs={needs} rId={r.id} user={user} mutate={mutate} color={r.color} isManager db={db} />}
      {tab==="res"    && <ReservationsPanel reservations={reservations||[]} rId={r.id} user={user} mutate={mutate} color={r.color} />}

    </Shell>
  );
}

function CashierApp({ db, mutate, session, onLogout, syncing }) {
  const [tab, setTab] = useState("cash");
  const { restaurant:r, user } = session;
  const menu   = db.menus?.[r.id] || [];
  const orders = (db.orders||[]).filter(o => o.rId===r.id);
  const needs  = (db.needs||[]).filter(n => n.rId===r.id);
  const reservations = (db.reservations||[]).filter(rv => rv.rId===r.id);
  const toEnc  = orders.filter(o => ["ready","served"].includes(o.status));
  const paidToday = orders.filter(o => o.status==="paid" && fmtD(o.createdAt)===fmtD(ts()));
  const todayCA = paidToday.reduce((s,o)=>s+o.total,0);
  const upcomingRes = reservations.filter(rv => !rv.done && new Date(rv.date) >= new Date(new Date().setHours(0,0,0,0)));



  const tabs = [
    { id:"cash", icon:"💳", label:"Caisse", badge: toEnc.length },
  ];

  return (
    <Shell session={session} onLogout={onLogout} tabs={tabs} activeTab={tab} setTab={setTab} syncing={syncing}>

      {/* ── CAISSE ── */}
      {tab==="cash" && (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
            <StatCard icon="💰" label="CA Aujourd'hui" val={`${todayCA.toFixed(2)}€`} color={r.color} />
            <StatCard icon="✅" label="Payées" val={paidToday.length} color="#10b981" />
            <StatCard icon="⏳" label="À encaisser" val={toEnc.length} color="#f59e0b" />
          </div>
          <Lbl>💳 À ENCAISSER ({toEnc.length})</Lbl>
          {toEnc.length===0 ? <Empty icon="☕" text="Rien à encaisser" /> :
            toEnc.map(o => <CashierOrderCard key={o.id} order={o} color={r.color} mutate={mutate} userName={user.name} rId={r.id} />)}
          <Lbl style={{ marginTop:20 }}>📜 PAYÉES AUJOURD'HUI</Lbl>
          {paidToday.length===0 ? <Empty icon="📋" text="Aucune" /> :
            paidToday.map(o => <OrderCard key={o.id} order={o} color="#10b981" userRole="cashier" mutate={mutate} userName={user.name} readonly />)}
        </div>
      )}

      {/* ── CAISSE ── */}
      {tab==="cash" && (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
            <StatCard icon="💰" label="CA Aujourd'hui" val={`${todayCA.toFixed(2)}€`} color={r.color} />
            <StatCard icon="✅" label="Payées" val={paidToday.length} color="#10b981" />
            <StatCard icon="⏳" label="À encaisser" val={toEnc.length} color="#f59e0b" />
          </div>
          <Lbl>💳 À ENCAISSER ({toEnc.length})</Lbl>
          {toEnc.length===0 ? <Empty icon="☕" text="Rien à encaisser" /> :
            toEnc.map(o => <CashierOrderCard key={o.id} order={o} color={r.color} mutate={mutate} userName={user.name} rId={r.id} />)}
          <Lbl style={{ marginTop:20 }}>📜 PAYÉES AUJOURD'HUI</Lbl>
          {paidToday.length===0 ? <Empty icon="📋" text="Aucune" /> :
            paidToday.map(o => <OrderCard key={o.id} order={o} color="#10b981" userRole="cashier" mutate={mutate} userName={user.name} readonly />)}
        </div>
      )}
    </Shell>
  );
}

function WaiterApp({ db, mutate, session, onLogout, syncing }) {
  const { restaurant:r, user } = session;
  const toServe = (db.orders||[]).filter(o => o.rId===r.id && o.status==="ready");
  const served  = (db.orders||[]).filter(o => o.rId===r.id && o.status==="served" && fmtD(o.createdAt)===fmtD(ts()));
  return (
    <Shell session={session} onLogout={onLogout} tabs={[]} activeTab="" setTab={()=>{}} syncing={syncing}>
      <Lbl>🍽️ À SERVIR ({toServe.length})</Lbl>
      {toServe.length===0?<Empty icon="😊" text="Rien à servir" />:toServe.map(o=><OrderCard key={o.id} order={o} color={r.color} userRole="waiter" mutate={mutate} userName={user.name} />)}
      <Lbl style={{ marginTop:18 }}>✅ SERVIES AUJOURD'HUI ({served.length})</Lbl>
      {served.map(o=><OrderCard key={o.id} order={o} color="#10b981" userRole="waiter" mutate={mutate} userName={user.name} readonly />)}
    </Shell>
  );
}


// ── CASHIER ORDER CARD — with payment modal ───────────────────────────────────
function CashierOrderCard({ order:o, color, mutate, userName, rId }) {
  const [open, setOpen] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState("cash");
  const [received, setReceived] = useState("");
  const sc = SC[o.status]; if (!sc) return null;

  const change = payMethod === "cash" && received ? Math.max(0, parseFloat(received) - o.total) : 0;

  const confirmPayment = () => {
    mutate(d => {
      const ord = d.orders.find(x => x.id === o.id);
      if (ord) { ord.status = "paid"; ord.payMethod = payMethod; ord.paidAt = new Date().toISOString(); ord.paidBy = userName; }
      return d;
    });
    setPaying(false);
  };

  return (
    <div style={{ background:"#0c0c0c",borderRadius:14,marginBottom:12,border:`2px solid ${color}55`,overflow:"hidden" }}>
      {/* Payment modal */}
      {paying && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"#111",borderRadius:20,padding:24,width:"100%",maxWidth:380,border:`2px solid ${color}44` }}>
            <div style={{ color:color,fontSize:11,letterSpacing:2,fontWeight:700,marginBottom:16 }}>💳 ENCAISSER LA COMMANDE</div>
            <div style={{ background:"#0a140a",borderRadius:10,padding:14,marginBottom:16 }}>
              <div style={{ fontSize:13,color:"#888",marginBottom:4 }}>Client</div>
              <div style={{ fontSize:18,fontWeight:900,color:"#fff",marginBottom:8 }}>{o.client}</div>
              <div style={{ fontSize:28,fontWeight:900,color:color,textAlign:"center",padding:"8px 0" }}>{o.total.toFixed(2)} €</div>
            </div>
            {/* Payment method */}
            <div style={{ color:"#555",fontSize:10,letterSpacing:2,marginBottom:10 }}>MODE DE PAIEMENT</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16 }}>
              {[["cash","💵","Espèces"],["card","💳","Carte"],["bancontact","📱","Bancontact"]].map(([v,ic,lb]) => (
                <button key={v} onClick={()=>setPayMethod(v)}
                  style={{ padding:"12px 6px",borderRadius:10,border:`2px solid ${payMethod===v?color:"#2a2a2a"}`,background:payMethod===v?`${color}22`:"transparent",cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:24 }}>{ic}</div>
                  <div style={{ color:payMethod===v?color:"#666",fontSize:11,fontWeight:700,marginTop:4 }}>{lb}</div>
                </button>
              ))}
            </div>
            {/* Cash: montant reçu + rendu */}
            {payMethod === "cash" && (
              <div style={{ marginBottom:16 }}>
                <div style={{ color:"#555",fontSize:10,letterSpacing:2,marginBottom:8 }}>MONTANT REÇU</div>
                <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                  <input type="number" value={received} onChange={e=>setReceived(e.target.value)} placeholder={`Ex: ${Math.ceil(o.total/5)*5}.00`}
                    style={{ flex:1,background:"#1a1a1a",border:"1px solid #333",borderRadius:8,padding:"12px",color:"#fff",fontSize:18,outline:"none",textAlign:"right" }} />
                  <span style={{ display:"flex",alignItems:"center",color:"#fff",fontSize:18,fontWeight:700 }}>€</span>
                </div>
                {/* Quick amount buttons */}
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {[Math.ceil(o.total), Math.ceil(o.total/5)*5, Math.ceil(o.total/10)*10, Math.ceil(o.total/20)*20, Math.ceil(o.total/50)*50].filter((v,i,a)=>a.indexOf(v)===i).slice(0,5).map(amt => (
                    <button key={amt} onClick={()=>setReceived(amt.toString())}
                      style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${received==amt?color:"#333"}`,background:received==amt?`${color}22`:"transparent",color:received==amt?color:"#888",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                      {amt}€
                    </button>
                  ))}
                </div>
                {received && parseFloat(received) >= o.total && (
                  <div style={{ background:"#0a2010",border:"1px solid #16a34a44",borderRadius:10,padding:"10px 14px",marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ color:"#888",fontSize:13 }}>Rendu monnaie</span>
                    <span style={{ color:"#10b981",fontSize:22,fontWeight:900 }}>{change.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            )}
            {(payMethod !== "cash" || (received && parseFloat(received) >= o.total)) && (
              <button onClick={confirmPayment}
                style={{ width:"100%",background:`linear-gradient(135deg,${color},${color}aa)`,border:"none",borderRadius:12,padding:16,color:"#060606",fontWeight:900,fontSize:16,cursor:"pointer",letterSpacing:1 }}>
                ✅ CONFIRMER LE PAIEMENT
              </button>
            )}
            {payMethod === "cash" && (!received || parseFloat(received) < o.total) && (
              <div style={{ textAlign:"center",color:"#444",fontSize:12,marginTop:8 }}>Entrez le montant reçu pour continuer</div>
            )}
            <button onClick={()=>setPaying(false)} style={{ width:"100%",background:"transparent",border:"none",color:"#555",cursor:"pointer",padding:"10px",marginTop:8,fontSize:13 }}>← Annuler</button>
          </div>
        </div>
      )}

      <div style={{ padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10 }} onClick={()=>setOpen(!open)}>
        <div style={{ width:10,height:10,borderRadius:"50%",background:sc.color,flexShrink:0,boxShadow:`0 0 8px ${sc.color}` }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <span style={{ fontWeight:800,fontSize:15 }}>{o.client}</span>
            <span style={{ color:sc.color,fontSize:11,fontWeight:700 }}>{sc.icon} {sc.label}</span>
          </div>
          <div style={{ fontSize:11,color:"#444",marginTop:2 }}>
            {o.type==="phone"?"📞":o.type==="dine-in"?"🪑":"🥡"} {fmt(o.createdAt)}
            {o.phone?` · ${o.phone}`:""}
            &nbsp;·&nbsp;<strong style={{ color }}>{o.total.toFixed(2)}€</strong>
            {o.pickupAt && <span style={{ color:"#8b5cf6",marginLeft:6,fontWeight:700 }}>🕐 {fmtDT(o.pickupAt)}</span>}
          </div>
        </div>
        <span style={{ color:"#333",fontSize:11 }}>{open?"▲":"▼"}</span>
      </div>

      {open && (
        <div style={{ padding:"0 14px 14px",borderTop:"1px solid #141414" }}>
          {o.items.map((it,i)=>(
            <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #121212",fontSize:13 }}>
              <span>{it.emoji} {it.name} <span style={{ color:"#444" }}>×{it.qty}</span></span>
              <span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span>
            </div>
          ))}
          <div style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",fontWeight:900,fontSize:15 }}>
            <span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span>
          </div>
          <button onClick={()=>setPaying(true)}
            style={{ width:"100%",background:`linear-gradient(135deg,${color},${color}88)`,border:"none",borderRadius:10,padding:14,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:15,letterSpacing:1,boxShadow:`0 4px 20px ${color}33` }}>
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
        <button onClick={()=>setShowAdd(!showAdd)} style={{ background:`${color}22`,border:`1px solid ${color}44`,borderRadius:8,padding:"7px 14px",color,cursor:"pointer",fontWeight:700,fontSize:12 }}>+ Nouvelle</button>
      </div>

      {showAdd && (
        <Pane color={color} title="🪑 NOUVELLE RÉSERVATION">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <FInp label="NOM CLIENT *" val={client} set={setClient} icon="👤" />
            <FInp label="TÉLÉPHONE" val={phone} set={setPhone} icon="📱" />
          </div>
          <div style={{ marginBottom:13 }}>
            <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>DATE & HEURE *</div>
            <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}
              style={{ width:"100%",background:"#141414",border:"1px solid #222",borderRadius:9,padding:"11px 12px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",colorScheme:"dark" }} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <div>
              <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>NOMBRE DE TABLES</div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <QB onClick={()=>setTables(t=>Math.max(1,t-1))}>−</QB>
                <span style={{ width:30,textAlign:"center",fontWeight:800,color:"#fff",fontSize:18 }}>{tables}</span>
                <QB onClick={()=>setTables(t=>t+1)}>+</QB>
              </div>
            </div>
            <div>
              <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>NOMBRE DE PERSONNES</div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <QB onClick={()=>setPersons(p=>Math.max(1,p-1))}>−</QB>
                <span style={{ width:30,textAlign:"center",fontWeight:800,color:"#fff",fontSize:18 }}>{persons}</span>
                <QB onClick={()=>setPersons(p=>p+1)}>+</QB>
              </div>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>NOTE (allergies, préférences...)</div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex: Anniversaire, végétarien..."
              style={{ width:"100%",background:"#141414",border:"1px solid #222",borderRadius:9,padding:"11px 12px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box" }} />
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
            <div key={res.id} style={{ background: isSoon?"#1a0f00":"#0c0c0c", borderRadius:14, padding:16, marginBottom:10, border:`2px solid ${isSoon?"#f59e0b":color+"33"}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:800,fontSize:16,color:"#fff" }}>{res.client}</div>
                  <div style={{ color:"#555",fontSize:12,marginTop:2 }}>{res.phone}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color: isSoon?"#f59e0b":color, fontWeight:900, fontSize:14 }}>
                    {isToday ? `Aujourd'hui ${fmt(res.date)}` : fmtDT(res.date)}
                  </div>
                  {isSoon && <div style={{ color:"#f59e0b",fontSize:11,fontWeight:700 }}>⚠️ Dans moins d'1h !</div>}
                </div>
              </div>
              <div style={{ display:"flex",gap:16,marginBottom:12 }}>
                <div style={{ background:"#1a1a1a",borderRadius:8,padding:"8px 14px",textAlign:"center" }}>
                  <div style={{ fontSize:20 }}>🪑</div>
                  <div style={{ color:"#fff",fontWeight:700,fontSize:16 }}>{res.tables}</div>
                  <div style={{ color:"#555",fontSize:10 }}>table(s)</div>
                </div>
                <div style={{ background:"#1a1a1a",borderRadius:8,padding:"8px 14px",textAlign:"center" }}>
                  <div style={{ fontSize:20 }}>👥</div>
                  <div style={{ color:"#fff",fontWeight:700,fontSize:16 }}>{res.persons}</div>
                  <div style={{ color:"#555",fontSize:10 }}>personne(s)</div>
                </div>
                {res.note && (
                  <div style={{ flex:1,background:"#1a1a10",borderRadius:8,padding:"8px 12px",border:"1px solid #333" }}>
                    <div style={{ color:"#888",fontSize:10,marginBottom:2 }}>NOTE</div>
                    <div style={{ color:"#f59e0b",fontSize:13 }}>{res.note}</div>
                  </div>
                )}
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>mutate(d=>{const r=d.reservations?.find(x=>x.id===res.id);if(r)r.done=true;return d;})}
                  style={{ flex:1,background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:10,padding:12,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13 }}>
                  ✅ Client arrivé
                </button>
                <button onClick={()=>mutate(d=>{d.reservations=d.reservations?.filter(x=>x.id!==res.id);return d;})}
                  style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:10,padding:"0 14px",color:"#ef4444",cursor:"pointer",fontSize:18 }}>
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
            <div key={res.id} style={{ background:"#0c0c0c",borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid #1e1e1e",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:.6 }}>
              <div>
                <div style={{ fontWeight:700 }}>{res.client}</div>
                <div style={{ color:"#555",fontSize:12 }}>{fmtDT(res.date)} · {res.persons} pers. · {res.tables} table(s)</div>
              </div>
              <button onClick={()=>mutate(d=>{d.reservations=d.reservations?.filter(x=>x.id!==res.id);return d;})}
                style={{ background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:18 }}>🗑️</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function OrderCard({ order:o, color, userRole, mutate, userName, readonly }) {
  const [open, setOpen] = useState(o.status==="pending");
  const sc = SC[o.status]; if (!sc) return null;
  const canAdv = !readonly && ROLE_ADV[userRole]?.includes(sc.next);
  const elapsed = Math.floor((Date.now()-new Date(o.createdAt))/60000);
  const late = elapsed>(o.prepMin||20) && ["pending","preparing"].includes(o.status);
  const advance = () => mutate(d=>{ const x=d.orders.find(i=>i.id===o.id); if(x) x.status=sc.next; return d; });
  return (
    <div style={{ background:"#0c0c0c",borderRadius:14,marginBottom:10,border:`1px solid ${late?"#ef4444":open?color+"44":"#181818"}`,overflow:"hidden" }}>
      <div style={{ padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10 }} onClick={()=>setOpen(!open)}>
        <div style={{ width:10,height:10,borderRadius:"50%",background:sc.color,flexShrink:0,boxShadow:`0 0 8px ${sc.color}` }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <span style={{ fontWeight:800,fontSize:14 }}>{o.client}</span>
            <span style={{ color:sc.color,fontSize:11,fontWeight:700 }}>{sc.icon} {sc.label}</span>
          </div>
          <div style={{ fontSize:11,color:"#444",marginTop:2 }}>
            {o.type==="phone"?"📞":o.type==="dine-in"?"🪑":"🥡"} {fmt(o.createdAt)}
            {o.phone?` · ${o.phone}`:""}
            &nbsp;·&nbsp;<strong style={{ color }}>{o.total.toFixed(2)}€</strong>
            {o.pickupAt && <span style={{ color:"#8b5cf6",marginLeft:6,fontWeight:700 }}>🕐 {fmtDT(o.pickupAt)}</span>}
            {late && <span style={{ color:"#ef4444",marginLeft:8,fontWeight:700 }}>⚠️ {elapsed}min</span>}
          </div>
        </div>
        <span style={{ color:"#333",fontSize:11 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 14px 14px",borderTop:"1px solid #141414" }}>
          {o.pickupAt && <div style={{ background:"#0d0820",border:"1px solid #8b5cf633",borderRadius:8,padding:"8px 12px",margin:"10px 0",fontSize:12,color:"#a78bfa" }}>🕐 Prête pour : <strong>{fmtDT(o.pickupAt)}</strong></div>}
          <div style={{ paddingTop:4 }}>
            {o.items.map((it,i)=>(
              <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #121212",fontSize:13 }}>
                <span>{it.emoji} {it.name} <span style={{ color:"#444" }}>×{it.qty}</span></span>
                <span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",fontWeight:900,fontSize:14 }}><span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span></div>
          <div style={{ color:"#444",fontSize:11,marginBottom:12 }}>⏱ Estimé: <strong style={{ color:"#f59e0b" }}>{o.prepMin||15} min</strong> · par <strong style={{ color:"#666" }}>{o.by}</strong></div>
          {canAdv && <button onClick={advance} style={{ width:"100%",background:`linear-gradient(135deg,${SC[sc.next].color},${SC[sc.next].color}88)`,border:"none",borderRadius:10,padding:13,color:"#fff",fontWeight:900,cursor:"pointer",fontSize:13,letterSpacing:1 }}>{SC[sc.next].icon} {SC[sc.next].label.toUpperCase()}</button>}
        </div>
      )}
    </div>
  );
}

function ScheduledPanel({ orders, color, mutate }) {
  const sorted = [...orders].sort((a,b)=>new Date(a.pickupAt)-new Date(b.pickupAt));
  return (
    <div>
      <Lbl>COMMANDES PROGRAMMÉES ({orders.length})</Lbl>
      {orders.length===0?<Empty icon="🕐" text="Aucune commande programmée" />:
        sorted.map(o => {
          const m = minsUntil(o.pickupAt);
          return (
            <div key={o.id} style={{ background:"#0d0820",border:"1px solid #8b5cf633",borderRadius:14,padding:14,marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div><div style={{ fontWeight:800,fontSize:15 }}>{o.client}</div><div style={{ color:"#555",fontSize:12 }}>{o.phone} · par {o.by}</div></div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:"#8b5cf6",fontWeight:900,fontSize:14 }}>{fmtDT(o.pickupAt)}</div>
                  <div style={{ fontSize:11,color:m<=60?"#f59e0b":"#8b5cf6" }}>{m>=60?`dans ${Math.floor(m/60)}h${m%60>0?m%60+"min":""}`:`dans ${m} min`}</div>
                </div>
              </div>
              {o.items.map((it,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1a1030",fontSize:13 }}><span>{it.emoji} {it.name} ×{it.qty}</span><span style={{ color }}>{(it.price*it.qty).toFixed(2)}€</span></div>)}
              <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",fontWeight:900 }}><span>TOTAL</span><span style={{ color }}>{o.total.toFixed(2)}€</span></div>
              <button onClick={()=>mutate(d=>{const x=d.orders.find(i=>i.id===o.id);if(x)x.status="pending";return d;})} style={{ width:"100%",background:"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",borderRadius:10,padding:12,color:"#060606",fontWeight:900,cursor:"pointer",fontSize:13,marginTop:6 }}>
                🚀 Envoyer maintenant en cuisine
              </button>
            </div>
          );
        })}
    </div>
  );
}

function OrdersPanel({ orders, color, userRole, mutate, userName }) {
  const [f, setF] = useState("active");
  const shown = f==="active"?orders.filter(o=>o.status!=="paid"):orders;
  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:12 }}>
        {[["active","⚡ En cours"],["all","📋 Toutes"]].map(([id,lb])=>(
          <button key={id} onClick={()=>setF(id)} style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${f===id?color:"#1e1e1e"}`,background:f===id?`${color}22`:"transparent",color:f===id?color:"#444",cursor:"pointer",fontSize:12,fontWeight:700 }}>{lb}</button>
        ))}
      </div>
      {shown.length===0?<Empty icon="✨" text="Aucune commande" />:shown.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(o=><OrderCard key={o.id} order={o} color={color} userRole={userRole} mutate={mutate} userName={userName} />)}
    </div>
  );
}

function NeedsPanel({ needs, rId, user, mutate, color, isManager, db }) {
  const [activecat, setActiveCat] = useState(null);
  const [manualText, setManualText] = useState("");
  const [qty, setQty] = useState("1");
  const [view, setView] = useState("current"); // current | history
  const [showHistoryList, setShowHistoryList] = useState(null);

  const shoppingLists = (db?.shoppingLists||[]).filter(l => l.rId === rId)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const addNeed = useCallback((text, category) => {
    if (!text?.trim()) return;
    const need = { id:uid(), rId, text:text.trim(), category:category||"Autre", by:user.name, avatar:user.avatar, createdAt:ts(), done:false, received:false };
    mutate(d=>{ d.needs.push(need); return d; }, { type:"need", data:need });
    setManualText(""); setQty("1");
  }, [rId, user, mutate]);

  const addProduct = (product, cat) => {
    const text = qty && qty !== "1" ? `${product.name} × ${qty}` : product.name;
    addNeed(text, cat);
  };

  // Mark item as received (checkbox)
  const toggleReceived = (id) => {
    mutate(d=>{ const x=d.needs.find(i=>i.id===id); if(x) x.received=!x.received; return d; });
  };

  // Validate entire list → save to history + clear
  const validateList = () => {
    const pending = needs.filter(n=>!n.done && n.rId===rId);
    if (pending.length === 0) return;
    const listNum = shoppingLists.length + 1;
    const list = {
      id: uid(), rId,
      num: listNum,
      items: pending.map(n => ({...n, received: n.received||false})),
      createdAt: ts(),
      by: user.name,
      total: pending.length,
      received: pending.filter(n=>n.received).length
    };
    mutate(d=>{
      d.shoppingLists = [...(d.shoppingLists||[]), list];
      d.needs = d.needs.filter(n => n.rId !== rId || n.done);
      return d;
    });
  };

  // Reuse a historical list
  const reuseList = (list) => {
    list.items.forEach(item => {
      const need = { id:uid(), rId, text:item.text, category:item.category||"Autre", by:user.name, avatar:user.avatar, createdAt:ts(), done:false, received:false };
      mutate(d=>{ d.needs.push(need); return d; });
    });
    setShowHistoryList(null);
    setView("current");
  };

  const pending = needs.filter(n=>!n.done);
  const done = needs.filter(n=>n.done);
  const cats = Object.keys(NEEDS_CATALOG);
  const receivedCount = pending.filter(n=>n.received).length;

  return (
    <div>
      {/* View toggle */}
      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
        <button onClick={()=>setView("current")}
          style={{ flex:1,padding:"10px",borderRadius:10,border:`2px solid ${view==="current"?"#3b82f6":"#2a2a2a"}`,background:view==="current"?"#3b82f622":"transparent",color:view==="current"?"#3b82f6":"#666",cursor:"pointer",fontWeight:700,fontSize:12 }}>
          🛒 Liste actuelle ({pending.length})
        </button>
        <button onClick={()=>setView("history")}
          style={{ flex:1,padding:"10px",borderRadius:10,border:`2px solid ${view==="history"?"#f59e0b":"#2a2a2a"}`,background:view==="history"?"#f59e0b22":"transparent",color:view==="history"?"#f59e0b":"#666",cursor:"pointer",fontWeight:700,fontSize:12 }}>
          📋 Historique ({shoppingLists.length})
        </button>
      </div>

      {/* ── CURRENT LIST ── */}
      {view === "current" && (
        <div>
          {/* Category selector */}
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
            {cats.map(cat => {
              const c = NEEDS_CATALOG[cat];
              return (
                <button key={cat} onClick={()=>setActiveCat(activecat===cat?null:cat)}
                  style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 14px",borderRadius:12,border:`2px solid ${activecat===cat?c.color:"#2a2a2a"}`,background:activecat===cat?`${c.color}22`:"#111",cursor:"pointer",minWidth:70,transition:"all .2s" }}>
                  <span style={{ fontSize:26 }}>{c.emoji}</span>
                  <span style={{ color:activecat===cat?c.color:"#888",fontSize:11,fontWeight:700 }}>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Products grid */}
          {activecat && (
            <div style={{ background:"#0c0c0c",borderRadius:14,padding:14,marginBottom:16,border:`1px solid ${NEEDS_CATALOG[activecat].color}33` }}>
              <div style={{ color:NEEDS_CATALOG[activecat].color,fontSize:10,letterSpacing:2,fontWeight:700,marginBottom:12 }}>
                {NEEDS_CATALOG[activecat].emoji} {activecat.toUpperCase()} — CLIQUEZ POUR AJOUTER
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
                <span style={{ color:"#888",fontSize:12 }}>Qté :</span>
                <QB onClick={()=>setQty(q=>String(Math.max(1,parseInt(q||1)-1)))}>−</QB>
                <input value={qty} onChange={e=>setQty(e.target.value)}
                  style={{ width:50,textAlign:"center",background:"#1a1a1a",border:"1px solid #333",borderRadius:6,padding:"6px",color:"#fff",fontSize:15,fontWeight:700,outline:"none" }} />
                <QB onClick={()=>setQty(q=>String(parseInt(q||1)+1))}>+</QB>
                <span style={{ color:"#555",fontSize:12 }}>kg / unités</span>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))",gap:10 }}>
                {NEEDS_CATALOG[activecat].products.map(product => (
                  <button key={product.name} onClick={()=>addProduct(product, activecat)}
                    style={{ background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,padding:8,cursor:"pointer",textAlign:"center",transition:"all .15s",overflow:"hidden" }}
                    onMouseOver={e=>{e.currentTarget.style.borderColor=NEEDS_CATALOG[activecat].color;e.currentTarget.style.background=`${NEEDS_CATALOG[activecat].color}15`;}}
                    onMouseOut={e=>{e.currentTarget.style.borderColor="#2a2a2a";e.currentTarget.style.background="#1a1a1a";}}>
                    <img src={product.img} alt={product.name}
                      style={{ width:"100%",height:62,objectFit:"cover",borderRadius:6,marginBottom:5,display:"block" }}
                      onError={e=>{e.target.style.display="none";}} />
                    <div style={{ color:"#fff",fontSize:10,fontWeight:600 }}>{product.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual/voice input */}
          <Pane color="#3b82f6" title="✍️ SAISIE MANUELLE OU VOCALE">
            <VoiceInput onSubmit={(t)=>addNeed(t, activecat||"Autre")} placeholder='Ex: "sauce tomate × 3"' buttonLabel="Ajouter" />
          </Pane>

          {/* Pending list with checkboxes */}
          {pending.length > 0 && (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <Lbl>À ACHETER ({pending.length}) — {receivedCount} reçus</Lbl>
                {isManager && pending.length > 0 && (
                  <button onClick={validateList}
                    style={{ background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:8,padding:"8px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:12 }}>
                    ✅ Valider & archiver
                  </button>
                )}
              </div>
              {/* Progress bar */}
              {receivedCount > 0 && (
                <div style={{ background:"#1a1a1a",borderRadius:20,height:6,marginBottom:12,overflow:"hidden" }}>
                  <div style={{ background:"#16a34a",height:"100%",width:`${(receivedCount/pending.length)*100}%`,transition:"width .3s",borderRadius:20 }} />
                </div>
              )}
              {cats.concat(["Autre"]).map(cat => {
                const catNeeds = pending.filter(n => (n.category||"Autre") === cat);
                if (catNeeds.length === 0) return null;
                const c = NEEDS_CATALOG[cat] || { emoji:"📦", color:"#888" };
                return (
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"6px 10px",background:`${c.color}11`,borderRadius:8 }}>
                      <span style={{ fontSize:18 }}>{c.emoji}</span>
                      <span style={{ color:c.color||"#888",fontSize:11,letterSpacing:2,fontWeight:700,flex:1 }}>{cat.toUpperCase()}</span>
                      <span style={{ color:c.color,fontSize:11 }}>{catNeeds.filter(n=>n.received).length}/{catNeeds.length}</span>
                    </div>
                    {catNeeds.map(n=>(
                      <div key={n.id} style={{ background:n.received?"#0a140a":"#0a0f1a",border:`1px solid ${n.received?"#16a34a44":"#1e3050"}`,borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,transition:"all .2s" }}>
                        {/* Checkbox */}
                        <button onClick={()=>toggleReceived(n.id)}
                          style={{ width:28,height:28,borderRadius:6,border:`2px solid ${n.received?"#16a34a":c.color||"#3b82f6"}`,background:n.received?"#16a34a":"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,transition:"all .2s" }}>
                          {n.received ? "✓" : ""}
                        </button>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14,fontWeight:600,textDecoration:n.received?"line-through":"none",color:n.received?"#888":"#fff" }}>{n.text}</div>
                          <div style={{ color:"#444",fontSize:11,marginTop:1 }}>{n.avatar} {n.by} · {fmt(n.createdAt)}</div>
                        </div>
                        {isManager && (
                          <button onClick={()=>mutate(d=>{d.needs=d.needs.filter(x=>x.id!==n.id);return d;})}
                            style={{ background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:16 }}>🗑️</button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          {pending.length === 0 && <Empty icon="✅" text="Rien à acheter !" />}
        </div>
      )}

      {/* ── HISTORY VIEW ── */}
      {view === "history" && (
        <div>
          {shoppingLists.length === 0 ? <Empty icon="📋" text="Aucun historique" /> :
            showHistoryList ? (
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                  <span style={{ color:"#f59e0b",fontWeight:700 }}>📋 Liste #{showHistoryList.num}</span>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>reuseList(showHistoryList)}
                      style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",borderRadius:8,padding:"8px 14px",color:"#060606",cursor:"pointer",fontWeight:700,fontSize:12 }}>
                      🔄 Réutiliser cette liste
                    </button>
                    <button onClick={()=>setShowHistoryList(null)}
                      style={{ background:"#1a1a1a",border:"1px solid #333",borderRadius:8,padding:"8px 12px",color:"#888",cursor:"pointer",fontSize:12 }}>
                      ← Retour
                    </button>
                  </div>
                </div>
                <div style={{ color:"#555",fontSize:12,marginBottom:12 }}>
                  {fmtD(showHistoryList.createdAt)} · par {showHistoryList.by} · {showHistoryList.received}/{showHistoryList.total} reçus
                </div>
                {showHistoryList.items.map((item, i) => (
                  <div key={i} style={{ background:"#0c0c0c",borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,border:"1px solid #1e1e1e" }}>
                    <div style={{ width:26,height:26,borderRadius:6,background:item.received?"#16a34a":"#1a1a1a",border:`2px solid ${item.received?"#16a34a":"#444"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,color:"#fff" }}>
                      {item.received?"✓":""}
                    </div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:13,color:item.received?"#888":"#fff",textDecoration:item.received?"line-through":"none" }}>{item.text}</span>
                      <span style={{ color:"#555",fontSize:11,marginLeft:8 }}>{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              shoppingLists.map((list, i) => (
                <div key={list.id} onClick={()=>setShowHistoryList(list)}
                  style={{ background:"#0c0c0c",borderRadius:12,padding:"14px 16px",marginBottom:10,border:"1px solid #1e1e1e",cursor:"pointer",transition:"all .2s" }}
                  onMouseOver={e=>e.currentTarget.style.borderColor="#f59e0b"}
                  onMouseOut={e=>e.currentTarget.style.borderColor="#1e1e1e"}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ background:"#f59e0b22",border:"1px solid #f59e0b44",borderRadius:8,padding:"4px 10px",color:"#f59e0b",fontWeight:900,fontSize:14 }}>
                        #{list.num}
                      </div>
                      <div>
                        <div style={{ fontWeight:700,color:"#fff" }}>{list.total} articles</div>
                        <div style={{ color:"#555",fontSize:12 }}>{fmtD(list.createdAt)} · {list.by}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:"#16a34a",fontSize:13,fontWeight:700 }}>{list.received}/{list.total} reçus</div>
                      <div style={{ color:"#555",fontSize:11 }}>→ voir</div>
                    </div>
                  </div>
                </div>
              ))
            )
          }
        </div>
      )}
    </div>
  );
}


function StockPanel({ inventory, color }) {
  return (<div><Lbl>INVENTAIRE</Lbl>{inventory.map(item=>{const crit=item.qty<=item.min;return(<div key={item.id} style={{ background:"#0c0c0c",borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${crit?"#ef4444":"#181818"}`,display:"flex",alignItems:"center",gap:12 }}>{crit&&<span>⚠️</span>}<div style={{ flex:1 }}><div style={{ fontWeight:700 }}>{item.name}</div><div style={{ fontSize:11,color:"#444" }}>Min: {item.min} {item.unit}</div></div><div style={{ textAlign:"center" }}><div style={{ fontSize:21,fontWeight:900,color:crit?"#ef4444":"#10b981" }}>{item.qty}</div><div style={{ fontSize:11,color:"#555" }}>{item.unit}</div></div></div>);})}</div>);
}

function SuperAdmin({ db, mutate, onLogout, syncing }) {
  const [tab, setTab] = useState("restaurants");
  const [nr, setNr] = useState({ name:"",logo:"🍽️",color:"#D4A017",address:"" });
  const [nu, setNu] = useState({ name:"",username:"",password:"",role:"chef",rId:"" });
  const [showNr,setShowNr]=useState(false); const [showNu,setShowNu]=useState(false);
  const rEmoji = { chef:"👨‍🍳",cashier:"💳",waiter:"🍽️",manager:"📋" };
  const addRest=()=>{ if(!nr.name)return; const id=uid(); mutate(d=>{d.restaurants.push({...nr,id});d.menus[id]=[];d.inventory[id]=[];return d;}); setNr({name:"",logo:"🍽️",color:"#D4A017",address:""}); setShowNr(false); };
  const addUser=()=>{ if(!nu.name||!nu.username||!nu.rId)return; mutate(d=>{d.users.push({...nu,id:uid(),avatar:rEmoji[nu.role]||"👤"});return d;}); setNu({name:"",username:"",password:"",role:"chef",rId:""}); setShowNu(false); };
  return (
    <div style={{ minHeight:"100vh",background:"#060606",fontFamily:"Georgia,serif",color:"#fff" }}>
      <header style={{ background:"linear-gradient(135deg,#0d0d0d,#1a1a2e)",borderBottom:"1px solid #1e1e2e",padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
        <span style={{ fontSize:34 }}>👑</span>
        <div style={{ flex:1 }}><div style={{ fontWeight:900,letterSpacing:2,fontSize:14 }}>SUPER ADMINISTRATEUR</div><div style={{ color:"#444",fontSize:11 }}>KamEat · Toutes les données en temps réel ✅</div></div>
        {syncing && <span style={{ color:"#555",fontSize:11,animation:"pulse 1s infinite" }}>⏳</span>}
        <button onClick={onLogout} style={{ background:"#111",border:"1px solid #222",borderRadius:8,padding:"6px 10px",color:"#666",cursor:"pointer" }}>🚪</button>
      </header>
      <div style={{ display:"flex",background:"#0a0a0a",borderBottom:"1px solid #161616" }}>
        {[["restaurants","🏪","Restaurants"],["users","👥","Utilisateurs"]].map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1,padding:12,background:"none",border:"none",borderBottom:tab===id?"3px solid #D4A017":"3px solid transparent",color:tab===id?"#D4A017":"#444",cursor:"pointer",fontWeight:700 }}>{ic} {lb}</button>
        ))}
      </div>
      <div style={{ padding:14,maxWidth:700,margin:"0 auto" }}>
        {tab==="restaurants" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}><Lbl>RESTAURANTS ({(db.restaurants||[]).length})</Lbl><button onClick={()=>setShowNr(!showNr)} style={addBtnS}>+ Nouveau</button></div>
            {showNr && <div style={{ background:"#111",borderRadius:12,padding:14,marginBottom:14,border:"1px solid #D4A01733" }}><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}><SI ph="Nom" val={nr.name} set={v=>setNr(p=>({...p,name:v}))} /><SI ph="Emoji logo" val={nr.logo} set={v=>setNr(p=>({...p,logo:v}))} /><SI ph="Adresse" val={nr.address} set={v=>setNr(p=>({...p,address:v}))} /><div style={{ display:"flex",gap:8,alignItems:"center" }}><input type="color" value={nr.color} onChange={e=>setNr(p=>({...p,color:e.target.value}))} style={{ width:44,height:40,border:"none",borderRadius:6,cursor:"pointer" }} /><span style={{ color:"#555",fontSize:12 }}>Couleur</span></div></div><BigBtn color="#D4A017" onClick={addRest}>✅ Créer</BigBtn></div>}
            {(db.restaurants||[]).map(r=>(
              <div key={r.id} style={{ background:"#0f0f0f",borderRadius:14,padding:14,marginBottom:10,border:`1px solid ${r.color}33`,display:"flex",alignItems:"center",gap:14 }}>
                {r.logoUrl ? <img src={r.logoUrl} alt={r.name} style={{ width:48,height:48,borderRadius:8,objectFit:"cover" }} /> : <span style={{ fontSize:40 }}>{r.logo}</span>}
                <div style={{ flex:1 }}><div style={{ fontWeight:800,fontSize:15 }}>{r.name}</div><div style={{ color:"#555",fontSize:12 }}>{r.address}</div><div style={{ fontSize:11,color:"#444",marginTop:3 }}>👥 {(db.users||[]).filter(u=>u.rId===r.id).length} · 🍽️ {(db.menus?.[r.id]||[]).length} plats</div></div>
                <button onClick={()=>mutate(d=>{d.restaurants=d.restaurants.filter(x=>x.id!==r.id);d.users=d.users.filter(u=>u.rId!==r.id);delete d.menus[r.id];delete d.inventory[r.id];return d;})} style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:8,padding:"7px 11px",color:"#ef4444",cursor:"pointer" }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
        {tab==="users" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}><Lbl>UTILISATEURS ({(db.users||[]).length})</Lbl><button onClick={()=>setShowNu(!showNu)} style={addBtnS}>+ Nouveau</button></div>
            {showNu && <div style={{ background:"#111",borderRadius:12,padding:14,marginBottom:14,border:"1px solid #D4A01733" }}><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}><SI ph="Nom complet" val={nu.name} set={v=>setNu(p=>({...p,name:v}))} /><SI ph="Identifiant" val={nu.username} set={v=>setNu(p=>({...p,username:v}))} /><SI ph="Mot de passe" val={nu.password} set={v=>setNu(p=>({...p,password:v}))} type="password" /><select value={nu.role} onChange={e=>setNu(p=>({...p,role:e.target.value}))} style={selS}><option value="chef">👨‍🍳 Cuisinier</option><option value="cashier">💳 Caissier</option><option value="waiter">🍽️ Serveur</option><option value="manager">📋 Gérant</option></select><select value={nu.rId} onChange={e=>setNu(p=>({...p,rId:e.target.value}))} style={{...selS,gridColumn:"1/-1"}}><option value="">-- Restaurant --</option>{(db.restaurants||[]).map(r=><option key={r.id} value={r.id}>{r.logo} {r.name}</option>)}</select></div><BigBtn color="#D4A017" onClick={addUser}>✅ Créer</BigBtn></div>}
            {(db.users||[]).map(u=>{const rest=(db.restaurants||[]).find(r=>r.id===u.rId);const rL={chef:"Cuisinier",cashier:"Caissier",waiter:"Serveur",manager:"Gérant"};return(<div key={u.id} style={{ background:"#0f0f0f",borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid #181818",display:"flex",alignItems:"center",gap:12 }}><span style={{ fontSize:28 }}>{u.avatar}</span><div style={{ flex:1 }}><div style={{ fontWeight:700 }}>{u.name}</div><div style={{ fontSize:12,color:"#555" }}>@{u.username} · {rL[u.role]}</div>{rest&&<div style={{ fontSize:11,color:"#444" }}>{rest.logo} {rest.name}</div>}</div><button onClick={()=>mutate(d=>{d.users=d.users.filter(x=>x.id!==u.id);return d;})} style={{ background:"#1a0808",border:"1px solid #ef4444",borderRadius:8,padding:"7px 11px",color:"#ef4444",cursor:"pointer" }}>🗑️</button></div>);})}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MICRO HELPERS ─────────────────────────────────────────────────────────────
function Pane({ color, title, children }) { return <div style={{ background:"#0c0c0c",border:`1px solid ${color}22`,borderRadius:14,padding:14,marginBottom:14 }}><div style={{ color,fontSize:10,letterSpacing:2,fontWeight:700,marginBottom:12 }}>{title}</div>{children}</div>; }
function FInp({ label, val, set, icon, type="text", onEnter }) {
  return (<div style={{ marginBottom:13 }}><div style={{ color:"#444",fontSize:10,letterSpacing:2,marginBottom:4 }}>{label}</div><div style={{ position:"relative" }}><span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:16 }}>{icon}</span><input type={type} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onEnter?.()} style={{ width:"100%",background:"#141414",border:"1px solid #222",borderRadius:9,padding:"11px 11px 11px 38px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif" }} /></div></div>);
}
function SI({ ph, val, set, type="text" }) { return <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)} style={{ background:"#181818",border:"1px solid #222",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Georgia,serif",width:"100%",boxSizing:"border-box" }} />; }
function BigBtn({ color, onClick, children, disabled, style={} }) { return <button onClick={onClick} disabled={disabled} style={{ width:"100%",background:disabled?"#141414":`linear-gradient(135deg,${color},${color}aa)`,border:"none",borderRadius:10,padding:13,color:disabled?"#333":"#060606",fontWeight:900,cursor:disabled?"not-allowed":"pointer",fontSize:14,letterSpacing:1,fontFamily:"Georgia,serif",...style }}>{children}</button>; }
function QB({ onClick, children }) { return <button onClick={onClick} style={{ width:28,height:28,borderRadius:6,border:"1px solid #222",background:"#141414",color:"#fff",cursor:"pointer",fontWeight:900,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",padding:0 }}>{children}</button>; }
function RR({ l, v, c, bold }) { return <div style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13 }}><span style={{ color:"#555" }}>{l}</span><span style={{ color:c||"#fff",fontWeight:bold?900:400 }}>{v}</span></div>; }
function ModeBtn({ active, color="#D4A017", onClick, children }) { return <button onClick={onClick} style={{ flex:1,padding:"8px",borderRadius:8,border:`2px solid ${active?color:"#222"}`,background:active?`${color}22`:"transparent",color:active?color:"#555",cursor:"pointer",fontWeight:700,fontSize:12 }}>{children}</button>; }
function StatCard({ icon, label, val, color }) { return <div style={{ background:"#0c0c0c",borderRadius:12,padding:14,border:`1px solid ${color}22`,textAlign:"center" }}><div style={{ fontSize:24 }}>{icon}</div><div style={{ fontSize:21,fontWeight:900,color,margin:"4px 0" }}>{val}</div><div style={{ fontSize:11,color:"#444" }}>{label}</div></div>; }
function Lbl({ children, style={} }) { return <div style={{ color:"#444",fontSize:10,letterSpacing:3,marginBottom:9,...style }}>{children}</div>; }
function Empty({ icon, text }) { return <div style={{ textAlign:"center",padding:"36px 20px",color:"#2a2a2a" }}><div style={{ fontSize:44,marginBottom:10 }}>{icon}</div><div style={{ fontSize:14 }}>{text}</div></div>; }
const addBtnS = { background:"#D4A01711",border:"1px solid #D4A01733",borderRadius:8,padding:"6px 14px",color:"#D4A017",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"Georgia,serif" };
const selS = { background:"#181818",border:"1px solid #222",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,fontFamily:"Georgia,serif",outline:"none",width:"100%",boxSizing:"border-box" };
