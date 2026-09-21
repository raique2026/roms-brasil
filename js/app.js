var RETROHUB_SUPPORT_TIERS=window.RETROHUB_SUPPORT_TIERS||{
  aliado:{rank:1,title:"Aliado Retro",badge:"images/aliado-retro.png",accent:"#ff8a3d"},
  guardiao:{rank:2,title:"Guardião Retro",badge:"images/guardiao-retro.png",accent:"#31a8ff"},
  lenda:{rank:3,title:"Lenda Retro",badge:"images/lenda-retro.png",accent:"#f3bd39"}
};
window.RETROHUB_SUPPORT_TIERS=RETROHUB_SUPPORT_TIERS;
var retrohubSupporter=window.retrohubSupporter||{tier:null,rank:0,active:false};

function retrohubTierFromProfile(profile){
  const key=String(profile?.supporter_tier||"").toLowerCase();
  return RETROHUB_SUPPORT_TIERS[key]||null;
}
function supporterRank(){return retrohubSupporter?.rank||0}
function supporterCan(min){return supporterRank()>=min}

async function syncRetrohubSupporter(){
  if(!retrohubSession?.user){retrohubSupporter={tier:null,rank:0,active:false};return retrohubSupporter}
  try{
    const {data}=await retrohubSupabase.auth.getSession();
    const token=data?.session?.access_token;
    if(!token) return retrohubSupporter;
    const r=await fetch("/api/patreon/sync",{method:"POST",headers:{Authorization:`Bearer ${token}`}});
    const j=await r.json();
    if(r.ok){
      const def=RETROHUB_SUPPORT_TIERS[j.tier]||null;
      retrohubSupporter={tier:j.tier||null,rank:def?.rank||0,active:!!j.active};
      if(retrohubProfile) retrohubProfile.supporter_tier=j.tier||null;
    }
  }catch(e){console.warn("Falha ao sincronizar Patreon:",e)}
  return retrohubSupporter;
}
function supporterBadgeHTML(profile){
  const tier=retrohubTierFromProfile(profile);
  if(!tier)return "";
  return `<div class="supporter-profile-badge" style="--support-accent:${tier.accent}"><img src="${tier.badge}" alt=""><span>${tier.title}</span></div>`;
}
function supporterProfileAttrs(profile){
  const tier=retrohubTierFromProfile(profile);
  const accent=profile?.profile_custom_color||profile?.profile_accent||tier?.accent||"#6b5cff";
  const themed=tier?" supporter-themed":"";
  const effect=tier?.rank>=3 && ["glow","particles","pulse"].includes(profile?.profile_effect)?` effect-${profile.profile_effect}`:"";
  return {cls:themed+effect,style:` style="--support-accent:${escapeHTML(accent)}"`,tier};
}
function supporterAvatarClass(profile){
  const tier=retrohubTierFromProfile(profile);
  if(!tier||tier.rank<3)return "";
  const b=["neon","energy","gold"].includes(profile?.avatar_border)?profile.avatar_border:"none";
  return b==="none"?"":` border-${b}`;
}
async function refreshSupporterEditor(){
  if(!retrohubSession?.user)return;
  await syncRetrohubSupporter();
  const tier=RETROHUB_SUPPORT_TIERS[retrohubSupporter.tier]||null;
  const pill=document.getElementById("supporterTierEditorBadge");
  if(pill){
    pill.textContent=tier?`✓ ${tier.title} ativo`:"Patreon sem nível ativo";
    pill.classList.toggle("active",!!tier);
  }
  const username=document.getElementById("profileUsernameInput");
  if(username){username.value=retrohubProfile?.username||"";username.disabled=!supporterCan(2)}
  const preset=document.getElementById("profileAccentPreset");
  if(preset){preset.value=retrohubProfile?.profile_accent||"";preset.disabled=!supporterCan(1)}
  const custom=document.getElementById("profileCustomColor");
  if(custom){custom.value=retrohubProfile?.profile_custom_color||"#6b5cff";custom.disabled=!supporterCan(2)}
  const border=document.getElementById("profileAvatarBorder");
  if(border){border.value=retrohubProfile?.avatar_border||"none";border.disabled=!supporterCan(3)}
  const effect=document.getElementById("profileEffect");
  if(effect){effect.value=retrohubProfile?.profile_effect||"none";effect.disabled=!supporterCan(3)}
  document.querySelectorAll("#supporterCustomizationSection label").forEach(el=>el.classList.remove("support-locked"));
}

/* ===== BLOCO SEPARADO ===== */

/* =========================================================
   JOGOS DO SITE
   EDITE SOMENTE ESTA ÁREA
   ========================================================= */

const games = [
  {
    slug: "the-simpsons-hit-and-run",
    title: "The Simpsons: Hit & Run",
    platform: "PS2",
    year: "2003",
    language: "Inglês",
    region: "NTSC-U/C",
    size: "Edite o tamanho",
    developer: "Radical Entertainment",
    publisher: "Vivendi Universal Games / Fox Interactive",
    genre: "Ação / Aventura / Mundo aberto",
    format: "ISO",
    translation: "Não informado",

    retroAchievements: true,
    achievements: 69,
    achievementPoints: 620,
    supportedHashes: 1,
    hardcoreSupport: true,
    recommendedEmulator: "PCSX2",
    retroAchievementsUrl: "https://retroachievements.org/game/19010",
    retroAchievementsGameId: 19010,
    retroHashesUrl: "https://retroachievements.org/game/19010/hashes",
    achievementBadge: "images/badges/the-simpsons-hit-and-run.png",
    achievementBadgeText: "Complete o conjunto de conquistas de The Simpsons: Hit & Run para conquistar esta insígnia",

    achievementGuide: {
      available: true,
      difficulty: "Média / Alta",
      estimatedTime: "20–30 horas",
      playthroughs: "1 + limpeza",
      missables: "Desafios específicos e condições especiais de algumas conquistas",
      summary: "Guia em português para as 69 conquistas do conjunto base de The Simpsons: Hit & Run no RetroAchievements. O conjunto soma 620 pontos e cobre as sete fases, missões, veículos, roupas, corridas, cartas, gags, vespas e desafios especiais.",
      steps: [
        { title: "1. Complete as sete fases", text: "Avance normalmente pela campanha e conclua todas as missões principais dos sete níveis. Evite cheats que deem vantagem, pois o conjunto do RetroAchievements bloqueia esse tipo de recurso em várias conquistas." },
        { title: "2. Veículos e roupas", text: "Junte moedas durante a campanha para comprar os veículos e roupas de cada nível. Destrua caixas, máquinas e outros objetos do cenário para aumentar sua reserva de moedas." },
        { title: "3. Corridas e conteúdo secundário", text: "Conclua as corridas de cada nível e trabalhe nos objetivos opcionais. Aproveite para liberar veículos adicionais e reduzir o volume de limpeza no final." },
        { title: "4. Colecionáveis", text: "Faça a limpeza das cartas, gags, vespas e demais colecionáveis. Use a lista de conquistas do RetroHub para acompanhar o que ainda falta em cada nível." },
        { title: "5. Desafios especiais e maestria", text: "Finalize as conquistas com condições específicas, veículos obrigatórios ou restrições próprias. Depois confira a lista bloqueada do RetroAchievements até completar as 69 conquistas." }
      ],
      achievements: []
    },

    cover: "images/the-simpsons-hit-and-run.jpg",
    banner: "banners/the-simpsons-hit-and-run.jpg",
    description: "The Simpsons: Hit & Run leva Springfield para uma aventura de ação e exploração com direção, missões e humor da série. Homer, Bart, Lisa, Marge e Apu investigam acontecimentos estranhos pela cidade enquanto o jogador explora sete níveis, participa de corridas, coleta itens e desbloqueia veículos e roupas.",
    screenshots: [
      "screenshots/the-simpsons-hit-and-run/screenshot-01.jpg",
      "screenshots/the-simpsons-hit-and-run/screenshot-02.jpg",
      "screenshots/the-simpsons-hit-and-run/screenshot-03.jpg"
    ],
    download: "https://www.mediafire.com/file/esjrh44niz4g6n8/Simpsons%252C_The_-_Hit_%2526_Run_%2528USA%2529.iso/file"
  },
  {
    slug: "shadow-of-the-colossus",
    title: "Shadow of the Colossus",
    platform: "PS2",
    year: "2005",
    language: "Português",
    region: "NTSC-U/C",
    size: "Edite o tamanho",
    developer: "Team Ico / SCE Japan Studio",
    publisher: "Sony Computer Entertainment",
    genre: "Ação / Aventura",
    format: "ISO",
    translation: "Não informado",

    retroAchievements: true,
    achievements: 94,
    achievementPoints: 625,
    supportedHashes: 1,
    hardcoreSupport: true,
    recommendedEmulator: "PCSX2",
    retroAchievementsUrl: "https://retroachievements.org/game/2992",
    retroAchievementsGameId: 2992,
    retroHashesUrl: "https://retroachievements.org/game/2992/hashes",
    achievementBadge: "images/badges/shadow-of-the-colossus.png",
    achievementBadgeText: "Complete o conjunto de conquistas de Shadow of the Colossus para conquistar esta insígnia",

    achievementGuide: {
      available: true,
      difficulty: "Alta",
      estimatedTime: "25–45 horas",
      playthroughs: "2 recomendadas",
      missables: "Desafios específicos de colossos e coletáveis",
      summary: "Guia em português para as 94 conquistas do conjunto base de Shadow of the Colossus no RetroAchievements. O conjunto soma 625 pontos e inclui os 16 colossos, desafios sem dano e com limite de golpes, coletáveis, Time Attack Normal e Hard e objetivos especiais.",
      steps: [
        { title: "1. NG Normal e os 16 colossos", text: "Faça a primeira campanha no Normal. Aproveite cada luta para aprender os pontos fracos, movimentação e rotas de escalada dos 16 colossos e tente os desafios específicos quando se sentir confortável." },
        { title: "2. Frutas, lagartos e Jardim Secreto", text: "Durante a campanha Normal, explore o mapa e trabalhe nos coletáveis. Aumentar a stamina ajuda no acesso ao Jardim Secreto e prepara o personagem para os objetivos de exploração." },
        { title: "3. Normal Time Attack", text: "Depois de concluir a campanha, faça os desafios de Time Attack no Normal. Memorize as rotas até os sigilos e use golpes totalmente carregados para economizar tempo." },
        { title: "4. NG Hard sem melhorias", text: "Reserve uma campanha Hard para os objetivos que exigem saúde e stamina mínimas. Evite frutas e caudas de lagartos quando a condição da conquista exigir manter os atributos baixos." },
        { title: "5. Hard Time Attack e limpeza", text: "Finalize os Time Attacks no Hard e depois use a lista de conquistas bloqueadas do RetroHub para limpar desafios de colossos, coletáveis e condições especiais restantes." }
      ],
      achievements: []
    },

    cover: "images/shadow-of-the-colossus.jpg",
    banner: "banners/shadow-of-the-colossus.jpg",
    description: "Shadow of the Colossus acompanha Wander em uma jornada pelas Terras Proibidas para derrotar dezesseis colossos e tentar restaurar a vida de Mono. A aventura combina exploração, escalada e batalhas gigantescas em um mundo melancólico e monumental.",
    screenshots: [
      "screenshots/shadow-of-the-colossus/screenshot-01.jpg",
      "screenshots/shadow-of-the-colossus/screenshot-02.jpg",
      "screenshots/shadow-of-the-colossus/screenshot-03.jpg"
    ],
    download: "https://www.mediafire.com/file/a4ily91savdmx81/Shadow_of_the_Colossus_%2528USA%2529.iso/file"
  },
  {
    slug: "black",
    title: "BLACK",
    platform: "PS2",
    year: "2006",
    language: "Português",
    region: "NTSC-U/C",
    size: "Edite o tamanho",
    developer: "Criterion Games",
    publisher: "Electronic Arts",
    genre: "FPS / Ação",
    format: "ISO",
    translation: "Não informado",

    retroAchievements: true,
    achievements: 56,
    achievementPoints: 600,
    supportedHashes: 1,
    hardcoreSupport: true,
    recommendedEmulator: "PCSX2",
    retroAchievementsUrl: "https://retroachievements.org/game/19040",
    retroAchievementsGameId: 19040,
    retroHashesUrl: "https://retroachievements.org/game/19040/hashes",
    achievementBadge: "images/badges/black.png",
    achievementBadgeText: "Complete o conjunto de conquistas de BLACK para conquistar esta insígnia",

    achievementGuide: {
      available: true,
      difficulty: "7/10",
      estimatedTime: "18–30 horas",
      playthroughs: "3 recomendadas",
      missables: "Objetivos e coletáveis por missão",
      summary: "Guia em português para as 56 conquistas do conjunto base de BLACK no RetroAchievements. O conjunto soma 600 pontos e inclui conclusão das oito missões, dificuldades Hard e Black Ops, objetivos de combate, coletáveis, destruição e desafios de tempo.",
      steps: [
        { title: "1. Primeira campanha no Hard", text: "Faça a primeira campanha no Hard. Explore cada fase com calma, priorize headshots, eliminações específicas e objetivos de combate. Isso prepara o save e libera equipamentos úteis para as próximas etapas." },
        { title: "2. Black Ops e objetivos das fases", text: "Depois, conclua as oito missões no Black Ops. Aproveite as armas prateadas e munição facilitada para cumprir objetivos secundários, destruir alvos e buscar itens que tenham ficado para trás." },
        { title: "3. Coletáveis e destruição", text: "Antes de sair de cada área, confira os objetivos da missão. Alguns pontos não permitem retorno, então verifique documentos, intel, armamentos e alvos destrutíveis antes de avançar." },
        { title: "4. Desafios de tempo", text: "Deixe as conquistas de tempo para depois da campanha no Black Ops. Com melhor conhecimento dos mapas e armamento liberado, use a dificuldade Easy quando o requisito permitir e ignore confrontos desnecessários." },
        { title: "5. Limpeza para 100%", text: "No fim, filtre as conquistas ainda bloqueadas no RetroHub BR e refaça apenas as missões necessárias. Dê prioridade às eliminações acumulativas, headshots e objetivos específicos que ainda faltarem." }
      ],
      achievements: []
    },

    cover: "images/black.jpg",
    banner: "banners/black.png",
    description: "BLACK é um jogo de tiro em primeira pessoa desenvolvido pela Criterion Games. A campanha acompanha operações militares intensas, com foco em armas de grande impacto, cenários destrutíveis e combates cinematográficos.",
    screenshots: [
      "screenshots/black/screenshot-01.png",
      "screenshots/black/screenshot-02.png",
      "screenshots/black/screenshot-03.png"
    ],
    download: "#"
  },
  {
    slug: "need-for-speed-most-wanted-black-edition",
    title: "Need for Speed: Most Wanted - Black Edition",
    platform: "PlayStation 2",
    year: "2005",
    language: "Português",
    region: "NTSC-U/C",
    size: "2.85 GB",
    developer: "EA Black Box",
    publisher: "Electronic Arts",
    genre: "Corrida",
    format: "ISO",
    translation: "Diogo Amaral - RafaSZ e ZANIT",

    retroAchievements: true,
    achievements: 131,
    achievementPoints: 955,
    supportedHashes: 1,
    hardcoreSupport: true,
    recommendedEmulator: "PCSX2",
    retroAchievementsUrl: "https://retroachievements.org/game/7788",
    retroAchievementsGameId: 7788,
    retroHashesUrl: "https://retroachievements.org/game/7788/hashes",
    achievementBadge: "images/badges/need-for-speed-most-wanted-black-edition.png",
    achievementBadgeText: "Complete o conjunto de conquistas e torne-se o piloto mais procurado de Rockport para conquistar esta insígnia",

    achievementGuide: {
      available: true,
      difficulty: "8/10",
      estimatedTime: "35–60 horas",
      playthroughs: "1–2 recomendadas",
      missables: "32",
      summary: "Guia em português para as 131 conquistas do conjunto base de Need for Speed: Most Wanted - Black Edition no RetroAchievements. O conjunto soma 955 pontos e mistura progressão da Blacklist, Pink Slips, perseguições, Rap Sheet, Challenge Series, tempos de corrida e desafios especiais.",
      steps: [
        { title: "1. Campanha e Blacklist", text: "Avance pela carreira derrotando os 15 membros da Blacklist. Complete todas as corridas e Milestones de cada rival antes de seguir para o próximo." },
        { title: "2. Pink Slips e conquistas perdíveis", text: "O conjunto possui 32 conquistas perdíveis. Dê atenção especial aos Pink Slips, aos desafios com carros iniciais e às condições que só podem ser feitas antes de determinados pontos da carreira." },
        { title: "3. Rap Sheet e perseguições", text: "Faça os objetivos de perseguição em sessões planejadas: tempo de perseguição, viaturas envolvidas/danificadas/imobilizadas, bloqueios, faixas de pregos, helicópteros, infrações, custo para o Estado e Bounty." },
        { title: "4. Challenge Series e tempos", text: "Finalize os 68 eventos da Challenge Series e depois ataque os tempos Blaze's Times. Use carros totalmente preparados quando a conquista permitir e pratique cada rota antes das tentativas sérias." },
        { title: "5. Limpeza para 100%", text: "Finalize os códigos secretos, atalhos, desafios especiais e a perseguição final sem exploits proibidos. Use o filtro de bloqueadas para localizar o que ainda falta." }
      ],
      achievements: []
    },

    cover: "images/need-for-speed-most-wanted-black-edition.jpg",
    banner: "banners/need-for-speed-most-wanted-black-edition.png",

    description: "Need for Speed: Most Wanted - Black Edition é uma edição especial de Most Wanted, com conteúdos extras e foco em corridas de rua e perseguições policiais.",

    screenshots: [
      "screenshots/need-for-speed-most-wanted-black-edition/screenshot-01.png",
      "screenshots/need-for-speed-most-wanted-black-edition/screenshot-02.png",
      "screenshots/need-for-speed-most-wanted-black-edition/screenshot-03.png"
    ],

    download: "https://gofile.io/d/0FxG10Az"
  },
  {
  slug: "midnight-club-3-dub-edition-remix",
  title: "Midnight Club 3: DUB Edition Remix",
  platform: "PS2",
  year: "2005",
  language: "Português",
  region: "NTSC-U/C",
  size: "7.95 GB",
  developer: "Rockstar San Diego",
  publisher: "Rockstar Games",
  genre: "Corrida",
  format: "ISO",
    translation: "Não informado",
    retroAchievements: true,
    achievements: 126,
    achievementPoints: 1081,
    supportedHashes: 1,
    hardcoreSupport: true,
    recommendedEmulator: "PCSX2",
    retroAchievementsUrl: "https://retroachievements.org/game/3113",
    retroAchievementsGameId: 3113,
    retroHashesUrl: "https://retroachievements.org/game/3113/hashes",
    achievementBadge: "images/badges/midnight-club-3-dub-edition-remix.png",
    achievementBadgeText: "Complete os desafios de corrida e domine as cidades para conquistar esta insígnia",

    achievementGuide: {
      available: true,
      difficulty: "7/10",
      estimatedTime: "30–45 horas",
      playthroughs: "1 campanha + limpeza",
      missables: "1",
      summary: "Roteiro para as 126 conquistas do conjunto base de Midnight Club 3: DUB Edition Remix no RetroAchievements. O conjunto soma 1.081 pontos e acompanha a carreira, torneios, clubes, colecionáveis, técnicas de direção e desafios especiais.",
      steps: [
        { title: "1. Carreira e cidades", text: "Avance pela carreira vencendo os eventos de San Diego, Atlanta, Detroit e o conteúdo Remix. Faça os eventos e torneios conforme forem liberados." },
        { title: "2. Torneios, clubes e veículos", text: "Conclua torneios e desafios de clubes para liberar veículos e personalizações ligados às conquistas." },
        { title: "3. Rockstar Logos e desafios", text: "Colete os Rockstar Logos e complete objetivos de direção, velocidade, Zone, slipstream, saltos e patrimônio." },
        { title: "4. Conquista perdível", text: "Existe 1 conquista marcada como perdível no conjunto. Confira o requisito antes de avançar demais na carreira." },
        { title: "5. Limpeza para 100%", text: "Depois da campanha, use os filtros de conquistas bloqueadas para finalizar eventos e desafios restantes." }
      ],
      achievements: []
    },


  cover: "images/midnight-club-3-dub-edition-remix.jpg",

  banner: "banners/midnight-club-3-dub-edition-remix.png",

  description: "Midnight Club 3: DUB Edition Remix é uma versão expandida do jogo de corrida da Rockstar, com novos veículos, músicas, corridas e a cidade de Tóquio adicionada ao conteúdo original.",

  screenshots: [
    "screenshots/midnight-club-3-dub-edition-remix/screenshot-01.png",
    "screenshots/midnight-club-3-dub-edition-remix/screenshot-02.png",
    "screenshots/midnight-club-3-dub-edition-remix/screenshot-03.png"
  ],

  download: "#"
},
  {
  slug: "need-for-speed-underground",
  title: "Need for Speed: Underground",
  platform: "PS2",
  year: "2003",
  language: "Português",
  region: "NTSC-U/C",
  size: "Edite o tamanho",
  developer: "EA Black Box",
  publisher: "Electronic Arts",
  genre: "Corrida",
  format: "ISO",
    translation: "Não informado",


  retroAchievements: true,
  achievements: 113,
  achievementPoints: 615,
  supportedHashes: 2,
  hardcoreSupport: true,
  recommendedEmulator: "PCSX2",
  retroAchievementsUrl: "https://retroachievements.org/game/3114",
  retroAchievementsGameId: 3114,
  retroHashesUrl: "https://retroachievements.org/game/3114/hashes",
  achievementBadge: "images/badges/need-for-speed-underground.png",
  achievementBadgeText: "Complete o jogo para conquistar esta insígnia",
  achievementGuide: {
    summary: "Guia em português para as 113 conquistas de Need for Speed: Underground no RetroAchievements, incluindo eventos perdíveis.",
    difficulty: "Média / Alta",
    estimatedTime: "25–35 horas",
    playthroughs: "1–2 recomendadas",
    missables: 23,
    achievements: []
  },
  cover: "images/need-for-speed-underground.jpg",

  description: "Need for Speed: Underground leva o jogador ao mundo das corridas de rua, com personalização de veículos, diversos eventos e uma campanha ambientada na cultura tuning.",

  banner: "banners/need-for-speed-underground.jpg",

  screenshots: [
    "screenshots/need-for-speed-underground/screenshot-01.png",
    "screenshots/need-for-speed-underground/screenshot-02.png",
    "screenshots/need-for-speed-underground/screenshot-03.png"
  ],

  download: "#"
},
  {
  slug: "ben-10-protector-of-earth",
  title: "Ben 10: Protector of Earth",
  platform: "PS2",
  year: "2007",
  language: "Português",
  region: "NTSC-U/C",
  size: "Edite o tamanho",
  developer: "High Voltage Software",
  publisher: "D3 Publisher",
  genre: "Ação / Aventura",
  format: "ISO",
    translation: "Não informado",


  retroAchievements: true,
  achievements: 73,
  achievementPoints: 500,
  supportedHashes: 1,
  hardcoreSupport: true,
  recommendedEmulator: "PCSX2",
  retroAchievementsUrl: "https://retroachievements.org/game/9371",
  retroAchievementsGameId: 9371,
  retroHashesUrl: "https://retroachievements.org/game/9371/hashes",
  achievementBadge: "images/badges/ben-10-protector-of-earth.png",
  achievementBadgeText: "Complete o jogo para conquistar esta insígnia",
  achievementGuide: {
    summary: "Guia em português para as 73 conquistas de Ben 10: Protector of Earth no RetroAchievements.",
    difficulty: "Média",
    estimatedTime: "8–12 horas",
    playthroughs: "1–2 recomendadas",
    achievements: []
  },
  cover: "images/ben-10-protector-of-earth.jpg",

  description: "Ben 10: Protector of Earth é um jogo de ação e aventura baseado na série Ben 10. Ben utiliza o Omnitrix para se transformar em diferentes alienígenas e enfrentar inimigos durante sua jornada.",

  banner: "banners/ben-10-protector-of-earth.jpg",

  screenshots: [
    "screenshots/ben-10-protector-of-earth/screenshot-01.png",
    "screenshots/ben-10-protector-of-earth/screenshot-02.png",
    "screenshots/ben-10-protector-of-earth/screenshot-03.png"
  ],

  download: "#"
},
  {
  slug: "kung-fu-panda",
  title: "Kung Fu Panda",
  platform: "PS2",
  year: "2008",
  language: "Português",
  region: "NTSC-U/C",
  size: "3.89 GB",
  developer: "Luxoflux",
  publisher: "Activision",
  genre: "Ação / Aventura",
  format: "ISO",
  translation: "Mauricio - HeitorSpectre",


  retroAchievements: true,
  achievements: 77,
  achievementPoints: 685,
  supportedHashes: 1,
  hardcoreSupport: true,
  recommendedEmulator: "PCSX2",
  retroAchievementsUrl: "https://retroachievements.org/game/23942",
  retroAchievementsGameId: 23942,
  retroHashesUrl: "https://retroachievements.org/game/23942/hashes",
  achievementBadge: "images/badges/kung-fu-panda.png",
  achievementBadgeText: "Complete o conjunto de conquistas para conquistar esta insígnia",

  // GUIA EM PORTUGUÊS — mesmo layout/recursos usados em Metroid Fusion
  achievementGuide: {
    available: true,
    difficulty: "7/10",
    estimatedTime: "12–18 horas",
    playthroughs: "2 recomendadas",
    missables: "10",
    summary: "Guia em português para as 77 conquistas do conjunto base de Kung Fu Panda no RetroAchievements. O conjunto soma 685 pontos e combina progressão da campanha, dificuldades Master e Dragon Warrior, objetivos de fase, desafios de 100% e tarefas especiais.",
    steps: [
      { title: "1. Primeira campanha — Master", text: "Comece pela dificuldade Master para conhecer as fases, controles, chefes e objetivos. Aproveite para concluir os desafios de progressão e aprender onde ficam os objetivos secundários." },
      { title: "2. Limpeza e objetivos de fase", text: "Volte às fases necessárias para concluir objetivos, colecionáveis e desafios de 100%. Algumas fases não possuem requisito de 100% porque seus objetivos principais já cobrem a conclusão necessária." },
      { title: "3. Dragon Warrior", text: "Depois de conhecer as fases, faça a campanha e os desafios exigidos na dificuldade Dragon Warrior. Use o conhecimento adquirido na primeira passagem para reduzir tentativas." },
      { title: "4. Desafios especiais e perdíveis", text: "Deixe os desafios mais exigentes, incluindo tarefas sem sofrer dano e condições específicas, para quando dominar cada fase. O conjunto possui 10 conquistas marcadas como perdíveis." }
    ],
    achievements: []
  },

  cover: "images/kung-fu-panda.jpg",

  banner: "banners/kung-fu-panda.jpg",

  description: "Kung Fu Panda é um jogo de ação e aventura baseado no filme da DreamWorks. Controle Po e outros personagens em uma jornada repleta de combates, plataformas, desafios e habilidades de kung fu.",

  screenshots: [
    "screenshots/kung-fu-panda/screenshot-01.png",
    "screenshots/kung-fu-panda/screenshot-02.png",
    "screenshots/kung-fu-panda/screenshot-03.png"
  ],

  download: "https://www.mediafire.com/file/qd1mhoeiq6e5l0a/Kung_Fu_Panda_%2528USA%2529_%255BPS2%255D_-_RETROHUB BR.iso/file"
},
  {
  slug: "metroid-fusion",
  title: "Metroid Fusion",
  platform: "Game Boy Advance",
  year: "2002",
  language: "Português",
  region: "NTSC-U",
  size: "8 MB",
  developer: "Nintendo R&D1",
  publisher: "Nintendo",
  genre: "Ação / Aventura",
  format: "ROM",
  translation: "Tradu-Roms - PO.B.R.E - Trans-Center",

  retroAchievements: true,
  achievements: 43,
  achievementPoints: 732,
  supportedHashes: 6,
  hardcoreSupport: true,
  recommendedEmulator: "RetroArch + mGBA",
  retroAchievementsUrl: "https://retroachievements.org/game/785",
  retroAchievementsGameId: 785,
  retroHashesUrl: "https://retroachievements.org/game/785/hashes",
  achievementBadge: "images/badges/metroid-fusion.png",
  achievementBadgeText: "Complete o jogo para conquistar esta insígnia",

  // GUIA REAL EM PORTUGUÊS — RetroAchievements Base Set
  achievementGuide: {
    available: true,
    difficulty: "8/10",
    estimatedTime: "15–25 horas",
    playthroughs: "2–3 recomendadas",
    missables: "17",
    summary: "Guia em português para as 43 conquistas do conjunto base de Metroid Fusion no RetroAchievements. O conjunto soma 732 pontos e mistura progressão, chefes sem dano, desafios de tempo, 100% e uma campanha low%.",
    steps: [
      { title: "1. Primeira campanha — história e reconhecimento", text: "Jogue normalmente, desbloqueie as conquistas de progressão e aprenda o mapa e os chefes. Aproveite para tentar os desafios sem dano quando houver um save próximo." },
      { title: "2. Atenção às perdíveis", text: "O conjunto oficial marca 17 conquistas como perdíveis. Dê atenção especial a Shinespark Legend, Quick Thinking, Under Pressure, Swift Escape e aos desafios de tempo." },
      { title: "3. 100% e velocidade", text: "Planeje uma rota para Completionist. Depois, quando conhecer bem o jogo, tente Don't Stop Me Now e Space Juggernaut. O domínio oficial costuma exigir bem mais tempo que apenas terminar a história." },
      { title: "4. Campanha low% — Bare-bones", text: "Faça uma campanha separada sem Energy Tanks e sem expansões de Power Bomb, mantendo a capacidade de Mísseis em 15 ou menos. Esta é uma das conquistas mais exigentes do conjunto." }
    ],
    achievements: [
      { name: "Wrecked Arachnus-X", officialName: "Wrecked Arachnus-X", points: 10, description: "Derrote Arachnus-X sem sofrer dano.", guide: "Salve antes da luta. Mantenha distância, evite as bolas de fogo e ataque quando houver abertura. Se sofrer qualquer dano, recarregue o save e tente novamente.", badge: "https://media.retroachievements.org/Badge/183563.png", missable: true },
      { name: "Vitalit-E", officialName: "Vitalit-E", points: 4, description: "Adquira um Energy Tank.", guide: "Pegue qualquer Energy Tank. O primeiro disponível no caminho normal já serve.", badge: "https://media.retroachievements.org/Badge/183593.png" },
      { name: "Mighty Morphin'", officialName: "Mighty Morphin'", points: 5, description: "Recupere a habilidade Morph Ball.", guide: "Derrote Arachnus-X e absorva o Core-X para recuperar a Morph Ball.", badge: "https://media.retroachievements.org/Badge/183579.png" },
      { name: "Explosive Chamber", officialName: "Explosive Chamber", points: 4, description: "Baixe os dados de Mísseis.", guide: "Conquista de progressão. Siga a missão principal até a Data Room indicada pelo computador e faça o download dos Mísseis.", badge: "https://media.retroachievements.org/Badge/183569.png" },
      { name: "L1 Access (Blue)", officialName: "L1 Access (Blue)", points: 5, description: "Desbloqueie as fechaduras de Nível 1 (azuis).", guide: "Use a Security Room indicada durante a progressão para liberar as portas azuis.", badge: "https://media.retroachievements.org/Badge/183574.png" },
      { name: "L2 Access (Green)", officialName: "L2 Access (Green)", points: 5, description: "Desbloqueie as fechaduras de Nível 2 (verdes).", guide: "Acesse a Security Room correspondente e libere as portas verdes.", badge: "https://media.retroachievements.org/Badge/183575.png" },
      { name: "L3 Access (Yellow)", officialName: "L3 Access (Yellow)", points: 5, description: "Desbloqueie as fechaduras de Nível 3 (amarelas).", guide: "Encontre a Security Room de Nível 3 durante a progressão e libere as portas amarelas.", badge: "https://media.retroachievements.org/Badge/183576.png" },
      { name: "L4 Access (Red)", officialName: "L4 Access (Red)", points: 10, description: "Desbloqueie as fechaduras de Nível 4 (vermelhas).", guide: "Acesse a Security Room de Nível 4 e libere as portas vermelhas.", badge: "https://media.retroachievements.org/Badge/183577.png" },
      { name: "Wrecked Elephant Bird", officialName: "Wrecked Elephant Bird", points: 25, description: "Derrote o Charge Core-X sem sofrer dano.", guide: "Fique atento aos saltos e projéteis do chefe. Priorize desviar e só ataque quando a trajetória estiver segura.", badge: "https://media.retroachievements.org/Badge/183596.png", missable: true },
      { name: "Focused Shot", officialName: "Focused Shot", points: 5, description: "Recupere a habilidade Charge Beam.", guide: "Derrote o Charge Core-X e absorva o núcleo para recuperar o Charge Beam.", badge: "https://media.retroachievements.org/Badge/183571.png" },
      { name: "Firecracker", officialName: "Firecracker", points: 4, description: "Baixe os dados de Bombas.", guide: "Chegue à Data Room do Setor 2 e faça o download das Bombas.", badge: "https://media.retroachievements.org/Badge/183570.png" },
      { name: "Wrecked Zazabi", officialName: "Wrecked Zazabi", points: 10, description: "Derrote Zazabi sem sofrer dano.", guide: "Evite ficar diretamente sob o chefe quando ele cair. Acerte-o quando abrir a boca e reinicie a tentativa caso seja atingido.", badge: "https://media.retroachievements.org/Badge/183604.png", missable: true },
      { name: "More Kick", officialName: "More Kick", points: 5, description: "Recupere High Jump e Jump Ball.", guide: "Derrote Zazabi e absorva o Core-X para receber as duas habilidades.", badge: "https://media.retroachievements.org/Badge/183581.png" },
      { name: "Wrecked Serris", officialName: "Wrecked Serris", points: 25, description: "Derrote Serris sem sofrer dano.", guide: "Memorize a rota de Serris e use as plataformas para evitar contato. Ataque a cabeça quando ele passar por uma posição segura.", badge: "https://media.retroachievements.org/Badge/183602.png", missable: true },
      { name: "Leg Day Paid Off", officialName: "Leg Day Paid Off", points: 5, description: "Recupere o Speed Booster.", guide: "Derrote Serris e absorva o Core-X.", badge: "https://media.retroachievements.org/Badge/183578.png" },
      { name: "Tripled Firepower", officialName: "Tripled Firepower", points: 5, description: "Baixe os dados de Super Missile.", guide: "Faça o download do upgrade de Super Missile na Data Room indicada pela missão.", badge: "https://media.retroachievements.org/Badge/183591.png" },
      { name: "Wrecked B.O.X.", officialName: "Wrecked B.O.X.", points: 10, description: "Derrote o B.O.X. Security Robot sem sofrer dano.", guide: "Use as plataformas para ficar fora da trajetória do robô e ataque o ponto vulnerável por cima. Se tomar dano, recarregue o save.", badge: "https://media.retroachievements.org/Badge/183595.png", missable: true },
      { name: "Stay Frosty", officialName: "Stay Frosty", points: 5, description: "Recupere o efeito da Varia Suit.", guide: "Derrote o Varia Core-X e absorva-o. A Varia Suit permite suportar temperaturas extremas.", badge: "https://media.retroachievements.org/Badge/183589.png" },
      { name: "Frigid Chamber", officialName: "Frigid Chamber", points: 5, description: "Adicione o efeito de gelo aos Mísseis.", guide: "Faça o download do upgrade Ice Missile quando a missão liberar a Data Room correspondente.", badge: "https://media.retroachievements.org/Badge/183572.png" },
      { name: "Open Wide", officialName: "Open Wide", points: 5, description: "Recupere o Wide Beam.", guide: "Derrote o Wide Beam Core-X e absorva o núcleo.", badge: "https://media.retroachievements.org/Badge/183582.png" },
      { name: "Under Pressure", officialName: "Under Pressure", points: 25, description: "Reative a unidade de resfriamento com pelo menos 4 minutos restantes.", guide: "Durante a emergência do superaquecimento, vá direto ao objetivo, evite desvios e reative o sistema antes que o cronômetro fique abaixo de 4:00.", badge: "https://media.retroachievements.org/Badge/183592.png", missable: true },
      { name: "Wrecked Human Core-X", officialName: "Wrecked Human Core-X", points: 25, description: "Derrote o Human Core-X sem sofrer dano.", guide: "Concentre-se em manter espaço para desviar dos ataques e use tiros carregados quando estiver seguro. Qualquer dano invalida a tentativa.", badge: "https://media.retroachievements.org/Badge/183597.png", missable: true },
      { name: "Blinding Power", officialName: "Blinding Power", points: 5, description: "Baixe os dados de Power Bomb.", guide: "Faça o download das Power Bombs na Data Room correspondente.", badge: "https://media.retroachievements.org/Badge/183565.png" },
      { name: "Wrecked Yakuza", officialName: "Wrecked Yakuza", points: 50, description: "Derrote Yakuza sem sofrer dano.", guide: "É um dos desafios mais difíceis do conjunto. Na primeira fase, evite ficar alinhado com as investidas; na segunda, mantenha-se móvel e ataque apenas em janelas seguras. Salve antes da luta.", badge: "https://media.retroachievements.org/Badge/183603.png", missable: true },
      { name: "Space Ninja", officialName: "Space Ninja", points: 5, description: "Recupere a habilidade Space Jump.", guide: "Derrote Yakuza e absorva o Core-X.", badge: "https://media.retroachievements.org/Badge/183588.png" },
      { name: "Wrecked Nettori", officialName: "Wrecked Nettori", points: 25, description: "Derrote Nettori sem sofrer dano.", guide: "Destrua as flores que bloqueiam a arena e controle os saltos entre os projéteis. Use ataques fortes sem se expor ao padrão das plantas.", badge: "https://media.retroachievements.org/Badge/183599.png", missable: true },
      { name: "Piercing Their Pants", officialName: "Piercing Their Pants", points: 5, description: "Recupere a habilidade Plasma Beam.", guide: "Derrote Nettori e absorva o Core-X.", badge: "https://media.retroachievements.org/Badge/183583.png" },
      { name: "Amphibious", officialName: "Amphibious", points: 5, description: "Recupere o efeito da Gravity Suit.", guide: "Derrote Nightmare e absorva o Core-X. Depois disso, Samus poderá se mover normalmente na água.", badge: "https://media.retroachievements.org/Badge/185189.png" },
      { name: "Diffusion Missiles", officialName: "Diffusion Missiles", points: 5, description: "Adicione Diffusion aos Mísseis.", guide: "Faça o download dos Diffusion Missiles na Data Room correspondente.", badge: "https://media.retroachievements.org/Badge/183567.png" },
      { name: "Shinespark Legend", officialName: "Shinespark Legend", points: 50, description: "Depois de abrir as portas de Nível 4 e antes de obter Diffusion Missiles, leia a mensagem secreta no Setor 4.", guide: "PERDÍVEL. Faça o caminho secreto de Shinespark no Setor 4 antes de pegar Diffusion Missiles. Salve antes de tentar e pratique a sequência de Speed Booster/Shinespark; obter Diffusion Missiles encerra a janela desta conquista.", badge: "https://media.retroachievements.org/Badge/183586.png", missable: true },
      { name: "Wave Beam", officialName: "Wave Beam", points: 5, description: "Recupere a habilidade Wave Beam.", guide: "Derrote o Wave Beam Core-X e absorva-o.", badge: "https://media.retroachievements.org/Badge/183594.png" },
      { name: "Wrecked Infected B.O.X.", officialName: "Wrecked Infected B.O.X.", points: 25, description: "Derrote o B.O.X. infectado sem sofrer dano.", guide: "Use o espaço da arena para evitar os ataques e acerte o núcleo quando estiver exposto. Recarregue o save se sofrer dano.", badge: "https://media.retroachievements.org/Badge/183598.png", missable: true },
      { name: "Quick Thinking", officialName: "Quick Thinking", points: 25, description: "Escape do Restricted Laboratory em até 10 segundos.", guide: "PERDÍVEL. Assim que a sequência de fuga começar, siga imediatamente pela rota de saída, sem parar para enfrentar inimigos ou explorar.", badge: "https://media.retroachievements.org/Badge/183584.png", missable: true },
      { name: "Screw Attack", officialName: "Screw Attack", points: 10, description: "Recupere a habilidade Screw Attack.", guide: "Derrote o Core-X correspondente e absorva-o durante a progressão final.", badge: "https://media.retroachievements.org/Badge/183585.png" },
      { name: "Wrecked SA-X", officialName: "Wrecked SA-X", points: 25, description: "Derrote SA-X sem sofrer dano.", guide: "Mantenha distância, use o espaço da arena e ataque nos momentos em que SA-X estiver vulnerável. Evite trocar dano: qualquer acerto recebido invalida a conquista.", badge: "https://media.retroachievements.org/Badge/183601.png", missable: true },
      { name: "Swift Escape", officialName: "Swift Escape", points: 25, description: "Escape da estação com pelo menos 1 minuto restante.", guide: "PERDÍVEL. Na fuga final, siga direto para a nave e evite desvios. O objetivo é terminar a sequência com 1:00 ou mais no cronômetro.", badge: "https://media.retroachievements.org/Badge/183590.png" },
      { name: "Wrecked Omega Metroid", officialName: "Wrecked Omega Metroid", points: 25, description: "Derrote o Omega Metroid sem sofrer dano.", guide: "Na batalha final, mantenha distância dos golpes e ataque somente quando houver abertura. Se for atingido, recarregue o save anterior.", badge: "https://media.retroachievements.org/Badge/183600.png" },
      { name: "Mission Complete", officialName: "Mission Complete", points: 25, description: "Complete a missão.", guide: "Finalize o jogo em qualquer tempo permitido pelo conjunto.", badge: "https://media.retroachievements.org/Badge/183580.png" },
      { name: "Hasty", officialName: "Hasty", points: 10, description: "Complete a missão em menos de 4 horas.", guide: "PERDÍVEL. Faça uma campanha focada na história, evitando coleta desnecessária. O tempo final precisa ser inferior a 4:00.", badge: "https://media.retroachievements.org/Badge/183573.png", missable: true },
      { name: "Don't Stop Me Now", officialName: "Don't Stop Me Now", points: 25, description: "Complete a missão em menos de 2 horas.", guide: "PERDÍVEL. Exige uma rota rápida e conhecimento do mapa. Ignore expansões não essenciais e pratique os setores que mais consomem tempo.", badge: "https://media.retroachievements.org/Badge/183568.png", missable: true },
      { name: "Completionist", officialName: "Completionist", points: 25, description: "Complete a missão com todos os itens coletados.", guide: "Colete 100% dos Energy Tanks, Missile Tanks e Power Bomb Tanks antes de finalizar a missão. Faça uma limpeza do mapa antes da sequência final.", badge: "https://media.retroachievements.org/Badge/183566.png" },
      { name: "Space Juggernaut", officialName: "Space Juggernaut", points: 50, description: "Complete a missão com todos os itens coletados em menos de 2 horas.", guide: "PERDÍVEL. Combine uma rota de 100% com ritmo de speedrun. Planeje a ordem dos itens para reduzir retornos e salve tempo nos chefes e deslocamentos.", badge: "https://media.retroachievements.org/Badge/183587.png", missable: true },
      { name: "Bare-bones", officialName: "Bare-Bones", points: 100, description: "Complete a missão com capacidade de Mísseis de 15 ou menos, sem Energy Tanks e sem expansões de Power Bomb.", guide: "PERDÍVEL. Faça uma campanha low%. Não pegue Energy Tanks nem Power Bomb Tanks e limite sua capacidade de Mísseis a no máximo 15. É recomendável fazer esta conquista em uma campanha separada.", badge: "https://media.retroachievements.org/Badge/183564.png", missable: true }
    ]
  },

  cover: "images/metroid-fusion.png",

  banner: "banners/metroid-fusion.png",

  description: "Metroid Fusion é um jogo de ação e aventura para Game Boy Advance. Samus Aran explora uma estação espacial infestada por organismos parasitas conhecidos como X, adquirindo novas habilidades enquanto enfrenta diversas ameaças.",

  screenshots: [
    "screenshots/metroid-fusion/screenshot-01.png",
    "screenshots/metroid-fusion/screenshot-02.png",
    "screenshots/metroid-fusion/screenshot-03.png"
  ],

  download: "https://www.mediafire.com/file/e10lp5v18fgbr54/Metroid_Fusion_%2528PT-BR%2529.gba/file"
}
];
/* ===== RETROHUB: PADRÃO METROID PARA TODOS OS JOGOS ===== */
function ensureMetroidStyleForAllGames(){
  if(!Array.isArray(games)) return;
  games.forEach(game => {
    if(!game.achievementGuide){
      game.achievementGuide = {
        available:true,
        difficulty:"—",
        estimatedTime:"—",
        playthroughs:"—",
        missables:"—",
        summary:"Conquistas, progresso, filtros e status sincronizados com o RetroAchievements.",
        steps:[],
        achievements:[]
      };
    }else{
      game.achievementGuide.available = true;
      if(!Array.isArray(game.achievementGuide.steps)) game.achievementGuide.steps=[];
      if(!Array.isArray(game.achievementGuide.achievements)) game.achievementGuide.achievements=[];
    }
  });
}

ensureMetroidStyleForAllGames();


/* =========================================================
   FIM DOS JOGOS
   NÃO PRECISA EDITAR ABAIXO
   ========================================================= */

let currentPlatform = "Todos";
let currentGenre = "Todos";
let dubbedOnly = false;
let emulatorMode = false;

let latestExpanded = false;
const latestInitialCount = 5;

const app = document.getElementById("app");
const q = document.getElementById("q");
const filters = document.getElementById("filters");

let currentScreenshots = [];
let currentScreenshotIndex = 0;

let featuredGames = [];
let featuredIndex = 0;
let featuredPosition = 1;
let featuredTimer = null;
let featuredAnimating = false;

function chooseRandomFeaturedGames(){

  const shuffled = [...games];

  for(let i = shuffled.length - 1; i > 0; i--){

    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [shuffled[i], shuffled[j]] =
      [shuffled[j], shuffled[i]];

  }

  featuredGames = shuffled.slice(
    0,
    Math.min(3, shuffled.length)
  );

  featuredIndex = 0;
  featuredPosition =
    featuredGames.length > 1 ? 1 : 0;
}

function getFeaturedSlides(){

  if(featuredGames.length === 0){
    return [];
  }

  if(featuredGames.length === 1){
    return [
      { game: featuredGames[0], logicalIndex: 0 }
    ];
  }

  return [
    {
      game: featuredGames[featuredGames.length - 1],
      logicalIndex: featuredGames.length - 1
    },

    ...featuredGames.map((game,index) => ({
      game,
      logicalIndex:index
    })),

    {
      game: featuredGames[0],
      logicalIndex:0
    }
  ];
}

function setFeaturedTransform(animate = true){

  const track =
    document.getElementById("featuredTrack");

  if(!track){
    return;
  }

  const cards = [
    ...track.querySelectorAll(".featured-card")
  ];

  const dots = [
    ...document.querySelectorAll(".featured-dot")
  ];

  const card = cards[featuredPosition];

  if(!card){
    return;
  }

  cards.forEach((item,index) => {
    item.classList.toggle(
      "active",
      index === featuredPosition
    );
  });

  dots.forEach((dot,index) => {
    dot.classList.toggle(
      "active",
      index === featuredIndex
    );
  });

  const wrap = track.parentElement;

  /*
    Centraliza pelo centro REAL do card dentro da área visível.
    O .featured-wrap possui padding lateral; por isso precisamos
    considerar esse espaço no cálculo do translateX.
  */
  const wrapStyle = getComputedStyle(wrap);
  const paddingLeft = parseFloat(wrapStyle.paddingLeft) || 0;

  const cardCenter =
    paddingLeft + card.offsetLeft + (card.offsetWidth / 2);

  const viewportCenter =
    wrap.clientWidth / 2;

  const target =
    cardCenter - viewportCenter;

  track.style.transition =
    animate
      ? "transform .7s ease"
      : "none";

  track.style.transform =
    `translate3d(${-target}px, 0, 0)`;
}

function updateFeatured(animate = true){

  if(featuredGames.length === 0){
    return;
  }

  setFeaturedTransform(animate);
}

let featuredResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(featuredResizeTimer);
  featuredResizeTimer = setTimeout(() => {
    if(document.getElementById("featuredTrack")){
      setFeaturedTransform(false);
    }
  }, 100);
});

function normalizeFeaturedPosition(){

  if(featuredGames.length <= 1){
    return false;
  }

  let newPosition = null;
  let newIndex = null;

  if(featuredPosition === 0){

    newPosition = featuredGames.length;
    newIndex = featuredGames.length - 1;

  }else if(
    featuredPosition === featuredGames.length + 1
  ){

    newPosition = 1;
    newIndex = 0;

  }else{

    return false;
  }

  const track =
    document.getElementById("featuredTrack");

  if(!track){
    return false;
  }

  const cards = [
    ...track.querySelectorAll(".featured-card")
  ];

  /*
    Desliga TODAS as animações por um instante.
    Assim a troca do slide-clone para o slide real
    acontece exatamente no mesmo lugar, sem o "pulo".
  */
  track.style.transition = "none";

  cards.forEach(card => {
    card.style.transition = "none";
  });

  featuredPosition = newPosition;
  featuredIndex = newIndex;

  setFeaturedTransform(false);

  /* força o navegador a aplicar a posição sem animação */
  void track.offsetWidth;

  return true;
}

function featuredNext(){

  if(
    featuredGames.length === 0 ||
    featuredAnimating
  ){
    return;
  }

  if(featuredGames.length === 1){
    return;
  }

  featuredAnimating = true;

  featuredPosition++;
  featuredIndex =
    (featuredIndex + 1) % featuredGames.length;

  updateFeatured(true);
  restartFeaturedTimer();
}

function featuredPrev(){

  if(
    featuredGames.length === 0 ||
    featuredAnimating
  ){
    return;
  }

  if(featuredGames.length === 1){
    return;
  }

  featuredAnimating = true;

  featuredPosition--;
  featuredIndex =
    (featuredIndex - 1 + featuredGames.length) %
    featuredGames.length;

  updateFeatured(true);
  restartFeaturedTimer();
}

function goToFeatured(index){

  if(
    featuredGames.length === 0 ||
    index < 0 ||
    index >= featuredGames.length
  ){
    return;
  }

  featuredIndex = index;

  featuredPosition =
    featuredGames.length === 1
      ? 0
      : index + 1;

  updateFeatured(true);
  restartFeaturedTimer();
}

function startFeaturedTimer(){

  clearInterval(featuredTimer);

  featuredTimer = setInterval(() => {

    if(
      document.getElementById("featuredTrack")
    ){
      featuredNext();
    }

  }, 7000);
}

function restartFeaturedTimer(){
  startFeaturedTimer();
}

function setupFeaturedLoop(){

  const track =
    document.getElementById("featuredTrack");

  if(!track){
    return;
  }

  track.addEventListener(
    "transitionend",
    function(event){

      /*
        IMPORTANTE:
        transitionend dos cards também "sobe" para o track.
        Sem este teste, o carrossel entende a animação do card
        como se fosse o fim do movimento principal e pode dar
        aquela sensação de ir e voltar.
      */
      if(
        event.target !== track ||
        event.propertyName !== "transform"
      ){
        return;
      }

      const wasReset =
        normalizeFeaturedPosition();

      requestAnimationFrame(() => {

        if(wasReset){

          const cards = [
            ...track.querySelectorAll(".featured-card")
          ];

          cards.forEach(card => {
            card.style.transition = "";
          });
        }

        track.style.transition =
          "transform .7s ease";

        featuredAnimating = false;
      });
    }
  );

  setFeaturedTransform(false);

  requestAnimationFrame(() => {
    track.style.transition =
      "transform .7s ease";
  });
}

window.addEventListener(
  "resize",
  function(){
    if(document.getElementById("featuredTrack")){
      setFeaturedTransform(false);
    }
  }
);

function placeholderCover(title){
  return "https://placehold.co/600x800/161e35/ffffff?text=" + encodeURIComponent(title);
}

function getCover(game){
  if(!game.cover){
    return placeholderCover(game.title);
  }

  return game.cover;
}


function getBanner(game){
  return game.banner || getCover(game);
}


function renderFilters(){

  const platformOptions = [
    { name:"Todos", label:"Todos Jogos" },
    { name:"Dreamcast", label:"Dreamcast" },
    { name:"Game Boy", label:"Game Boy" },
    { name:"Game Boy Color", label:"Game Boy Color GBC" },
    { name:"Game Boy Advance", label:"Game Boy Advance GBA" },
    { name:"GameCube", label:"Game Cube" },
    { name:"Master System", label:"Master System" },
    { name:"Mega Drive", label:"Mega Drive" },
    { name:"N64", label:"Nintendo 64 N64" },
    { name:"Nintendo DS", label:"Nintendo DS" },
    { name:"NES", label:"Nintendo NES (Famicom)" },
    { name:"Nintendo Wii", label:"Nintendo Wii" },
    { name:"PS1", label:"Playstation 1 PS1" },
    { name:"PS2", label:"Playstation 2 PS2" },
    { name:"PSP", label:"PSP" },
    { name:"Saturn", label:"Saturn" },
    { name:"SNES", label:"Super Nintendo SNES" }
  ];

  const genreOptions = [
    ...new Set(
      games.map(game => game.genre).filter(Boolean)
    )
  ].sort((a,b) => a.localeCompare(b, "pt-BR"));

  filters.innerHTML = `

    <div class="main-menu-item">
      <button
        class="main-menu-btn ${currentPlatform === "Todos" && currentGenre === "Todos" && !dubbedOnly && !emulatorMode ? "active" : ""}"
        onclick="goHomeMenu()"
      >
        INÍCIO
      </button>
    </div>

    <div class="main-menu-item">

      <button
        class="main-menu-btn ${currentPlatform !== "Todos" ? "active" : ""}"
        type="button"
      >
        JOGOS
        <span class="menu-chevron">⌄</span>
      </button>

      <div class="dropdown-menu">

        ${platformOptions.map(platform => `
          <button onclick="setPlatform('${platform.name}')">
            ${platform.label}
          </button>
        `).join("")}

      </div>

    </div>

    <div class="main-menu-item">

      <button
        class="main-menu-btn ${currentGenre !== "Todos" ? "active" : ""}"
        type="button"
      >
        GÊNEROS
        <span class="menu-chevron">⌄</span>
      </button>

      <div class="dropdown-menu">

        <button onclick="setGenre('Todos')">
          Todos os gêneros
        </button>

        ${genreOptions.map(genre => `
          <button
            onclick="setGenre(decodeURIComponent('${encodeURIComponent(genre)}'))"
          >
            ${genre}
          </button>
        `).join("")}

      </div>

    </div>

    <div class="main-menu-item">
      <button
        class="main-menu-btn ${dubbedOnly ? "active" : ""}"
        onclick="showDubbed()"
      >
        DUBLADOS
      </button>
    </div>


    <div class="main-menu-item">
      <button
        class="main-menu-btn"
        onclick="showAchievementGuides()"
      >
        GUIAS
      </button>
    </div>

    <div class="main-menu-item">
      <button
        class="main-menu-btn ${emulatorMode ? "active" : ""}"
        onclick="showEmulators()"
      >
        EMULADORES
      </button>
    </div>

    <div class="main-menu-item">
      <button class="main-menu-btn nav-apoie" onclick="openSupportPage()">
        APOIE
      </button>
    </div>

  `;
}

function showAchievementGuides(){
  clearInterval(featuredTimer);
  currentPlatform = "Todos";
  currentGenre = "Todos";
  dubbedOnly = false;
  emulatorMode = false;
  q.value = "";
  q.style.display = "";
  q.closest(".search-wrap")?.style.removeProperty("display");
  filters.style.display = "flex";

  const guideGames = games.filter(game => game.retroAchievements);
  app.innerHTML = `
    <section style="padding:38px 0 50px">
      <h1 style="margin:0 0 8px">📖 Guias de Conquistas</h1>
      <p class="desc" style="margin:0 0 24px">Guias em português para jogos com suporte ao RetroAchievements.</p>
      <div class="grid">
        ${guideGames.map(game => `
          <article class="card" onclick="openGame('${game.slug}')">
            <div class="cover"><img src="${getCover(game)}" alt="${game.title}"></div>
            <div class="info">
              <h3>${game.title}</h3>
              <div class="meta">${game.achievementGuide?.available ? "📖 Guia disponível" : "🕒 Guia em preparação"}</div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
  window.scrollTo(0,0);
}

function goHomeMenu(){
  goHome(true);
}

function setPlatform(platform){

  currentPlatform = platform;
  currentGenre = "Todos";
  dubbedOnly = false;
  emulatorMode = false;

  renderFilters();
  renderHome();
}

function setGenre(genre){

  currentPlatform = "Todos";
  currentGenre = genre;
  dubbedOnly = false;
  emulatorMode = false;

  renderFilters();
  renderHome();

  setTimeout(() => { initRetroAchievementsProgress(game); initGameAchievementCards(); loadNfsAchievementCatalog(game); }, 0);

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}

function showDubbed(){

  currentPlatform = "Todos";
  currentGenre = "Todos";
  dubbedOnly = true;
  emulatorMode = false;

  renderFilters();
  renderHome();
}


const emulators = [
  {
    slug:"duckstation",
    short:"PS1",
    name:"DuckStation",
    platform:"PlayStation 1",
    image:"images/emulators/duckstation.png",
    description:"Emulador moderno e leve para jogos de PlayStation 1.",
    detailDescription:"O DuckStation é um emulador de PlayStation 1 para computador, desenvolvido com foco em alta compatibilidade, precisão e facilidade de uso. Ele permite executar jogos de PS1 com recursos como aumento de resolução interna, correção de perspectiva, filtros gráficos, controles personalizados, save states e outras melhorias que podem deixar os jogos clássicos mais confortáveis em computadores modernos.",
    download:"https://www.duckstation.org/",
    bios:"#"
  },
  {
    slug:"pcsx2",
    short:"PS2",
    name:"PCSX2",
    platform:"PlayStation 2",
    image:"images/emulators/pcsx2.png",
    description:"Emulador de PlayStation 2 para PC, com alta compatibilidade e melhorias gráficas.",
    detailDescription:"O PCSX2 é um emulador de PlayStation 2 para Windows, Linux e macOS. Ele permite executar jogos de PS2 no computador com recursos extras como aumento de resolução, filtros gráficos, widescreen, controles personalizados e melhorias de desempenho. O desempenho pode variar de acordo com o jogo e com o hardware do computador, por isso é recomendado manter o emulador atualizado e ajustar as configurações gráficas conforme a capacidade do PC.",
    download:"https://pcsx2.net/",
    bios:"#"
  },
  {
    slug:"ppsspp",
    short:"PSP",
    name:"PPSSPP",
    platform:"PSP",
    image:"images/emulators/ppsspp.png",
    description:"Emulador conhecido por oferecer boa compatibilidade com jogos de PSP.",
    download:"#",
    bios:"#"
  },
  {
    slug:"flycast",
    short:"DC",
    name:"Flycast",
    platform:"Dreamcast",
    image:"images/emulators/flycast.png",
    description:"Emulador voltado para Sega Dreamcast.",
    download:"#",
    bios:"#"
  },
  {
    slug:"mupen64plus",
    short:"N64",
    name:"Mupen64Plus",
    platform:"Nintendo 64",
    image:"images/emulators/mupen64plus.png",
    description:"Emulador para jogos de Nintendo 64.",
    download:"#",
    bios:"#"
  },
  {
    slug:"snes9x",
    short:"SNES",
    name:"Snes9x",
    platform:"Super Nintendo",
    image:"images/emulators/snes9x.png",
    description:"Emulador leve para jogos de Super Nintendo.",
    download:"#",
    bios:"#"
  },
  {
    slug:"genesis-plus-gx",
    short:"MD",
    name:"Genesis Plus GX",
    platform:"Mega Drive",
    image:"images/emulators/genesis-plus-gx.png",
    description:"Emulador para Mega Drive e Master System.",
    download:"#",
    bios:"#"
  },
  {
    slug:"dolphin",
    short:"GC",
    name:"Dolphin",
    platform:"GameCube / Wii",
    image:"images/emulators/dolphin.png",
    description:"Emulador para Nintendo GameCube e Wii.",
    download:"#",
    bios:"#"
  }
];

function showEmulators(updateHistory = true){

  currentPlatform = "Todos";
  currentGenre = "Todos";
  dubbedOnly = false;
  emulatorMode = true;

  if(updateHistory && location.hash !== "#emulators"){
    history.pushState(
      { page: "emulators" },
      "",
      "#emulators"
    );
  }

  renderFilters();
  renderEmulators();

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

function renderEmulators(){

  clearInterval(featuredTimer);

  app.innerHTML = `

    <section class="emulators-section">

      <div class="emulators-header">

        <h1>Emuladores</h1>

        <p>
          Emuladores organizados por plataforma.
        </p>

      </div>

      <div class="emulators-grid">

        ${emulators.map(item => `

          <article
            class="emulator-card"
            onclick="openEmulator('${item.slug}')"
          >

            <div class="emulator-cover">
              <img
                src="${item.image}"
                alt="${item.name}"
                onerror="this.style.display='none'"
              >
            </div>

            <h3>${item.name}</h3>

            <div class="emulator-platform">
              ${item.platform}
            </div>

            <p>${item.description}</p>

          </article>

        `).join("")}

      </div>

    </section>

  `;
}

function openEmulator(slug, updateHistory = true){

  const emulator = emulators.find(
    item => item.slug === slug
  );

  if(!emulator){
    return;
  }

  if(updateHistory){
    history.pushState(
      { page:"emulator", slug:slug },
      "",
      "#emulator=" + encodeURIComponent(slug)
    );
  }

  clearInterval(featuredTimer);

  app.innerHTML = `

    <section class="emulator-detail">

      <div class="emulator-detail-grid">

        <div class="emulator-detail-image">
          <img
            src="${emulator.image}"
            alt="${emulator.name}"
            onerror="this.style.display='none'"
          >
        </div>

        <div class="emulator-detail-body">

          <h1>${emulator.name}</h1>

          <div class="emulator-detail-platform">
            ${emulator.platform}
          </div>

          <p class="emulator-detail-desc">
            ${emulator.detailDescription || emulator.description}
          </p>

          <div class="emulator-actions">

            <a
              class="emulator-download"
              href="${emulator.download}"
              target="_blank"
              rel="noopener"
            >
              ⬇ DOWNLOAD
            </a>

            ${emulator.slug === "pcsx2" ? `
              <a
                class="emulator-bios"
                href="${emulator.bios}"
                target="_blank"
                rel="noopener"
              >
                BIOS
              </a>
            ` : ""}

          </div>

          ${emulator.slug === "pcsx2" ? `
            <div class="pcsx2-bios-box">
              <h2>Sobre a BIOS</h2>
              <p>
                A BIOS é o software de sistema original do PlayStation 2 utilizado pelo PCSX2
                para inicializar e executar jogos corretamente.
              </p>
              <p>
                O recomendado é extrair a BIOS do seu próprio console PlayStation 2.
                O PCSX2 não inclui a BIOS junto com o emulador.
              </p>
              <p>Existem diferentes versões de BIOS de acordo com a região e o modelo do console:</p>
              <ul class="pcsx2-bios-list">
                <li><strong>NTSC-U</strong> — América do Norte</li>
                <li><strong>PAL</strong> — Europa</li>
                <li><strong>NTSC-J</strong> — Japão</li>
              </ul>
            </div>
          ` : emulator.slug === "duckstation" ? `
            <div class="pcsx2-bios-box">
              <h2>Sobre a BIOS</h2>
              <p>
                A BIOS contém o software de sistema original do PlayStation 1 e pode ser utilizada
                pelo DuckStation para oferecer uma experiência mais fiel ao console.
              </p>
              <p>
                O recomendado é extrair a BIOS do seu próprio PlayStation 1.
                O DuckStation não acompanha arquivos de BIOS.
              </p>
              <p>As versões podem variar de acordo com a região do console:</p>
              <ul class="pcsx2-bios-list">
                <li><strong>NTSC-U</strong> — América do Norte</li>
                <li><strong>PAL</strong> — Europa</li>
                <li><strong>NTSC-J</strong> — Japão</li>
              </ul>
            </div>
          ` : ""}

        </div>

      </div>

    </section>

  `;

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

function goHome(updateHistory = true){

  clearInterval(featuredTimer);

  currentPlatform = "Todos";
  currentGenre = "Todos";
  dubbedOnly = false;
  emulatorMode = false;
  latestExpanded = false;
  q.value = "";

  if(updateHistory){
    history.replaceState(
      { page: "home" },
      "",
      location.pathname + location.search
    );
  }

  q.style.display = "";
  q.closest(".search-wrap")?.style.removeProperty("display");
  filters.style.display = "flex";

  const socialX = document.getElementById("socialX");
  const topBar = document.getElementById("topBar");

  if(socialX) socialX.style.display = "";
  if(topBar) topBar.style.justifyContent = "";

  renderFilters();
  renderHome();

  window.scrollTo(0, 0);
}


function getLatestGames(){

  /*
    ORDEM DOS ÚLTIMOS JOGOS:
    O primeiro jogo cadastrado no array "games" é considerado o mais novo.
    Portanto, sempre adicione jogos novos NO INÍCIO do const games.
    Assim o jogo recém-adicionado aparecerá automaticamente em primeiro
    em "Últimos jogos adicionados", sem precisar alterar outra parte do site.
  */
  return [...games];
}

function getVisibleLatestGames(){

  const latestGames = getLatestGames();

  return latestExpanded
    ? latestGames
    : latestGames.slice(0, latestInitialCount);
}

function toggleLatestGames(){

  latestExpanded = !latestExpanded;
  renderHome();

  const section =
    document.querySelector(".latest-section");

  if(section){
    section.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });
  }
}

function isHomeView(){

  return (
    currentPlatform === "Todos" &&
    currentGenre === "Todos" &&
    !dubbedOnly &&
    !emulatorMode &&
    q.value.trim() === ""
  );

}


function getRetrohubPicks(limit = 3){
  const pool = [...games];
  for(let i = pool.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(limit, pool.length));
}

function getHomeAchievementGames(){
  return games.filter(g => g.retroAchievements && g.retroAchievementsGameId).slice(0,4);
}

function getHomePlatforms(){
  const counts = {};
  games.forEach(g => { counts[g.platform] = (counts[g.platform] || 0) + 1; });
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,4);
}

async function loadHomeContinueProgress(){
  const section=document.getElementById("homeContinueSection");
  const grid=document.getElementById("homeContinueGrid");
  const user=localStorage.getItem("retrohub_ra_user");
  if(!section || !grid || !user) return;
  const raGames=games.filter(g=>g.retroAchievements && g.retroAchievementsGameId).slice(0,8);
  try{
    const results=await Promise.all(raGames.map(async game=>{
      try{
        const r=await fetch(`/api/retroachievements?user=${encodeURIComponent(user)}&gameId=${encodeURIComponent(game.retroAchievementsGameId)}`,{cache:"no-store"});
        if(!r.ok) return null;
        const d=await r.json();
        const total=Number(d.NumAchievements ?? game.achievements ?? 0), earned=Number(d.NumAwardedToUser ?? 0);
        if(!total || !earned || earned>=total) return null;
        return {game,total,earned,percent:Math.round(earned/total*100)};
      }catch(_){ return null; }
    }));
    const active=results.filter(Boolean).sort((a,b)=>b.percent-a.percent).slice(0,4);
    if(!active.length) return;
    grid.innerHTML=active.map(x=>`<article class="home-progress-card" onclick="openGame('${x.game.slug}')"><img src="${getCover(x.game)}" alt="${x.game.title}"><div><div class="home-progress-title">${x.game.title}</div><div class="home-progress-meta">${x.earned} / ${x.total} conquistas desbloqueadas</div><div class="home-progress-track"><div class="home-progress-fill" style="width:${x.percent}%"></div></div><div class="home-progress-percent">${x.percent}% concluído</div></div></article>`).join("");
    section.classList.add("show");
  }catch(_){ }
}

function renderHome(){

  const search = q.value.toLowerCase().trim();

  const filteredGames = games.filter(game => {

    const matchesPlatform =
      currentPlatform === "Todos" ||
      game.platform === currentPlatform;

    const matchesGenre =
      currentGenre === "Todos" ||
      game.genre === currentGenre;

    const matchesDubbed =
      !dubbedOnly ||
      /dublado|dublada/i.test(game.language || "") ||
      /dublado|dublada/i.test(game.title || "") ||
      /dublado|dublada/i.test(game.description || "");

    const matchesSearch =
      game.title.toLowerCase().includes(search);

    return matchesPlatform &&
           matchesGenre &&
           matchesDubbed &&
           matchesSearch;

  });

  const showHomeSections = isHomeView();

  app.innerHTML = `

    ${showHomeSections ? `

    <h2 class="featured-section-title">Destaques e recomendados</h2>
    <section class="featured-wrap">

      <button class="featured-arrow featured-prev" onclick="event.stopPropagation();featuredPrev()">❮</button>

      <div class="featured-track" id="featuredTrack">

        ${getFeaturedSlides().map((slide,slideIndex) => `

          <article
            class="featured-card ${slideIndex === featuredPosition ? "active" : ""}"
            onclick="openGame('${slide.game.slug}')"
          >

            <img
              class="featured-main-image"
              data-featured-main-image
              data-original-banner="${getBanner(slide.game)}"
              src="${getBanner(slide.game)}"
              alt="${slide.game.title}"
            >

            <div class="featured-overlay"></div>

            <div class="featured-info">

              <h2>${slide.game.title}</h2>

              <p>
                ${slide.game.description}
              </p>

              ${(slide.game.screenshots || []).length ? `
                <div class="featured-preview-grid">
                  ${(slide.game.screenshots || []).slice(0,4).map(src => `<img class="featured-screenshot-thumb" data-featured-screenshot data-full="${src}" src="${src}" alt="Prévia de ${slide.game.title}" onclick="event.stopPropagation()">`).join("")}
                </div>
              ` : ""}

              <div class="featured-recommend">
                <strong>↗ Em destaque</strong>
                <span>Selecionado para você conhecer no RetroHub BR</span>
              </div>

              <div class="featured-tags">
                <span>${slide.game.platform}</span>
                <span>${slide.game.genre}</span>
                <span>${slide.game.language}</span>
              </div>

            </div>

          </article>

        `).join("")}

      </div>

      <button class="featured-arrow featured-next" onclick="event.stopPropagation();featuredNext()">❯</button>

      <div class="featured-dots">
        ${featuredGames.map((game,index) => `
          <button
            class="featured-dot ${index === featuredIndex ? "active" : ""}"
            onclick="event.stopPropagation();goToFeatured(${index})"
            aria-label="Ir para destaque ${index + 1}"
          ></button>
        `).join("")}
      </div>

    </section>

    <section class="latest-section">

      <div class="latest-header">

        <h2>
          Últimos jogos adicionados
        </h2>

      </div>

      <div class="latest-grid">

        ${getVisibleLatestGames().map(game => `

          <article
            class="latest-card"
            onclick="openGame('${game.slug}')"
          >

            <div class="latest-cover">

              <img
                src="${getCover(game)}"
                alt="${game.title}"
              >

            </div>

            <div class="latest-info">

              <h3>
                ${game.title}
              </h3>

              <div class="latest-meta">
                <span class="latest-chip">${game.platform}</span>
                <span class="latest-chip">${game.language || game.year}</span>
                ${game.retroAchievements ? `<span class="latest-chip ra">🏆 Conquistas</span>` : ``}
              </div>

            </div>

          </article>

        `).join("")}

      </div>

      ${games.length > latestInitialCount ? `

        <div class="latest-expand-wrap">

          <button
            class="latest-expand"
            onclick="toggleLatestGames()"
          >
            ${latestExpanded
              ? "MOSTRAR MENOS"
              : "CONFIRA +"}
          </button>

        </div>

      ` : ""}

    </section>

    <section class="home-section home-continue" id="homeContinueSection">
      <div class="home-section-head"><div><div class="home-section-kicker">Seu progresso</div><h2>Continue conquistando</h2><p>Retome os jogos que você já começou no RetroAchievements.</p></div></div>
      <div class="home-continue-grid" id="homeContinueGrid"></div>
    </section>

    <section class="home-section">
      <div class="home-section-head"><div><div class="home-section-kicker">Guias & conquistas</div><h2>Jogos com conquistas</h2><p>Jogos do catálogo com integração ao RetroAchievements e guia de progresso.</p></div></div>
      <div class="home-achievement-grid">
        ${getHomeAchievementGames().map(game=>`<article class="home-achievement-card" onclick="openGame('${game.slug}')"><img src="${getBanner(game)}" alt="${game.title}"><div class="home-achievement-info"><strong>${game.title}</strong><div class="home-achievement-meta"><span>${game.platform}</span><span class="home-trophy">🏆 ${game.achievements || 'RA'} conquistas</span>${game.achievementGuide ? `<span>Guia disponível</span>` : ``}</div></div></article>`).join("")}
      </div>
    </section>

    <section class="home-section retrohub-picks-section">
      <div class="home-section-head"><div><div class="home-section-kicker">Descubra algo novo</div><h2>Escolhas do RetroHub</h2><p>Três jogos do catálogo escolhidos para você conhecer.</p></div></div>
      <div class="retrohub-picks-grid">
        ${getRetrohubPicks().map(game=>`<article class="retrohub-pick-card" onclick="openGame('${game.slug}')"><img src="${getBanner(game)}" alt="${game.title}"><div class="retrohub-pick-overlay"></div><div class="retrohub-pick-info"><span>${game.platform}</span><h3>${game.title}</h3><div class="retrohub-pick-meta">${game.language || ''}${game.retroAchievements ? ' · 🏆 Conquistas' : ''}</div><button type="button" onclick="event.stopPropagation();openGame('${game.slug}')">Ver jogo →</button></div></article>`).join("")}
      </div>
    </section>

    <div class="ra-footer-notice">
      <span>🏆 <strong>Conquistas via RetroAchievements</strong> · Disponíveis em jogos compatíveis.</span>
      <button class="ra-footer-more" type="button" onclick="event.stopPropagation();openRaInfoModal()">Saiba mais ›</button>
    </div>

    <footer class="site-footer">
      <div class="site-footer-links">
        <a href="termos.html">Termos de Serviço</a>
        <span>•</span>
        <a href="privacidade.html">Política de Privacidade</a>
      </div>
      <div class="site-footer-copy">
        © 2026 RetroHub BR. Todos os direitos reservados.
      </div>
    </footer>

    ` : ""}

    ${!showHomeSections ? `

    <section class="grid">

      ${filteredGames.map(game => `

        <article
          class="card"
          onclick="openGame('${game.slug}')"
        >

          <div class="cover">

            <img
              src="${getCover(game)}"
              alt="${game.title}"
            >

          </div>

          <div class="info">

            <h3>
              ${game.title}
            </h3>

            <div class="meta">
              ${game.platform}
              •
              ${game.language}
              •
              ${game.year}
            </div>

          </div>

        </article>

      `).join("")}

    </section>

    ` : ""}

  `;

  document.body.classList.toggle("home-modern", showHomeSections);

  if(showHomeSections){

    requestAnimationFrame(() => {
      setupFeaturedLoop();
      startFeaturedTimer();
      loadHomeContinueProgress();
    });

  }else{

    clearInterval(featuredTimer);

  }

}


function getRandomRecommendations(currentSlug, limit = 5){

  const available = games.filter(
    game => game.slug !== currentSlug
  );

  for(let i = available.length - 1; i > 0; i--){

    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [available[i], available[j]] =
      [available[j], available[i]];

  }

  return available.slice(
    0,
    Math.min(limit, available.length)
  );
}

function openGame(slug, updateHistory = true){

  clearInterval(featuredTimer);

  const game = games.find(
    item => item.slug === slug
  );
  if(!game){

    history.replaceState(
      { page: "home" },
      "",
      location.pathname
    );

    q.style.display = "";
  q.closest(".search-wrap")?.style.removeProperty("display");
    filters.style.display = "flex";

    document.getElementById("socialX").style.display = "";
    document.getElementById("topBar").style.justifyContent = "";

    renderHome();
    return;
  }

  if(updateHistory){
    history.pushState(
      { page: "game", slug: slug },
      "",
      "#game=" + encodeURIComponent(slug)
    );
  }

  q.style.display = "none";
  q.closest(".search-wrap")?.style.setProperty("display", "none");
  filters.style.display = "none";

  document.getElementById("socialX").style.display = "none";
  document.getElementById("topBar").style.justifyContent = "center";

  let screenshotsHTML = "";

  if(
    game.screenshots &&
    game.screenshots.length > 0
  ){

    screenshotsHTML = `

      <div class="shots">

        ${game.screenshots.map((image,index) => `
          <img
            src="${image}"
            alt="${game.title}"
            onclick="openScreenshot('${game.slug}', ${index})"
          >
        `).join("")}

      </div>

    `;

  }else{

    screenshotsHTML = `

      <p class="no-shots">
        Nenhum screenshot adicionado.
      </p>

    `;

  }

  const retroAchievementsHTML = game.retroAchievements ? `
    <section class="ra-box ra-compact">
      <div class="ra-compact-top">
        <div class="ra-compact-brand">
          <h2 class="ra-title">🏆 RetroAchievements</h2>
          <span class="ra-status">✓ Suportado</span>
        </div>
        <div class="ra-compact-actions">
          <button class="ra-user-disconnect" id="raDisconnect" type="button" onclick="disconnectRetroAchievements()" hidden>Desconectar</button>
        </div>
      </div>

      <div class="ra-user-box" id="raUserBox" data-game-id="${game.retroAchievementsGameId || ""}">
        <div class="ra-user-head">
          <div class="ra-user-identity">
            <div class="ra-user-title">👤 <span id="raCompactUserLabel">Seu progresso</span></div>
            <div class="ra-user-sub" id="raUserSubtitle">Informe seu usuário para sincronizar suas conquistas.</div>
          </div>
          <form class="ra-user-form" id="raUserForm" onsubmit="connectRetroAchievements(event)">
            <input class="ra-user-input" id="raUsername" type="text" maxlength="50" autocomplete="username" placeholder="Usuário do RetroAchievements" aria-label="Usuário do RetroAchievements">
            <button class="ra-user-button" type="submit">🔄 SINCRONIZAR</button>
          </form>
        </div>

        <div class="ra-progress-wrap" id="raProgress" hidden>
          <div class="ra-progress-info"><span id="raProgressCount">0 / ${game.achievements ?? 0} conquistas</span><span id="raProgressPercent">0%</span></div>
          <div class="ra-progress-track"><div class="ra-progress-bar" id="raProgressBar"></div></div>
          <div class="ra-sync-msg" id="raSyncMsg"></div>
        </div>
      </div>

      <div class="ra-compact-info">
        <span><b>${game.achievements ?? "—"}</b> conquistas</span>
        <span><b>${game.achievementPoints ?? "—"}</b> pontos</span>
        <span><b>${game.supportedHashes ?? "—"}</b> hashes</span>
        ${game.hardcoreSupport ? `<span>🔥 Hardcore</span>` : ""}
        ${game.recommendedEmulator ? `<span>🎮 ${game.recommendedEmulator}</span>` : ""}
        <span>🌎 ${game.region}</span>
      </div>

      ${game.achievementBadge ? `
        <div class="ra-badge ra-badge-compact">
          <img src="${game.achievementBadge}" alt="Insígnia de conclusão de ${game.title}" onerror="this.parentElement.style.display='none'">
          <div class="ra-badge-info">
            <small>🏅 INSÍGNIA DE CONCLUSÃO</small>
            <strong>${game.achievementBadgeText || "Complete o jogo para conquistar esta insígnia"}</strong>
          </div>
        </div>
      ` : ""}
    </section>
  ` : "";

  const achievementGuideHTML = game.retroAchievements ? (() => {
    const guide = game.achievementGuide;
    const achievements = Array.isArray(guide?.achievements) ? guide.achievements : [];

    return `
      ${guide ? `
        <div class="achievement-summary-compact">
          <h2>${game.title} — Roteiro para 100%</h2>
          ${guide.summary ? `<p>${guide.summary}</p>` : ""}
          <div class="achievement-summary-stats">
            ${guide.difficulty ? `<span>⚔ <strong>${guide.difficulty}</strong></span>` : ""}
            ${guide.estimatedTime ? `<span>⏱ <strong>${guide.estimatedTime}</strong></span>` : ""}
            ${guide.playthroughs ? `<span>🎮 <strong>${guide.playthroughs}</strong></span>` : ""}
            ${guide.missables ? `<span>⚠ <strong>${guide.missables}</strong> perdíveis</span>` : ""}
          </div>
        </div>
      ` : ""}
      <div class="guide-full achievements-list-only">
        ${achievements.length ? achievements.map(item => `
          <article class="guide-achievement" data-ra-name="${escapeHTML(item.officialName || item.name || "")}">
            ${item.badge ? `<img src="${item.badge}" alt="${item.name || "Conquista"}">` : ""}
            <div>
              <div class="guide-achievement-title">
                ${item.missable ? `<img class="guide-missable-icon" src="missable-icon.png" alt="Perdível" title="Conquista perdível">` : ""}
                <div>
                  <h3><span class="ra-lock-icon">🔒</span> ${item.name || "Conquista"}</h3>
                  <div class="ra-earned-slot"></div>
                  ${item.officialName ? `<div class="guide-official-name">${item.officialName}</div>` : ""}
                </div>
              </div>
              ${item.points ? `<div class="guide-points">${item.points} pontos</div>` : ""}
              ${item.description ? `<p><strong>Requisito:</strong> ${item.description}</p>` : ""}
              ${item.guide ? `<p><strong>Como conseguir:</strong> ${item.guide}</p>` : ""}
            </div>
          </article>
        `).join("") : `<p class="guide-empty">As conquistas deste jogo ainda não foram adicionadas.</p>`}
      </div>
    `;
  })() : "";

  const recommendedGames =
    getRandomRecommendations(
      game.slug,
      5
    );

  const recommendationsHTML =
    recommendedGames.length > 0
      ? `
        <section class="recommended">

          <h2>
            Escolhidos para você
          </h2>

          <div class="recommended-grid">

            ${recommendedGames.map(item => `

              <article
                class="recommended-card"
                onclick="openGame('${item.slug}')"
              >

                <img
                  src="${getCover(item)}"
                  alt="${item.title}"
                >

                <h3>
                  ${item.title}
                </h3>

              </article>

            `).join("")}

          </div>

        </section>
      `
      : "";

  app.innerHTML = `
    <main class="game-page">
      <section class="game-hero" style="--game-hero-bg:url('${game.heroBackground || getBanner(game) || getCover(game)}')">
        <img class="game-hero-cover" src="${getCover(game)}" alt="${game.title}">
        <div class="game-hero-main">
          <h1>${game.title}</h1>
          <div class="tags">
            <span class="pill">${game.platform}</span>
            <span class="pill">${game.year}</span>
            <span class="pill">${game.genre}</span>
            <span class="pill">${game.language}</span>
          </div>
          <p class="desc">${game.description}</p>
        </div>
        <aside class="game-hero-progress">
          <div class="game-progress-number" id="gameHeroProgressCount">0 / ${game.achievements ?? 0}</div>
          <div class="game-progress-label">conquistas desbloqueadas</div>
          <div class="game-progress-track"><div class="game-progress-fill" id="gameHeroProgressBar"></div></div>
          <div class="game-progress-percent" id="gameHeroProgressPercent">0%</div><div class="game-perfect-label">🏆 JOGO PERFEITO</div>
        </aside>
      </section>

      <nav class="game-tabs" aria-label="Seções do jogo">
        <button class="game-tab active" onclick="goGameSection('gameOverview',this)">Visão geral</button>
        ${game.retroAchievements ? `<button class="game-tab" onclick="goGameSection('gameAchievements',this)">Conquistas</button>` : ""}
        <button class="game-tab" onclick="goGameSection('gameScreens',this)">Screenshots</button>
      </nav>

      <section class="game-section" id="gameOverview">
        <div class="game-section-title"><h2>Visão geral</h2><span>${game.platform} • ${game.region}</span></div>
        ${retroAchievementsHTML}
      </section>

      ${game.retroAchievements ? `
      <section class="game-section game-achievement-panel" id="gameAchievements">
        <div class="game-section-title"><h2>🏆 Conquistas</h2><span>${game.achievements ?? "—"} conquistas • ${game.achievementPoints ?? "—"} pontos</span></div>
        ${achievementGuideHTML}
      </section>` : ""}

      <section class="game-section" id="gameScreens">
        <div class="game-section-title"><h2>🖼️ Screenshots</h2><span>${game.screenshots?.length || 0} imagens</span></div>
        <div class="game-overview-grid">
          <div class="game-shots-card">${screenshotsHTML}</div>
          <div class="game-info-card game-info-compact">
            <div class="game-info-heading">
              <div><small>FICHA TÉCNICA</small><strong>Informações do jogo</strong></div>
              <a class="download game-info-download" href="${game.download}" target="_blank" rel="noopener">⬇ DOWNLOAD</a>
            </div>
            <div class="game-info-chips">
              ${[["🎮",game.platform],["📅",game.year],["🌐",game.language],["🌎",game.region],["💾",game.size],["📦",game.format]].map(item => `<span><b>${item[0]}</b>${item[1]}</span>`).join("")}
            </div>
            <div class="game-info-details">
              <p><small>Desenvolvedora</small><strong>${game.developer}</strong></p>
              <p><small>Publicadora</small><strong>${game.publisher}</strong></p>
              <p class="translation"><small>Tradução</small><strong>${game.translation || "Não informado"}</strong></p>
            </div>
          </div>
        </div>
      </section>

      <section class="game-section rh-comments-section" id="gameComments">
        <div class="game-section-title">
          <h2>💬 Comentários</h2>
          <span id="gameCommentsCount">Carregando...</span>
        </div>

        <div class="rh-comment-composer" id="gameCommentComposer">
          <div class="rh-comment-login-note" id="gameCommentLoginNote">Entre na sua conta para comentar neste jogo.</div>
          <form id="gameCommentForm" onsubmit="submitGameComment(event, '${game.slug}')" hidden>
            <textarea id="gameCommentText" maxlength="1000" rows="4" placeholder="Escreva um comentário sobre ${game.title}..." required></textarea>
            <div class="rh-comment-compose-bottom">
              <span><b id="gameCommentChars">0</b>/1000</span>
              <button type="submit" id="gameCommentSubmit">Publicar comentário</button>
            </div>
          </form>
        </div>

        <div class="rh-comments-list" id="gameCommentsList">
          <div class="rh-comments-loading">Carregando comentários...</div>
        </div>
      </section>
    </main>
    ${recommendationsHTML}
  `;

  setTimeout(() => {
    initRetroAchievementsProgress(game);
    initGameAchievementCards();
    loadNfsAchievementCatalog(game);
    if (typeof initGameComments === "function") {
      initGameComments(game.slug);
    } else {
      window.addEventListener("load", () => initGameComments(game.slug), { once:true });
    }
  }, 0);

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


function goGameSection(id, button){
  const target=document.getElementById(id);
  if(!target) return;
  document.querySelectorAll('.game-tab').forEach(el=>el.classList.remove('active'));
  button?.classList.add('active');
  target.scrollIntoView({behavior:'smooth',block:'start'});
}

function escapeHTML(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizeRAName(value){
  return String(value || "").trim().toLocaleLowerCase("en-US");
}

function getCurrentGame(){
  const match = location.hash.match(/^#game=(.+)$/);
  if(!match) return null;
  const slug = decodeURIComponent(match[1]);
  return games.find(item => item.slug === slug) || null;
}


let currentGameAchievementFilter="all", currentGameAchievementSearch="";
function applyGameAchievementFilters(){
  document.querySelectorAll("#gameAchievements .guide-achievement").forEach(card=>{
    const title=(card.dataset.raName||card.textContent||"").toLowerCase();
    const earned=card.classList.contains("ra-earned");
    const hardcore=card.classList.contains("is-hardcore");
    const matchFilter=currentGameAchievementFilter==="all"||(currentGameAchievementFilter==="earned"&&earned)||(currentGameAchievementFilter==="locked"&&!earned)||(currentGameAchievementFilter==="hardcore"&&hardcore);
    const matchSearch=!currentGameAchievementSearch||title.includes(currentGameAchievementSearch);
    card.classList.toggle("hidden-by-filter",!(matchFilter&&matchSearch));
  });
}
function filterGameAchievements(filter,button){currentGameAchievementFilter=filter;document.querySelectorAll(".game-filter").forEach(b=>b.classList.toggle("active",b===button));applyGameAchievementFilters()}
function searchGameAchievements(value){currentGameAchievementSearch=(value||"").trim().toLowerCase();applyGameAchievementFilters()}
function initGameAchievementCards(){document.querySelectorAll("#gameAchievements .guide-achievement").forEach(card=>card.addEventListener("click",()=>card.classList.toggle("expanded")))}

function initRetroAchievementsProgress(game){
  if(!game?.retroAchievements || !game?.retroAchievementsGameId) return;
  const savedUser = localStorage.getItem("retrohub_ra_user");
  const input = document.getElementById("raUsername");
  if(savedUser && input){
    input.value = savedUser;
    loadRetroAchievementsProgress(savedUser, game);
  }
}

function connectRetroAchievements(event){
  event?.preventDefault();
  const input = document.getElementById("raUsername");
  const user = input?.value.trim();
  if(!user) return;
  if(!/^[a-zA-Z0-9_-]{1,50}$/.test(user)){
    document.getElementById("raUserSubtitle").textContent = "Usuário inválido. Confira o nome usado no RetroAchievements.";
    return;
  }
  localStorage.setItem("retrohub_ra_user", user);
  const game = getCurrentGame();
  if(game) loadRetroAchievementsProgress(user, game);
}

function disconnectRetroAchievements(){
  localStorage.removeItem("retrohub_ra_user");
  const input = document.getElementById("raUsername");
  if(input) input.value = "";
  const subtitle = document.getElementById("raUserSubtitle");
  if(subtitle) subtitle.textContent = "Informe seu usuário para sincronizar suas conquistas.";
  const progress = document.getElementById("raProgress");
  if(progress) progress.hidden = true;
  const button = document.getElementById("raDisconnect");
  if(button) button.hidden = true;
  document.querySelectorAll(".guide-achievement").forEach(card => {
    card.classList.remove("ra-earned");
    const lock = card.querySelector(".ra-lock-icon");
    if(lock) lock.textContent = "🔒";
    const slot = card.querySelector(".ra-earned-slot");
    if(slot) slot.innerHTML = "";
  });
}

async function loadRetroAchievementsProgress(user, game){
  const subtitle = document.getElementById("raUserSubtitle");
  const progress = document.getElementById("raProgress");
  const syncMsg = document.getElementById("raSyncMsg");
  const disconnect = document.getElementById("raDisconnect");
  if(!subtitle || !progress) return;

  subtitle.textContent = `Sincronizando ${user}...`;
  progress.hidden = false;
  if(syncMsg) syncMsg.textContent = "Consultando o RetroAchievements...";

  try{
    const response = await fetch(`/api/retroachievements?user=${encodeURIComponent(user)}&gameId=${encodeURIComponent(game.retroAchievementsGameId)}`, { cache: "no-store" });
    const data = await response.json();
    if(!response.ok || !data || Array.isArray(data)) throw new Error(data?.error || "Não foi possível carregar o progresso.");

    const total = Number(data.NumAchievements ?? game.achievements ?? 0);
    const earned = Number(data.NumAwardedToUser ?? 0);
    const hardcore = Number(data.NumAwardedToUserHardcore ?? 0);
    const percent = total ? Math.round((earned / total) * 100) : 0;

    subtitle.textContent = `Conectado como ${user}`;
    if(disconnect) disconnect.hidden = false;
    document.getElementById("raProgressCount").textContent = `${earned} / ${total} conquistas`;
    document.getElementById("raProgressPercent").textContent = `${percent}%`;
    document.getElementById("raProgressBar").style.width = `${percent}%`;
    const heroCount=document.getElementById("gameHeroProgressCount");
    const heroPercent=document.getElementById("gameHeroProgressPercent");
    const heroBar=document.getElementById("gameHeroProgressBar");
    if(heroCount) heroCount.textContent=`${earned} / ${total}`;
    if(heroPercent) heroPercent.textContent=`${percent}%`;
    if(heroBar) heroBar.style.width=`${percent}%`;
    const heroBox=document.querySelector(".game-hero-progress"); if(heroBox) heroBox.classList.toggle("perfect",total>0 && earned===total);
    if(syncMsg) syncMsg.textContent = hardcore ? `🔥 ${hardcore} conquista${hardcore === 1 ? "" : "s"} em Hardcore.` : "Progresso sincronizado com o RetroAchievements.";

    applyRetroAchievementsToGuide(data.Achievements || {});
  }catch(error){
    subtitle.textContent = `Não foi possível sincronizar ${user}.`;
    if(syncMsg) syncMsg.textContent = error.message || "Erro ao consultar o progresso.";
  }
}

function translateRetroAchievementDescription(text){
  let t = String(text || "").trim();
  if(!t) return "";

  const rules = [
    [/^Finish (.+)\.?$/i, "Conclua $1."],
    [/^Collect all (.+) in (.+)\.?$/i, "Colete todos os $1 em $2."],
    [/^Collect (.+)\.?$/i, "Colete $1."],
    [/^Win your first (.+)\.?$/i, "Vença sua primeira $1."],
    [/^Win the (.+) tournament in Underground mode on hard difficulty\.?$/i, "Vença o torneio $1 no modo Underground na dificuldade Difícil."],
    [/^Win the (.+) tournament in Underground mode\.?$/i, "Vença o torneio $1 no modo Underground."],
    [/^Win (.+) in Underground mode\.?$/i, "Vença $1 no modo Underground."],
    [/^Win (.+)\.?$/i, "Vença $1."],
    [/^Reach (.+)\.?$/i, "Alcance $1."],
    [/^Get featured in (.+) by (.+)\.?$/i, "Apareça em $1 ao $2."],
    [/^Clear (.+) on Master difficulty or higher\.?$/i, "Conclua $1 na dificuldade Master ou superior."],
    [/^Clear (.+) on Dragon Warrior difficulty or higher\.?$/i, "Conclua $1 na dificuldade Dragon Warrior ou superior."],
    [/^Clear (.+) on Dragon Warrior difficulty\.?$/i, "Conclua $1 na dificuldade Dragon Warrior."],
    [/^Clear (.+) on (Easy|Normal|Hard|Very Hard) difficulty or higher\.?$/i, "Conclua $1 na dificuldade $2 ou superior."],
    [/^Clear (.+)\.?$/i, "Conclua $1."],
    [/^Complete all level tasks on (.+) on Master difficulty or higher\.?$/i, "Conclua todas as tarefas da fase $1 na dificuldade Master ou superior."],
    [/^Complete all levels tasks on (.+) on Master difficulty or higher\.?$/i, "Conclua todas as tarefas da fase $1 na dificuldade Master ou superior."],
    [/^Complete all level tasks in (.+) on Master difficulty or higher\.?$/i, "Conclua todas as tarefas da fase $1 na dificuldade Master ou superior."],
    [/^Complete all tasks on (.+) on Master difficulty or higher\.?$/i, "Conclua todas as tarefas de $1 na dificuldade Master ou superior."],
    [/^Complete (.+) on Master difficulty or higher\.?$/i, "Conclua $1 na dificuldade Master ou superior."],
    [/^Complete (.+) on Dragon Warrior difficulty\.?$/i, "Conclua $1 na dificuldade Dragon Warrior."],
    [/^Complete (.+) without taking damage\.?$/i, "Conclua $1 sem sofrer dano."],
    [/^Complete (.+)\.?$/i, "Conclua $1."],
    [/^Defeat (.+) without taking damage\.?$/i, "Derrote $1 sem sofrer dano."],
    [/^Defeat (.+)\.?$/i, "Derrote $1."],
    [/^Beat (.+) without taking damage\.?$/i, "Derrote $1 sem sofrer dano."],
    [/^Beat (.+)\.?$/i, "Derrote $1."],
    [/^Finish (.+)\.?$/i, "Finalize $1."],
    [/^Win (.+)\.?$/i, "Vença $1."],
    [/^Collect (.+)\.?$/i, "Colete $1."],
    [/^Obtain (.+)\.?$/i, "Obtenha $1."],
    [/^Get (.+)\.?$/i, "Consiga $1."],
    [/^Unlock (.+)\.?$/i, "Desbloqueie $1."],
    [/^Reach (.+)\.?$/i, "Alcance $1."],
    [/^Earn (.+)\.?$/i, "Conquiste $1."],
    [/^Find (.+)\.?$/i, "Encontre $1."],
    [/^Destroy (.+)\.?$/i, "Destrua $1."],
    [/^Kill (.+)\.?$/i, "Elimine $1."],
    [/^Perform (.+)\.?$/i, "Execute $1."],
    [/^Use (.+)\.?$/i, "Use $1."],
    [/^Complete the game\.?$/i, "Conclua o jogo."],
    [/^Beat the game\.?$/i, "Conclua o jogo."],

    // Expressões comuns que podem aparecer no meio de requisitos maiores.
    [/\bwithout taking damage\b/gi, "sem sofrer dano"],
    [/\bwithout receiving damage\b/gi, "sem sofrer dano"],
    [/\bwithout dying\b/gi, "sem morrer"],
    [/\bwithout attacking\b/gi, "sem atacar"],
    [/\bwithout pausing in the menu\b/gi, "sem pausar no menu"],
    [/\bwithout pausing\b/gi, "sem pausar"],
    [/\bon Master difficulty or higher\b/gi, "na dificuldade Master ou superior"],
    [/\bon Dragon Warrior difficulty or higher\b/gi, "na dificuldade Dragon Warrior ou superior"],
    [/\bon Dragon Warrior difficulty\b/gi, "na dificuldade Dragon Warrior"],
    [/\bon Hard difficulty or higher\b/gi, "na dificuldade Difícil ou superior"],
    [/\bon Hard difficulty\b/gi, "na dificuldade Difícil"],
    [/\bon Normal difficulty or higher\b/gi, "na dificuldade Normal ou superior"],
    [/\bon Normal difficulty\b/gi, "na dificuldade Normal"],
    [/\bon Easy difficulty\b/gi, "na dificuldade Fácil"],
    [/\bfor the first time\b/gi, "pela primeira vez"],
    [/\bin a single playthrough\b/gi, "em uma única campanha"],
    [/\bin one playthrough\b/gi, "em uma única campanha"],
    [/\bin a single race\b/gi, "em uma única corrida"],
    [/\bin a single level\b/gi, "em uma única fase"],
    [/\bin one level\b/gi, "em uma única fase"],
    [/\bin a row\b/gi, "seguidas"],
    [/\bconsecutive\b/gi, "consecutivas"],
    [/\ball levels\b/gi, "todas as fases"],
    [/\ball missions\b/gi, "todas as missões"],
    [/\ball races\b/gi, "todas as corridas"],
    [/\ball bosses\b/gi, "todos os chefes"],
    [/\ball collectibles\b/gi, "todos os colecionáveis"],
    [/\bRestart level to reload\b/gi, "Reinicie a fase para tentar novamente"],
    [/\bReload to reset\b/gi, "Recarregue para reiniciar o desafio"],
    [/\bRestart from level beginning to reset\b/gi, "Reinicie desde o começo da fase para resetar o desafio"]
  ];

  for(const [pattern, replacement] of rules){
    t = t.replace(pattern, replacement);
  }

  // Pequeno dicionário de palavras restantes. Mantém nomes próprios, fases,
  // carros, personagens e golpes exatamente como o RetroAchievements fornece.
  const words = [
    [/\bdifficulty\b/gi,"dificuldade"],
    [/\bhigher\b/gi,"superior"],
    [/\bmission\b/gi,"missão"],
    [/\bmissions\b/gi,"missões"],
    [/\blevel\b/gi,"fase"],
    [/\blevels\b/gi,"fases"],
    [/\brace\b/gi,"corrida"],
    [/\braces\b/gi,"corridas"],
    [/\bpoints\b/gi,"pontos"],
    [/\bpoint\b/gi,"ponto"],
    [/\bseconds\b/gi,"segundos"],
    [/\bminutes\b/gi,"minutos"],
    [/\bhours\b/gi,"horas"],
    [/\bdamage\b/gi,"dano"],
    [/\bboss\b/gi,"chefe"],
    [/\bbosses\b/gi,"chefes"],
    [/\bgame\b/gi,"jogo"]
  ];
  for(const [pattern,replacement] of words) t=t.replace(pattern,replacement);

  return t;
}


function buildMidnightClub3AchievementGuide(title,description){
  const d=String(description||""),low=d.toLowerCase();
  if(low.includes("rites of passage")) return "Vença a corrida Rites of Passage em San Diego durante o modo Career.";
  if(low.includes("defeat")&&low.includes("san diego")) return "Avance pelos eventos de San Diego até enfrentar o rival indicado e vença a corrida para liberar a recompensa descrita.";
  if(low.includes("tournament")) return "Vença o torneio indicado no modo Career. Complete todas as provas necessárias até receber a recompensa.";
  if(low.includes("rockstar logos")) return "Explore as cidades no modo Career e colete a quantidade de Rockstar Logos exigida pelo requisito.";
  if(low.includes("250 mph")) return "Use um veículo de alto desempenho no modo Career, prepare uma reta longa e ultrapasse 250 mph.";
  if(low.includes("zone")&&low.includes("six")) return "Durante uma corrida no Career, use a habilidade Zone seis vezes e ainda termine em primeiro lugar.";
  if(low.includes("airborne")) return "Procure um salto grande e permaneça no ar por pelo menos 4 segundos no modo Career.";
  if(low.includes("slip stream")) return "Fique no vácuo de um adversário durante a corrida até carregar o turbo de slipstream e execute-o.";
  if(low.includes("assets")) return "Continue vencendo eventos, comprando/ganhando veículos e acumulando patrimônio até atingir o valor exigido.";
  if(low.includes("autocross")&&low.includes("first lap")) return "Faça esta conquista durante o modo Career: complete uma prova Autocross já na primeira volta. Ela é marcada como perdível.";
  if(low.includes("career")) return "Cumpra exatamente a condição descrita durante o modo Career.";
  return "Cumpra o requisito oficial acima no modo indicado. Use o filtro de bloqueadas para acompanhar o que ainda falta.";
}

function buildUniversalAchievementGuide(title, description){
  const raw = String(description || "").trim();
  const d = raw.toLowerCase();
  const translated = translateRetroAchievementDescription(raw);

  // Gera uma orientação útil a partir do requisito oficial sem inventar
  // locais, itens ou condições que o RetroAchievements não informou.
  if(!raw) return "Abra os detalhes da conquista e cumpra o objetivo oficial mostrado pelo RetroAchievements.";

  if(/without (taking )?damage|without being hit|no damage|without getting hit/.test(d))
    return "Faça a luta ou trecho indicado sem receber nenhum golpe. Priorize esquivas e padrões seguros; se sofrer dano, reinicie a tentativa antes de concluir o objetivo.";

  if(/collect all|obtain all|find all|gather all/.test(d))
    return "Explore toda a fase ou área indicada e pegue todos os colecionáveis exigidos antes de finalizar o objetivo. Confira caminhos laterais e áreas opcionais para não deixar nenhum para trás.";

  if(/collect|obtain|find|gather/.test(d) && /\b\d+\b/.test(d))
    return "Durante a fase ou modo indicado, procure e obtenha a quantidade exigida pelo requisito. Explore rotas secundárias antes de avançar para o final.";

  if(/a rank|rank a|s rank|rank s|grade a|grade s/.test(d)){
    const hero = /hero/.test(d) ? " na dificuldade Hero" : " na dificuldade indicada";
    return `Jogue a fase ou evento${hero} e busque o rank exigido. Evite derrotas e erros desnecessários e conclua o objetivo com desempenho suficiente para registrar o rank pedido.`;
  }

  if(/difficulty/.test(d) && /(complete|finish|beat|defeat|win)/.test(d))
    return "Selecione a dificuldade exigida antes de iniciar e conclua o objetivo nela. Não reduza a dificuldade durante a tentativa, pois isso pode impedir o desbloqueio.";

  if(/under|less than|within|seconds|minutes|hours|time/.test(d) && /(complete|finish|beat|win|escape|reach)/.test(d))
    return "É um desafio de tempo. Vá direto ao objetivo, evite desvios e repetições desnecessárias e termine dentro do limite indicado no requisito.";

  if(/defeat|beat|kill/.test(d))
    return "Avance até o confronto indicado e derrote o inimigo ou chefe cumprindo também qualquer condição adicional descrita no requisito. Se houver restrição de dano, equipamento ou dificuldade, ela precisa ser mantida até o fim.";

  if(/win/.test(d) && /(race|event|tournament|match|challenge)/.test(d))
    return "Entre na corrida, evento ou desafio indicado e termine em primeiro lugar. Antes de começar, confira se modo, veículo, dificuldade e demais condições correspondem ao requisito.";

  if(/complete|finish|clear/.test(d))
    return "Avance normalmente até a fase, missão ou evento citado e conclua-o por completo. Antes de finalizar, confirme se há alguma condição adicional no requisito, como dificuldade, rank, tempo ou coletáveis.";

  if(/unlock|acquire|earn|get /.test(d))
    return "Continue a progressão até liberar ou receber o item, habilidade ou conteúdo indicado. O desbloqueio ocorre quando a condição descrita no requisito oficial é registrada pelo jogo.";

  if(/purchase|buy/.test(d))
    return "Acumule os recursos necessários e compre exatamente o item ou melhoria indicada. Faça a compra no modo exigido pelo requisito para que a conquista seja registrada.";

  if(/score|points/.test(d) && /\b\d+\b/.test(d))
    return "Jogue o modo indicado buscando a pontuação exigida. Priorize ações que aumentem a pontuação e só encerre a tentativa depois de alcançar ou superar o valor pedido.";

  return `Siga o objetivo oficial: ${translated}. Confira antes da tentativa todas as condições citadas no requisito e conclua o objetivo sem alterá-las.`;
}

function buildNfsAchievementGuide(title, description){
  const d = String(description || "");
  const low = d.toLowerCase();

  if(low.includes("pink slip"))
    return "Após derrotar esse membro da Blacklist, escolha os marcadores de recompensa até obter o documento do carro (Pink Slip). Como é perdível, faça backup do save antes das escolhas.";
  if(low.includes("win all races") && low.includes("milestones"))
    return "Antes de desafiar o próximo rival, conclua todas as corridas e todos os Milestones disponíveis no capítulo deste membro da Blacklist.";
  if(low.includes("defeat") && low.includes("performance upgrades") && low.includes("starter car"))
    return "Use um dos carros iniciais permitidos e respeite exatamente o limite total de upgrades de desempenho indicado. Evite instalar peças extras antes da corrida contra o rival.";
  if(low.includes("complete") && low.includes("or less"))
    return "Entre no evento indicado com um carro bem preparado, memorize a rota, use nitro nas retas e Speedbreaker apenas onde ele realmente economizar tempo. Termine dentro do tempo exigido.";
  if(low.includes("single non-final pursuit"))
    return "Faça isso em uma única perseguição normal da carreira, antes da perseguição final. Não use atalhos fora do mapa nem o truque da Bus Station; encerre a perseguição somente depois de cumprir o número exigido.";
  if(low.includes("lifetime") || low.includes("total of"))
    return "Este objetivo é acumulativo na carreira. Continue realizando perseguições até atingir o total exigido; não é necessário fazer tudo em uma única sessão.";
  if(low.includes("challenge series"))
    return "Abra a Challenge Series e conclua o evento indicado respeitando todas as restrições da conquista. Se o requisito proibir Bus Station ou atalhos fora do mapa, faça a prova pela rota normal.";
  if(low.includes("secret code"))
    return "Digite o código secreto correspondente na tela indicada pelo jogo e, se houver uma prova liberada pelo código, conclua também o evento para registrar a conquista.";
  if(low.includes("perfect launch"))
    return "Em uma corrida que não seja Drag, mantenha o acelerador na faixa ideal durante a largada até o jogo registrar um Perfect Launch.";
  if(low.includes("most wanted racer"))
    return "Avance pela carreira até derrotar Razor e assumir a posição nº 1 da Blacklist.";
  if(low.includes("unlock") && low.includes("borough"))
    return "Continue a campanha e derrote o membro da Blacklist exigido para liberar automaticamente essa região de Rockport.";
  if(low.includes("heat level"))
    return "Avance pela Blacklist até liberar o nível de perseguição exigido e cumpra a condição descrita antes de encerrar a perseguição.";
  if(low.includes("police helicopter"))
    return "Entre em uma perseguição de Heat alto, espere o helicóptero aparecer e provoque sua destruição durante a perseguição.";
  if(low.includes("quick play"))
    return "No menu de Quick Play, escolha qualquer evento permitido e vença a corrida.";
  if(low.includes("custom play"))
    return "Configure a corrida personalizada exatamente como o requisito pede — pista, tráfego, adversários, dificuldade e Catch Up — e vença.";
  if(low.includes("final pursuit"))
    return "Chegue à perseguição final e conclua-a legitimamente. Não utilize atalhos fora dos limites do mapa nem o truque da Bus Station.";
  if(low.includes("lotus elise") && low.includes("300 mph"))
    return "Use o Lotus Elise em um Photo Ticket Milestone ainda disponível e execute a técnica de velocidade necessária para registrar mais de 300 MPH (483 km/h). Faça isso antes de concluir todos os Photo Tickets.";
  if(low.includes("junkman"))
    return "Consiga as peças Junkman necessárias e equipe as 6 peças exigidas, exceto Nitrous, no mesmo carro da carreira.";
  if(low.includes("impound strikes"))
    return "Acumule os strikes extras de apreensão no mesmo carro até chegar à quantidade indicada, evitando perder definitivamente o veículo.";
  if(low.includes("shortcut") || low.includes("barrier") || low.includes("escape the track"))
    return "Use o ponto específico de saída/atalho descrito pela conquista e siga até o destino indicado. Faça um save antes da tentativa para poder repetir rapidamente.";
  return "Cumpra o requisito exatamente como descrito. Antes da tentativa, confira carro, modo de jogo, evento, nível de Heat e qualquer restrição de upgrades ou atalhos.";
}

async function loadNfsAchievementCatalog(game){
  if(!game || !game.retroAchievements || !game.retroAchievementsGameId) return;
  const guide = game.achievementGuide || (game.achievementGuide = { achievements: [] });

  const container = document.querySelector(".guide-full.achievements-list-only");
  if(!container) return;

  container.innerHTML = `<p class="guide-empty">Carregando as ${game.achievements || ""} conquistas e o guia...</p>`;

  try{
    // A rota do próprio RetroHub já é usada para sincronizar o RetroAchievements.
    // Aqui ela é usada apenas como catálogo para mostrar as conquistas mesmo antes
    // do visitante conectar a própria conta.
    const response = await fetch(`/api/retroachievements?user=${encodeURIComponent("raiquesantos")}&gameId=${encodeURIComponent(game.retroAchievementsGameId)}`, {cache:"no-store"});
    if(!response.ok) throw new Error("Falha ao consultar o catálogo");
    const data = await response.json();
    const achievements = data?.Achievements || {};
    ensureAllRetroAchievementsInGuide(achievements);

    const count = Object.values(achievements).filter(a=>a && a.Title).length;
    const summary = document.querySelector(".achievement-summary-compact h2");
    if(summary) summary.textContent = `${game.title} — Roteiro para 100% • ${count || game.achievements || 0} conquistas`;
  }catch(err){
    container.innerHTML = '<p class="guide-empty">Não foi possível carregar o catálogo de conquistas agora. Tente recarregar a página.</p>';
  }
}

function ensureAllRetroAchievementsInGuide(achievements){
  const game = getCurrentGame();
  if(!game) return;

  const container = document.querySelector(".guide-full.achievements-list-only");
  if(!container) return;

  const items = Object.values(achievements || {})
    .filter(item => item && item.Title)
    .sort((a,b) => Number(a.DisplayOrder ?? a.ID ?? 0) - Number(b.DisplayOrder ?? b.ID ?? 0));

  if(!items.length) return;

  // Fonte única para TODOS os jogos: RetroAchievements. Não mistura cards manuais com cards sincronizados.
  container.replaceChildren();

  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "guide-achievement";
    card.dataset.raName = item.Title;

    let badge = "";
    const bn = String(item.BadgeName || "").trim();
    if(bn){
      badge = bn.startsWith("http")
        ? bn
        : `https://media.retroachievements.org/Badge/${encodeURIComponent(bn)}.png`;
    } else {
      badge = String(item.BadgeURL || item.Badge || "");
    }

    const desc = translateRetroAchievementDescription(item.Description || "");
    const missable = String(item.Type || "").toLowerCase() === "missable";

    card.innerHTML = `
      ${badge ? `<img src="${escapeHTML(badge)}" alt="${escapeHTML(item.Title)}" loading="lazy">` : `<div class="guide-badge-placeholder"></div>`}
      <div>
        <div class="guide-achievement-title">
          ${missable ? `<span class="guide-missable-icon" title="Conquista perdível">⚠️</span>` : ""}
          <div>
            <h3><span class="ra-lock-icon">🔒</span> ${escapeHTML(item.Title)}</h3>
            <div class="ra-earned-slot"></div>
          </div>
        </div>
        <div class="guide-points">${Number(item.Points || 0)} pontos</div>
        ${desc ? `<p><strong>Requisito:</strong> ${escapeHTML(desc)}</p>` : ""}
        <p><strong>Como conseguir:</strong> ${escapeHTML(game.slug === "midnight-club-3-dub-edition-remix" ? buildMidnightClub3AchievementGuide(item.Title, item.Description || "") : game.slug === "need-for-speed-most-wanted-black-edition" ? buildNfsAchievementGuide(item.Title, item.Description || "") : buildUniversalAchievementGuide(item.Title, item.Description || ""))}</p>
      </div>`;
    container.appendChild(card);
  });

  const summary = document.querySelector(".achievement-summary-compact h2");
  if(summary) summary.textContent = `${game.title} — Roteiro para 100% • ${items.length} conquistas`;
}
function applyRetroAchievementsToGuide(achievements){
  ensureAllRetroAchievementsInGuide(achievements);
  const byName = new Map();
  Object.values(achievements || {}).forEach(item => {
    if(item?.Title) byName.set(normalizeRAName(item.Title), item);
  });
  document.querySelectorAll(".guide-achievement[data-ra-name]").forEach(card => {
    const item = byName.get(normalizeRAName(card.dataset.raName));
    if(!item) return;
    const earned = Boolean(item.DateEarned || item.DateEarnedHardcore);
    const hardcore = Boolean(item.DateEarnedHardcore);
    const date = item.DateEarnedHardcore || item.DateEarned;
    const lock = card.querySelector(".ra-lock-icon");
    const slot = card.querySelector(".ra-earned-slot");
    card.classList.toggle("ra-earned", earned);
    card.classList.toggle("is-hardcore", hardcore);
    if(lock) lock.textContent = earned ? "✅" : "🔒";
    if(slot) slot.innerHTML = earned
      ? `<span class="ra-earned-state">${hardcore ? "🔥 HARDCORE" : "✅ DESBLOQUEADA"}${date ? ` • ${escapeHTML(date)}` : ""}</span>`
      : "";
  });
  applyGameAchievementFilters();
}

function toggleAchievementGuide(button){
  const box = button.closest(".guide-box");
  if(!box) return;
  const full = box.querySelector(".guide-full");
  if(!full) return;
  const opening = full.hidden;
  full.hidden = !opening;
  button.textContent = opening ? "📕 FECHAR GUIA" : "📖 VER GUIA COMPLETO";
}

function openScreenshot(slug,index){

  const game = games.find(item => item.slug === slug);

  if(!game || !game.screenshots || game.screenshots.length === 0){
    return;
  }

  currentScreenshots = game.screenshots;
  currentScreenshotIndex = index;

  updateScreenshotViewer();

  document
    .getElementById("imageViewer")
    .classList.add("active");

  document.body.style.overflow = "hidden";
}

function updateScreenshotViewer(){

  const image = document.getElementById("viewerImage");
  const counter = document.getElementById("viewerCounter");

  image.src = currentScreenshots[currentScreenshotIndex];

  counter.textContent =
    (currentScreenshotIndex + 1) +
    " / " +
    currentScreenshots.length;
}

function nextScreenshot(){

  if(currentScreenshots.length === 0) return;

  currentScreenshotIndex =
    (currentScreenshotIndex + 1) %
    currentScreenshots.length;

  updateScreenshotViewer();
}

function prevScreenshot(){

  if(currentScreenshots.length === 0) return;

  currentScreenshotIndex =
    (currentScreenshotIndex - 1 + currentScreenshots.length) %
    currentScreenshots.length;

  updateScreenshotViewer();
}

function closeScreenshot(event){

  const viewer = document.getElementById("imageViewer");

  if(
    event &&
    event.target !== viewer
  ){
    return;
  }

  viewer.classList.remove("active");

  document.getElementById("viewerImage").src = "";

  document.body.style.overflow = "";
}

document.addEventListener(
  "keydown",
  function(event){

    const viewer =
      document.getElementById("imageViewer");

    if(viewer.classList.contains("active")){

      if(event.key === "Escape"){
        closeScreenshot();
      }

      if(event.key === "ArrowRight"){
        nextScreenshot();
      }

      if(event.key === "ArrowLeft"){
        prevScreenshot();
      }

      return;
    }

    if(event.key === "Escape"){
      const internalPage =
        location.hash.startsWith("#game=") ||
        location.hash.startsWith("#emulator=") ||
        location.hash === "#emulators" ||
        q.style.display === "none" ||
        filters.style.display === "none";

      if(internalPage){
        event.preventDefault();
        goHome(true);
      }
    }

  }
);

window.addEventListener(
  "popstate",
  function(){

    if(location.hash === "#profile" && typeof renderRetrohubProfilePage === "function"){
      renderRetrohubProfilePage();

    }else if(location.hash.startsWith("#game=")){

      const slug = decodeURIComponent(
        location.hash.replace("#game=", "")
      );

      openGame(slug, false);

    }else if(location.hash.startsWith("#emulator=")){

      const slug = decodeURIComponent(
        location.hash.replace("#emulator=", "")
      );

      emulatorMode = true;
      renderFilters();
      openEmulator(slug, false);

    }else if(location.hash === "#emulators"){

      showEmulators(false);

    }else{

      goHome(false);

    }

  }
);

q.addEventListener(
  "input",
  function(){

    emulatorMode = false;
    renderFilters();
    renderHome();

  }
);

chooseRandomFeaturedGames();

renderFilters();

if(location.hash.startsWith("#game=")){

  const initialSlug = decodeURIComponent(
    location.hash.replace("#game=", "")
  );

  const initialGame = games.find(
    game => game.slug === initialSlug
  );

  if(initialGame){

    openGame(initialSlug, false);

  }else{

    history.replaceState(
      { page: "home" },
      "",
      location.pathname
    );

    renderHome();

  }

}else if(location.hash.startsWith("#emulator=")){

  const initialEmulatorSlug = decodeURIComponent(
    location.hash.replace("#emulator=", "")
  );

  const initialEmulator = emulators.find(
    emulator => emulator.slug === initialEmulatorSlug
  );

  if(initialEmulator){

    emulatorMode = true;
    renderFilters();
    openEmulator(initialEmulatorSlug, false);

  }else{

    showEmulators(false);

  }

}else if(location.hash === "#emulators"){

  showEmulators(false);

}else{

  renderHome();

}

/* ===== BLOCO SEPARADO ===== */

window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR - SUPABASE AUTH ===== */
const RETROHUB_SUPABASE_URL = "https://cybhsinaymvmgfwrhhvt.supabase.co";
const RETROHUB_SUPABASE_KEY = "sb_publishable_rlT-HHY5MTNgeBcNfLp01A_DCICFJzd";
const retrohubSupabase = window.supabase.createClient(RETROHUB_SUPABASE_URL, RETROHUB_SUPABASE_KEY);
let retrohubSession = null;
let retrohubProfile = null;

function handleAccountButton(){
  // Se estiver logado, o botão Perfil abre direto o perfil completo.
  // Se não estiver logado, abre a tela de Entrar/Criar conta.
  if(retrohubSession?.user){
    openFullRetrohubProfile();
  }else{
    openAccountPanel();
  }
}

function openAccountPanel(){
  document.getElementById("accountModal").hidden = false;
  refreshRetrohubAccountUI();
  setTimeout(()=>{if(typeof refreshSupporterEditor==="function")refreshSupporterEditor().catch(console.warn)},50);
}
function closeAccountPanel(){ document.getElementById("accountModal").hidden = true; }

function showAuthTab(tab){
  const login = tab === "login";
  document.getElementById("loginForm").hidden = !login;
  document.getElementById("signupForm").hidden = login;
  document.getElementById("loginTab").classList.toggle("active", login);
  document.getElementById("signupTab").classList.toggle("active", !login);
  document.getElementById("authMessage").textContent = "";
}

function setAccountMessage(id, text, ok=false){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = text || "";
  el.style.color = ok ? "#65e6a6" : "#ff9bb5";
}

async function retrohubSignup(event){
  event.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const password2 = document.getElementById("signupPassword2").value;
  if(password !== password2) return setAccountMessage("authMessage","As senhas não são iguais.");
  if(!/^[A-Za-z0-9_]{3,24}$/.test(username)) return setAccountMessage("authMessage","Use 3 a 24 caracteres: letras, números ou _.");

  setAccountMessage("authMessage","Criando conta...", true);
  const { data, error } = await retrohubSupabase.auth.signUp({
    email, password, options:{ data:{ username } }
  });
  if(error) return setAccountMessage("authMessage", error.message);
  if(data.session){
    setAccountMessage("authMessage","Conta criada com sucesso!", true);
    await loadRetrohubProfile();
  }else{
    setAccountMessage("authMessage","Conta criada. Confira seu e-mail para confirmar o cadastro.", true);
  }
}

async function retrohubLogin(event){
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const submit = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
  if(submit) submit.disabled = true;
  setAccountMessage("authMessage","Entrando...", true);

  try {
    const { data, error } = await retrohubSupabase.auth.signInWithPassword({ email, password });
    if(error) throw error;

    retrohubSession = data?.session || null;
    if(!retrohubSession?.user) throw new Error("A sessão não foi criada.");

    // Carrega o perfil uma única vez antes de navegar.
    await loadRetrohubProfile();

    // O login terminou: o modal nunca deve continuar cobrindo a página.
    closeAccountPanel();
    await openFullRetrohubProfile({ replaceHistory: true });
  } catch(error) {
    console.error("Erro no login RetroHub:", error);
    setAccountMessage(
      "authMessage",
      "Não foi possível entrar. Verifique o e-mail, a senha e se o e-mail foi confirmado."
    );
  } finally {
    if(submit) submit.disabled = false;
  }
}

async function retrohubLogout(){
  await retrohubSupabase.auth.signOut();
  retrohubProfile = null;
  closeAccountPanel();
}

function retrohubFriendCard(profile, relation, mode){
  const username=profile?.username||"Usuário";
  const avatar=retrohubSocialAvatar(profile?.avatar_url);
  let buttons="";
  if(mode==="search"){
    if(!relation) buttons=`<button class="friend-action" onclick="sendRetrohubFriendRequest('${profile.id}')">Adicionar amigo</button>`;
    else if(relation.status==="accepted") buttons=`<span class="friend-status">✓ Amigo</span>`;
    else if(relation.status==="pending"&&relation.sender_id===retrohubSession.user.id) buttons=`<span class="friend-status pending">Pedido enviado</span><button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Cancelar</button>`;
    else if(relation.status==="pending") buttons=`<button class="friend-action" onclick="acceptRetrohubFriendRequest('${relation.id}')">Aceitar</button><button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Recusar</button>`;
  }else if(mode==="incoming"){
    buttons=`<button class="friend-action" onclick="acceptRetrohubFriendRequest('${relation.id}')">Aceitar</button><button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Recusar</button>`;
  }else if(mode==="outgoing"){
    buttons=`<span class="friend-status pending">Aguardando</span><button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Cancelar</button>`;
  }else if(mode==="blocked"){
    buttons=`<button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Desbloquear</button>`;
  }else{
    buttons=`<button class="friend-chat-btn" onclick="openRetrohubChat('${profile.id}')">💬 Conversar</button><span class="friend-status">Amigo</span><button class="friend-action danger" onclick="removeRetrohubFriendship('${relation.id}')">Remover</button>`;
  }
  return `<article class="friend-card">
    <div class="friend-avatar-wrap" onclick="openRetrohubPublicProfile('${profile.id}')" title="Ver perfil de @${escapeHTML(username)}"><img class="friend-avatar" src="${escapeHTML(avatar)}" alt="" onerror="this.onerror=null;this.src=avatarFallback()"><span class="friend-online-dot" title="Usuário do RetroHub"></span></div>
    <div class="friend-info">
      <strong onclick="openRetrohubPublicProfile('${profile.id}')" title="Ver perfil">@${escapeHTML(username)}</strong>
      <small>${profile?.retroachievements_username ? "RetroAchievements: "+escapeHTML(profile.retroachievements_username) : "Membro do RetroHub BR"}</small>
      <div class="friend-meta"><span class="friend-level">RetroHub</span><span>Perfil de jogador</span></div>
    </div>
    <div class="friend-actions">${buttons}</div>
  </article>`;
}
async function getRetrohubRelations(){
  if(!retrohubSession?.user) return [];
  const uid=retrohubSession.user.id;
  const {data,error}=await retrohubSupabase.from("friendships").select("*").or(`sender_id.eq.${uid},receiver_id.eq.${uid}`).order("created_at",{ascending:false});
  if(error) throw error;
  return data||[];
}
async function getRetrohubProfiles(ids){
  const unique=[...new Set((ids||[]).filter(Boolean))];
  if(!unique.length) return {};
  const {data,error}=await retrohubSupabase.from("profiles").select("id,username,avatar_url,retroachievements_username").in("id",unique);
  if(error) throw error;
  return Object.fromEntries((data||[]).map(p=>[p.id,p]));
}
async function loadRetrohubFriends(){
  const uid=retrohubSession.user.id;
  const relations=await getRetrohubRelations();
  const profiles=await getRetrohubProfiles(relations.map(r=>r.sender_id===uid?r.receiver_id:r.sender_id));
  retrohubFriendCache={friends:[],incoming:[],outgoing:[],blocked:[]};
  relations.forEach(r=>{
    const otherId=r.sender_id===uid?r.receiver_id:r.sender_id, profile=profiles[otherId];
    if(!profile)return;
    const item={profile,relation:r};
    if(r.status==="accepted") retrohubFriendCache.friends.push(item);
    else if(r.status==="blocked") retrohubFriendCache.blocked.push(item);
    else if(r.status==="pending"&&r.receiver_id===uid) retrohubFriendCache.incoming.push(item);
    else if(r.status==="pending") retrohubFriendCache.outgoing.push(item);
  });
  renderRetrohubFriendsTab(retrohubFriendsTab);
}
function setRetrohubFriendsTab(tab,button){
  retrohubFriendsTab=tab;
  document.querySelectorAll(".friends-tab").forEach(x=>x.classList.remove("active"));
  button?.classList.add("active");
  renderRetrohubFriendsTab(tab);
}
function renderRetrohubFriendsTab(tab){
  const box=document.getElementById("friendsResults"); if(!box)return;
  const list=retrohubFriendCache[tab]||[];
  const mode=tab==="incoming"?"incoming":tab==="outgoing"?"outgoing":tab==="blocked"?"blocked":"friends";
  const emptyCopy=tab==="friends"
    ?["👥","Sua lista de amigos está vazia","Pesquise um usuário acima para começar a criar sua comunidade."]
    :tab==="incoming"
      ?["📨","Nenhum pedido novo","Quando alguém adicionar você, o pedido aparecerá aqui."]
      :tab==="outgoing"
        ?["↗","Nenhum pedido enviado","Os pedidos aguardando resposta aparecerão aqui."]
        :["✓","Nenhum usuário bloqueado","Sua lista de bloqueados está vazia."];
  box.innerHTML=list.length?list.map(x=>retrohubFriendCard(x.profile,x.relation,mode)).join(""):`<div class="friends-empty"><div class="friends-empty-icon">${emptyCopy[0]}</div><strong>${emptyCopy[1]}</strong><span>${emptyCopy[2]}</span></div>`;
  const incomingCount=document.getElementById("incomingFriendCount"); if(incomingCount) incomingCount.textContent=retrohubFriendCache.incoming.length;
  const summary=document.getElementById("friendsOnlineSummary"); if(summary) summary.textContent=retrohubFriendCache.friends.length;
}
async function openRetrohubFriends(){
  window.retrohubViewingPublicProfile=false;
  if(!retrohubSession?.user){openAccountPanel();return;}
  closeAccountPanel(); retrohubHideHomeControls();
  const url=location.pathname+location.search+"#friends";
  if(location.hash!=="#friends")history.pushState({page:"friends"},"",url);
  const app=document.getElementById("app");
  app.innerHTML=`<section class="friends-page">
    <div class="friends-head">
      <div class="friends-title-row"><div class="friends-title-icon">👥</div><div><h1>Amigos</h1><p>Sua comunidade no RetroHub BR</p><div class="friends-summary"><strong id="friendsOnlineSummary">0</strong> amigos na sua lista</div></div></div>
      <button class="friends-profile-btn" onclick="openFullRetrohubProfile()">← Meu perfil</button>
    </div>
    <form class="friends-search" onsubmit="searchRetrohubPeople(event)">
      <div class="friends-search-box"><span class="friends-search-icon">⌕</span><input id="friendsSearchInput" maxlength="24" autocomplete="off" placeholder="Pesquisar usuários do RetroHub..."></div>
      <button type="submit">Pesquisar</button>
    </form>
    <div class="friends-tabs">
      <button class="friends-tab active" onclick="setRetrohubFriendsTab('friends',this)">Todos</button>
      <button class="friends-tab" onclick="setRetrohubFriendsTab('incoming',this)">Pedidos <span id="incomingFriendCount" class="friends-count">0</span></button>
      <button class="friends-tab" onclick="setRetrohubFriendsTab('outgoing',this)">Enviados</button>
      <button class="friends-tab" onclick="setRetrohubFriendsTab('blocked',this)">Bloqueados</button>
    </div>
    <div id="friendsNotice"></div>
    <div id="friendsResults" class="friends-grid"><div class="friends-empty"><div class="friends-empty-icon">👥</div><strong>Carregando seus amigos...</strong><span>Um instante.</span></div></div>
  </section>`;
  try{await loadRetrohubFriends();}catch(e){console.error(e);document.getElementById("friendsResults").innerHTML=`<div class="friends-empty friends-error"><div class="friends-empty-icon">!</div><strong>Não foi possível carregar seus amigos</strong><span>Tente novamente em alguns instantes.</span></div>`;}
  window.scrollTo({top:0,behavior:"auto"});
}
async function searchRetrohubPeople(event){
  event.preventDefault();
  const input=document.getElementById("friendsSearchInput"), term=(input?.value||"").trim();
  const box=document.getElementById("friendsResults");
  if(term.length<2){box.innerHTML=`<div class="friends-empty">Digite pelo menos 2 caracteres.</div>`;return;}
  box.innerHTML=`<div class="friends-empty">Pesquisando...</div>`;
  const uid=retrohubSession.user.id;
  try{
    const [{data:profiles,error},relations]=await Promise.all([
      retrohubSupabase.from("profiles").select("id,username,avatar_url,retroachievements_username").ilike("username",`%${term}%`).neq("id",uid).limit(30),
      getRetrohubRelations()
    ]);
    if(error)throw error;
    const relationMap={};
    relations.forEach(r=>{const other=r.sender_id===uid?r.receiver_id:r.sender_id;relationMap[other]=r;});
    box.innerHTML=(profiles||[]).length?(profiles||[]).map(p=>retrohubFriendCard(p,relationMap[p.id],"search")).join(""):`<div class="friends-empty">Nenhum usuário encontrado.</div>`;
  }catch(e){console.error(e);box.innerHTML=`<div class="friends-empty">Erro ao pesquisar usuários.</div>`;}
}
async function sendRetrohubFriendRequest(receiverId){
  const uid=retrohubSession?.user?.id;if(!uid||uid===receiverId)return;
  const {error}=await retrohubSupabase.from("friendships").insert({sender_id:uid,receiver_id:receiverId,status:"pending"});
  if(error){alert(error.code==="23505"?"Já existe uma relação com este usuário.":"Não foi possível enviar o pedido.");return;}
  await loadRetrohubFriends(); const f=document.querySelector(".friends-search"); if(f) f.requestSubmit();
}
async function acceptRetrohubFriendRequest(id){
  const {error}=await retrohubSupabase.from("friendships").update({status:"accepted",updated_at:new Date().toISOString()}).eq("id",id).eq("receiver_id",retrohubSession.user.id).eq("status","pending");
  if(error){alert("Não foi possível aceitar o pedido.");return;} await loadRetrohubFriends();
}
async function removeRetrohubFriendship(id){
  const {error}=await retrohubSupabase.from("friendships").delete().eq("id",id);
  if(error){alert("Não foi possível alterar esta amizade.");return;} await loadRetrohubFriends();
}
async function blockRetrohubUser(otherId){
  const uid=retrohubSession?.user?.id;if(!uid||uid===otherId)return;
  const relations=await getRetrohubRelations();
  const existing=relations.find(r=>(r.sender_id===uid&&r.receiver_id===otherId)||(r.sender_id===otherId&&r.receiver_id===uid));
  if(existing) await retrohubSupabase.from("friendships").delete().eq("id",existing.id);
  const {error}=await retrohubSupabase.from("friendships").insert({sender_id:uid,receiver_id:otherId,status:"blocked"});
  if(error)alert("Não foi possível bloquear este usuário."); else await loadRetrohubFriends();
}
window.addEventListener("hashchange",()=>{if(location.hash==="#friends"&&retrohubSession?.user)openRetrohubFriends();});

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · PERFIL PÚBLICO DE OUTRO USUÁRIO ===== */
async function getRetrohubRelationWith(otherId){
  if(!retrohubSession?.user)return null;
  const uid=retrohubSession.user.id;
  const {data,error}=await retrohubSupabase.from("friendships").select("*")
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${uid})`)
    .maybeSingle();
  if(error){console.error(error);return null}
  return data||null;
}
function publicProfileActionHTML(profile,relation){
  if(!retrohubSession?.user)return "";
  const uid=retrohubSession.user.id;
  if(profile.id===uid)return `<button class="friend-action" onclick="openFullRetrohubProfile()">Meu perfil</button>`;
  if(!relation)return `<button class="friend-action" onclick="sendRetrohubFriendRequestFromProfile('${profile.id}')">＋ Adicionar amigo</button><button class="friend-action secondary" onclick="blockRetrohubUserFromProfile('${profile.id}')">Bloquear</button>`;
  if(relation.status==="accepted")return `<button class="friend-action" onclick="openRetrohubChat('${profile.id}')">💬 Conversar</button><button class="friend-action secondary">✓ Amigos</button><button class="friend-action danger" onclick="removeRetrohubFriendshipFromProfile('${relation.id}')">Remover amigo</button>`;
  if(relation.status==="blocked")return `<button class="friend-action secondary" onclick="removeRetrohubFriendshipFromProfile('${relation.id}')">Desbloquear</button>`;
  if(relation.receiver_id===uid)return `<button class="friend-action" onclick="acceptRetrohubFriendRequestFromProfile('${relation.id}','${profile.id}')">✓ Aceitar pedido</button><button class="friend-action secondary" onclick="removeRetrohubFriendshipFromProfile('${relation.id}')">Recusar</button>`;
  return `<button class="friend-action secondary">Pedido enviado</button><button class="friend-action danger" onclick="removeRetrohubFriendshipFromProfile('${relation.id}')">Cancelar</button>`;
}
async function openRetrohubPublicProfile(userId,pushState=true){
  if(!retrohubSession?.user){openAccountPanel();return}
  if(userId===retrohubSession.user.id){openFullRetrohubProfile();return}

  window.retrohubViewingPublicProfile=true;
  window.retrohubPublicProfileUserId=userId;
  closeAccountPanel();
  retrohubHideHomeControls();

  const app=document.getElementById("app");
  app.innerHTML=`<section class="profile-page"><div class="profile-section profile-empty">Carregando perfil do jogador...</div></section>`;

  try{
    const [{data:profile,error},relation]=await Promise.all([
      retrohubSupabase.from("profiles").select("*").eq("id",userId).single(),
      getRetrohubRelationWith(userId)
    ]);
    if(error)throw error;

    if(pushState){
      history.pushState(
        {page:"public-profile",userId},
        "",
        location.pathname+location.search+"#profile/"+encodeURIComponent(profile.username||userId)
      );
    }

    const username=profile.username||"Usuário";
    const raUser=profile.retroachievements_username||"";
    const avatar=profile.avatar_url||avatarFallback();
    const wallpaper=profile.wallpaper_url||profile.cover_url||profile.banner_url||"";
    const wallpaperStyle=wallpaper?` style="--profile-wallpaper:url('${escapeHTML(wallpaper).replace(/'/g,"%27")}')"`:"";

    app.innerHTML=`<section class="profile-page">
      <button class="public-profile-back" onclick="openRetrohubFriends()">← Voltar para amigos</button>
      <div class="profile-hero ${wallpaper?"has-wallpaper":""}"${wallpaperStyle}>
        <div class="profile-hero-grid">
          <img class="profile-page-avatar${supporterAvatarClass(profile)}" src="${escapeHTML(avatar)}" alt="Avatar" onerror="this.onerror=null;this.src=avatarFallback()">
          <div class="profile-hero-main">
            <h1 class="profile-page-name">@${escapeHTML(username)}</h1>
            <div class="profile-page-ra">${raUser?escapeHTML(raUser):"RetroAchievements não vinculado"}</div>
            <div class="profile-meta-row"><div class="profile-online">Perfil RetroHub</div></div>
            <div id="profileHeroFeaturedBadge" class="profile-hero-featured-badge" hidden></div>
            <div class="profile-level-wrap">
              <div class="profile-level-line">
                <div id="profileLevelPill" class="profile-level">🎖️ Nível <b>1</b> · Novato</div>
                <span id="profileXpText" class="profile-xp-text">0 / 500 XP</span>
              </div>
              <div class="profile-xp-track"><div id="profileXpFill" class="profile-xp-fill"></div></div>
            </div>
          </div>
          <div class="profile-hero-actions">${publicProfileActionHTML(profile,relation)}</div>
        </div>
      </div>
      <div id="profileDashboard">
        <div class="profile-loading">${raUser?"Carregando conquistas, jogos, insígnias e progresso...":"Este usuário ainda não vinculou o RetroAchievements."}</div>
      </div>
    </section>`;

    if(raUser){
      await loadRetrohubFullProfile(raUser);
    }else{
      const target=document.getElementById("profileDashboard");
      if(target)target.innerHTML=`<div class="profile-section profile-empty">Quando @${escapeHTML(username)} vincular uma conta do RetroAchievements, o perfil completo aparecerá aqui.</div>`;
    }

    window.scrollTo({top:0,behavior:"auto"});
  }catch(e){
    console.error(e);
    window.retrohubViewingPublicProfile=false;
    app.innerHTML=`<section class="public-profile-page"><button class="public-profile-back" onclick="openRetrohubFriends()">← Voltar para amigos</button><div class="friends-empty friends-error"><div class="friends-empty-icon">!</div><strong>Perfil indisponível</strong><span>Não foi possível carregar este usuário.</span></div></section>`;
  }
}
async function sendRetrohubFriendRequestFromProfile(id){await sendRetrohubFriendRequest(id);await openRetrohubPublicProfile(id,false)}
async function acceptRetrohubFriendRequestFromProfile(id,userId){await acceptRetrohubFriendRequest(id);await openRetrohubPublicProfile(userId,false)}
async function removeRetrohubFriendshipFromProfile(id){await removeRetrohubFriendship(id);openRetrohubFriends()}
async function blockRetrohubUserFromProfile(id){await blockRetrohubUser(id);await openRetrohubPublicProfile(id,false)}

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · CHAT ENTRE AMIGOS V1 ===== */
let retrohubChatFriend=null;
let retrohubChatTimer=null;
let retrohubChatLastSignature="";

function stopRetrohubChatPolling(){
  if(retrohubChatTimer){clearInterval(retrohubChatTimer);retrohubChatTimer=null}
}
function retrohubChatDate(value){
  try{return new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit"}).format(new Date(value))}
  catch{return ""}
}
async function verifyRetrohubAcceptedFriend(otherId){
  const rel=await getRetrohubRelationWith(otherId);
  return !!(rel&&rel.status==="accepted");
}
async function openRetrohubChat(friendId,pushState=true){
  if(!retrohubSession?.user){openAccountPanel();return}
  if(!friendId||friendId===retrohubSession.user.id)return;
  stopRetrohubChatPolling();
  retrohubHideHomeControls();

  const app=document.getElementById("app");
  app.innerHTML=`<section class="chat-page"><div class="friends-empty">Abrindo conversa...</div></section>`;

  try{
    const [accepted,{data:profile,error}]=await Promise.all([
      verifyRetrohubAcceptedFriend(friendId),
      retrohubSupabase.from("profiles").select("id,username,avatar_url,retroachievements_username").eq("id",friendId).single()
    ]);
    if(error)throw error;
    if(!accepted)throw new Error("CHAT_NOT_FRIEND");

    retrohubChatFriend=profile;
    retrohubChatLastSignature="";
    if(pushState)history.pushState({page:"chat",friendId},"",location.pathname+location.search+"#chat/"+encodeURIComponent(friendId));

    const avatar=retrohubSocialAvatar(profile.avatar_url);
    app.innerHTML=`<section class="chat-page">
      <div class="chat-shell">
        <header class="chat-head">
          <button class="chat-back" onclick="openRetrohubFriends()">←</button>
          <img src="${escapeHTML(avatar)}" alt="" onerror="this.onerror=null;this.src=avatarFallback()">
          <div class="chat-head-info"><strong>@${escapeHTML(profile.username||"Usuário")}</strong><small>Seu amigo no RetroHub BR</small></div>
          <button class="chat-profile" onclick="openRetrohubPublicProfile('${profile.id}')">Ver perfil</button>
        </header>
        <div id="retrohubChatMessages" class="chat-messages"><div class="chat-empty"><b>Carregando mensagens...</b></div></div>
        <form class="chat-compose" onsubmit="sendRetrohubChatMessage(event)">
          <textarea id="retrohubChatInput" maxlength="1000" rows="1" placeholder="Escreva uma mensagem..." onkeydown="retrohubChatKeydown(event)"></textarea>
          <button id="retrohubChatSend" class="chat-send" type="submit">Enviar</button>
        </form>
      </div>
    </section>`;

    await loadRetrohubChatMessages(true);
    await markRetrohubChatRead(friendId);
    retrohubChatTimer=setInterval(()=>loadRetrohubChatMessages(false),3000);
    document.getElementById("retrohubChatInput")?.focus();
  }catch(e){
    console.error(e);
    app.innerHTML=`<section class="chat-page"><button class="public-profile-back" onclick="openRetrohubFriends()">← Voltar para amigos</button><div class="friends-empty friends-error"><div class="friends-empty-icon">!</div><strong>Não foi possível abrir o chat</strong><span>${e?.message==="CHAT_NOT_FRIEND"?"O chat só está disponível entre amigos aceitos.":"Verifique se a tabela de mensagens foi criada no Supabase."}</span></div></section>`;
  }
}
async function loadRetrohubChatMessages(forceScroll=false){
  if(!retrohubChatFriend||!retrohubSession?.user)return;
  const uid=retrohubSession.user.id, fid=retrohubChatFriend.id;
  const {data,error}=await retrohubSupabase.from("messages")
    .select("id,sender_id,receiver_id,content,created_at")
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${fid}),and(sender_id.eq.${fid},receiver_id.eq.${uid})`)
    .order("created_at",{ascending:true})
    .limit(300);
  if(error){console.error(error);return}
  const rows=data||[];
  const sig=rows.length?`${rows.length}:${rows[rows.length-1].id}`:"0";
  if(sig===retrohubChatLastSignature&&!forceScroll)return;
  retrohubChatLastSignature=sig;

  const box=document.getElementById("retrohubChatMessages");if(!box)return;
  const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<120;
  box.innerHTML=rows.length?rows.map(m=>{
    const mine=m.sender_id===uid;
    return `<div class="chat-row ${mine?"mine":""}"><div class="chat-bubble">${escapeHTML(m.content||"")}<span class="chat-time">${retrohubChatDate(m.created_at)}</span></div></div>`;
  }).join(""):`<div class="chat-empty"><b>Comece a conversa 👋</b>Envie a primeira mensagem para @${escapeHTML(retrohubChatFriend.username||"seu amigo")}.</div>`;
  if(forceScroll||nearBottom)box.scrollTop=box.scrollHeight;
}
async function sendRetrohubChatMessage(event){
  event.preventDefault();
  if(!retrohubChatFriend||!retrohubSession?.user)return;
  const input=document.getElementById("retrohubChatInput");
  const button=document.getElementById("retrohubChatSend");
  const content=(input?.value||"").trim();
  if(!content)return;
  if(content.length>1000){alert("A mensagem pode ter no máximo 1000 caracteres.");return}
  if(button)button.disabled=true;
  const {error}=await retrohubSupabase.from("messages").insert({
    sender_id:retrohubSession.user.id,
    receiver_id:retrohubChatFriend.id,
    content
  });
  if(button)button.disabled=false;
  if(error){
    console.error(error);
    alert(error.code==="42501"?"O Supabase bloqueou o envio. Execute o SQL do chat que acompanha esta versão.":"Não foi possível enviar a mensagem.");
    return;
  }
  input.value="";
  retrohubChatLastSignature="";
  await loadRetrohubChatMessages(true);
  input.focus();
}
function retrohubChatKeydown(event){
  if(event.key==="Enter"&&!event.shiftKey){
    event.preventDefault();
    event.target.form?.requestSubmit();
  }
}
window.addEventListener("hashchange",()=>{
  if(!location.hash.startsWith("#chat/"))stopRetrohubChatPolling();
});

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · NOTIFICAÇÕES DE MENSAGENS ===== */
let retrohubNotifyTimer=null;

function startRetrohubMessageNotifications(){
  if(retrohubNotifyTimer)clearInterval(retrohubNotifyTimer);
  updateRetrohubMessageNotifications();
  retrohubNotifyTimer=setInterval(updateRetrohubMessageNotifications,5000);
}
function stopRetrohubMessageNotifications(){
  if(retrohubNotifyTimer){clearInterval(retrohubNotifyTimer);retrohubNotifyTimer=null}
  document.getElementById("messageNotifyWrap")?.classList.remove("show");
}
async function updateRetrohubMessageNotifications(){
  const wrap=document.getElementById("messageNotifyWrap");
  if(!wrap)return;
  if(!retrohubSession?.user){wrap.classList.remove("show");return}
  wrap.classList.add("show");
  const uid=retrohubSession.user.id;
  const {data,error}=await retrohubSupabase.from("messages")
    .select("id,sender_id,content,created_at")
    .eq("receiver_id",uid).is("read_at",null)
    .order("created_at",{ascending:false}).limit(100);
  if(error){console.error("Notificações:",error);return}
  const unread=data||[], grouped={};
  unread.forEach(m=>{
    if(!grouped[m.sender_id])grouped[m.sender_id]={count:0,last:m};
    grouped[m.sender_id].count++;
  });
  const ids=Object.keys(grouped);
  let profiles={};
  if(ids.length){
    const {data:p}=await retrohubSupabase.from("profiles").select("id,username,avatar_url").in("id",ids);
    profiles=Object.fromEntries((p||[]).map(x=>[x.id,x]));
  }
  const total=unread.length,badge=document.getElementById("messageNotifyBadge"),list=document.getElementById("messageNotifyList");
  if(badge){badge.textContent=total>99?"99+":String(total);badge.classList.toggle("show",total>0)}
  if(!list)return;
  list.innerHTML=ids.length?ids.map(id=>{
    const p=profiles[id]||{username:"Usuário",avatar_url:""};
    const g=grouped[id],avatar=retrohubSocialAvatar(p.avatar_url);
    return `<div class="message-notice" onclick="openRetrohubChatFromNotification('${id}')">
      <img src="${escapeHTML(avatar)}" alt="" onerror="this.onerror=null;this.src=avatarFallback()">
      <div><strong>@${escapeHTML(p.username||"Usuário")}</strong><span>${escapeHTML(g.last.content||"Nova mensagem")}</span></div>
      <b class="message-notice-count">${g.count}</b>
    </div>`;
  }).join(""):`<div class="message-pop-empty">Nenhuma mensagem nova.</div>`;
}
function positionRetrohubMessagePopover(){
  const pop=document.getElementById("messageNotifyPopover");
  const bell=document.getElementById("messageBell");
  if(!pop||!bell)return;

  const r=bell.getBoundingClientRect();
  const panelWidth=Math.min(350,window.innerWidth-24);
  let left=r.right-panelWidth;

  if(left<12) left=12;
  if(left+panelWidth>window.innerWidth-12) left=window.innerWidth-panelWidth-12;

  pop.style.left=left+"px";
  pop.style.right="auto";
  pop.style.top=(r.bottom+10)+"px";
}

function toggleRetrohubMessageNotifications(event){
  event?.stopPropagation();
  const pop=document.getElementById("messageNotifyPopover");
  const bell=document.getElementById("messageBell");
  const open=!pop?.classList.contains("show");

  if(open) positionRetrohubMessagePopover();

  pop?.classList.toggle("show",open);
  bell?.classList.toggle("active",open);

  if(open) updateRetrohubMessageNotifications();
}
document.addEventListener("click",()=>{
  document.getElementById("messageNotifyPopover")?.classList.remove("show");
  document.getElementById("messageBell")?.classList.remove("active");
});

window.addEventListener("resize",()=>{
  if(document.getElementById("messageNotifyPopover")?.classList.contains("show")){
    positionRetrohubMessagePopover();
  }
});
window.addEventListener("scroll",()=>{
  if(document.getElementById("messageNotifyPopover")?.classList.contains("show")){
    positionRetrohubMessagePopover();
  }
},{passive:true});

async function openRetrohubChatFromNotification(friendId){
  document.getElementById("messageNotifyPopover")?.classList.remove("show");
  await openRetrohubFloatingChat(friendId);
}
async function markRetrohubChatRead(friendId){
  if(!retrohubSession?.user||!friendId)return;
  const {error}=await retrohubSupabase.from("messages").update({read_at:new Date().toISOString()})
    .eq("sender_id",friendId).eq("receiver_id",retrohubSession.user.id).is("read_at",null);
  if(error)console.error("Marcar mensagens como lidas:",error);
  updateRetrohubMessageNotifications();
}
window.addEventListener("load",()=>setTimeout(startRetrohubMessageNotifications,1800));

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · CHAT FLUTUANTE V8 ===== */
let retrohubFloatingFriend=null;
let retrohubFloatingTimer=null;
let retrohubFloatingSignature="";

function closeRetrohubFloatingChat(){
  document.getElementById("retrohubFloatingChat")?.classList.remove("show");
  if(retrohubFloatingTimer){clearInterval(retrohubFloatingTimer);retrohubFloatingTimer=null}
  retrohubFloatingFriend=null;
}
function minimizeRetrohubFloatingChat(){
  closeRetrohubFloatingChat();
}
function openFloatingChatProfile(){
  if(!retrohubFloatingFriend)return;
  const id=retrohubFloatingFriend.id;
  closeRetrohubFloatingChat();
  openRetrohubPublicProfile(id);
}
async function openRetrohubFloatingChat(friendId){
  if(!retrohubSession?.user){openAccountPanel();return}
  if(!friendId||friendId===retrohubSession.user.id)return;

  try{
    const [accepted,{data:profile,error}]=await Promise.all([
      verifyRetrohubAcceptedFriend(friendId),
      retrohubSupabase.from("profiles").select("id,username,avatar_url").eq("id",friendId).single()
    ]);
    if(error)throw error;
    if(!accepted){alert("O chat só está disponível entre amigos.");return}

    retrohubFloatingFriend=profile;
    retrohubFloatingSignature="";
    const panel=document.getElementById("retrohubFloatingChat");
    document.getElementById("retrohubFloatingChatAvatar").src=retrohubSocialAvatar(profile.avatar_url);
    document.getElementById("retrohubFloatingChatName").textContent="@"+(profile.username||"Usuário");
    document.getElementById("retrohubFloatingChatMessages").innerHTML='<div class="chat-empty"><b>Carregando...</b></div>';
    panel.classList.add("show");

    if(retrohubFloatingTimer)clearInterval(retrohubFloatingTimer);
    await loadRetrohubFloatingMessages(true);
    await markRetrohubChatRead(friendId);
    retrohubFloatingTimer=setInterval(()=>loadRetrohubFloatingMessages(false),3000);
    setTimeout(()=>document.getElementById("retrohubFloatingChatInput")?.focus(),100);
  }catch(e){
    console.error(e);
    alert("Não foi possível abrir a conversa.");
  }
}
async function loadRetrohubFloatingMessages(forceScroll=false){
  if(!retrohubFloatingFriend||!retrohubSession?.user)return;
  const uid=retrohubSession.user.id,fid=retrohubFloatingFriend.id;
  const {data,error}=await retrohubSupabase.from("messages")
    .select("id,sender_id,receiver_id,content,created_at")
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${fid}),and(sender_id.eq.${fid},receiver_id.eq.${uid})`)
    .order("created_at",{ascending:true}).limit(300);
  if(error){console.error(error);return}
  const rows=data||[];
  const sig=rows.length?`${rows.length}:${rows[rows.length-1].id}`:"0";
  if(sig===retrohubFloatingSignature&&!forceScroll)return;
  retrohubFloatingSignature=sig;
  const box=document.getElementById("retrohubFloatingChatMessages");if(!box)return;
  const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<100;
  box.innerHTML=rows.length?rows.map(m=>{
    const mine=m.sender_id===uid;
    return `<div class="chat-row ${mine?"mine":""}"><div class="chat-bubble">${escapeHTML(m.content||"")}<span class="chat-time">${retrohubChatDate(m.created_at)}</span></div></div>`;
  }).join(""):`<div class="chat-empty"><b>Comece a conversa 👋</b>Envie uma mensagem para @${escapeHTML(retrohubFloatingFriend.username||"seu amigo")}.</div>`;
  if(forceScroll||nearBottom)box.scrollTop=box.scrollHeight;
  await markRetrohubChatRead(fid);
}
async function sendRetrohubFloatingMessage(event){
  event.preventDefault();
  if(!retrohubFloatingFriend||!retrohubSession?.user)return;
  const input=document.getElementById("retrohubFloatingChatInput");
  const button=document.getElementById("retrohubFloatingChatSend");
  const content=(input?.value||"").trim();
  if(!content)return;
  button.disabled=true;
  const {error}=await retrohubSupabase.from("messages").insert({
    sender_id:retrohubSession.user.id,
    receiver_id:retrohubFloatingFriend.id,
    content
  });
  button.disabled=false;
  if(error){console.error(error);alert("Não foi possível enviar a mensagem.");return}
  input.value="";
  retrohubFloatingSignature="";
  await loadRetrohubFloatingMessages(true);
  input.focus();
}
function retrohubFloatingChatKeydown(event){
  if(event.key==="Enter"&&!event.shiftKey){
    event.preventDefault();
    event.target.form?.requestSubmit();
  }
}

/* A partir desta versão, qualquer botão antigo que chamava openRetrohubChat()
   abre a janela flutuante, sem trocar a página atual. */
window.openRetrohubChat=openRetrohubFloatingChat;

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · PATREON OAUTH ===== */
async function retrohubPatreonAuthHeader(){
  const {data,error}=await retrohubSupabase.auth.getSession();
  if(error||!data?.session?.access_token) throw new Error("LOGIN_REQUIRED");
  return {Authorization:`Bearer ${data.session.access_token}`};
}

async function connectRetrohubPatreon(){
  if(!retrohubSession?.user){openAccountPanel();return}
  const btn=document.getElementById("supportPatreonButton");
  if(btn){btn.disabled=true;btn.textContent="Abrindo Patreon..."}
  try{
    const headers=await retrohubPatreonAuthHeader();
    const response=await fetch("/api/patreon/login",{method:"POST",headers});
    const data=await response.json();
    if(!response.ok||!data.url) throw new Error(data.error||"Não foi possível iniciar a conexão.");
    location.href=data.url;
  }catch(error){
    console.error(error);
    alert(error.message==="LOGIN_REQUIRED"?"Entre na sua conta RetroHub primeiro.":"Não foi possível abrir o Patreon.");
    if(btn){btn.disabled=false;btn.textContent="Conectar Patreon"}
  }
}

async function loadRetrohubPatreonStatus(){
  const name=document.getElementById("supportPatreonName");
  const details=document.getElementById("supportPatreonDetails");
  const status=document.getElementById("supportPatreonStatus");
  const btn=document.getElementById("supportPatreonButton");
  if(!name||!details||!status||!btn)return;
  if(!retrohubSession?.user){
    name.textContent="Patreon não conectado";details.textContent="Entre na sua conta RetroHub para conectar o Patreon.";
    status.textContent="Não conectado";status.className="patreon-status";btn.textContent="Conectar Patreon";return;
  }
  try{
    const headers=await retrohubPatreonAuthHeader();
    const response=await fetch("/api/patreon/status",{headers});
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"STATUS_ERROR");
    if(!data.connected){
      name.textContent="Patreon não conectado";details.textContent="Conecte sua conta para identificar automaticamente sua assinatura.";
      status.textContent="Não conectado";status.className="patreon-status";btn.textContent="Conectar Patreon";return;
    }
    name.textContent=data.full_name||"Conta Patreon conectada";
    const tiers=(data.tiers||[]).map(t=>t.title).filter(Boolean);
    const amount=Number(data.currently_entitled_amount_cents||0)/100;
    details.textContent=tiers.length?`Nível: ${tiers.join(", ")}${amount?` · R$ ${amount.toFixed(2).replace(".",",")}`:""}`:"Conta vinculada ao RetroHub BR.";
    const active=data.patron_status==="active_patron";
    status.textContent=active?"Apoio ativo":"Conta conectada";
    status.className="patreon-status"+(active?" active":"");
    btn.textContent="Reconectar Patreon";
    btn.classList.add("secondary");
  }catch(error){console.error("Patreon status:",error)}
}

(function handlePatreonReturn(){
  const params=new URLSearchParams(location.search);
  const result=params.get("patreon");
  if(!result)return;
  if(result==="conectado") setTimeout(()=>{loadRetrohubPatreonStatus();alert("Patreon conectado ao seu perfil RetroHub BR!");},700);
  if(result==="erro") setTimeout(()=>alert("Não foi possível concluir a conexão com o Patreon."),300);
  params.delete("patreon");
  const clean=location.pathname+(params.toString()?`?${params}`:"")+location.hash;
  history.replaceState(history.state,"",clean);
})();

const _retrohubOriginalOpenAccountPanel=openAccountPanel;
openAccountPanel=function(){
  _retrohubOriginalOpenAccountPanel();
  setTimeout(loadRetrohubPatreonStatus,0);
};

/* ===== BLOCO SEPARADO ===== */

function openSupportPage(){
  document.body.classList.add("retrohub-support-open");
  const overlay=document.getElementById("supportOverlay");
  if(overlay){overlay.classList.add("open");document.body.style.overflow="hidden";}
  setTimeout(()=>{if(typeof loadRetrohubPatreonStatus==="function")loadRetrohubPatreonStatus()},0);
}
function closeSupportPage(){
  document.body.classList.remove("retrohub-support-open");
  const overlay=document.getElementById("supportOverlay");
  if(overlay)overlay.classList.remove("open");
  document.body.style.overflow="";
}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSupportPage()});

/* ===== BLOCO SEPARADO ===== */

(function(){
  function applyGameHeaderLayout(){
    const notify=document.getElementById("messageNotifyWrap");
    if(!notify)return;

    const candidates=[...document.querySelectorAll("a,button,div,span")];
    const brand=candidates.find(el=>{
      const txt=(el.textContent||"").replace(/\s+/g," ").trim();
      return txt==="RETROHUB BR" && el.getBoundingClientRect().width>80;
    });
    if(!brand)return;

    let brandNode=brand.closest("a")||brand;
    let row=notify.parentElement;

    // Find the compact row that contains both the brand and account controls.
    for(let i=0;i<5 && row;i++,row=row.parentElement){
      if(row.contains(brandNode) && row.contains(notify)) break;
    }
    if(!row || !row.contains(brandNode) || !row.contains(notify))return;

    // Only modify compact/internal headers, not the full home navigation.
    const rowText=(row.textContent||"").replace(/\s+/g," ");
    if(/INÍCIO|JOGOS|GÊNEROS|DUBLADOS|GUIAS|EMULADORES/.test(rowText))return;

    row.classList.add("game-detail-header-fixed");
    brandNode.classList.add("game-header-brand");

    // Group notification + profile/X controls at the right without changing click handlers.
    let account=row.querySelector(":scope > .game-header-account");
    if(!account){
      account=document.createElement("div");
      account.className="game-header-account";

      const children=[...row.children];
      const notifyTop=children.find(c=>c===notify || c.contains(notify));
      const profileTop=children.find(c=>{
        if(c===brandNode || c.contains(brandNode) || c===notifyTop)return false;
        const t=(c.textContent||"").replace(/\s+/g," ").trim();
        return /Perfil/i.test(t);
      });

      if(notifyTop){
        row.insertBefore(account,notifyTop);
        account.appendChild(notifyTop);
        if(profileTop) account.appendChild(profileTop);
      }
    }
  }

  document.addEventListener("DOMContentLoaded",applyGameHeaderLayout);
  window.addEventListener("load",applyGameHeaderLayout);
  const obs=new MutationObserver(()=>applyGameHeaderLayout());
  obs.observe(document.body,{childList:true,subtree:true});
})();

/* ===== BLOCO SEPARADO ===== */

(function(){
  function syncSupportLayer(){
    const overlay=document.getElementById("supportOverlay");
    if(!overlay)return;
    const visible=overlay.classList.contains("show") ||
                  overlay.classList.contains("active") ||
                  getComputedStyle(overlay).display!=="none";
    document.body.classList.toggle("retrohub-support-open",visible);
  }
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"){
      setTimeout(syncSupportLayer,0);
    }
  });
})();

/* ===== BLOCO SEPARADO ===== */

(function(){
  const plans = {
    "Aliado Retro": [
      "Avatar animado em GIF",
      "Cores especiais no perfil",
      "Insígnia exclusiva Aliado Retro"
    ],
    "Guardião Retro": [
      "Todos os benefícios do Aliado Retro",
      "Cor/tema principal personalizado",
      "Troca de nome de usuário a qualquer momento",
      "Insígnia exclusiva Guardião Retro"
    ],
    "Lenda Retro": [
      "Todos os benefícios anteriores",
      "Banner animado no perfil",
      "Efeitos visuais exclusivos",
      "Borda especial no avatar",
      "Insígnia exclusiva Lenda Retro"
    ]
  };

  function enhance(){
    const all=[...document.querySelectorAll("div,article,section")];
    Object.entries(plans).forEach(([name, benefits])=>{
      const title=[...document.querySelectorAll("h1,h2,h3,h4,strong,b")].find(
        el => (el.textContent||"").trim()===name
      );
      if(!title) return;

      let card=title.parentElement;
      for(let i=0;i<4 && card;i++,card=card.parentElement){
        const txt=(card.textContent||"");
        if(txt.includes(name) && /NÍVEL\s*[123]/i.test(txt)) break;
      }
      if(!card || card.querySelector(".support-tier-benefits")) return;

      const ul=document.createElement("ul");
      ul.className="support-tier-benefits";
      benefits.forEach(item=>{
        const li=document.createElement("li");
        li.textContent=item;
        ul.appendChild(li);
      });
      const note=document.createElement("div");
      note.className="support-tier-note";
      note.textContent="Benefícios ativos enquanto a assinatura correspondente estiver válida.";
      card.appendChild(ul);
      card.appendChild(note);
    });
  }
  document.addEventListener("DOMContentLoaded",enhance);
  window.addEventListener("load",enhance);
  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
})();

/* ===== BLOCO SEPARADO ===== */

(function(){
function syncHero(){
  const p=document.getElementById('wallpaperPreview'),h=document.getElementById('rhxHeroWallpaper');
  if(!p||!h)return;
  const bg=getComputedStyle(p).backgroundImage;
  if(bg&&bg!=='none')h.style.backgroundImage='linear-gradient(100deg,#07101d 0 28%,transparent 72%),'+bg;
}
document.addEventListener('click',e=>{
  const r=e.target.closest('.rhx-ring');
  if(r){
    const q=document.getElementById('profileAvatarBorder');
    if(q){q.value=r.dataset.border;q.dispatchEvent(new Event('change',{bubbles:true}));}
    document.querySelectorAll('.rhx-ring').forEach(x=>x.classList.toggle('selected',x===r));
  }
});
document.addEventListener('DOMContentLoaded',()=>{
  const p=document.getElementById('wallpaperPreview');
  if(p)new MutationObserver(syncHero).observe(p,{attributes:true});
  setTimeout(syncHero,400);
});
window.addEventListener('load',()=>setTimeout(syncHero,600));
})();

/* ===== BLOCO SEPARADO ===== */

(function(){
  function enhanceFriends(){
    const page=document.getElementById('friendsPage');
    if(!page || page.dataset.rhRedesigned) return;
    page.dataset.rhRedesigned='1';
    const search=page.querySelector('.friends-search-wrap');
    if(search){
      const tools=document.createElement('div');
      tools.className='rh-friends-tools';
      tools.innerHTML='<div class="rh-tool">Status<b>Todos⌄</b></div><div class="rh-tool">Ordenar por<b>↕ Mais recentes⌄</b></div><div class="rh-tool rh-view">▦ <b>☷</b></div>';
      search.insertAdjacentElement('afterend',tools);
    }
  }
  document.addEventListener('DOMContentLoaded',enhanceFriends);
  window.addEventListener('load',enhanceFriends);
  new MutationObserver(enhanceFriends).observe(document.documentElement,{childList:true,subtree:true});
})();

/* ===== BLOCO SEPARADO ===== */


/* ===== BLOCO SEPARADO ===== */

(function(){
  function looksLikeImagePath(value){
    const s=String(value||"").trim();
    return /^(?:https?:\/\/|\/|\.?\.?\/|images\/|assets\/|badges\/)/i.test(s) &&
           /\.(?:png|jpe?g|webp|gif|svg)(?:[?#].*)?$/i.test(s);
  }

  function repairFeaturedBadgeCards(root=document){
    root.querySelectorAll(".profile-featured-card").forEach(card=>{
      const emoji=card.querySelector(".profile-featured-emoji");
      if(!emoji) return;

      const raw=(emoji.textContent||"").trim();
      if(!looksLikeImagePath(raw)) return;

      const img=document.createElement("img");
      img.className="profile-featured-icon";
      img.src=raw;
      img.alt="Insígnia em destaque";
      img.loading="lazy";
      emoji.replaceWith(img);
    });
  }

  window.repairRetrohubFeaturedBadgeCards=repairFeaturedBadgeCards;

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>repairFeaturedBadgeCards());
  }else{
    repairFeaturedBadgeCards();
  }

  const observer=new MutationObserver(()=>repairFeaturedBadgeCards());
  observer.observe(document.body,{childList:true,subtree:true});
})();
