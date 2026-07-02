/* ══════════════════════════════════════════════════
   1. 기초 데이터
   ══════════════════════════════════════════════════ */
const GAN  = ['갑','을','병','정','무','기','경','신','임','계'];
const GANH = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JI   = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const JIH  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN_EL = ['목','목','화','화','토','토','금','금','수','수'];
const JI_EL  = ['수','토','목','목','토','화','화','토','금','금','토','수'];
const JI_JG  = [9,5,0,1,4,2,3,5,6,7,4,8]; // 지지 정기(주된 지장간) → 천간 인덱스
const ELH = {목:'木',화:'火',토:'土',금:'金',수:'水'};
const JEOLGI = [[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,8],[9,8],[10,8],[11,7],[12,7],[1,6]];

function jdn(y,m,d){
  const a=Math.floor((14-m)/12), yy=y+4800-a, mm=m+12*a-3;
  return d + Math.floor((153*mm+2)/5) + 365*yy + Math.floor(yy/4) - Math.floor(yy/100) + Math.floor(yy/400) - 32045;
}

/* ══════════════════════════════════════════════════
   2. 음력 → 양력 변환 (1900–2100)
   ══════════════════════════════════════════════════ */
const LUNAR_INFO = [
0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
0x0d520];
const lInfo = y => LUNAR_INFO[y-1900];
const leapMonth = y => lInfo(y) & 0xf;
const leapDays  = y => leapMonth(y) ? ((lInfo(y) & 0x10000) ? 30 : 29) : 0;
const lMonthDays = (y,m) => (lInfo(y) & (0x10000 >> m)) ? 30 : 29;
function lYearDays(y){
  let sum = 348;
  for(let i = 0x8000; i > 0x8; i >>= 1) sum += (lInfo(y) & i) ? 1 : 0;
  return sum + leapDays(y);
}
function lunarToSolar(ly, lm, ld, isLeap){
  if(ly < 1900 || ly > 2099) return null;
  if(isLeap && leapMonth(ly) !== lm) isLeap = false;
  const maxD = isLeap ? leapDays(ly) : lMonthDays(ly, lm);
  if(ld > maxD) return {err:`음력 ${ly}년 ${isLeap?'윤':''}${lm}월은 ${maxD}일까지 있습니다.`};
  let offset = 0;
  for(let y = 1900; y < ly; y++) offset += lYearDays(y);
  const leap = leapMonth(ly);
  for(let m = 1; m < lm; m++){
    offset += lMonthDays(ly, m);
    if(m === leap) offset += leapDays(ly);
  }
  if(isLeap) offset += lMonthDays(ly, lm);
  offset += ld - 1;
  const dt = new Date(Date.UTC(1900,0,31) + offset * 86400000);
  return {y:dt.getUTCFullYear(), m:dt.getUTCMonth()+1, d:dt.getUTCDate()};
}

/* ══════════════════════════════════════════════════
   3. 사주 계산 (양력 기준)
   ══════════════════════════════════════════════════ */
function calcSaju(y,m,d,hour){
  let sy = y;
  if(m < 2 || (m === 2 && d < 4)) sy = y - 1;
  const yIdx = ((sy - 4) % 60 + 60) % 60, yGan = yIdx % 10, yJi = yIdx % 12;

  let mIdx = -1;
  const cur = jdn(y,m,d);
  for(let i = 0; i < 12; i++){
    const [jm,jd_] = JEOLGI[i];
    const sD = jdn(jm === 1 ? sy+1 : sy, jm, jd_);
    const nxt = JEOLGI[(i+1) % 12];
    const eY = (nxt[0] === 1 || nxt[0] < jm) ? sy + 1 : sy;
    const eD = jdn(eY, nxt[0], nxt[1]);
    if(cur >= sD && cur < eD){ mIdx = i; break; }
  }
  if(mIdx < 0) mIdx = 11;
  const mJi = (mIdx + 2) % 12;
  const mGan = ((yGan % 5) * 2 + 2 + mIdx) % 10;

  const dIdx = ((cur + 49) % 60 + 60) % 60;
  const dGan = dIdx % 10, dJi = dIdx % 12;

  let hGan = null, hJi = null;
  if(hour >= 0){
    hJi = Math.floor(((hour + 1) % 24) / 2);
    hGan = ((dGan % 5) * 2 + hJi) % 10;
  }
  return {yGan,yJi,mGan,mJi,dGan,dJi,hGan,hJi};
}

/* ══════════════════════════════════════════════════
   4. 십성 계산
   ══════════════════════════════════════════════════ */
const SHENG = {목:'화',화:'토',토:'금',금:'수',수:'목'};
const KE = {목:'토',토:'수',수:'화',화:'금',금:'목'};
function sipseong(dGan, tGan){
  const de = GAN_EL[dGan], te = GAN_EL[tGan];
  const same = (dGan % 2) === (tGan % 2);
  if(de === te) return same ? '비견' : '겁재';
  if(SHENG[de] === te) return same ? '식신' : '상관';
  if(KE[de] === te) return same ? '편재' : '정재';
  if(KE[te] === de) return same ? '편관' : '정관';
  return same ? '편인' : '정인';
}
const SS_GROUP = {비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};

/* 지장간 — [천간 인덱스, 월률분야 비중] (여기·중기·정기) */
const JANGGAN = [
  [[8,.33],[9,.67]],           // 자: 임·계
  [[9,.30],[7,.10],[5,.60]],   // 축: 계·신·기
  [[4,.23],[2,.23],[0,.54]],   // 인: 무·병·갑
  [[0,.33],[1,.67]],           // 묘: 갑·을
  [[1,.30],[9,.10],[4,.60]],   // 진: 을·계·무
  [[4,.23],[6,.23],[2,.54]],   // 사: 무·경·병
  [[2,.33],[5,.30],[3,.37]],   // 오: 병·기·정
  [[3,.30],[1,.10],[5,.60]],   // 미: 정·을·기
  [[4,.23],[8,.23],[6,.54]],   // 신: 무·임·경
  [[6,.33],[7,.67]],           // 유: 경·신
  [[7,.30],[3,.10],[4,.60]],   // 술: 신·정·무
  [[4,.23],[0,.23],[8,.54]]    // 해: 무·갑·임
];

/* 오행 세력 계산 — 위치별 가중치 + 지장간 반영 */
function elementPower(s){
  const pw = {목:0,화:0,토:0,금:0,수:0};
  // 천간: 연 1.0 / 월 1.2 / 일 1.2 / 시 1.0
  [[s.yGan,1.0],[s.mGan,1.2],[s.dGan,1.2],[s.hGan,1.0]].forEach(([g,w]) => {
    if(g !== null) pw[GAN_EL[g]] += w;
  });
  // 지지: 연 1.0 / 월 2.5(득령 가중) / 일 1.5 / 시 1.0 — 지장간 비중대로 분배
  [[s.yJi,1.0],[s.mJi,2.5],[s.dJi,1.5],[s.hJi,1.0]].forEach(([j,w]) => {
    if(j !== null) JANGGAN[j].forEach(([g,r]) => pw[GAN_EL[g]] += w * r);
  });
  return pw;
}

/* 일간 신강·신약 판정 — 나를 돕는 세력(비겁·인성) vs 힘을 빼는 세력(식상·재성·관성) */
function shinStrength(s, pw){
  const de = GAN_EL[s.dGan];
  const inseongEl = Object.keys(SHENG).find(k => SHENG[k] === de); // 나를 생하는 오행
  const support = pw[de] + pw[inseongEl];
  const total = Object.values(pw).reduce((a,b) => a+b, 0);
  const ratio = support / total;
  return {ratio, de, inseongEl,
    grade: ratio >= 0.62 ? '태강' : ratio >= 0.53 ? '신강' : ratio > 0.47 ? '중화' : ratio > 0.38 ? '신약' : '태약'};
}

/* ══════════════════════════════════════════════════
   5. 대운 계산
   ══════════════════════════════════════════════════ */
function calcDaeun(s, gender, y, m, d){
  const yang = s.yGan % 2 === 0;
  const forward = (yang && gender === '남') || (!yang && gender === '여');
  let mi = 0;
  for(let i = 0; i < 60; i++){ if(i % 10 === s.mGan && i % 12 === s.mJi){ mi = i; break; } }
  const cur = jdn(y,m,d);
  const dates = [];
  for(let yy = y-1; yy <= y+1; yy++) JEOLGI.forEach(([jm,jd_]) => dates.push(jdn(jm === 1 ? yy+1 : yy, jm, jd_)));
  dates.sort((a,b) => a-b);
  let diff;
  if(forward){ diff = dates.find(x => x > cur) - cur; }
  else { diff = cur - [...dates].reverse().find(x => x <= cur); }
  const startAge = Math.min(10, Math.max(1, Math.round(diff / 3)));
  const list = [];
  for(let k = 1; k <= 8; k++){
    const idx = ((mi + (forward ? k : -k)) % 60 + 60) % 60;
    list.push({age:startAge + (k-1)*10, gan:idx % 10, ji:idx % 12});
  }
  return {forward, startAge, list};
}

/* ══════════════════════════════════════════════════
   6. 해석 텍스트 뱅크
   ══════════════════════════════════════════════════ */
const ILGAN_DESC = {
  '갑':'하늘로 곧게 뻗는 큰 나무. 시작하는 힘과 리더의 기개를 타고났지만, 꺾이는 걸 못 견디는 자존심이 평생의 변수야.',
  '을':'바위 틈에서도 피어나는 넝쿨과 화초. 부드러움 속에 지독한 생존력을 숨기고 있어서, 유연함이 곧 네 무기야.',
  '병':'만물을 비추는 태양. 존재만으로 주목받는 기운인데, 남을 비추느라 스스로를 태워 소진되는 게 평생의 숙제야.',
  '정':'어둠 속의 촛불과 화롯불. 은은하지만 가장 오래 타는 불이라, 한 분야를 깊게 파고들 때 크게 이뤄.',
  '무':'우직한 큰 산. 쉽게 흔들리지 않아서 믿음을 주지만, 그 무게 때문에 기회 앞에서 반 박자 늦는 게 아쉬워.',
  '기':'만물을 기르는 기름진 밭. 품고 기르는 힘이 좋아서 사람과 돈이 모이는데, 정작 자신을 돌보는 데는 서툴러.',
  '경':'제련되지 않은 원석과 무쇠. 강한 결단력과 승부사 기질을 타고나서, 시련이라는 담금질을 거칠수록 빛나.',
  '신':'세공을 마친 보석이자 예리한 칼. 완벽주의와 미적 감각이 뛰어난데, 그 날이 자신을 향할 때만 조심하면 돼.',
  '임':'막힘없이 흐르는 큰 강과 바다. 스케일 큰 지혜와 포용력이 있지만, 방향을 잃으면 범람하는 양면이 있어.',
  '계':'스며드는 빗물과 이슬. 겉은 조용해도 어디든 스며들어 결국 바위를 뚫는, 가장 과소평가되기 쉬운 대기만성형이야.'
};
const OH_STRONG = {
  '목':'뻗어나가려는 목(木) 기운이 강해서 계획을 세우고 일을 벌이는 추진력이 좋아. 다만 벌인 일을 거두는 힘이 못 따라오면 산만해지기 쉬워.',
  '화':'화(火) 기운이 강해서 열정과 표현력, 존재감이 넘쳐. 대신 에너지를 태우는 속도가 빨라서 번아웃 관리가 평생 숙제야.',
  '토':'토(土) 기운이 강해서 신중하고 묵직하고, 사람들한테 신뢰를 줘. 다만 그 신중함이 길어지면 기회비용이 되는 순간을 조심해.',
  '금':'금(金) 기운이 강해서 원칙과 결단이 분명하고 승부처에서 강해. 날이 선 만큼 관계에서는 부드러운 칼집이 필요하지.',
  '수':'수(水) 기운이 강해서 통찰력과 적응력이 뛰어나고, 판을 읽는 눈을 타고났어. 생각이 깊어지다 실행이 늦어지는 패턴만 조심하면 돼.'
};
const OH_WEAK = {
  '목':'성장과 시작의 동력인 목(木)이 약해서, 결심은 많은데 첫발이 무거운 흐름이 반복될 수 있어. 작게 시작하는 습관이 처방이야.',
  '화':'표현과 확산의 화(火)가 약해서, 실력에 비해 알려지는 속도가 더뎌. 의식적으로 자신을 드러내는 연습이 운을 당겨와.',
  '토':'중심을 잡아주는 토(土)가 약해서 환경 변화에 흔들림이 큰 편이야. 장소·시간·루틴 같은 물리적 기반을 단단히 다져놔.',
  '금':'맺고 끊는 금(金)이 약해서 정리해야 할 걸 오래 붙드는 경향이 있어. 마감과 결단의 규칙을 아예 바깥에 세워두면 편해.',
  '수':'유연함과 지혜의 저장고인 수(水)가 약해서 밀어붙이다 방전되기 쉬워. 휴식과 배움으로 물을 채우는 시간이 필수야.'
};
const OH_GUIDE = {
  '목':{color:'초록 · 청색',dir:'동쪽',act:'새 배움 · 식물 · 아침 산책'},
  '화':{color:'붉은 계열',dir:'남쪽',act:'표현 활동 · 운동 · 모임'},
  '토':{color:'황토 · 베이지',dir:'중앙',act:'루틴 · 정리 · 흙 밟기'},
  '금':{color:'흰색 · 메탈',dir:'서쪽',act:'마무리 습관 · 규칙 · 악기'},
  '수':{color:'검정 · 네이비',dir:'북쪽',act:'독서 · 명상 · 충분한 휴식'}
};
const SIP_STRONG = {
  '비겁':'비겁(자아·주체·동료)의 별이 강해. 남 밑에서 시키는 일만 하기는 어려운 독립형 구조라, 네 이름을 걸고 하는 일에서 힘이 나. 다만 동업이랑 돈거래에서는 사람으로 인한 손재를 조심해.',
  '식상':'식상(표현·창의·생산)의 별이 강해. 만들고, 말하고, 가르치고, 표현할 때 운이 도는 사주야. 재능이 밥이 되는 구조인데, 윗사람이나 규율과 부딪히는 기질은 다듬을수록 이로워.',
  '재성':'재성(재물·현실감각·결과)의 별이 강해. 기회와 돈 냄새를 맡는 감각이 좋고 성과 지향적이지. 다만 재성이 강하면 몸이 바빠지는 팔자라, 건강과 에너지 배분이 곧 재테크야.',
  '관성':'관성(조직·명예·책임)의 별이 강해. 체계 안에서 인정받고 직책과 명예가 따르는 구조야. 대신 책임감이 과해서 스스로를 옥죄는 압박은 의식적으로 내려놔.',
  '인성':'인성(학문·수용·문서)의 별이 강해. 배우고 정리하고 자격을 갖추는 일에 강하고, 문서·계약·공부가 재산이 되는 사주야. 생각이 많아 실행이 늦어지는 것만 조심하면 돼.'
};
const SIP_WEAK = {
  '비겁':'비겁이 약해서 혼자 버티는 힘보다 협업과 조력 속에서 성과가 나는 구조야. 모든 걸 혼자 짊어지려 하지 않아도 돼.',
  '식상':'식상이 약해서 속에 있는 걸 밖으로 꺼내는 통로가 좁아. 글쓰기나 말하기 같은 표현 훈련이 막힌 운을 뚫는 열쇠야.',
  '재성':'재성이 약해서 돈 자체보다 일의 의미가 동력이 되는 유형이야. 재물은 직접 쫓기보다 실력과 시스템 뒤에 따라오게 하는 전략이 맞아.',
  '관성':'관성이 약해서 조직의 규율보다 자율이 맞는 구조야. 명함과 직책보다 실질을 택할 때 스트레스 없이 오래가.',
  '인성':'인성이 약해서 배움을 완성하기 전에 실전으로 나가는 경향이 있어. 자격·문서·근거를 갖추는 습관이 네 뒤를 든든하게 해줘.'
};
const SIP_CAREER = {
  '비겁':'1인 창업, 프리랜서, 전문직, 스포츠·영업 등 개인 성과가 드러나는 분야',
  '식상':'콘텐츠, 교육, 요리, 예술, 기획, 마케팅 등 만들고 표현하는 분야',
  '재성':'사업, 영업, 금융, 유통, 부동산 등 숫자와 성과로 말하는 분야',
  '관성':'공직, 대기업, 법률·행정, 관리직 등 체계와 직책이 있는 분야',
  '인성':'연구, 교육, 저술, 상담, 의료, 자격 기반 전문직 등 지식이 자산인 분야'
};
const MBTI_DESC = {
  INTJ:'전략을 세우고 판을 설계하는 기질', INTP:'구조의 본질을 파고드는 분석 기질',
  ENTJ:'조직과 자원을 움직이는 지휘 기질', ENTP:'판을 뒤집는 발상과 논쟁의 기질',
  INFJ:'사람의 이면을 꿰뚫는 통찰 기질', INFP:'자기만의 가치로 세상을 재는 기질',
  ENFJ:'사람을 모으고 성장시키는 기질', ENFP:'가능성에 불을 붙이는 확산 기질',
  ISTJ:'약속과 체계를 지켜내는 기질', ISFJ:'곁을 지키며 완성하는 헌신 기질',
  ESTJ:'현실을 조직하고 관철하는 기질', ESFJ:'관계의 온도를 조율하는 기질',
  ISTP:'손과 감각으로 문제를 푸는 기질', ISFP:'미감과 온기로 순간을 사는 기질',
  ESTP:'현장에서 승부를 보는 기질', ESFP:'무대 위에서 에너지를 얻는 기질'
};
const SPOUSE_TXT = {
  '비겁':'배우자궁에 비겁이 앉아서, 친구처럼 대등하고 편한 인연이 들어와. 서로 닮아 잘 통하는 대신, 주도권이랑 돈 관리의 경계선은 미리 정해두는 게 이 궁의 사용법이야.',
  '식상':'배우자궁에 식상이 앉아서, 표현이 풍부하고 같이 있으면 즐거운 인연이 들어와. 애정 표현이 곧 관계의 연료니까, 침묵이 길어지는 시기를 제일 조심해.',
  '재성':'배우자궁에 재성이 앉아서, 현실 감각 있고 생활을 안정시켜주는 인연이 들어와. 같이 미래를 설계할 때 강해지는 조합이고, 결혼이 재물운과 연결되는 구조야.',
  '관성':'배우자궁에 관성이 앉아서, 반듯하고 책임감 있는 인연이 들어와. 신뢰가 깊어지는 만큼 서로 기대치도 높아질 수 있으니, 격식보다 솔직함을 택해야 오래가.',
  '인성':'배우자궁에 인성이 앉아서, 어른스럽게 품어주고 지지해주는 인연이 들어와. 안정감이 큰 대신 관계가 보호자-피보호자 구도로 굳지 않게 균형을 잡아.'
};

/* ══════════════════════════════════════════════════
   7. 신살 계산
   ══════════════════════════════════════════════════ */
const SAMHAP = b => [ [8,0,4],[2,6,10],[5,9,1],[11,3,7] ].findIndex(g => g.includes(b));
const YEOKMA = [2,8,11,5], DOHWA = [9,3,6,0], HWAGAE = [4,10,1,7];
const CHEONEUL = {0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],7:[2,6],8:[5,3],9:[5,3]};
function calcSinsal(s){
  const branches = [s.yJi, s.mJi, s.dJi, s.hJi].filter(v => v !== null);
  const found = [];
  const check = (table, base) => branches.includes(table[SAMHAP(base)]);
  const bases = [s.yJi, s.dJi];
  if(bases.some(b => check(YEOKMA, b))) found.push({h:'驛馬', n:'역마살', t:'이동·변화·확장의 별. 한자리에 묶이면 답답해지는 대신, 출장·이주·해외·온라인처럼 판이 움직이는 무대에서 남들보다 빠르게 성과를 내. 역마는 떠돌이 팔자가 아니라, 활동 반경이 곧 재산인 재능이야.'});
  if(bases.some(b => check(DOHWA, b))) found.push({h:'桃花', n:'도화살', t:'매력과 흡인력의 별. 사람의 시선과 호감을 끄는 힘이 있어서 대인 서비스·콘텐츠·영업·무대에서 강력한 무기가 돼. 관리 안 되면 구설이 되지만, 무대 위에 올리면 팬이 되지.'});
  if(bases.some(b => check(HWAGAE, b))) found.push({h:'華蓋', n:'화개살', t:'예술과 정신세계의 별. 홀로 깊어지는 시간에서 영감을 얻는 기질이라 예술·종교·학문·연구와 인연이 깊어. 고독은 이 별의 그늘이 아니라 작업실이야.'});
  if((CHEONEUL[s.dGan] || []).some(b => branches.includes(b))) found.push({h:'天乙', n:'천을귀인', t:'하늘이 붙여준 조력자의 별. 결정적인 순간에 나를 돕는 귀인이 나타나는, 길신 중의 길신이야. 단, 귀인은 움직이는 사람한테 와 — 도움을 청하는 걸 부끄러워하지 마.'});
  return found;
}

/* ══════════════════════════════════════════════════
   8. UI 초기화
   ══════════════════════════════════════════════════ */
const $ = s => document.querySelector(s);
const birthInput=$('#inBirth'), hourSel=$('#inHour'), mbtiSel=$('#inMbti');
const nowY = new Date().getFullYear();
birthInput.addEventListener('input', () => {
  birthInput.value = birthInput.value.replace(/\D/g, '').slice(0, 8);
});
const HOUR_NAMES = ['자시 (23:30~01:29)','축시 (01:30~03:29)','인시 (03:30~05:29)','묘시 (05:30~07:29)','진시 (07:30~09:29)','사시 (09:30~11:29)','오시 (11:30~13:29)','미시 (13:30~15:29)','신시 (15:30~17:29)','유시 (17:30~19:29)','술시 (19:30~21:29)','해시 (21:30~23:29)'];
HOUR_NAMES.forEach((n,i) => hourSel.add(new Option(n, i*2)));
mbtiSel.add(new Option('모릅니다 (사주만 볼게요)', 'unknown'));
Object.keys(MBTI_DESC).forEach(t => mbtiSel.add(new Option(t, t)));

let gender = '남';
let calType = 'solar';
$('#segGender').addEventListener('click', e => {
  if(e.target.tagName !== 'BUTTON') return;
  document.querySelectorAll('#segGender button').forEach(b => b.classList.remove('on'));
  e.target.classList.add('on'); gender = e.target.dataset.v;
});
$('#segCal').addEventListener('click', e => {
  if(e.target.tagName !== 'BUTTON') return;
  document.querySelectorAll('#segCal button').forEach(b => b.classList.remove('on'));
  e.target.classList.add('on'); calType = e.target.dataset.v;
  $('#leapRow').style.display = calType === 'lunar' ? 'flex' : 'none';
});

/* ══════════════════════════════════════════════════
   9. 분석 실행 & 렌더
   ══════════════════════════════════════════════════ */
function bar(name, cls, cnt, total){
  return `<div class="obar"><span class="oname ${cls.startsWith('el')?cls:''}">${name}</span>
  <div class="track"><div class="fill f-${cls.replace('el-','')}" data-w="${total ? (cnt/total*100).toFixed(0) : 0}"></div></div>
  <span class="cnt">${cnt}</span></div>`;
}

/* ── "카카오로 3초 시작하기" 버튼 ──────────────────────────
   아임웹에서는 카카오 로그인/카카오싱크(채널 자동추가)를
   [환경설정 > 소셜 로그인·지도·API]에서 코드 없이 설정합니다.
   이 버튼에 별도 Kakao SDK를 붙이지 마세요 — 아임웹 자체 회원 시스템과
   분리되어 실제 가입·채널추가 기록이 남지 않습니다.
   실제 구현은 이 버튼 자리에 "아임웹 회원가입/로그인 위젯"을 배치하고,
   그 위젯에서 카카오 로그인을 선택하도록 안내하는 방식을 추천드립니다.
   (참고: 소셜 로그인은 아임웹 Starter 이상 요금제에서 지원됩니다)
   지금은 임시로 폼으로 스크롤만 이동시켜 둡니다.
*/
$('#btnKakaoStart').addEventListener('click', () => {
  document.querySelector('#form-section .field').scrollIntoView({behavior:'smooth', block:'center'});
});

/* ── 무료 분석 공유하기 ── */
$('#btnShare').addEventListener('click', async () => {
  const nameEl = $('#rName');
  const who = (nameEl && nameEl.textContent && nameEl.textContent !== '—') ? nameEl.textContent : '내';
  const shareData = {
    title: '명식LAB — 사주 × MBTI 무료 정밀 리포트',
    text: `${who} 사주를 무료로 세워봤는데 신기하더라 — 너도 무료로 열어봐!`,
    url: location.href.split('#')[0]
  };
  if(navigator.share){
    try{ await navigator.share(shareData); }
    catch(e){ /* 사용자가 공유를 취소한 경우는 무시 */ }
  } else {
    try{
      await navigator.clipboard.writeText(shareData.url);
      alert('링크가 복사됐어요. 원하는 곳에 붙여넣어 공유해보세요.');
    }catch(e){
      alert('이 브라우저에서는 공유 기능이 지원되지 않아요. 링크: ' + shareData.url);
    }
  }
});

function parseBirthInput(){
  const raw = birthInput.value.trim();
  if(!/^\d{8}$/.test(raw)) return {err:'생년월일 8자리를 숫자로만 입력해줘 (예: 19970602)'};
  const y = +raw.slice(0,4), m = +raw.slice(4,6), d = +raw.slice(6,8);
  if(y < 1900 || y > nowY) return {err:`연도는 1900~${nowY} 사이로 입력해줘`};
  if(m < 1 || m > 12) return {err:'월은 01~12 사이로 입력해줘'};
  const maxD = calType === 'lunar' ? 30 : new Date(y, m, 0).getDate();
  if(d < 1 || d > maxD) return {err:`${calType === 'lunar' ? '음력 ' : ''}${m}월은 ${maxD}일까지 있어`};
  if(calType === 'solar'){
    const today = new Date();
    const todayNum = today.getFullYear()*10000 + (today.getMonth()+1)*100 + today.getDate();
    if(y*10000 + m*100 + d > todayNum) return {err:'아직 오지 않은 날짜야. 오늘 이전 날짜로 입력해줘'};
  }
  return {y, m, d};
}

$('#btnAnalyze').addEventListener('click', () => {
  const name = $('#inName').value.trim() || '방문자';
  const mbti = mbtiSel.value;
  if(!mbti){ mbtiSel.style.borderColor = 'var(--cinnabar)'; mbtiSel.focus(); return; }
  const hasMbti = mbti !== 'unknown';

  const parsed = parseBirthInput();
  if(parsed.err){ alert(parsed.err); birthInput.style.borderColor = 'var(--cinnabar)'; birthInput.focus(); return; }
  birthInput.style.borderColor = '';
  let y = parsed.y, m = parsed.m, d = parsed.d;
  const h = +hourSel.value;
  let birthLine = '';

  if(calType === 'lunar'){
    const conv = lunarToSolar(y, m, d, $('#inLeap').checked);
    if(!conv || conv.err){ alert(conv ? conv.err : '변환 가능한 범위를 벗어났습니다.'); return; }
    birthLine = `음력 ${y}년 ${$('#inLeap').checked?'윤':''}${m}월 ${d}일 (양력 ${conv.y}년 ${conv.m}월 ${conv.d}일)`;
    y = conv.y; m = conv.m; d = conv.d;
  } else {
    birthLine = `양력 ${y}년 ${m}월 ${d}일`;
  }

  const s = calcSaju(y, m, d, h);

  /* CH1 원국표 */
  $('#rName').textContent = `${name} (${gender}) 님의 사주 원국`;
  $('#rBirth').innerHTML = `${birthLine}<br>${h < 0 ? '시간 미상' : HOUR_NAMES[h/2].split(' ')[0]} 생${hasMbti ? ' · MBTI ' + mbti : ''}`;
  const cols = [
    {label:'時柱 시주', g:s.hGan, j:s.hJi},
    {label:'日柱 일주', g:s.dGan, j:s.dJi, me:true},
    {label:'月柱 월주', g:s.mGan, j:s.mJi},
    {label:'年柱 연주', g:s.yGan, j:s.yJi},
  ];
  $('#rPillars').innerHTML = cols.map(c => {
    if(c.g === null) return `<div class="col"><div class="plabel">${c.label}</div>
      <div class="pchar"><span class="hanja" style="color:var(--muted)">?</span><span class="han">미상</span><span class="ss">—</span></div>
      <div class="pchar"><span class="hanja" style="color:var(--muted)">?</span><span class="han">미상</span><span class="ss">—</span></div></div>`;
    const gTag = c.me ? `<span class="ss me">일원(나)</span>` : `<span class="ss">${sipseong(s.dGan, c.g)}</span>`;
    const jTag = `<span class="ss">${sipseong(s.dGan, JI_JG[c.j])}</span>`;
    return `<div class="col"><div class="plabel">${c.label}</div>
      <div class="pchar"><span class="hanja el-${GAN_EL[c.g]}">${GANH[c.g]}</span><span class="han">${GAN[c.g]}·${GAN_EL[c.g]}</span>${gTag}</div>
      <div class="pchar"><span class="hanja el-${JI_EL[c.j]}">${JIH[c.j]}</span><span class="han">${JI[c.j]}·${JI_EL[c.j]}</span>${jTag}</div></div>`;
  }).join('');
  const ilganName = GAN[s.dGan], ilganEl = GAN_EL[s.dGan];
  $('#rIlgan').innerHTML = `네 일간은 <b>${GANH[s.dGan]}(${ilganName}${ilganEl})</b> — ${ILGAN_DESC[ilganName]}`;

  /* CH2 오행 — 여덟 글자 카운트 (업계 표준 방식) + 과다/발달/고립/없음 분류 */
  const rawCnt = {목:0,화:0,토:0,금:0,수:0};
  [s.yGan,s.mGan,s.dGan,s.hGan].forEach(g => { if(g !== null) rawCnt[GAN_EL[g]]++; });
  [s.yJi,s.mJi,s.dJi,s.hJi].forEach(j => { if(j !== null) rawCnt[JI_EL[j]]++; });
  const total = Object.values(rawCnt).reduce((a,b) => a+b, 0);
  $('#rOhaeng').innerHTML = Object.entries(rawCnt).map(([el,c]) =>
    `<div class="obar"><span class="oname el-${el}">${ELH[el]} ${el}</span>
    <div class="track"><div class="fill f-${el}" data-w="${(c/total*100).toFixed(0)}"></div></div>
    <span class="cnt">${c}개</span></div>`).join('');

  const sortedO = Object.entries(rawCnt).sort((a,b) => b[1]-a[1]);
  const strongEl = sortedO[0][0], weakEl = sortedO[4][0];
  const maxC = sortedO[0][1], minC = sortedO[4][1];
  const maxEls = sortedO.filter(([,c]) => c === maxC).map(([e]) => e);
  const zeros  = sortedO.filter(([,c]) => c === 0).map(([e]) => e);
  const minEls = sortedO.filter(([,c]) => c === minC).map(([e]) => e);
  const elName = arr => arr.map(e => `${ELH[e]}(${e})`).join('·');
  const ilganElNow = GAN_EL[s.dGan];

  // 강한 기운 해설
  let strongMsg;
  if(maxEls.length === 1 && maxC >= 3){
    strongMsg = `<b>과다한 기운 — ${elName(maxEls)} ${maxC}개.</b> 여덟 글자 중 ${maxC}개면 한 기운이 원국을 주도하는 '과다' 구조야. ${OH_STRONG[strongEl]}`;
  } else if(maxEls.length === 1){
    strongMsg = `<b>가장 발달한 기운 — ${elName(maxEls)} ${maxC}개.</b> ${OH_STRONG[strongEl]}`;
  } else {
    strongMsg = `<b>발달한 기운 — ${elName(maxEls)} 각 ${maxC}개 (동률).</b> 특정 기운이 독주하지 않고 ${maxEls.length}가지 기운이 어깨를 나란히 하는 원국이야. 상황마다 꺼내 쓸 카드가 많다는 뜻이라, 한 가지 재능에 올인하기보다 국면마다 다른 힘을 쓰는 유연한 전략이 어울려.`
      + (maxEls.includes(ilganElNow) ? ` 일간의 ${ELH[ilganElNow]}(${ilganElNow}) 기운도 그 안에 있어서 자기 뿌리는 갖춘 편이야.` : ` 다만 일간의 ${ELH[ilganElNow]}(${ilganElNow}) 기운이 주도 그룹에 없으니 그건 챙겨봐야 해.`);
  }
  $('#rOhaengStrong').innerHTML = strongMsg;

  // 약한 기운 해설
  let weakMsg;
  if(zeros.length){
    weakMsg = `<b>원국에 없는 기운 — ${elName(zeros)} 0개.</b> 명리에서 '무(無)오행'은 그 기운과 관련된 영역이 인생의 과제로 남는다는 뜻이야. ` + zeros.map(e => OH_WEAK[e]).join(' ');
  } else if(minEls.length === 1){
    weakMsg = `<b>가장 약한 기운 — ${elName(minEls)} ${minC}개.</b> ${OH_WEAK[weakEl]}`;
  } else {
    weakMsg = `<b>약한 기운 — ${elName(minEls)} 각 ${minC}개.</b> ` + minEls.map(e => OH_WEAK[e]).join(' ');
  }
  $('#rOhaengWeak').innerHTML = weakMsg;

  // 신강·신약 (심화 판정 — 월지·지장간 가중 기준)
  const pw = elementPower(s);
  const shin = shinStrength(s, pw);
  const SHIN_TXT = {
    '태강':`나를 돕는 기운이 압도적인 <b>극신강</b> 명식이야. 힘이 넘치는 만큼 그 힘을 받아낼 출구 — 식상(${SHENG[shin.de]})과 재성(${KE[shin.de]})의 활동이 운을 틔워줘.`,
    '신강':`일간이 든든한 뿌리를 가진 <b>신강</b> 명식이야. 스스로 끌고 가는 힘이 있으니, 기운을 덜어내 쓰는 식상(${SHENG[shin.de]})·재성(${KE[shin.de]}) 방향의 활동이 길이 돼.`,
    '중화':`돕는 힘과 빼는 힘이 균형을 이룬 <b>중화</b>에 가까운 명식이야. 어느 쪽에도 치우치지 않아서 대운의 흐름에 따라 유연하게 태세를 바꿀 수 있는, 명리에서 귀하게 보는 구조지.`,
    '신약':`일간을 돕는 세력이 살짝 아쉬운 <b>신약</b> 명식이야. 나를 생해주는 ${shin.inseongEl}(인성)과 같은 편인 ${shin.de}(비겁)의 기운을 채우는 환경 — 배움, 자격, 사람의 조력 — 이 곧 힘이 돼.`,
    '태약':`일간의 뿌리가 많이 약한 <b>극신약</b> 명식이야. 혼자 버티기보다 ${shin.inseongEl}(인성)의 지원과 조직·귀인의 힘을 빌리는 게 현명하고, 대운에서 ${shin.inseongEl}·${shin.de} 기운이 올 때 크게 일어서.`
  };
  $('#rShin').innerHTML = `<b>일간 ${GANH[s.dGan]}(${shin.de}) 강약 — ${shin.grade}</b><br>${SHIN_TXT[shin.grade]}<br><span style="font-size:11.5px;color:var(--muted)">※ 강약 판정은 글자 수가 아니라, 계절(월지)과 지장간의 힘까지 반영한 심화 기준이야.</span>`;
  const guideTargets = zeros.length ? zeros : minEls;
  $('#rGuide').innerHTML = guideTargets.map(el => {
    const g = OH_GUIDE[el];
    return `<div class="g-item"><span class="gk">${ELH[el]} 보완 색</span><span class="gv">${g.color}</span></div>
    <div class="g-item"><span class="gk">기운의 방위</span><span class="gv">${g.dir}</span></div>
    <div class="g-item"><span class="gk">추천 활동</span><span class="gv">${g.act}</span></div>`;
  }).join('');

  /* CH3 십성 */
  const sg = {비겁:0,식상:0,재성:0,관성:0,인성:0};
  [s.yGan, s.mGan, s.hGan].forEach(gv => { if(gv !== null) sg[SS_GROUP[sipseong(s.dGan, gv)]]++; });
  [s.yJi, s.mJi, s.dJi, s.hJi].forEach(j => { if(j !== null) sg[SS_GROUP[sipseong(s.dGan, JI_JG[j])]]++; });
  const sTotal = Object.values(sg).reduce((a,b) => a+b, 0);
  const SG_LABEL = {비겁:'比劫 비겁',식상:'食傷 식상',재성:'財星 재성',관성:'官星 관성',인성:'印星 인성'};
  $('#rSipseong').innerHTML = Object.entries(sg).map(([k,c]) => bar(SG_LABEL[k], k, c, sTotal)).join('');
  const sortedS = Object.entries(sg).sort((a,b) => b[1]-a[1]);
  const domS = sortedS[0][0], weakS = sortedS[4][0];
  $('#rSipStrong').innerHTML = `<b>주도하는 별 — ${SG_LABEL[domS]} (${sortedS[0][1]}개).</b> ${SIP_STRONG[domS]}`;
  $('#rSipWeak').innerHTML = sortedS[4][1] === 0
    ? `<b>비어 있는 별 — ${SG_LABEL[weakS]}.</b> ${SIP_WEAK[weakS]}`
    : `<b>가장 약한 별 — ${SG_LABEL[weakS]} (${sortedS[4][1]}개).</b> ${SIP_WEAK[weakS]}`;

  /* 천직 (십성 기반 — MBTI는 보조) */
  $('#rCareer').innerHTML = `<b>천직의 방향</b> — 주도하는 별이 ${SG_LABEL[domS]}이니 ${SIP_CAREER[domS]}${hasMbti ? `에서 네 기질(${MBTI_DESC[mbti]})이 가장 자연스럽게 발휘돼.` : `와 잘 맞아.`}`;

  /* CH4 — MBTI 있으면 교차 해석, 없으면 사주 단독 기질 심층 해석 */
  let isE = false, isT = false, isJ = false;
  const ch4Title = document.querySelector('#chMbti h3');
  const ch4Desc = document.querySelector('#chMbti .chapter-desc');
  if(hasMbti){
    ch4Title.textContent = '사주 × MBTI 교차 해석';
    ch4Desc.textContent = '타고난 그릇(명식)과 현재 에너지 사용 습관(MBTI)이 맞물리는 지점, 어긋나는 지점을 짚어줄게.';
    isE = mbti[0] === 'E'; isT = mbti[2] === 'T'; isJ = mbti[3] === 'J';
    $('#rIlganChar').textContent = `${GANH[s.dGan]} ${ilganName}${ilganEl} 일간`;
    $('#rMbtiChar').textContent = mbti;
    const expansive = ['목','화'].includes(strongEl);
    $('#rCross1').innerHTML = `${ilganName}${ilganEl} 일간의 '${ILGAN_DESC[ilganName].split('.')[0]}' 구조 위에, <b style="color:var(--mbti)">${mbti}</b>의 '${MBTI_DESC[mbti]}'이 얹혀 있는 사주야.`;
    $('#rCross2').textContent = isE
      ? (expansive
        ? `외향(E) 기질이 원국의 강한 ${strongEl} 기운과 같은 방향으로 증폭되는 조합이야. 추진력은 최상급인데 브레이크가 없는 구조라, 확장할 때마다 '멈추는 장치'를 일부러 설계해둬야 과열 손실을 막아.`
        : `외향(E) 기질이 원국의 수렴적인 ${strongEl} 기운을 바깥으로 꺼내주는 조합이야. 타고난 그릇은 신중한데 쓰는 손은 활발해서, 안에서 다진 걸 밖에서 파는 구조 — 준비와 발표를 분리하면 제일 강해져.`)
      : (expansive
        ? `내향(I) 기질이 원국의 강한 ${strongEl} 기운을 안으로 눌러 담는 조합이야. 에너지는 큰데 출구가 좁아서 속에서 열이 차는 유형 — 글, 작업물, 기록처럼 '혼자 발산하는 통로'를 꼭 하나 열어둬.`
        : `내향(I) 기질과 원국의 ${strongEl} 기운이 같은 결로 흐르는 안정 조합이야. 깊게 파는 힘이 강점인데 세상에 나를 알리는 속도는 느릴 수 있으니, 결과물이 대신 말하게 하는 포트폴리오 전략이 맞아.`);
    $('#rCross3').textContent = (isT
      ? `판단을 논리(T)로 내리는 습관이 ${domS} 중심의 원국과 만나서, 감정 소모 없이 구조로 승부하는 강점이 있어. `
      : `판단에 사람과 관계(F)를 먼저 놓는 습관이 ${domS} 중심의 원국과 만나서, 사람을 얻어 일을 이루는 강점이 있어. `)
      + (isJ
      ? `계획형(J)이라 대운의 상승 구간을 만나면 준비한 만큼 정직하게 거둬. 대운 그래프에서 상승 구간이 보이면 그 3년 전부터 판을 짜둬.`
      : `유연형(P)이라 대운의 변곡점에서 오히려 기회를 낚아채는 순발력이 있어. 대운 그래프에서 흐름이 꺾이는 지점을 '위기'가 아니라 '환승역'으로 읽어.`);
  } else {
    /* 사주 단독 모드 — 일간 × 주도 십성 */
    ch4Title.textContent = '기질 심층 해석';
    ch4Desc.textContent = '원국의 일간·오행·십성 조합만으로 타고난 기질의 결과 에너지 사용 습관을 읽어줄게.';
    const SIP_ESSENCE = {비겁:'내 이름으로 서려는 힘',식상:'만들고 표현하려는 힘',재성:'결과와 성과를 쥐려는 힘',관성:'책임과 명예를 지키려는 힘',인성:'배우고 갖추려는 힘'};
    $('#rIlganChar').textContent = `${GANH[s.dGan]} ${ilganName}${ilganEl} 일간`;
    $('#rMbtiChar').textContent = SG_LABEL[domS];
    $('#rCross1').innerHTML = `타고난 그릇은 '${ILGAN_DESC[ilganName].split('.')[0]}'이야. 그리고 이 그릇을 실제로 움직이는 엔진은 원국에서 가장 강한 별인 <b style="color:var(--gold-soft)">${SG_LABEL[domS]}</b> — 즉 '${SIP_ESSENCE[domS]}'이지. 일간이 몸이라면, 주도 십성은 그 몸이 향하는 방향이야.`;
    $('#rCross2').textContent = (() => {
      const hasExp = maxEls.some(e => ['목','화'].includes(e));
      const hasCon = maxEls.some(e => ['금','수'].includes(e));
      if(hasExp && hasCon) return `오행의 흐름을 보면 뻗어나가는 기운(목·화)과 모으고 벼리는 기운(금·수)이 공존하는 원국이야. 벌일 때와 거둘 때를 스스로 전환할 수 있는 양손잡이형 — 다만 두 기운이 싸우면 시작도 마무리도 어중간해지니까, 시기를 정해서 한 모드씩 쓰는 게 요령이야.`;
      if(hasExp) return `오행의 흐름이 바깥으로 뻗는 발산형 원국이야. 계획보다 시동이 빠르고 판을 벌이는 데서 에너지를 얻는 대신, 거두고 정리하는 힘은 의식적으로 채워야 해. 확장할 때마다 '멈추는 장치'를 미리 설계해두면 과열 손실을 막을 수 있어.`;
      if(hasCon) return `오행의 흐름이 안으로 모이는 수렴형 원국이야. 깊게 파고 벼리는 힘이 강점이라 완성도로 승부하는 유형인데, 세상에 나를 알리는 속도는 느릴 수 있어. 결과물이 대신 말하게 하는 포트폴리오 전략이 이 원국의 정공법이야.`;
      return `오행의 중심이 토(土)에 놓인 축적형 원국이야. 화려하게 벌이기보다 신뢰와 기반을 차곡차곡 쌓아 올리는 유형이라, 시간이 지날수록 단단해지는 대기만성 구조지. 다만 신중함이 길어져서 기회를 흘려보내는 것만 조심하면 돼.`;
    })();
    const SHIN_STRATEGY = {
      '태강':`일간의 힘이 넘치는 극신강 구조라, 이 기질은 가만히 있으면 안에서 넘쳐. 힘을 덜어내 쓰는 활동 — 만들고, 가르치고, 성과로 바꾸는 일 — 이 곧 건강이자 전략이야. 대운의 상승 구간에서는 판을 키워도 돼.`,
      '신강':`일간의 뿌리가 든든한 신강 구조라, 스스로 끌고 가는 추진이 어울려. 남의 판에 얹히기보다 내 판을 짜는 쪽이 맞고, 대운 상승 구간의 3년 전부터 준비하면 정직하게 거둬.`,
      '중화':`돕는 힘과 빼는 힘이 균형을 이룬 중화 구조라, 대운의 계절에 맞춰 태세를 바꾸는 유연함이 최대 무기야. 상승 구간에는 확장을, 조정 구간에는 축적을 — 흐름을 읽고 모드를 전환하는 게 이 원국의 승부법이지.`,
      '신약':`일간을 돕는 세력이 아쉬운 신약 구조라, 혼자 밀어붙이기보다 배움·자격·사람의 조력을 등에 업는 전략이 맞아. 대운에서 인성·비겁의 기운이 들어오는 시기가 네 도약의 창이야.`,
      '태약':`일간의 뿌리가 많이 약한 구조라, 정면 승부보다 큰 흐름에 올라타는 지혜가 필요해. 조직·귀인·시스템의 힘을 빌리는 건 부끄러운 게 아니라 이 원국의 정석이고, 때가 오면 누구보다 크게 일어서.`
    };
    $('#rCross3').textContent = SHIN_STRATEGY[shin.grade];
  }

  /* CH5 대운 */
  const du = calcDaeun(s, gender, y, m, d);
  const age = nowY - y + 1;
  $('#rDaeunDesc').textContent = `${gender === '남' ? '남성' : '여성'} · ${du.forward ? '순행' : '역행'} 대운 · ${du.startAge}세부터 10년 주기로 큰 운의 계절이 바뀌어.`;
  const scores = du.list.map(p => {
    let sc = 50;
    [[GAN_EL[p.gan], 14], [JI_EL[p.ji], 10]].forEach(([e,w]) => {
      if(e === weakEl || e === sortedO[3][0]) sc += w;
      if(e === strongEl) sc -= w * 0.7;
    });
    return Math.round(sc);
  });
  const bestIdx = scores.indexOf(Math.max(...scores));
  let nowIdx = du.list.findIndex((p,i) => age >= p.age && age < p.age + 10);
  const pts = scores.map((sc,i) => [24 + i * 50, 165 - (sc - 25) * 2.6]);
  const line = pts.map((p,i) => (i ? 'L' : 'M') + p[0].toFixed(0) + ',' + p[1].toFixed(0)).join(' ');
  $('#rGraph').innerHTML = `
    <defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9a24b"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
    <path class="chartarea" fill="url(#gg)" d="${line} L${pts[7][0]},185 L${pts[0][0]},185 Z"/>
    <path class="chartline" d="${line}"/>
    ${pts.map((p,i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === bestIdx ? 5 : 3}" fill="${i === bestIdx ? 'var(--cinnabar)' : '#c9a24b'}"/>
      <text x="${p[0]}" y="182" text-anchor="middle" fill="${i === nowIdx ? '#ff9c7e' : '#9b9485'}" font-size="10">${du.list[i].age}세</text>`).join('')}
    <text x="${pts[bestIdx][0]}" y="${pts[bestIdx][1] - 10}" text-anchor="middle" fill="#ece5d3" font-size="11">▲ 대발복 구간</text>`;
  $('#rDaeun').innerHTML = du.list.map((p,i) => `
    <div class="dcard${i === nowIdx ? ' now' : ''}">
      <div class="dage">${p.age}~${p.age+9}세${i === nowIdx ? ' · 현재' : ''}</div>
      <div class="dganji"><span class="el-${GAN_EL[p.gan]}">${GANH[p.gan]}</span><span class="el-${JI_EL[p.ji]}">${JIH[p.ji]}</span></div>
      <div class="dss">${sipseong(s.dGan, p.gan)} 운</div>
    </div>`).join('');
  const best = du.list[bestIdx];
  $('#rDaeunMsg').innerHTML = (nowIdx >= 0
    ? `현재 <b>${GANH[du.list[nowIdx].gan]}${JIH[du.list[nowIdx].ji]} 대운(${du.list[nowIdx].age}~${du.list[nowIdx].age+9}세)</b> — 일간 기준 ${sipseong(s.dGan, du.list[nowIdx].gan)}의 기운이 들어와 있는 시기야. `
    : `아직 첫 대운이 들어오기 전이라, 원국 본연의 기운으로 사는 시기야. `)
    + `평생 흐름에서 가장 밝은 구간은 <b>${best.age}세 전후의 ${GANH[best.gan]}${JIH[best.ji]} 대운</b>인데, 원국에 부족한 ${ELH[weakEl]}(${weakEl}) 기운이 채워지는 시기랑 맞물려.`;

  /* CH6 인연 */
  const spouseSS = SS_GROUP[sipseong(s.dGan, JI_JG[s.dJi])];
  $('#rSpouse1').innerHTML = `<b>배우자궁 — ${JIH[s.dJi]}(${JI[s.dJi]}·${JI_EL[s.dJi]}), ${SG_LABEL[spouseSS]}의 자리.</b> ${SPOUSE_TXT[spouseSS]}`;
  $('#rSpouse2').innerHTML = `<b>인연의 흐름.</b> 대운 그래프의 상승 구간(${best.age}세 전후)은 인연운에서도 문이 넓게 열리는 시기야. ${!hasMbti ? '새로운 환경과 익숙한 관계망 양쪽 모두에 문을 열어두면 인연의 폭이 넓어져.' : isE ? '외향 기질은 새로운 모임과 활동 반경을 넓히는 게 곧 인연의 통로가 돼.' : '내향 기질은 넓은 만남보다 신뢰가 쌓인 관계망 안에서 인연이 이어지는 유형이야.'}`;

  /* CH7 신살 */
  const sins = calcSinsal(s);
  $('#rSinsal').innerHTML = sins.length
    ? sins.map(x => `<div class="sinsal"><div class="schar">${x.h}</div><div class="sbody"><b>${x.n}</b><p>${x.t}</p></div></div>`).join('')
    : `<div class="sinsal"><div class="schar">淸</div><div class="sbody"><b>맑은 원국</b><p>대표 신살(역마·도화·화개·천을귀인)이 강하게 드러나지 않는 담백한 구조야. 신살의 굴곡 대신 오행과 십성의 균형이 그대로 삶에 반영되는, 노력이 정직하게 쌓이는 원국이지.</p></div></div>`;

  /* ═══ CH 마인드 리딩: 지배 기운 · 남이 보는 나 · 속마음 · 재물 ═══ */
  const SSH = {비견:'比肩',겁재:'劫財',식신:'食神',상관:'傷官',편재:'偏財',정재:'正財',편관:'偏官',정관:'正官',편인:'偏印',정인:'正印'};
  const SS_MEAN = {
    비견:'흔들리지 않는 주체성과 자립심', 겁재:'지는 것을 못 견디는 승부욕과 쟁취 본능',
    식신:'좋아하는 일에 파묻히는 몰입과 생산력', 상관:'틀을 못 견디는 표현력과 반골 기질',
    편재:'큰돈과 기회를 굴리는 감각', 정재:'꼼꼼하고 현실적인 계산 능력',
    편관:'압박 속에서 강해지는 돌파력과 카리스마', 정관:'원칙과 명예를 지키는 자기 관리',
    편인:'남다른 직관력과 창의적인 사고방식', 정인:'조용히 깊어지는 수용력과 학문의 힘'
  };
  const SS_ID = {
    비견:'제 발로 서는 독립가', 겁재:'조용한 승부사', 식신:'한 우물을 즐기는 장인', 상관:'틀 밖의 크리에이터',
    편재:'판을 읽는 사업가', 정재:'지독한 현실주의자', 편관:'위기에서 빛나는 해결사', 정관:'반듯함이 무기인 관리자',
    편인:'꿈꾸는 천재', 정인:'걸어다니는 서재'
  };
  const SS_GOOD = {
    비견:'끝까지 밀고 가는 추진력', 겁재:'판을 뒤집는 승부수', 식신:'꾸준히 만들어내는 생산력', 상관:'남들이 못 보는 표현력',
    편재:'기회를 돈으로 바꾸는 수완', 정재:'새지 않게 지키는 관리력', 편관:'위기에서 빛나는 결단력', 정관:'신뢰를 쌓는 반듯함',
    편인:'번뜩이는 아이디어', 정인:'깊이 있는 통찰'
  };
  const SS_BAD = {
    비견:'황소고집', 겁재:'조급한 욕심', 식신:'게으른 안주', 상관:'말로 인한 구설',
    편재:'한탕주의', 정재:'좀스러운 계산', 편관:'자기 압박', 정관:'체면의 감옥',
    편인:'실행 없는 공상', 정인:'결정 미루기'
  };
  const ssCnt10 = {비견:0,겁재:0,식신:0,상관:0,편재:0,정재:0,편관:0,정관:0,편인:0,정인:0};
  [s.yGan, s.mGan, s.hGan].forEach(gv => { if(gv !== null) ssCnt10[sipseong(s.dGan, gv)]++; });
  [s.yJi, s.mJi, s.dJi, s.hJi].forEach(j => { if(j !== null) ssCnt10[sipseong(s.dGan, JI_JG[j])]++; });
  const ssSorted = Object.entries(ssCnt10).sort((a,b) => b[1]-a[1]);
  const [t1] = ssSorted[0], [t2, t2c] = ssSorted[1];

  // 올해 세운 (입춘 반영)
  const td = new Date();
  const ts = calcSaju(td.getFullYear(), td.getMonth()+1, td.getDate(), -1);
  const cyGanji = GANH[ts.yGan] + JIH[ts.yJi], cyGanjiK = GAN[ts.yGan] + JI[ts.yJi];
  const cyGroup = SS_GROUP[sipseong(s.dGan, ts.yGan)];
  const YEAR_LINE = {
    비겁:'네 주장을 확실히 펼치고 주도권을 잡을 기회가 오는 해', 식상:'만들고 표현하는 것마다 눈에 띄는 해',
    재성:'움직인 만큼 돈이 붙는 해', 관성:'자리와 책임, 이름값이 걸리는 해', 인성:'배움과 문서, 귀인이 들어오는 해'
  };

  /* 지배 기운 */
  let dParas;
  if(t2c === 0){
    $('#dHead').innerHTML = `${t1}(${SSH[t1]}) 외길의 사주`;
    dParas = [
      `네 사주는 여러 별이 나눠 갖는 구조가 아니라, <b>${t1}(${SSH[t1]})</b> 하나가 판을 지배하는 외길 구조야.`,
      `${t1}은 ${SS_MEAN[t1]}을 뜻해. 즉, 너는 뼛속까지 '<b>${SS_ID[t1]}</b>'라는 거지.`,
      `이 기운이 잘 쓰이면 ${SS_GOOD[t1]}이 인생을 끌고 가지만, 어긋나면 ${SS_BAD[t1]}에 발목 잡히기 쉬워. 한 기운에 몰린 사주는 그 기운의 사용법이 곧 인생의 성적표가 돼.`
    ];
  } else {
    $('#dHead').innerHTML = `${t1}(${SSH[t1]})과 ${t2}(${SSH[t2]})의 조화`;
    dParas = [
      `네 사주에서 가장 강하게 작용하는 건 <b>${t1}(${SSH[t1]})</b>과 <b>${t2}(${SSH[t2]})</b>다.`,
      `${t1}은 ${SS_MEAN[t1]}을 뜻하고, ${t2}는 ${SS_MEAN[t2]}을 뜻해.`,
      `즉, 너는 '<b>${SS_ID[t1]}</b>'이면서 동시에 '<b>${SS_ID[t2]}</b>'야.`,
      `이 두 기운이 잘 어우러지면 ${SS_GOOD[t1]}에 ${SS_GOOD[t2]}까지 갖춘 무서운 조합이 되지만, 잘못 어우러지면 ${SS_BAD[t1]}과 ${SS_BAD[t2]} 사이에서 헛도는 수가 있어.`
    ];
  }
  dParas.push(`올해 ${cyGanji}(${cyGanjiK})년은 네 일간 기준 <b>${cyGroup}</b>의 기운이 들어오는 해 — ${YEAR_LINE[cyGroup]}야.`);
  if(sg.비겁 >= 3) dParas.push(`다만 비겁(比劫)의 기운이 ${sg.비겁}개나 되니, 주변 사람들과 재물을 나누지 않고 혼자 독식하려 들다가는 크게 다쳐. 네 비상한 머리를 남을 돕는 데도 좀 써봐 — 그래야 그 복이 다 너한테 돌아오게 되어 있어.`);
  $('#dBody').innerHTML = dParas.map(p => `<p>${p}</p>`).join('');

  /* 타인이 보는 내 모습 */
  const PERSONA_HEAD = {
    비견:'어디서든 제 몫은 해내는 단단한 실속파', 겁재:'웃는 얼굴 뒤에 승부수를 숨긴 야심가',
    식신:'있으면 분위기가 풀리는 여유로운 실력자', 상관:'한마디로 판을 정리하는 아이디어뱅크',
    편재:'발 넓고 손 큰, 어디서든 통하는 마당발', 정재:'맡기면 새는 법이 없는 믿음직한 살림꾼',
    편관:'모두를 압도하는 카리스마 뒤에 숨은 능구렁이 같은 처세술', 정관:'흐트러짐 없는 모범생, 그래서 더 궁금해지는 사람',
    편인:'종잡을 수 없는 4차원, 그런데 미워할 수 없는 천재', 정인:'말수는 적지만 물어보면 답이 나오는 어른'
  };
  const PERSONA_SCENE = {
    비견:'네 몫은 칼같이 해내니까, 팀에서 구멍 걱정 없는 사람으로 통해.',
    겁재:'경쟁이 붙는 순간 눈빛이 달라지는 거, 주변 사람들 다 알아.',
    식신:'네가 있으면 이상하게 분위기가 풀려서, 다들 네 옆자리를 좋아해.',
    상관:'회의가 산으로 갈 때 네 한마디가 판을 정리하는 거, 다들 봤어.',
    편재:'어느 자리에 데려다 놔도 아는 사람이 나오는 네 인맥, 다들 신기해해.',
    정재:'네가 관리하는 건 새는 법이 없어서, 중요한 건 결국 다 너한테 맡기잖아.',
    편관:'위기 상황에서 제일 먼저 침착해지는 게 너라서, 다들 은근히 널 찾아.',
    정관:'지각 한 번 없는 네 성실함이, 말 안 해도 네 명함이 됐어.',
    편인:'멍하니 있다가 툭 던진 한마디에 다들 "쟤 천재인가?" 하고 보게 만드는 그 짜릿한 시선, 너 그거 즐기지?',
    정인:'조용히 있다가 물어보면 정답이 나오니까, 다들 너를 걸어다니는 사전 취급해.'
  };
  const EL_IMAGE = {목:'늠름하고 성실한 큰 나무',화:'어디서든 눈에 띄는 밝은 불',토:'묵직하게 믿음을 주는 산',금:'빈틈없이 벼려진 칼',수:'유연하게 스며드는 물'};
  const pSS = sipseong(s.dGan, s.mGan);
  let score = 52 + sg.관성*7 + sg.재성*6 + sg.식상*5 + (['태강','신강'].includes(shin.grade) ? 4 : 0);
  score = Math.max(58, Math.min(96, score));
  const scoreLine = score >= 90 ? '없으면 안 되는 사람' : score >= 80 ? '일 잘하고 똑똑한 사람' : score >= 70 ? '믿고 맡길 만한 사람' : '조용히 제 몫 하는 사람';
  $('#pHead').textContent = PERSONA_HEAD[pSS];
  $('#pBody').innerHTML = [
    `네 관계 온도가 ${score}도라는 건, 너는 어디 가나 '<b>${scoreLine}</b>' 소리를 듣는다는 뜻이야. 특히 학교나 직장에서 네 존재감은 확실하지.`,
    `<b>${GANH[s.mGan]}${JIH[s.mJi]}(${GAN[s.mGan]}${JI[s.mJi]})</b> 월주를 가졌으니, 사회에서 너는 ${EL_IMAGE[GAN_EL[s.mGan]]}처럼 보이려 하고, 실제로 그렇게 보여.`,
    `월간의 ${GAN[s.mGan]}(${GANH[s.mGan]})은 <b>${pSS}(${SSH[pSS]})</b> — ${SS_MEAN[pSS]}인데, ${hasMbti ? `이게 네 ${mbti} 기질과 합쳐지면` : `이 기운 덕에`} 남들이 생각지 못한 지점을 치고 들어가니, 상사나 동료들이 너를 쉽게 무시 못 하는 거야.`,
    PERSONA_SCENE[pSS],
    `하지만 이건 네가 쓴 '능력자'라는 가면일 뿐이야. 속마음은 다음 장에서 이야기할게.`
  ].map(p => `<p>${p}</p>`).join('');
  $('#pScoreNum').textContent = score + '도';
  setTimeout(() => { $('#pScoreFill').style.width = score + '%'; }, 400);

  /* 내면의 모습 */
  const INNER_HEAD = {
    비견:'"괜찮아"라고 말하지만, 기대는 법을 잊어버린 사람', 겁재:'이기고 싶다는 말을 평생 삼켜온 조용한 승부사',
    식신:'혼자만의 놀이터가 있어야 숨이 쉬어지는 사람', 상관:'자유를 갈망하지만 현실의 벽에 부딪힌 예민한 예술가',
    편재:'통장 잔고보다 더 큰 판을 그리는 몽상 사업가', 정재:'"인생 뭐 있어" 외치면서 잔고를 확인하는 사람',
    편관:'스스로에게 가장 가혹한 검사를 마음에 둔 사람', 정관:'틀을 지키느라 하고 싶은 말을 삼키는 사람',
    편인:'군중 속에서도 혼자만의 세계로 돌아가는 사람', 정인:'어리광 부리고 싶은 마음을 어른스러움으로 덮는 사람'
  };
  const INNER_TXT = {
    비견:'누구에게도 기대지 않으려는 그 고집, 사실은 외로움의 다른 이름이야.',
    겁재:'지는 게 싫어서 아예 시작조차 미루는 완벽주의가 숨어 있어.',
    식신:'좋아하는 것에 파묻혀 있을 때만 진짜 숨이 쉬어지지.',
    상관:'규칙과 시선에서 벗어나 마음껏 표현하고 싶은 갈망이 항상 끓고 있어.',
    편재:'지금보다 큰 판을 꿈꾸느라 정작 현재를 즐기지 못할 때가 많아.',
    정재:'노후와 미래에 대한 경제적 불안감이 마음 한켠에 늘 깔려 있어. 그래서 자꾸만 새로운 돈벌이 수단에 집착하게 되는 거고.',
    편관:'스스로에게 들이대는 잣대가 제일 엄격해서, 너를 제일 많이 혼내는 건 결국 너 자신이야.',
    정관:'"해야 한다"에 갇혀 "하고 싶다"를 자꾸 삼키고 있어.',
    편인:'사회적 가면을 유지하느라 쓴 에너지를 집에서 혼자 공상하거나 쓸데없는 걱정을 하며 소모하곤 하지.',
    정인:'괜찮은 어른인 척하느라 어리광 부리고 싶은 마음을 누르고 있어.'
  };
  const ANXIETY = {
    목:'새로 시작할 타이밍을 놓치고 있는 건 아닐까 하는 조바심',
    화:'아무도 나를 제대로 알아봐주지 않는 것 같은 헛헛함',
    토:'어디에도 완전히 뿌리내리지 못한 것 같은 붕 뜬 느낌',
    금:'끝내지 못한 일들이 쌓여만 가는 찝찝함',
    수:'쉬는 법을 몰라 언젠가 방전될 것 같은 불안'
  };
  const innerJi = s.hJi !== null ? s.hJi : s.dJi;
  const innerPalace = s.hJi !== null ? '시지(태어난 시간의 자리)' : '일지(몸이 앉은 자리)';
  const innerSS = sipseong(s.dGan, JI_JG[innerJi]);
  const anxEl = zeros[0] || minEls[0];
  $('#iHead').textContent = `"${INNER_HEAD[innerSS]}"`;
  $('#iBody').innerHTML = [
    `사회에서는 씩씩한 척, 똑똑한 척 다 하지만 — 집에 돌아와 신발을 벗는 순간 너는 완전히 다른 사람이 되지.`,
    `${innerPalace}에 앉은 <b>${JIH[innerJi]}(${JI[innerJi]})</b>는 일간 기준 <b>${innerSS}(${SSH[innerSS]})</b>의 자리야. ${INNER_TXT[innerSS]}`,
    `특히 ${ELH[anxEl]}(${anxEl}) 기운이 ${zeros.length ? '원국에 비어' : '약하게'} 있으니, 마음 깊은 곳엔 '<b>${ANXIETY[anxEl]}</b>'이 깔려 있어.`,
    hasMbti
      ? (isT ? `${mbti}답게 겉으로는 논리를 앞세우지만, 속마음은 누구보다 감성적이고 때로는 근거 없는 불안에 시달리기도 해.` : `${mbti}답게 겉으로는 다정하게 웃지만, 속으로는 조용히 마음의 손익계산서를 접었다 폈다 하는 순간이 많아.`)
      : `겉과 속의 온도차가 큰 편이라, 그 간극을 아는 사람만이 네 진짜 편이 돼.`,
    `그러니 혼자 있는 시간을 죄책감 없이 즐겨. 그게 네 원국이 스스로를 충전하는 방식이니까.`
  ].map(p => `<p>${p}</p>`).join('');

  /* 재물 리포트 */
  const jJ = ssCnt10['정재'], jP = ssCnt10['편재'], jT = jJ + jP;
  $('#mChips').innerHTML = `<span>正財 정재 ${jJ}개</span><span>偏財 편재 ${jP}개</span>`;
  let mHead, mType;
  if(jT === 0){
    mHead = '"돈복이 없는 게 아니라, 돈이 스며드는 길이 다른 사주"';
    mType = `원국에 재성이 드러나지 않는 <b>무재(無財) 사주</b>야. 겁먹지 마 — 명리에서 무재는 오히려 큰 부자의 원국에서 종종 보이는 구조거든. 돈을 정면으로 쫓으면 달아나고, 실력과 사람을 먼저 쌓으면 돈이 뒤따라 스며드는 유형이야. 네 통장이 아니라 네 이름값을 불리는 게 곧 재테크야.`;
  } else if(jP > jJ){
    mHead = '"월급보다 판돈 — 흐름을 타야 돈이 붙는 사주"';
    mType = `<b>편재(偏財)</b>가 주도하는 원국이야. 기회의 냄새를 맡는 코가 발달해서 고정 월급만으로는 성에 안 차지. 부업, 투자, 사업처럼 판이 움직이는 곳에서 돈이 붙는 대신, 들어온 만큼 나가는 속도도 빠른 게 편재의 습성이야. 지키는 장치 — 자동 저축, 분리 계좌 같은 정재의 습관 — 을 인위적으로라도 만들어둬.`;
  } else if(jJ > jP){
    mHead = '"차곡차곡, 무너지지 않는 탑을 쌓는 사주"';
    mType = `<b>정재(正財)</b>가 주도하는 원국이야. 한 방보다 복리의 힘을 아는 유형이라, 꼼꼼한 계산과 관리력 덕에 큰 사고 없이 자산이 우상향하는 구조지. 다만 너무 지키기만 하면 그릇이 안 커져. 소득의 일부는 의도적으로 '공격 자금'으로 떼어놓고 굴리는 연습을 해.`;
  } else {
    mHead = '"두 개의 지갑 — 안정과 기회를 오가는 사주"';
    mType = `정재와 편재가 나란히 있는 <b>재성혼잡</b> 구조야. 돈 버는 길이 여러 갈래라는 뜻이지만, 동시에 다 벌이면 둘 다 어중간해지는 게 함정이지. 본업(정재)으로 바닥을 단단히 깔고, 편재는 검증된 판에만 태우는 이원화 전략이 네 정답이야.`;
  }
  const isShinStrong = ['태강','신강'].includes(shin.grade);
  const isShinWeak = ['신약','태약'].includes(shin.grade);
  let mShin;
  if(isShinWeak && jT >= 3) mShin = `단, 네 원국은 <b>재다신약(財多身弱)</b> — 돈은 잘 보이는데 그걸 쥐려면 체력이 먼저 받쳐줘야 하는 구조야. 돈 욕심에 몸을 갈아 넣으면 돈도 건강도 같이 새 나가. 컨디션 관리가 곧 네 재테크야.`;
  else if(isShinStrong && jT >= 2) mShin = `일간이 든든해서 <b>재물을 감당하는 그릇 자체가 커.</b> 큰돈이 들어와도 휘둘리지 않는 체질이니, 그릇 크기만큼 판을 키워도 되는 사주야.`;
  else if(isShinStrong) mShin = `벌 힘은 넘치는데 돈이 흘러 들어오는 통로가 아직 좁아. 수익 파이프라인의 개수를 의도적으로 늘리는 게 네 과제야.`;
  else if(isShinWeak) mShin = `재물은 혼자 벌기보다 <b>시스템과 사람의 힘을 빌릴 때</b> 커지는 구조야. 좋은 파트너와 플랫폼이 곧 네 금고야.`;
  else mShin = `힘과 재물의 균형이 좋아서, 무리한 레버리지 없이도 꾸준히 불어나는 안정 구조야.`;
  const moneyDaeun = du.list.filter(p => {
    const g1 = sipseong(s.dGan, p.gan), g2 = sipseong(s.dGan, JI_JG[p.ji]);
    return ['정재','편재'].includes(g1) || ['정재','편재'].includes(g2);
  }).map(p => `${p.age}~${p.age+9}세`);
  let mTiming = moneyDaeun.length
    ? `돈의 문이 크게 열리는 대운은 <b>${moneyDaeun.join(', ')}</b>야. 그 시기의 3년 전부터 종잣돈과 실력을 준비해 둬 — 재성 대운은 준비된 사람에게만 돈을 쥐여주거든.`
    : `앞으로의 8개 대운 안에 재성 대운이 뚜렷하게 들어오진 않아. 대신 해마다 도는 세운에서 재성이 들어오는 해가 기회의 창이 되니, 짧은 창을 놓치지 않는 순발력이 중요해.`;
  if(cyGroup === '재성') mTiming += ` 참고로 올해(${cyGanji}년)가 바로 재성이 들어온 해야. 미루던 돈 공부, 올해 시작해.`;
  $('#mHead').textContent = mHead;
  $('#mBody').innerHTML = [mType, mShin, mTiming].map(p => `<p>${p}</p>`).join('');

  /* 표시 & 챕터 번호 재정렬 */
  const rep = $('#report');
  rep.style.display = 'block';
  let chNo = 1;
  document.querySelectorAll('#report .chapter-head .ch').forEach(el => {
    const sec = el.closest('section');
    if(sec && sec.style.display === 'none') return;
    el.textContent = 'CHAPTER ' + chNo++;
  });
  rep.scrollIntoView({behavior:'smooth'});
  setTimeout(() => document.querySelectorAll('.fill').forEach(f => f.style.width = f.dataset.w + '%'), 300);
});