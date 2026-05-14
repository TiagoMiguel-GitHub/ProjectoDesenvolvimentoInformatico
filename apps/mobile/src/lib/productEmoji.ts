const EMOJI_MAP: { keywords: string[]; emoji: string }[] = [
  { keywords: ["madeira", "lenha", "tronco", "pinho", "carvalho"], emoji: "🪵" },
  { keywords: ["batata"], emoji: "🥔" },
  { keywords: ["cebola"], emoji: "🧅" },
  { keywords: ["alho"], emoji: "🧄" },
  { keywords: ["tomate"], emoji: "🍅" },
  { keywords: ["cenoura"], emoji: "🥕" },
  { keywords: ["alface", "espinafre", "agrião", "rúcula"], emoji: "🥬" },
  { keywords: ["couve", "brócolos", "brocolo"], emoji: "🥦" },
  { keywords: ["abóbora", "abobora"], emoji: "🍈" },
  { keywords: ["pimento"], emoji: "🌶️" },
  { keywords: ["pepino"], emoji: "🥒" },
  { keywords: ["beringela"], emoji: "🍆" },
  { keywords: ["feijão", "feijao", "grão", "grao", "ervilha"], emoji: "🫘" },
  { keywords: ["milho"], emoji: "🌽" },
  { keywords: ["cogumelo"], emoji: "🍄" },
  { keywords: ["laranja"], emoji: "🍊" },
  { keywords: ["limão", "limao"], emoji: "🍋" },
  { keywords: ["maçã", "maca", "maça"], emoji: "🍎" },
  { keywords: ["pera"], emoji: "🍐" },
  { keywords: ["uva"], emoji: "🍇" },
  { keywords: ["melancia"], emoji: "🍉" },
  { keywords: ["melão", "melao"], emoji: "🍈" },
  { keywords: ["morango"], emoji: "🍓" },
  { keywords: ["framboesa", "mirtilo", "amora"], emoji: "🫐" },
  { keywords: ["banana"], emoji: "🍌" },
  { keywords: ["ananás", "ananas", "abacaxi"], emoji: "🍍" },
  { keywords: ["manga"], emoji: "🥭" },
  { keywords: ["abacate"], emoji: "🥑" },
  { keywords: ["noz", "avelã", "avela", "amêndoa", "amendoa"], emoji: "🌰" },
  { keywords: ["azeite", "azeitona"], emoji: "🫒" },
  { keywords: ["figo"], emoji: "🍈" },
  { keywords: ["nabo", "rabanete"], emoji: "🌿" },
  { keywords: ["curgete", "courgette"], emoji: "🥒" },
  { keywords: ["alecrim", "manjericão", "oregão", "salsa", "coentro"], emoji: "🌿" },
  { keywords: ["mel"], emoji: "🍯" },
  { keywords: ["compota", "copota", "doce", "marmelada"], emoji: "🫙" },
  { keywords: ["ovo", "ovos"], emoji: "🥚" },
];

export function getProductEmoji(name: string, categorySlug: string): string {
  const nameLower = name.toLowerCase();
  for (const { keywords, emoji } of EMOJI_MAP) {
    if (keywords.some((k) => nameLower.includes(k))) return emoji;
  }
  const categoryLower = categorySlug.toLowerCase();
  for (const { keywords, emoji } of EMOJI_MAP) {
    if (keywords.some((k) => categoryLower.includes(k))) return emoji;
  }
  return "🌱";
}
