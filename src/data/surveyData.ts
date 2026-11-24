import { SurveyQuestion, GenreRecommendation } from '../types';

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 1,
    question: "지금 당신의 마음을 채우고 싶은 분위기는 어떤 느낌인가요?",
    description: "현재 나의 기분이나 귀를 사로잡는 분위기를 한 가지 골라보세요.",
    options: [
      {
        id: "opt-1-1",
        label: "몽환적이고 트렌디한 이지리스닝",
        sublabel: "가볍고 중독성 넘치는 멜로디에 기분 좋게 빠져들고 싶을 때",
        icon: "✨",
        genreWeight: { bubblegum: 4, citypop: 2, lofi: 1 }
      },
      {
        id: "opt-1-2",
        label: "차분하고 포근한 나만의 칠(Chill) 타임",
        sublabel: "잡생각을 비우고 아늑한 감성에 스며들고 싶을 때",
        icon: "🌙",
        genreWeight: { lofi: 4, acoustic: 3, citypop: 1 }
      },
      {
        id: "opt-1-3",
        label: "세련되고 감각적인 그루비 & 네오소울",
        sublabel: "도심의 야경처럼 트렌디하고 리드미컬한 무드를 원할 때",
        icon: "🌆",
        genreWeight: { citypop: 4, bubblegum: 2, lofi: 1 }
      },
      {
        id: "opt-1-4",
        label: "심장을 뛰게 하는 에너지와 텐션 부스터",
        sublabel: "지루할 틈 없이 비트와 함께 몸을 들썩이고 싶을 때",
        icon: "⚡",
        genreWeight: { edm: 4, bubblegum: 2 }
      },
      {
        id: "opt-1-5",
        label: "가슴 뭉클하고 따스한 어쿠스틱 선율",
        sublabel: "진솔한 가사와 기타·피아노의 아날로그 사운드가 그리울 때",
        icon: "☕",
        genreWeight: { acoustic: 4, lofi: 2 }
      }
    ]
  },
  {
    id: 2,
    question: "하루 중 어떤 순간에 음악이 가장 필요하다고 느끼나요?",
    description: "당신이 이어폰을 귀에 꽂는 가장 결정적인 순간을 선택해주세요.",
    options: [
      {
        id: "opt-2-1",
        label: "등하굣길이나 출퇴근길 걸으며 가볍게 리듬 탈 때",
        sublabel: "지루한 이동 시간을 나만의 감각적인 런웨이로 만들고 싶을 때",
        icon: "🚶",
        genreWeight: { bubblegum: 4, citypop: 3 }
      },
      {
        id: "opt-2-2",
        label: "노트북 작업이나 공부할 때 집중 모드",
        sublabel: "방해되지 않으면서 머릿속을 맑게 채워주는 배경음악",
        icon: "💻",
        genreWeight: { lofi: 4, acoustic: 2 }
      },
      {
        id: "opt-2-3",
        label: "운동할 때 또는 한밤중 드라이브 쾌감을 느낄 때",
        sublabel: "한계치를 뛰어넘는 아드레날린과 속도감이 필요할 때",
        icon: "🏎️",
        genreWeight: { edm: 4, citypop: 2 }
      },
      {
        id: "opt-2-4",
        label: "자기 전 조용한 방에서 온전히 나에게 집중할 때",
        sublabel: "따뜻한 이불 속에서 오늘 하루를 위로받고 싶을 때",
        icon: "🛋️",
        genreWeight: { acoustic: 4, lofi: 3 }
      }
    ]
  },
  {
    id: 3,
    question: "음악을 들을 때 가장 당신의 귀를 사로잡는 요소는?",
    description: "곡의 첫인상을 결정짓는 나만의 취향 포인트를 알려주세요.",
    options: [
      {
        id: "opt-3-1",
        label: "머릿속에 맴도는 중독적인 보컬 훅과 멜로디",
        sublabel: "한 번 들으면 흥얼거리게 되는 톡톡 튀는 킬링 파트",
        icon: "🎧",
        genreWeight: { bubblegum: 4, citypop: 2 }
      },
      {
        id: "opt-3-2",
        label: "심장을 울리는 묵직한 베이스 라인과 리듬",
        sublabel: "온몸의 세포를 깨우는 킥 드럼과 드롭의 전율",
        icon: "🥁",
        genreWeight: { edm: 4, citypop: 2 }
      },
      {
        id: "opt-3-3",
        label: "마음에 스며드는 어쿠스틱 악기 & 따스한 노랫말",
        sublabel: "화려한 가공 없이 담백하게 전달되는 사람의 온기",
        icon: "🎸",
        genreWeight: { acoustic: 4, lofi: 2 }
      },
      {
        id: "opt-3-4",
        label: "몽환적인 신스 패드와 빈티지한 질감의 사운드",
        sublabel: "구름 위를 걷는 듯한 공간감과 은은한 잔향",
        icon: "🌌",
        genreWeight: { lofi: 3, bubblegum: 3, citypop: 2 }
      }
    ]
  },
  {
    id: 4,
    question: "오늘 당신에게 가장 어울리는 사운드 템포는?",
    description: "당신의 심장 박동과 어우러질 이상적인 비트를 골라보세요.",
    options: [
      {
        id: "opt-4-1",
        label: "산뜻하게 통통 튀는 미디엄 업템포 (100~115 BPM)",
        sublabel: "기분 좋은 경쾌함과 걸음걸이가 가벼워지는 리듬",
        icon: "🌸",
        genreWeight: { bubblegum: 4, citypop: 2 }
      },
      {
        id: "opt-4-2",
        label: "잔잔하고 포근하게 젖어드는 슬로우 템포 (60~80 BPM)",
        sublabel: "느긋한 커피 한 잔의 여유 같은 부드러운 호흡",
        icon: "☕",
        genreWeight: { lofi: 4, acoustic: 3 }
      },
      {
        id: "opt-4-3",
        label: "그루브가 넘치는 세련된 미드 템포 (90~105 BPM)",
        sublabel: "자연스럽게 고개가 끄덕여지는 어반 리듬",
        icon: "🪩",
        genreWeight: { citypop: 4, bubblegum: 1 }
      },
      {
        id: "opt-4-4",
        label: "짜릿하고 거침없는 하이 템포 (128+ BPM)",
        sublabel: "망설임 없이 앞으로 달려나가는 논스톱 파워",
        icon: "🚀",
        genreWeight: { edm: 4 }
      }
    ]
  },
  {
    id: 5,
    question: "음악을 들으며 가장 기분 좋게 머물고 싶은 공간은 어디인가요?",
    description: "당신의 플레이리스트가 배경음악이 되어줄 이상적인 공간을 선택해주세요.",
    options: [
      {
        id: "opt-5-1",
        label: "트렌디한 편집숍과 활기찬 도심 거리",
        sublabel: "감각적인 쇼윈도와 사람들의 에너지가 어우러진 공간",
        icon: "🛍️",
        genreWeight: { bubblegum: 4, citypop: 2 }
      },
      {
        id: "opt-5-2",
        label: "야경이 반짝이는 한강변 심야 드라이브 도로",
        sublabel: "창문을 살짝 열고 도시의 불빛을 가르며 달리는 순간",
        icon: "🌉",
        genreWeight: { citypop: 4, edm: 2 }
      },
      {
        id: "opt-5-3",
        label: "비 오는 밤, 작은 스탠드만 켜진 아늑한 작업실",
        sublabel: "빗소리와 잔잔한 사운드가 어우러지는 고요한 시간",
        icon: "🌧️",
        genreWeight: { lofi: 4, acoustic: 2 }
      },
      {
        id: "opt-5-4",
        label: "따스한 햇살이 스며드는 한적한 우드톤 카페",
        sublabel: "향긋한 커피 내음과 여유로운 오후의 대화가 흐르는 곳",
        icon: "🪴",
        genreWeight: { acoustic: 4, lofi: 2 }
      },
      {
        id: "opt-5-5",
        label: "레이저 조명과 함성이 터지는 페스티벌 메인 스테이지",
        sublabel: "심장을 울리는 사운드에 온몸을 맡기는 짜릿한 현장",
        icon: "🎆",
        genreWeight: { edm: 4, bubblegum: 1 }
      }
    ]
  },
  {
    id: 6,
    question: "플레이리스트를 고를 때 가장 끌리는 선곡 스타일은 무엇인가요?",
    description: "평소 당신이 '좋아요'를 누르거나 자주 재생하는 플레이리스트 성향을 알려주세요.",
    options: [
      {
        id: "opt-6-1",
        label: "차트 최상위권의 핫하고 세련된 최신 K-POP 히트곡",
        sublabel: "지금 가장 트렌디한 사운드와 중독성 있는 K-POP 챌린지 음악",
        icon: "🔥",
        genreWeight: { bubblegum: 4, edm: 2 }
      },
      {
        id: "opt-6-2",
        label: "나만 알고 싶은 숨은 명곡 중심의 감각적인 디깅 믹스",
        sublabel: "남들과 다른 세련된 취향을 드러내는 그루비한 트랙들",
        icon: "💿",
        genreWeight: { citypop: 4, lofi: 2 }
      },
      {
        id: "opt-6-3",
        label: "가사의 방해 없이 흐름에 맡기는 비트·인스트루멘탈 모음",
        sublabel: "작업 효율이나 깊은 휴식에 집중할 수 있는 사운드스케이프",
        icon: "🎹",
        genreWeight: { lofi: 4, edm: 2 }
      },
      {
        id: "opt-6-4",
        label: "한 소절만 들어도 마음이 움직이는 진솔한 스토리텔링 곡",
        sublabel: "가수의 음성과 가사가 선명하게 들리는 담백한 선곡",
        icon: "📖",
        genreWeight: { acoustic: 4, citypop: 1 }
      }
    ]
  }
];

export const GENRE_PROFILES: Record<string, GenreRecommendation> = {
  bubblegum: {
    id: "bubblegum",
    title: "트렌디 K-POP & 감각적 이지리스닝",
    koreanName: "중독성 넘치는 최신 K-POP 바이브",
    tagline: "귓가에 맴도는 산뜻한 멜로디와 세련된 K-POP·청춘 밴드 사운드",
    matchScore: 98,
    badge: "SPOTIFY K-POP PICKS",
    accentColor: "#1DB954",
    glowColor: "#d8b4e2",
    tags: ["#트렌디케이팝", "#감각적이지리스닝", "#청춘밴드팝", "#드라이브사운드", "#데일리플레이리스트"],
    description: "당신은 가볍고 산뜻하면서도 한 번 들으면 잊히지 않는 중독적인 멜로디 감각을 지녔습니다. 몽환적인 신스 팝부터 청량한 보이밴드·걸밴드 사운드, 감각적인 솔로 팝까지 다채로운 한국 팝 트랙들이 당신의 일상을 빛내줍니다.",
    reason: "트렌디한 이지리스닝 선호와 경쾌한 업템포, 감각적인 보컬 훅에 대한 높은 반응도를 바탕으로 산출되었습니다.",
    spotifyBenefit: "스포티파이 프리미엄에서는 광고 없이 끊김 없는 고음질(320kbps)로 최신 K-POP과 밴드 팝의 섬세한 사운드 텍스처를 원음 그대로 즐길 수 있습니다.",
    artists: ["뉴진스 (NewJeans)", "데이식스 (DAY6)", "에스파 (aespa)", "아이유 (IU)", "라이즈 (RIIZE)"],
    artistPreviews: [
      { name: "뉴진스 (NewJeans)", representativeTrack: "Supernatural", tempo: "115 BPM", searchQuery: "NewJeans Supernatural" },
      { name: "르세라핌 (LE SSERAFIM)", representativeTrack: "Perfect Night", tempo: "118 BPM", searchQuery: "LE SSERAFIM Perfect Night" },
      { name: "아이브 (IVE)", representativeTrack: "I AM", tempo: "128 BPM", searchQuery: "IVE I AM" },
      { name: "에스파 (aespa)", representativeTrack: "Supernova", tempo: "120 BPM", searchQuery: "aespa Supernova" },
      { name: "데이식스 (DAY6)", representativeTrack: "한 페이지가 될 수 있게", tempo: "174 BPM", searchQuery: "DAY6 Time of Our Life" },
      { name: "키스오브라이프 (KISS OF LIFE)", representativeTrack: "Sticky", tempo: "116 BPM", searchQuery: "KISS OF LIFE Sticky" },
      { name: "라이즈 (RIIZE)", representativeTrack: "Boom Boom Bass", tempo: "112 BPM", searchQuery: "RIIZE Boom Boom Bass" },
      { name: "태연 (TAEYEON)", representativeTrack: "To. X", tempo: "106 BPM", searchQuery: "TAEYEON To X" },
      { name: "투어스 (TWS)", representativeTrack: "첫 만남은 계획대로 되지 않아", tempo: "135 BPM", searchQuery: "TWS plot twist" },
      { name: "레드벨벳 (Red Velvet)", representativeTrack: "Cosmic", tempo: "110 BPM", searchQuery: "Red Velvet Cosmic" },
      { name: "QWER", representativeTrack: "고민중독", tempo: "152 BPM", searchQuery: "QWER TBH" },
      { name: "정국 (Jung Kook)", representativeTrack: "Standing Next to You", tempo: "106 BPM", searchQuery: "Jung Kook Standing Next to You" },
      { name: "트와이스 (TWICE)", representativeTrack: "Feel Special", tempo: "129 BPM", searchQuery: "TWICE Feel Special" },
      { name: "스테이씨 (STAYC)", representativeTrack: "ASAP", tempo: "132 BPM", searchQuery: "STAYC ASAP" },
      { name: "아일릿 (ILLIT)", representativeTrack: "Magnetic", tempo: "130 BPM", searchQuery: "ILLIT Magnetic" },
      { name: "오마이걸 (OH MY GIRL)", representativeTrack: "Dolphin", tempo: "116 BPM", searchQuery: "OH MY GIRL Dolphin" },
      { name: "(여자)아이들 ((G)I-DLE)", representativeTrack: "나는 아픈 건 딱 질색이니까", tempo: "138 BPM", searchQuery: "G I-DLE Fate" },
      { name: "세븐틴 (SEVENTEEN)", representativeTrack: "음악의 신", tempo: "122 BPM", searchQuery: "SEVENTEEN God of Music" },
      { name: "보이넥스트도어 (BOYNEXTDOOR)", representativeTrack: "오늘만 I LOVE YOU", tempo: "124 BPM", searchQuery: "BOYNEXTDOOR IF I SAY I LOVE YOU" },
      { name: "아이유 (IU)", representativeTrack: "라일락 (LILAC)", tempo: "115 BPM", searchQuery: "IU LILAC" }
    ],
    tracks: [
      { title: "Supernatural", artist: "뉴진스 (NewJeans)", duration: "3:11", tempo: "115 BPM", searchQuery: "NewJeans Supernatural" },
      { title: "한 페이지가 될 수 있게", artist: "데이식스 (DAY6)", duration: "3:25", tempo: "138 BPM", searchQuery: "DAY6 Time of Our Life" },
      { title: "Perfect Night", artist: "르세라핌 (LE SSERAFIM)", duration: "2:39", tempo: "118 BPM", searchQuery: "LE SSERAFIM Perfect Night" },
      { title: "Supernova", artist: "에스파 (aespa)", duration: "2:59", tempo: "120 BPM", searchQuery: "aespa Supernova" },
      { title: "I AM", artist: "아이브 (IVE)", duration: "3:03", tempo: "128 BPM", searchQuery: "IVE I AM" },
      { title: "Standing Next to You", artist: "정국 (Jung Kook)", duration: "3:26", tempo: "106 BPM", searchQuery: "Jung Kook Standing Next to You" },
      { title: "Cosmic", artist: "레드벨벳 (Red Velvet)", duration: "3:46", tempo: "110 BPM", searchQuery: "Red Velvet Cosmic" },
      { title: "고민중독", artist: "QWER", duration: "2:55", tempo: "145 BPM", searchQuery: "QWER TBH" },
      { title: "Sticky", artist: "키스오브라이프 (KISS OF LIFE)", duration: "2:37", tempo: "116 BPM", searchQuery: "KISS OF LIFE Sticky" },
      { title: "첫 만남은 계획대로 되지 않아", artist: "투어스 (TWS)", duration: "2:32", tempo: "135 BPM", searchQuery: "TWS plot twist" },
      { title: "Boom Boom Bass", artist: "라이즈 (RIIZE)", duration: "2:32", tempo: "112 BPM", searchQuery: "RIIZE Boom Boom Bass" },
      { title: "To. X", artist: "태연 (TAEYEON)", duration: "2:50", tempo: "106 BPM", searchQuery: "TAEYEON To X" },
      { title: "오늘만 I LOVE YOU", artist: "보이넥스트도어 (BOYNEXTDOOR)", duration: "2:41", tempo: "124 BPM", searchQuery: "BOYNEXTDOOR IF I SAY I LOVE YOU" },
      { title: "Magnetic", artist: "아일릿 (ILLIT)", duration: "2:40", tempo: "130 BPM", searchQuery: "ILLIT Magnetic" },
      { title: "Dolphin", artist: "오마이걸 (OH MY GIRL)", duration: "2:56", tempo: "116 BPM", searchQuery: "OH MY GIRL Dolphin" },
      { title: "라일락 (LILAC)", artist: "아이유 (IU)", duration: "3:34", tempo: "115 BPM", searchQuery: "IU LILAC" },
      { title: "나는 아픈 건 딱 질색이니까", artist: "(여자)아이들 ((G)I-DLE)", duration: "2:41", tempo: "138 BPM", searchQuery: "G I-DLE Fate" },
      { title: "음악의 신", artist: "세븐틴 (SEVENTEEN)", duration: "3:25", tempo: "122 BPM", searchQuery: "SEVENTEEN God of Music" },
      { title: "In Bloom", artist: "제로베이스원 (ZEROBASEONE)", duration: "3:00", tempo: "134 BPM", searchQuery: "ZEROBASEONE In Bloom" },
      { title: "DASH", artist: "엔믹스 (NMIXX)", duration: "2:46", tempo: "126 BPM", searchQuery: "NMIXX DASH" },
      { title: "Feel Special", artist: "트와이스 (TWICE)", duration: "3:26", tempo: "129 BPM", searchQuery: "TWICE Feel Special" },
      { title: "ASAP", artist: "스테이씨 (STAYC)", duration: "3:14", tempo: "132 BPM", searchQuery: "STAYC ASAP" },
      { title: "Cupid", artist: "피프티피프티 (FIFTY FIFTY)", duration: "2:54", tempo: "120 BPM", searchQuery: "FIFTY FIFTY Cupid" },
      { title: "WANNABE", artist: "있지 (ITZY)", duration: "3:11", tempo: "122 BPM", searchQuery: "ITZY WANNABE" }
    ],
    metrics: {
      energy: 85,
      chill: 60,
      melody: 96,
      dance: 92
    },
    audioMood: 'bubblegum'
  },
  lofi: {
    id: "lofi",
    title: "미드나잇 한국 인디 & 칠 로우파이",
    koreanName: "새벽 2시, 나만의 감성 플레이리스트",
    tagline: "잡생각을 잊게 만드는 아늑한 K-인디와 칠 힙합·얼터너티브",
    matchScore: 96,
    badge: "DEEP FOCUS & CHILL",
    accentColor: "#38bdf8",
    glowColor: "#818cf8",
    tags: ["#새벽감성", "#한국인디", "#몰입과집중", "#칠힙합", "#얼터너티브록"],
    description: "당신은 자극적인 소음에서 벗어나 마음의 평온과 깊은 사색을 중요시하는 섬세한 리스너입니다. 몽환적인 한국 인디 밴드, 부드러운 일렉트릭 피아노, 그리고 감성적인 칠 힙합·R&B가 당신의 하루를 온화하게 감싸줍니다.",
    reason: "차분한 칠 타임 선호와 작업 몰입형 리스닝 습관, 슬로우 템포에 대한 높은 선호도가 반영되었습니다.",
    spotifyBenefit: "오프라인 저장 기능으로 비행기, 지하철 어디서나 데이터 걱정 없이 나만의 집중 플레이리스트를 즐기세요.",
    artists: ["웨이브 투 어스 (wave to earth)", "검정치마", "오프온오프 (offonoff)", "실리카겔 (Silica Gel)", "빈지노 (Beenzino)"],
    artistPreviews: [
      { name: "웨이브 투 어스 (wave to earth)", representativeTrack: "seasons", tempo: "74 BPM", searchQuery: "wave to earth seasons" },
      { name: "검정치마 (The Black Skirts)", representativeTrack: "Everything", tempo: "68 BPM", searchQuery: "The Black Skirts Everything" },
      { name: "오프온오프 (offonoff)", representativeTrack: "Bath", tempo: "76 BPM", searchQuery: "offonoff Bath" },
      { name: "DPR IAN", representativeTrack: "So Beautiful", tempo: "82 BPM", searchQuery: "DPR IAN So Beautiful" },
      { name: "실리카겔 (Silica Gel)", representativeTrack: "NO PAIN", tempo: "94 BPM", searchQuery: "Silica Gel NO PAIN" },
      { name: "DPR LIVE", representativeTrack: "Jasmine", tempo: "78 BPM", searchQuery: "DPR LIVE Jasmine" },
      { name: "pH-1", representativeTrack: "Nerdy Love", tempo: "84 BPM", searchQuery: "pH-1 Nerdy Love" },
      { name: "혁오 (HYUKOH)", representativeTrack: "TOMBOY", tempo: "74 BPM", searchQuery: "HYUKOH TOMBOY" },
      { name: "새소년 (SE SO NEON)", representativeTrack: "난춘", tempo: "72 BPM", searchQuery: "SE SO NEON Nan Chun" },
      { name: "너드커넥션 (Nerd Connection)", representativeTrack: "좋은 밤 좋은 꿈", tempo: "75 BPM", searchQuery: "Nerd Connection Good Night Good Dream" },
      { name: "더 발룬티어스 (The Volunteers)", representativeTrack: "Summer", tempo: "78 BPM", searchQuery: "The Volunteers Summer" },
      { name: "빈지노 (Beenzino)", representativeTrack: "Aqua Man", tempo: "86 BPM", searchQuery: "Beenzino Aqua Man" },
      { name: "이하이 (LeeHi)", representativeTrack: "한숨", tempo: "68 BPM", searchQuery: "LeeHi BREATHE" },
      { name: "로꼬 (Loco)", representativeTrack: "시간이 들겠지", tempo: "80 BPM", searchQuery: "Loco It Takes Time" },
      { name: "릴러말즈 (Leellamarz)", representativeTrack: "TRIP", tempo: "82 BPM", searchQuery: "Leellamarz TRIP" },
      { name: "에픽하이 (EPIK HIGH)", representativeTrack: "우산", tempo: "84 BPM", searchQuery: "EPIK HIGH Umbrella" },
      { name: "기리보이 (Giriboy)", representativeTrack: "교통정리", tempo: "85 BPM", searchQuery: "Giriboy Traffic Control" },
      { name: "슬롬 (Slom)", representativeTrack: "ANXIOUS", tempo: "80 BPM", searchQuery: "Slom ANXIOUS" },
      { name: "이센스 (E SENS)", representativeTrack: "비행", tempo: "88 BPM", searchQuery: "E SENS Flight" },
      { name: "쏜애플 (THORNAPPLE)", representativeTrack: "시퍼런 봄", tempo: "90 BPM", searchQuery: "THORNAPPLE Blue Spring" }
    ],
    tracks: [
      { title: "seasons", artist: "웨이브 투 어스 (wave to earth)", duration: "4:16", tempo: "74 BPM", searchQuery: "wave to earth seasons" },
      { title: "Everything", artist: "검정치마", duration: "4:42", tempo: "68 BPM", searchQuery: "The Black Skirts Everything" },
      { title: "Bath", artist: "오프온오프 (offonoff)", duration: "3:44", tempo: "76 BPM", searchQuery: "offonoff Bath" },
      { title: "NO PAIN", artist: "실리카겔 (Silica Gel)", duration: "3:43", tempo: "94 BPM", searchQuery: "Silica Gel NO PAIN" },
      { title: "Jasmine", artist: "DPR LIVE", duration: "3:21", tempo: "78 BPM", searchQuery: "DPR LIVE Jasmine" },
      { title: "좋은 밤 좋은 꿈", artist: "너드커넥션 (Nerd Connection)", duration: "4:08", tempo: "75 BPM", searchQuery: "Nerd Connection Good Night Good Dream" },
      { title: "So Beautiful", artist: "DPR IAN", duration: "3:07", tempo: "82 BPM", searchQuery: "DPR IAN So Beautiful" },
      { title: "TOMBOY", artist: "혁오 (HYUKOH)", duration: "3:59", tempo: "74 BPM", searchQuery: "HYUKOH TOMBOY" },
      { title: "난춘", artist: "새소년 (SE SO NEON)", duration: "3:55", tempo: "72 BPM", searchQuery: "SE SO NEON Nan Chun" },
      { title: "시간이 들겠지", artist: "로꼬 (Loco)", duration: "3:52", tempo: "80 BPM", searchQuery: "Loco It Takes Time" },
      { title: "Nerdy Love", artist: "pH-1", duration: "3:24", tempo: "84 BPM", searchQuery: "pH-1 Nerdy Love" },
      { title: "Aqua Man", artist: "빈지노 (Beenzino)", duration: "3:49", tempo: "86 BPM", searchQuery: "Beenzino Aqua Man" },
      { title: "한숨", artist: "이하이 (LeeHi)", duration: "4:48", tempo: "68 BPM", searchQuery: "LeeHi BREATHE" },
      { title: "우산", artist: "에픽하이 (EPIK HIGH)", duration: "5:01", tempo: "84 BPM", searchQuery: "EPIK HIGH Umbrella" },
      { title: "Summer", artist: "더 발룬티어스 (The Volunteers)", duration: "4:33", tempo: "78 BPM", searchQuery: "The Volunteers Summer" },
      { title: "기다린 만큼, 더", artist: "검정치마", duration: "4:29", tempo: "72 BPM", searchQuery: "The Black Skirts Wait More" },
      { title: "bad", artist: "웨이브 투 어스 (wave to earth)", duration: "4:23", tempo: "76 BPM", searchQuery: "wave to earth bad" },
      { title: "TRIP", artist: "릴러말즈 (Leellamarz)", duration: "3:18", tempo: "82 BPM", searchQuery: "Leellamarz TRIP" },
      { title: "교통정리", artist: "기리보이 (Giriboy)", duration: "3:50", tempo: "85 BPM", searchQuery: "Giriboy Traffic Control" },
      { title: "비행", artist: "이센스 (E SENS)", duration: "3:58", tempo: "88 BPM", searchQuery: "E SENS Flight" },
      { title: "파도", artist: "새소년 (SE SO NEON)", duration: "4:52", tempo: "78 BPM", searchQuery: "SE SO NEON The Wave" },
      { title: "악몽", artist: "애쉬 아일랜드 (ASH ISLAND)", duration: "3:10", tempo: "86 BPM", searchQuery: "ASH ISLAND Paranoid" },
      { title: "위잉위잉", artist: "혁오 (HYUKOH)", duration: "3:14", tempo: "82 BPM", searchQuery: "HYUKOH Wi Ing Wi Ing" },
      { title: "죽일 놈", artist: "다이나믹 듀오 (Dynamic Duo)", duration: "3:42", tempo: "88 BPM", searchQuery: "Dynamic Duo Guilty" }
    ],
    metrics: {
      energy: 40,
      chill: 95,
      melody: 88,
      dance: 35
    },
    audioMood: 'lofi'
  },
  citypop: {
    id: "citypop",
    title: "네온 K-시티팝 & 그루비 R&B",
    koreanName: "심야 서울 도심 드라이브 감성",
    tagline: "세련된 베이스라인과 한국 R&B·시티팝·네오소울의 황홀한 만남",
    matchScore: 97,
    badge: "K-URBAN GROOVE & SOUL",
    accentColor: "#f43f5e",
    glowColor: "#fb7185",
    tags: ["#한국시티팝", "#K알앤비", "#심야드라이브", "#그루비베이스", "#레트로뉴잭"],
    description: "당신은 도시의 밤거리와 세련된 미적 감각에 자연스럽게 이끌리는 트렌드세터입니다. 찰진 베이스라인, 화려한 신스 텍스처, 8090 한국 시티팝부터 현대 네오소울·R&B까지 이동하는 모든 순간을 영화처럼 만들어줍니다.",
    reason: "세련된 그루브와 몽환적인 신스, 도심 라이프스타일 템포에 대한 선호도가 결합된 결과입니다.",
    spotifyBenefit: "무제한 건너뛰기 기능으로 원하는 그루브의 트랙만 골라 나만의 완벽한 드라이브 믹스를 완성해보세요.",
    artists: ["백예린", "딘 (DEAN)", "크러쉬 (Crush)", "유키카 (YUKIKA)", "선미 (SUNMI)"],
    artistPreviews: [
      { name: "백예린", representativeTrack: "Square (2017)", tempo: "115 BPM", searchQuery: "Yerin Baek Square 2017" },
      { name: "딘 (DEAN)", representativeTrack: "D (Half Moon)", tempo: "92 BPM", searchQuery: "DEAN Half Moon" },
      { name: "크러쉬 (Crush)", representativeTrack: "Mayday", tempo: "105 BPM", searchQuery: "Crush Mayday Joy" },
      { name: "콜드 (Colde)", representativeTrack: "와르르 ♥", tempo: "96 BPM", searchQuery: "Colde WA-R-R" },
      { name: "유키카 (YUKIKA)", representativeTrack: "네온 (NEON)", tempo: "114 BPM", searchQuery: "YUKIKA NEON" },
      { name: "선미 (SUNMI)", representativeTrack: "보라빛 밤 (pporappippam)", tempo: "118 BPM", searchQuery: "SUNMI pporappippam" },
      { name: "자이언티 (Zion.T)", representativeTrack: "양화대교", tempo: "90 BPM", searchQuery: "Zion.T Yanghwa BRDG" },
      { name: "비비 (BIBI)", representativeTrack: "밤양갱", tempo: "104 BPM", searchQuery: "BIBI Bam Yang Gang" },
      { name: "죠지 (george)", representativeTrack: "Boat", tempo: "100 BPM", searchQuery: "george Boat" },
      { name: "박재범 (Jay Park)", representativeTrack: "All I Wanna Do", tempo: "98 BPM", searchQuery: "Jay Park All I Wanna Do" },
      { name: "헤이즈 (Heize)", representativeTrack: "비도 오고 그래서", tempo: "94 BPM", searchQuery: "Heize You Clouds Rain" },
      { name: "수란 (SURAN)", representativeTrack: "오늘 취하면", tempo: "96 BPM", searchQuery: "SURAN WINE" },
      { name: "김현철", representativeTrack: "춘천 가는 기차", tempo: "102 BPM", searchQuery: "Kim Hyun Chul Train to Chuncheon" },
      { name: "빛과 소금", representativeTrack: "샴푸의 요정", tempo: "96 BPM", searchQuery: "Light and Salt Shampoo Fairy" },
      { name: "쏠 (SOLE)", representativeTrack: "RIDE", tempo: "104 BPM", searchQuery: "SOLE RIDE THAMA" },
      { name: "박문치", representativeTrack: "울희 깅이", tempo: "110 BPM", searchQuery: "Park Moonchi" },
      { name: "키 (KEY)", representativeTrack: "BAD LOVE", tempo: "116 BPM", searchQuery: "KEY BAD LOVE" },
      { name: "원더걸스 (Wonder Girls)", representativeTrack: "I Feel You", tempo: "112 BPM", searchQuery: "Wonder Girls I Feel You" },
      { name: "김아름", representativeTrack: "선 (Line)", tempo: "112 BPM", searchQuery: "Kim Areum Line" },
      { name: "레인보우 노트", representativeTrack: "1호선", tempo: "110 BPM", searchQuery: "Rainbow note Line 1" }
    ],
    tracks: [
      { title: "Square (2017)", artist: "백예린", duration: "4:22", tempo: "115 BPM", searchQuery: "Yerin Baek Square 2017" },
      { title: "D (Half Moon)", artist: "딘 (DEAN)", duration: "3:50", tempo: "92 BPM", searchQuery: "DEAN Half Moon" },
      { title: "Mayday", artist: "크러쉬 (Crush)", duration: "3:25", tempo: "105 BPM", searchQuery: "Crush Mayday Joy" },
      { title: "네온 (NEON)", artist: "유키카 (YUKIKA)", duration: "3:36", tempo: "114 BPM", searchQuery: "YUKIKA NEON" },
      { title: "보라빛 밤 (pporappippam)", artist: "선미 (SUNMI)", duration: "3:27", tempo: "118 BPM", searchQuery: "SUNMI pporappippam" },
      { title: "와르르 ♥", artist: "콜드 (Colde)", duration: "3:15", tempo: "96 BPM", searchQuery: "Colde WA-R-R" },
      { title: "Boat", artist: "죠지 (george)", duration: "3:26", tempo: "100 BPM", searchQuery: "george Boat" },
      { title: "All I Wanna Do", artist: "박재범 (Jay Park)", duration: "3:34", tempo: "98 BPM", searchQuery: "Jay Park All I Wanna Do" },
      { title: "비도 오고 그래서", artist: "헤이즈 (Heize)", duration: "3:26", tempo: "94 BPM", searchQuery: "Heize You Clouds Rain" },
      { title: "1호선", artist: "레인보우 노트", duration: "3:30", tempo: "110 BPM", searchQuery: "Rainbow note Line 1" },
      { title: "양화대교", artist: "자이언티 (Zion.T)", duration: "3:47", tempo: "90 BPM", searchQuery: "Zion.T Yanghwa BRDG" },
      { title: "오늘 취하면", artist: "수란 (SURAN)", duration: "3:52", tempo: "96 BPM", searchQuery: "SURAN WINE" },
      { title: "밤양갱", artist: "비비 (BIBI)", duration: "2:26", tempo: "104 BPM", searchQuery: "BIBI Bam Yang Gang" },
      { title: "춘천 가는 기차", artist: "김현철", duration: "4:35", tempo: "102 BPM", searchQuery: "Kim Hyun Chul Train to Chuncheon" },
      { title: "샴푸의 요정", artist: "빛과 소금", duration: "4:16", tempo: "96 BPM", searchQuery: "Light and Salt Shampoo Fairy" },
      { title: "RIDE", artist: "쏠 (SOLE)", duration: "3:42", tempo: "104 BPM", searchQuery: "SOLE RIDE THAMA" },
      { title: "I Feel You", artist: "원더걸스 (Wonder Girls)", duration: "3:26", tempo: "112 BPM", searchQuery: "Wonder Girls I Feel You" },
      { title: "BAD LOVE", artist: "키 (KEY)", duration: "3:20", tempo: "116 BPM", searchQuery: "KEY BAD LOVE" },
      { title: "선 (Line)", artist: "김아름", duration: "3:38", tempo: "112 BPM", searchQuery: "Kim Areum Line" },
      { title: "East Shore", artist: "브론즈 (Bronze)", duration: "3:44", tempo: "108 BPM", searchQuery: "Bronze East Shore" },
      { title: "instagram", artist: "딘 (DEAN)", duration: "4:15", tempo: "92 BPM", searchQuery: "DEAN instagram" },
      { title: "가끔", artist: "크러쉬 (Crush)", duration: "3:57", tempo: "90 BPM", searchQuery: "Crush Sometimes" },
      { title: "서울여자 (SOUL LADY)", artist: "유키카 (YUKIKA)", duration: "3:34", tempo: "116 BPM", searchQuery: "YUKIKA SOUL LADY" },
      { title: "그건 아마 우리의 잘못은 아닐 거야", artist: "백예린", duration: "4:12", tempo: "94 BPM", searchQuery: "Yerin Baek Maybe It's Not Our Fault" }
    ],
    metrics: {
      energy: 78,
      chill: 72,
      melody: 92,
      dance: 88
    },
    audioMood: 'citypop'
  },
  edm: {
    id: "edm",
    title: "에너제틱 K-일렉트로닉 & 하이텐션 댄스",
    koreanName: "한계 돌파 한국형 텐션 부스터",
    tagline: "심장을 울리는 킥 드럼과 폭발적인 K-일렉트로닉·페스티벌 사운드",
    matchScore: 99,
    badge: "MAXIMUM K-ENERGY",
    accentColor: "#eab308",
    glowColor: "#f97316",
    tags: ["#텐션극대화", "#운동부스터", "#K댄스일렉", "#하우스테크노", "#러닝사운드"],
    description: "당신은 망설임 없이 앞으로 나아가는 파워풀한 열정의 소유자입니다. 글로벌 하우스·테크노부터 일렉트로 록, 폭발적인 K-퍼포먼스 댄스 비트까지 운동과 드라이브, 페스티벌의 열기를 그대로 전해줍니다.",
    reason: "폭발적인 에너지 레벨 선호, 강렬한 베이스와 빠른 하이 템포(128+ BPM) 응답을 종합한 결과입니다.",
    spotifyBenefit: "스포티파이 프리미엄의 최고급 음질로 가슴을 진동시키는 깊은 서브 베이스의 파워를 경험하세요.",
    artists: ["페기 구 (Peggy Gou)", "빅뱅 (BIGBANG)", "블랙핑크 (BLACKPINK)", "글렌체크 (Glen Check)", "스트레이 키즈 (Stray Kids)"],
    artistPreviews: [
      { name: "페기 구 (Peggy Gou)", representativeTrack: "(It Goes Like) Nanana", tempo: "130 BPM", searchQuery: "Peggy Gou Nanana" },
      { name: "전소미 (JEON SOMI)", representativeTrack: "Fast Forward", tempo: "128 BPM", searchQuery: "JEON SOMI Fast Forward" },
      { name: "에프엑스 (f(x))", representativeTrack: "4 Walls", tempo: "126 BPM", searchQuery: "f(x) 4 Walls" },
      { name: "빅뱅 (BIGBANG)", representativeTrack: "FANTASTIC BABY", tempo: "130 BPM", searchQuery: "BIGBANG FANTASTIC BABY" },
      { name: "지드래곤 (G-DRAGON)", representativeTrack: "삐딱하게 (Crooked)", tempo: "130 BPM", searchQuery: "G-DRAGON Crooked" },
      { name: "블랙핑크 (BLACKPINK)", representativeTrack: "뚜두뚜두 (DDU-DU DDU-DU)", tempo: "140 BPM", searchQuery: "BLACKPINK DDU-DU DDU-DU" },
      { name: "투애니원 (2NE1)", representativeTrack: "내가 제일 잘 나가", tempo: "132 BPM", searchQuery: "2NE1 I AM THE BEST" },
      { name: "싸이 (PSY)", representativeTrack: "강남스타일", tempo: "132 BPM", searchQuery: "PSY Gangnam Style" },
      { name: "샤이니 (SHINee)", representativeTrack: "Lucifer", tempo: "130 BPM", searchQuery: "SHINee Lucifer" },
      { name: "스트레이 키즈 (Stray Kids)", representativeTrack: "神메뉴 (God's Menu)", tempo: "142 BPM", searchQuery: "Stray Kids God's Menu" },
      { name: "에이티즈 (ATEEZ)", representativeTrack: "BOUNCY (K-HOT CHILLI PEPPERS)", tempo: "128 BPM", searchQuery: "ATEEZ BOUNCY" },
      { name: "글렌체크 (Glen Check)", representativeTrack: "60's Cardin", tempo: "128 BPM", searchQuery: "Glen Check 60s Cardin" },
      { name: "이디오테잎 (IDIOTAPE)", representativeTrack: "Melodie", tempo: "132 BPM", searchQuery: "IDIOTAPE Melodie" },
      { name: "NCT 127", representativeTrack: "영웅 (英雄; Kick It)", tempo: "136 BPM", searchQuery: "NCT 127 Kick It" },
      { name: "권은비 (KWON EUN BI)", representativeTrack: "Underwater", tempo: "124 BPM", searchQuery: "KWON EUN BI Underwater" },
      { name: "루나 (LUNA)", representativeTrack: "Free Somebody", tempo: "124 BPM", searchQuery: "LUNA Free Somebody" },
      { name: "청하 (CHUNG HA)", representativeTrack: "벌써 12시", tempo: "120 BPM", searchQuery: "CHUNG HA Gotta Go" },
      { name: "트레저 (TREASURE)", representativeTrack: "직진 (JIKJIN)", tempo: "132 BPM", searchQuery: "TREASURE JIKJIN" },
      { name: "레이든 (Raiden)", representativeTrack: "Yours", tempo: "126 BPM", searchQuery: "Raiden CHANYEOL Yours" },
      { name: "알티 (R.Tee)", representativeTrack: "What You Waiting For", tempo: "128 BPM", searchQuery: "R.Tee Anda What You Waiting For" }
    ],
    tracks: [
      { title: "(It Goes Like) Nanana", artist: "페기 구 (Peggy Gou)", duration: "3:51", tempo: "130 BPM", searchQuery: "Peggy Gou Nanana" },
      { title: "Fast Forward", artist: "전소미 (JEON SOMI)", duration: "2:40", tempo: "128 BPM", searchQuery: "JEON SOMI Fast Forward" },
      { title: "4 Walls", artist: "에프엑스 (f(x))", duration: "3:27", tempo: "126 BPM", searchQuery: "f(x) 4 Walls" },
      { title: "FANTASTIC BABY", artist: "빅뱅 (BIGBANG)", duration: "3:51", tempo: "130 BPM", searchQuery: "BIGBANG FANTASTIC BABY" },
      { title: "삐딱하게 (Crooked)", artist: "지드래곤 (G-DRAGON)", duration: "3:44", tempo: "130 BPM", searchQuery: "G-DRAGON Crooked" },
      { title: "60's Cardin", artist: "글렌체크 (Glen Check)", duration: "3:23", tempo: "128 BPM", searchQuery: "Glen Check 60s Cardin" },
      { title: "Melodie", artist: "이디오테잎 (IDIOTAPE)", duration: "4:18", tempo: "132 BPM", searchQuery: "IDIOTAPE Melodie" },
      { title: "뚜두뚜두 (DDU-DU DDU-DU)", artist: "블랙핑크 (BLACKPINK)", duration: "3:29", tempo: "140 BPM", searchQuery: "BLACKPINK DDU-DU DDU-DU" },
      { title: "내가 제일 잘 나가", artist: "투애니원 (2NE1)", duration: "3:30", tempo: "132 BPM", searchQuery: "2NE1 I AM THE BEST" },
      { title: "강남스타일", artist: "싸이 (PSY)", duration: "3:39", tempo: "132 BPM", searchQuery: "PSY Gangnam Style" },
      { title: "Lucifer", artist: "샤이니 (SHINee)", duration: "3:54", tempo: "130 BPM", searchQuery: "SHINee Lucifer" },
      { title: "영웅 (英雄; Kick It)", artist: "NCT 127", duration: "3:53", tempo: "136 BPM", searchQuery: "NCT 127 Kick It" },
      { title: "神메뉴 (God's Menu)", artist: "스트레이 키즈 (Stray Kids)", duration: "2:48", tempo: "142 BPM", searchQuery: "Stray Kids God's Menu" },
      { title: "BOUNCY (K-HOT CHILLI PEPPERS)", artist: "에이티즈 (ATEEZ)", duration: "3:07", tempo: "128 BPM", searchQuery: "ATEEZ BOUNCY" },
      { title: "Underwater", artist: "권은비 (KWON EUN BI)", duration: "2:50", tempo: "124 BPM", searchQuery: "KWON EUN BI Underwater" },
      { title: "Free Somebody", artist: "루나 (LUNA)", duration: "3:19", tempo: "124 BPM", searchQuery: "LUNA Free Somebody" },
      { title: "BANG BANG BANG", artist: "빅뱅 (BIGBANG)", duration: "3:40", tempo: "136 BPM", searchQuery: "BIGBANG BANG BANG BANG" },
      { title: "View", artist: "샤이니 (SHINee)", duration: "3:10", tempo: "122 BPM", searchQuery: "SHINee View" },
      { title: "Whiplash", artist: "에스파 (aespa)", duration: "3:03", tempo: "128 BPM", searchQuery: "aespa Whiplash" },
      { title: "직진 (JIKJIN)", artist: "트레저 (TREASURE)", duration: "3:01", tempo: "132 BPM", searchQuery: "TREASURE JIKJIN" },
      { title: "Starry Night", artist: "페기 구 (Peggy Gou)", duration: "3:54", tempo: "126 BPM", searchQuery: "Peggy Gou Starry Night" },
      { title: "Youth", artist: "글렌체크 (Glen Check)", duration: "3:30", tempo: "125 BPM", searchQuery: "Glen Check Youth" },
      { title: "벌써 12시", artist: "청하 (CHUNG HA)", duration: "3:41", tempo: "120 BPM", searchQuery: "CHUNG HA Gotta Go" },
      { title: "Kill This Love", artist: "블랙핑크 (BLACKPINK)", duration: "3:09", tempo: "132 BPM", searchQuery: "BLACKPINK Kill This Love" }
    ],
    metrics: {
      energy: 98,
      chill: 25,
      melody: 82,
      dance: 96
    },
    audioMood: 'edm'
  },
  acoustic: {
    id: "acoustic",
    title: "어쿠스틱 감성 K-인디 & 포크",
    koreanName: "마음을 어루만지는 통기타와 한국어 가사",
    tagline: "진솔한 노랫말과 어쿠스틱·발라드·모던 포크의 따스한 위로",
    matchScore: 95,
    badge: "WARM K-ACOUSTIC & INDIE",
    accentColor: "#fb923c",
    glowColor: "#fdba74",
    tags: ["#담백한위로", "#어쿠스틱기타", "#한국인디감성", "#서정적발라드", "#마음정리"],
    description: "당신은 음악의 화려함보다는 진실된 목소리와 시적인 한국어 가사에 깊이 감응하는 감성 리스너입니다. 통기타 포크와 인디 선율, 가슴을 울리는 발라드까지 지친 일상에 가장 따스한 안식처가 되어줍니다.",
    reason: "아날로그 악기 선호, 침실 힐링 리스닝 및 진솔한 가사에 대한 애정이 반영되었습니다.",
    spotifyBenefit: "곡과 곡 사이 거슬리는 광고 없이, 조용한 방에서 나만의 힐링 세션을 온전히 지켜드립니다.",
    artists: ["10CM", "적재", "카더가든", "잔나비", "아이유 (IU)"],
    artistPreviews: [
      { name: "10CM", representativeTrack: "스토커", tempo: "72 BPM", searchQuery: "10CM Stalker" },
      { name: "적재", representativeTrack: "별 보러 가자", tempo: "76 BPM", searchQuery: "Jukjae Let's go see the stars" },
      { name: "카더가든", representativeTrack: "나무", tempo: "68 BPM", searchQuery: "Car the garden Tree" },
      { name: "잔나비", representativeTrack: "주저하는 연인들을 위해", tempo: "70 BPM", searchQuery: "JANNABI for lovers who hesitate" },
      { name: "폴킴", representativeTrack: "모든 날, 모든 순간", tempo: "74 BPM", searchQuery: "Paul Kim Every day Every Moment" },
      { name: "아이유 (IU)", representativeTrack: "밤편지", tempo: "70 BPM", searchQuery: "IU Through the Night" },
      { name: "최유리", representativeTrack: "숲", tempo: "72 BPM", searchQuery: "Choi Yu Ree Forest" },
      { name: "멜로망스", representativeTrack: "선물", tempo: "82 BPM", searchQuery: "MeloMance Gift" },
      { name: "볼빨간사춘기", representativeTrack: "여행", tempo: "104 BPM", searchQuery: "BOL4 Travel" },
      { name: "성시경", representativeTrack: "너의 모든 순간", tempo: "68 BPM", searchQuery: "Sung Si Kyung Every Moment of You" },
      { name: "스탠딩 에그", representativeTrack: "오래된 노래", tempo: "78 BPM", searchQuery: "Standing Egg Old Song" },
      { name: "백아", representativeTrack: "첫사랑", tempo: "76 BPM", searchQuery: "Baek A First Love" },
      { name: "악뮤 (AKMU)", representativeTrack: "어떻게 이별까지 사랑하겠어, 널 사랑하는 거지", tempo: "72 BPM", searchQuery: "AKMU How can I love the heartbreak" },
      { name: "김광석", representativeTrack: "서른 즈음에", tempo: "70 BPM", searchQuery: "Kim Kwang Seok Around Thirty" },
      { name: "윤하 (YOUNHA)", representativeTrack: "사건의 지평선", tempo: "110 BPM", searchQuery: "YOUNHA Event Horizon" },
      { name: "박효신", representativeTrack: "야생화", tempo: "66 BPM", searchQuery: "Park Hyo Shin Wild Flower" },
      { name: "이무진", representativeTrack: "신호등", tempo: "108 BPM", searchQuery: "Lee Mujin Traffic light" },
      { name: "정승환", representativeTrack: "너였다면", tempo: "68 BPM", searchQuery: "Jung Seung Hwan If It Is You" },
      { name: "장범준", representativeTrack: "흔들리는 꽃들 속에서 네 샴푸향이 느껴진거야", tempo: "96 BPM", searchQuery: "Jang Beom June Your Shampoo Scent" },
      { name: "브로콜리너마저", representativeTrack: "보편적인 노래", tempo: "84 BPM", searchQuery: "Broccoli, you too Universal Song" }
    ],
    tracks: [
      { title: "스토커", artist: "10CM", duration: "4:12", tempo: "72 BPM", searchQuery: "10CM Stalker" },
      { title: "별 보러 가자", artist: "적재", duration: "5:06", tempo: "76 BPM", searchQuery: "Jukjae Let's go see the stars" },
      { title: "나무", artist: "카더가든", duration: "3:48", tempo: "68 BPM", searchQuery: "Car the garden Tree" },
      { title: "주저하는 연인들을 위해", artist: "잔나비", duration: "4:25", tempo: "70 BPM", searchQuery: "JANNABI for lovers who hesitate" },
      { title: "밤편지", artist: "아이유 (IU)", duration: "4:13", tempo: "70 BPM", searchQuery: "IU Through the Night" },
      { title: "숲", artist: "최유리", duration: "3:49", tempo: "72 BPM", searchQuery: "Choi Yu Ree Forest" },
      { title: "모든 날, 모든 순간", artist: "폴킴", duration: "3:30", tempo: "74 BPM", searchQuery: "Paul Kim Every day Every Moment" },
      { title: "선물", artist: "멜로망스", duration: "4:21", tempo: "82 BPM", searchQuery: "MeloMance Gift" },
      { title: "첫사랑", artist: "백아", duration: "3:46", tempo: "76 BPM", searchQuery: "Baek A First Love" },
      { title: "어떻게 이별까지 사랑하겠어, 널 사랑하는 거지", artist: "악뮤 (AKMU)", duration: "4:50", tempo: "72 BPM", searchQuery: "AKMU How can I love the heartbreak" },
      { title: "여행", artist: "볼빨간사춘기", duration: "3:36", tempo: "104 BPM", searchQuery: "BOL4 Travel" },
      { title: "오래된 노래", artist: "스탠딩 에그", duration: "4:08", tempo: "78 BPM", searchQuery: "Standing Egg Old Song" },
      { title: "야생화", artist: "박효신", duration: "5:13", tempo: "66 BPM", searchQuery: "Park Hyo Shin Wild Flower" },
      { title: "신호등", artist: "이무진", duration: "3:51", tempo: "108 BPM", searchQuery: "Lee Mujin Traffic light" },
      { title: "너였다면", artist: "정승환", duration: "4:33", tempo: "68 BPM", searchQuery: "Jung Seung Hwan If It Is You" },
      { title: "흔들리는 꽃들 속에서 네 샴푸향이 느껴진거야", artist: "장범준", duration: "2:48", tempo: "96 BPM", searchQuery: "Jang Beom June Your Shampoo Scent" },
      { title: "사건의 지평선", artist: "윤하 (YOUNHA)", duration: "5:00", tempo: "110 BPM", searchQuery: "YOUNHA Event Horizon" },
      { title: "서른 즈음에", artist: "김광석", duration: "4:43", tempo: "70 BPM", searchQuery: "Kim Kwang Seok Around Thirty" },
      { title: "너의 모든 순간", artist: "성시경", duration: "4:04", tempo: "68 BPM", searchQuery: "Sung Si Kyung Every Moment of You" },
      { title: "보편적인 노래", artist: "브로콜리너마저", duration: "3:49", tempo: "84 BPM", searchQuery: "Broccoli, you too Universal Song" },
      { title: "널 사랑하지 않아", artist: "어반자카파 (Urban Zakapa)", duration: "4:16", tempo: "68 BPM", searchQuery: "Urban Zakapa I Don't Love You" },
      { title: "폰서트", artist: "10CM", duration: "3:18", tempo: "96 BPM", searchQuery: "10CM Phonecert" },
      { title: "기억의 습작", artist: "전람회 (Exhibition)", duration: "5:15", tempo: "68 BPM", searchQuery: "Exhibition Etude of Memory" },
      { title: "수고했어, 오늘도", artist: "옥상달빛 (OKDAL)", duration: "3:36", tempo: "78 BPM", searchQuery: "OKDAL Hard work today" }
    ],
    metrics: {
      energy: 48,
      chill: 92,
      melody: 95,
      dance: 38
    },
    audioMood: 'acoustic'
  }
};

export function calculateRecommendation(answers: Record<number, string>): GenreRecommendation {
  const scores: Record<string, number> = {
    bubblegum: 0,
    lofi: 0,
    citypop: 0,
    edm: 0,
    acoustic: 0
  };

  // Tally scores from chosen options
  SURVEY_QUESTIONS.forEach(q => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const opt = q.options.find(o => o.id === selectedOptionId);
      if (opt && opt.genreWeight) {
        Object.entries(opt.genreWeight).forEach(([genre, weight]) => {
          scores[genre] = (scores[genre] || 0) + weight;
        });
      }
    }
  });

  // Find max scoring genre
  let bestGenre = 'bubblegum';
  let maxScore = -1;

  Object.entries(scores).forEach(([genre, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestGenre = genre;
    }
  });

  return GENRE_PROFILES[bestGenre] || GENRE_PROFILES['bubblegum'];
}

function parseTempoBpm(tempo: string): number {
  const m = tempo.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 100;
}

function clampMetric(val: number): number {
  return Math.max(10, Math.min(99, Math.round(val)));
}

function deriveItemMetrics(
  base: { energy: number; chill: number; melody: number; dance: number },
  tempo: string,
  title: string
): { energy: number; chill: number; melody: number; dance: number } {
  const bpm = parseTempoBpm(tempo);
  const bpmDelta = (bpm - 102) * 0.42;
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }
  const jitter = (offset: number) => (((Math.abs(hash >> offset) % 13) - 6) * 2);

  return {
    energy: clampMetric(base.energy + bpmDelta + jitter(0)),
    chill: clampMetric(base.chill - bpmDelta * 0.8 + jitter(3)),
    melody: clampMetric(base.melody + jitter(6)),
    dance: clampMetric(base.dance + bpmDelta * 0.75 + jitter(9)),
  };
}

function calcProfileDistance(
  a: { energy: number; chill: number; melody: number; dance: number },
  b: { energy: number; chill: number; melody: number; dance: number }
): number {
  const de = a.energy - b.energy;
  const dc = a.chill - b.chill;
  const dm = a.melody - b.melody;
  const dd = a.dance - b.dance;
  return Math.sqrt((de * de + dc * dc + dm * dm + dd * dd) / 4);
}

export interface MatchedTrackEntry {
  id: string;
  title: string;
  artist: string;
  duration: string;
  tempo: string;
  searchQuery: string;
  mood: 'bubblegum' | 'lofi' | 'citypop' | 'edm' | 'acoustic';
  matchScore: number;
}

export interface MatchedArtistEntry {
  id: string;
  name: string;
  representativeTrack: string;
  tempo: string;
  searchQuery: string;
  mood: 'bubblegum' | 'lofi' | 'citypop' | 'edm' | 'acoustic';
  matchScore: number;
}

export function getClosestGenreForMetrics(metrics: {
  energy: number;
  chill: number;
  melody: number;
  dance: number;
}): GenreRecommendation {
  const profiles = Object.values(GENRE_PROFILES);
  let best = profiles[0];
  let bestDist = Infinity;

  profiles.forEach((profile) => {
    const dist = calcProfileDistance(metrics, profile.metrics);
    if (dist < bestDist) {
      bestDist = dist;
      best = profile;
    }
  });

  return best;
}

export function getSoundMatchedCatalog(
  targetMetrics: { energy: number; chill: number; melody: number; dance: number },
  preferredGenre: GenreRecommendation,
  useCustomProfile: boolean
): {
  tracks: MatchedTrackEntry[];
  artists: MatchedArtistEntry[];
  closestGenre: GenreRecommendation;
  averageMatch: number;
} {
  const closestGenre = getClosestGenreForMetrics(targetMetrics);

  if (!useCustomProfile) {
    return {
      tracks: preferredGenre.tracks.map((track, idx) => ({
        id: `track-${preferredGenre.id}-${idx}`,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        tempo: track.tempo,
        searchQuery: track.searchQuery || `${track.artist} ${track.title}`,
        mood: preferredGenre.audioMood,
        matchScore: preferredGenre.matchScore,
      })),
      artists: preferredGenre.artistPreviews.map((ap, idx) => ({
        id: `artist-${preferredGenre.id}-${idx}`,
        name: ap.name,
        representativeTrack: ap.representativeTrack,
        tempo: ap.tempo,
        searchQuery: ap.searchQuery,
        mood: preferredGenre.audioMood,
        matchScore: preferredGenre.matchScore,
      })),
      closestGenre: preferredGenre,
      averageMatch: preferredGenre.matchScore,
    };
  }

  const scoredTracks: Array<MatchedTrackEntry & { dist: number }> = [];
  const scoredArtists: Array<MatchedArtistEntry & { dist: number }> = [];

  Object.values(GENRE_PROFILES).forEach((profile) => {
    profile.tracks.forEach((track, idx) => {
      const itemMetrics = track.metrics ?? deriveItemMetrics(profile.metrics, track.tempo, track.title);
      const dist = calcProfileDistance(targetMetrics, itemMetrics);
      const score = Math.round(Math.max(58, Math.min(99, 100 - dist * 0.72)));
      scoredTracks.push({
        id: `matched-track-${profile.id}-${idx}`,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        tempo: track.tempo,
        searchQuery: track.searchQuery || `${track.artist} ${track.title}`,
        mood: track.mood ?? profile.audioMood,
        matchScore: score,
        dist,
      });
    });

    profile.artistPreviews.forEach((ap, idx) => {
      const itemMetrics = ap.metrics ?? deriveItemMetrics(profile.metrics, ap.tempo, ap.representativeTrack);
      const dist = calcProfileDistance(targetMetrics, itemMetrics);
      const score = Math.round(Math.max(58, Math.min(99, 100 - dist * 0.72)));
      scoredArtists.push({
        id: `matched-artist-${profile.id}-${idx}`,
        name: ap.name,
        representativeTrack: ap.representativeTrack,
        tempo: ap.tempo,
        searchQuery: ap.searchQuery,
        mood: ap.mood ?? profile.audioMood,
        matchScore: score,
        dist,
      });
    });
  });

  scoredTracks.sort((a, b) => a.dist - b.dist);
  scoredArtists.sort((a, b) => a.dist - b.dist);

  const topTracks = scoredTracks.slice(0, 24);
  const topArtists = scoredArtists.slice(0, 20);
  const averageMatch = Math.round(
    topTracks.slice(0, 4).reduce((sum, t) => sum + t.matchScore, 0) / Math.max(1, Math.min(4, topTracks.length))
  );

  return {
    tracks: topTracks,
    artists: topArtists,
    closestGenre,
    averageMatch,
  };
}

