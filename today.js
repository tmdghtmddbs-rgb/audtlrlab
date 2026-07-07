(function(){
/* ── 부트로더 ──
   1) 아임웹이 위젯 HTML을 비동기로 늦게 끼워 넣는 경우 → #mslToday가 나타날 때까지 재시도
   2) 아임웹이 <script>를 별도 iframe으로 감싸는 경우 → 이 스크립트의 document가 아니라
      부모/최상위 문서에 #mslToday가 있을 수 있으므로 그쪽도 함께 탐색
   두 경우 모두를 포괄해 최대 20초간 시도합니다. */
var __tries = 0;

function __findRootDoc(){
  if(document.getElementById('mslToday')) return document;
  try{ if(window.parent && window.parent !== window && window.parent.document.getElementById('mslToday')) return window.parent.document; }catch(e){}
  try{ if(window.top && window.top !== window && window.top.document.getElementById('mslToday')) return window.top.document; }catch(e){}
  return null;
}

function __waitToday(){
  const found = __findRootDoc();
  if(found){ __bootToday(found); return; }
  if(++__tries < 67) setTimeout(__waitToday, 300); /* 300ms × 67 ≈ 20초 후 포기 */
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', __waitToday);
}else{
  __waitToday();
}

function __bootToday(ROOT){
  if(window.__mslTodayBooted) return; /* 중복 실행 방지 */
  window.__mslTodayBooted = true;


/* ══════════════════════════════════════════════════
   0. 설정 — 배포 시 여기만 수정하면 됩니다
   ══════════════════════════════════════════════════ */
const CONFIG = {
  PAYMENT_ENABLED: false,        // false면 구독/500원 버튼을 완전히 숨기고 "로그인 후 무료" 버튼만 노출
  SUBSCRIBE_URL: '/subscribe',   // 아임웹 정기구독 상품 페이지 URL로 교체 (PAYMENT_ENABLED:true일 때만 사용)
  DAYPASS_URL:   '/daypass',     // 500원 하루 이용권 상품 페이지 URL로 교체 (PAYMENT_ENABLED:true일 때만 사용)
  TEST_PASS:     'oneul',        // 테스트용: 주소 뒤에 ?pass=oneul 붙이면 오늘 하루 잠금 해제
  UNLOCK_FOR_MEMBERS: true,      // true면 아임웹 로그인 회원(간편가입 포함)은 무료로 전체 공개
  LOGIN_URL: '/login',           // 사이트 자체 로그인 버튼을 못 찾을 때 이동할 기본 로그인 페이지 주소
  /* 아임웹은 코드 위젯 안에서 쓸 수 있는 "로그인 여부" 공식 JS API를 제공하지 않아서,
     로그인/장바구니 위젯이 로그인 시에만 보여주는 문구(보통 "로그아웃")를 페이지에서 찾아
     로그인 여부를 판단합니다. 사이트에 로그인 후 F12 콘솔에서 document.body.innerText.includes('로그아웃')
     가 true로 나오는지 확인해보고, 실제로 쓰는 문구가 다르면 아래 배열에 그 문구를 추가해주세요. */
  LOGIN_INDICATOR_TEXTS: ['로그아웃', '마이페이지', 'Logout']
  /* PAYMENT_ENABLED를 다시 true로 바꾸면 구독/일일이용권 결제 버튼이 그대로 되살아납니다.
     구독자는 카톡 알림톡의 개인화 링크(?pass=발급토큰)로 들어오면 자동 해제되는 구조를 권장. */
};

/* ══════════════════════════════════════════════════
   1. 기초 데이터 (report.js와 동일한 만세력 엔진)
   ══════════════════════════════════════════════════ */
const GAN  = ['갑','을','병','정','무','기','경','신','임','계'];
const GANH = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JI   = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const JIH  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN_EL = ['목','목','화','화','토','토','금','금','수','수'];
const JI_EL  = ['수','토','목','목','토','화','화','토','금','금','토','수'];
const JI_JG  = [9,5,0,1,4,2,3,5,6,7,4,8];
const ELH = {목:'木',화:'火',토:'土',금:'金',수:'水'};
const JEOLGI = [[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,8],[9,8],[10,8],[11,7],[12,7],[1,6]];
const HOUR_NAMES = ['자시 (23:30~01:29)','축시 (01:30~03:29)','인시 (03:30~05:29)','묘시 (05:30~07:29)','진시 (07:30~09:29)','사시 (09:30~11:29)','오시 (11:30~13:29)','미시 (13:30~15:29)','신시 (15:30~17:29)','유시 (17:30~19:29)','술시 (19:30~21:29)','해시 (21:30~23:29)'];

function jdn(y,m,d){
  const a=Math.floor((14-m)/12), yy=y+4800-a, mm=m+12*a-3;
  return d + Math.floor((153*mm+2)/5) + 365*yy + Math.floor(yy/4) - Math.floor(yy/100) + Math.floor(yy/400) - 32045;
}

/* 음력 → 양력 (1900–2100) */
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

/* 사주 계산 */
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
  return {yGan,yJi,mGan,mJi,dGan,dJi,hGan,hJi,dIdx};
}

/* 십성 */
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

/* 지장간 + 오행 세력 + 신강약 */
const JANGGAN = [
  [[8,.33],[9,.67]],[[9,.30],[7,.10],[5,.60]],[[4,.23],[2,.23],[0,.54]],[[0,.33],[1,.67]],
  [[1,.30],[9,.10],[4,.60]],[[4,.23],[6,.23],[2,.54]],[[2,.33],[5,.30],[3,.37]],[[3,.30],[1,.10],[5,.60]],
  [[4,.23],[8,.23],[6,.54]],[[6,.33],[7,.67]],[[7,.30],[3,.10],[4,.60]],[[4,.23],[0,.23],[8,.54]]
];
function elementPower(s){
  const pw = {목:0,화:0,토:0,금:0,수:0};
  [[s.yGan,1.0],[s.mGan,1.2],[s.dGan,1.2],[s.hGan,1.0]].forEach(([g,w]) => { if(g !== null) pw[GAN_EL[g]] += w; });
  [[s.yJi,1.0],[s.mJi,2.5],[s.dJi,1.5],[s.hJi,1.0]].forEach(([j,w]) => {
    if(j !== null) JANGGAN[j].forEach(([g,r]) => pw[GAN_EL[g]] += w * r);
  });
  return pw;
}
function shinStrength(s, pw){
  const de = GAN_EL[s.dGan];
  const inseongEl = Object.keys(SHENG).find(k => SHENG[k] === de);
  const support = pw[de] + pw[inseongEl];
  const total = Object.values(pw).reduce((a,b) => a+b, 0);
  const ratio = support / total;
  return {ratio, de, inseongEl,
    grade: ratio >= 0.62 ? '태강' : ratio >= 0.53 ? '신강' : ratio > 0.47 ? '중화' : ratio > 0.38 ? '신약' : '태약'};
}

/* ══════════════════════════════════════════════════
   2. 오늘의 운세 전용 계산
   ══════════════════════════════════════════════════ */

/* 오늘/내일의 일진 간지 (자정 기준) */
function dayGanji(date){
  const idx = ((jdn(date.getFullYear(), date.getMonth()+1, date.getDate()) + 49) % 60 + 60) % 60;
  return {idx, gan: idx % 10, ji: idx % 12};
}

/* 지지 관계: 육합·삼합·충·형·원진·해·파 */
const YUKHAP = {0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
const SAMHAP_GROUPS = [[8,0,4],[2,6,10],[5,9,1],[11,3,7]];
const HYEONG_SETS = [[2,5,8],[1,7,10]];
const HYEONG_PAIR = [[0,3]];
const JAHYEONG = [4,6,9,11];
const WONJIN = [[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];
const HAE   = [[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];
const PA    = [[0,9],[1,4],[2,11],[3,6],[5,8],[7,10]];
const inPair = (list,a,b) => list.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
function branchRelation(a, b){ // a: 오늘 지지, b: 내 일지 — 우선순위대로 하나만 반환
  if(((a+6)%12) === b) return '충';
  if(YUKHAP[a] === b) return '육합';
  if(a !== b && SAMHAP_GROUPS.some(g => g.includes(a) && g.includes(b))) return '삼합';
  if(HYEONG_SETS.some(g => g.includes(a) && g.includes(b) && a!==b) || inPair(HYEONG_PAIR,a,b) || (a===b && JAHYEONG.includes(a))) return '형';
  if(inPair(WONJIN,a,b)) return '원진';
  if(inPair(HAE,a,b)) return '해';
  if(inPair(PA,a,b)) return '파';
  return '무난';
}

/* 12운성 — 일간이 오늘 지지에서 갖는 기세 */
const JANGSENG = {0:11, 2:2, 4:2, 6:5, 8:8, 1:6, 3:9, 5:9, 7:0, 9:3}; // 일간별 장생 지지
const UNSEONG_NAMES = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const UNSEONG_ENERGY = {장생:80,목욕:55,관대:75,건록:90,제왕:100,쇠:60,병:40,사:30,묘:25,절:20,태:45,양:65};
const UNSEONG_DESC = {
  장생:'새싹이 돋는 기세. 시작·배움·첫 만남에 힘이 실리는 하루야.',
  목욕:'물기를 머금은 불안정한 기세. 감정 기복과 유혹에 흔들리기 쉬우니 큰 결정은 미뤄.',
  관대:'예복을 갖춰 입는 기세. 격식 있는 자리, 공식적인 일에서 인정받기 좋아.',
  건록:'제 녹을 받는 기세. 실력이 그대로 성과로 연결되는, 일하기 가장 좋은 컨디션이야.',
  제왕:'기운이 정점에 오른 날. 추진력은 최고지만 독주와 과욕만 조심하면 돼.',
  쇠:'정점을 지나 한 김 식은 기세. 무리한 확장보다 지키고 다듬는 게 이로워.',
  병:'기운이 처지는 날. 몸 신호에 민감해지고, 중요한 일은 오전에 끝내.',
  사:'움직임이 멎는 기세. 실행보다 사색·정리·마무리에 어울리는 하루야.',
  묘:'창고에 들어간 기세. 겉으로 조용하지만 안으로 쌓기 좋은 날 — 저축·공부·기록.',
  절:'끊어지고 다시 이어지기 직전의 기세. 비워내는 일, 끝내는 일에 오히려 길해.',
  태:'새 생명이 잉태되는 기세. 아이디어를 심기 좋은 날이니 씨앗을 골라둬.',
  양:'자라나기 직전의 온양. 준비와 계획이 곧 다음 달의 성과가 되는 날이야.'
};
function unseong(dGan, ji){
  const js = JANGSENG[dGan];
  const forward = dGan % 2 === 0;
  const step = forward ? ((ji - js) % 12 + 12) % 12 : ((js - ji) % 12 + 12) % 12;
  return UNSEONG_NAMES[step];
}

/* 일진 신살: 오늘이 내 기준으로 귀인·역마·도화·공망 일인지 */
const SAMHAP = b => SAMHAP_GROUPS.findIndex(g => g.includes(b));
const YEOKMA = [2,8,11,5], DOHWA = [9,3,6,0];
const CHEONEUL = {0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],7:[2,6],8:[5,3],9:[5,3]};
function daySinsal(user, tJi){
  const out = [];
  if((CHEONEUL[user.dGan] || []).includes(tJi))
    out.push({c:'天乙', n:'천을귀인 일', t:'하늘의 조력자가 드는 날. 부탁·상담·미팅은 오늘 잡아 — 평소보다 도움의 손이 잘 잡혀.'});
  if(YEOKMA[SAMHAP(user.dJi)] === tJi)
    out.push({c:'驛馬', n:'역마 일', t:'움직임의 별이 드는 날. 이동·출장·외근·새 판 벌이기에 길하고, 한자리에 묶이면 답답해져.'});
  if(DOHWA[SAMHAP(user.dJi)] === tJi)
    out.push({c:'桃花', n:'도화 일', t:'매력이 오르는 날. 소개팅·발표·촬영·첫인상이 중요한 자리라면 오늘을 써.'});
  const xun = Math.floor(user.dIdx / 10);
  const v1 = ((10 - xun * 2) % 12 + 12) % 12;
  if(tJi === v1 || tJi === (v1 + 1) % 12)
    out.push({c:'空亡', n:'공망 일', t:'기운이 비는 날. 계약·확답·큰 지출은 하루 미루고, 대신 정리·휴식·내면 작업엔 오히려 좋아.'});
  return out;
}

/* ══════════════════════════════════════════════════
   3. 해석 텍스트 뱅크
   ══════════════════════════════════════════════════ */
const DAY_SS_TXT = { // 오늘의 천간이 나에게 갖는 십성 → 하루의 주제
  비견:'나와 같은 기운이 들어와 자아가 또렷해지는 날이야. 내 페이스대로 밀고 가되, 고집과 지출 경쟁만 조심해.',
  겁재:'경쟁의 기운이 드는 날. 승부처에선 강해지지만 돈거래·동업 얘기는 오늘 결론 내지 마.',
  식신:'만들고 표현하는 기운이 드는 날. 요리·글·기획 뭐든 손을 움직이면 결과가 남고, 먹복도 따라와.',
  상관:'틀을 깨는 기운이 드는 날. 아이디어는 번뜩이는데 말이 앞서기 쉬워 — 윗사람 앞에선 한 템포 늦게 말해.',
  편재:'큰돈과 기회가 스치는 날. 움직인 만큼 들어오지만, 쉽게 번 만큼 쉽게 나가는 흐름이니 지갑 단속.',
  정재:'착실한 재물의 기운이 드는 날. 꼼꼼한 계산·정리·계약 검토에 길하고, 성실함이 그대로 돈이 돼.',
  편관:'압박과 도전의 기운이 드는 날. 부담스러운 일일수록 정면돌파가 답이고, 피하면 오히려 쫓겨.',
  정관:'질서와 인정의 기운이 드는 날. 공적인 자리, 평가받는 일, 격식 갖출 일에서 점수를 따.',
  편인:'번뜩이는 직감이 드는 날. 공부·연구·기획엔 좋지만 의심이 늘어 결정이 느려지니 마감을 정해둬.',
  정인:'배움과 문서의 기운이 드는 날. 계약서·자격·공부·어른의 조언 — 종이에 적힌 것들이 너를 돕는다.'
};
const AREA_TXT = { // 오늘의 십성 그룹 → 분야별 해석
  재물:{
    비겁:'주변에 돈 쓸 일과 나눌 일이 생기는 흐름. 더치페이 원칙을 지키면 손재를 막아.',
    식상:'재주가 돈이 되는 날. 내가 만든 것, 내가 한 말이 수익의 씨앗이 되니 결과물을 밖으로 내놔.',
    재성:'재물의 별이 직접 드는 날. 거래·협상·구매 결정에 유리하지만 욕심이 붙는 순간 흐름이 꺾여.',
    관성:'돈보다 신용이 쌓이는 날. 오늘의 지출은 소비가 아니라 평판 투자라고 생각해.',
    인성:'문서가 돈을 지키는 날. 계약서 조항, 보증, 영수증 — 종이를 꼼꼼히 보면 새는 돈이 잡혀.'
  },
  애정:{
    비겁:'친구 같은 편안함이 통하는 날. 꾸미기보다 솔직함이 매력이 되는데, 주도권 다툼만 피해.',
    식상:'표현이 곧 애정운인 날. 마음에 있는 말을 오늘 꺼내면 평소의 두 배로 전달돼.',
    재성:'상대를 챙기는 만큼 돌아오는 날. 작은 선물, 밥 한 끼가 관계의 온도를 확 올려.',
    관성:'진지한 기류가 흐르는 날. 관계의 정의를 내리기 좋고, 어른스러운 태도가 점수를 따.',
    인성:'말보다 들어주는 게 애정인 날. 조언하려 들지 말고 품어주면 관계가 깊어져.'
  },
  직장:{
    비겁:'내 몫을 지켜야 하는 날. 성과의 지분을 분명히 하되, 동료와의 신경전은 소모전이 돼.',
    식상:'아이디어와 실력이 드러나는 날. 발표·제안·보고는 오늘로 당겨 — 단, 윗사람 지적은 흘려들어.',
    재성:'성과와 숫자로 말하게 되는 날. 결과물을 정리해 보여주면 평가가 따라와.',
    관성:'책임이 실리는 날. 부담스러워도 오늘 맡은 역할이 다음 직책의 복선이야.',
    인성:'배우고 준비하는 날. 실행보다 기획·문서·결재 라인 정비에 공을 들이면 이득.'
  },
  건강:{
    비겁:'에너지가 넘쳐 과로하기 쉬운 날. 운동은 좋지만 승부욕 붙는 운동은 부상 주의.',
    식상:'입이 즐거운 날이라 과식·과음 경계. 손을 쓰는 활동이 스트레스를 씻어줘.',
    재성:'몸이 바빠지는 날. 일정을 다 소화하려 말고 하나는 덜어내 — 체력이 곧 재물이야.',
    관성:'긴장과 압박이 몸으로 오는 날. 어깨·목·소화기 신호를 무시하지 말고 스트레칭.',
    인성:'회복의 기운이 드는 날. 잠·따뜻한 음식·조용한 시간이 보약이 되는 하루야.'
  }
};
const AREA_TIP = {
  재물:{비겁:'오늘의 지출은 반드시 기록으로 남기기',식상:'만든 결과물 하나를 공개하기',재성:'가격 비교는 세 곳 이상',관성:'약속 시간 10분 먼저 도착하기',인성:'계약·문서는 소리 내어 한 번 읽기'},
  애정:{비겁:'이기려 하지 말고 웃어넘기기',식상:'아껴둔 말 한마디 오늘 전하기',재성:'작은 선물 하나 준비하기',관성:'먼저 정중하게 연락하기',인성:'끝까지 듣고 마지막에 말하기'},
  직장:{비겁:'내가 한 일은 내 이름으로 정리해두기',식상:'초안이라도 오늘 공유하기',재성:'성과를 숫자 한 줄로 요약하기',관성:'싫은 일 하나 정면으로 처리하기',인성:'배운 것 하나를 문서로 남기기'},
  건강:{비겁:'운동 강도 80%에서 멈추기',식상:'저녁 한 끼는 가볍게',재성:'일정 하나 비우고 걷기',관성:'한 시간마다 어깨 펴기',인성:'오늘은 30분 일찍 잠들기'}
};
const REL_TXT = {
  충:{h:'沖', t:'오늘의 지지가 네 일지를 정면으로 <b>충(沖)</b>하는 날이야. 계획이 틀어지고 동선이 꼬이기 쉬운데, 이 흔들림은 나쁜 게 아니라 "자리를 옮기라"는 신호에 가까워. 이동·변경엔 유연하게, 말다툼과 서두른 결정만 피하면 오히려 막힌 게 뚫리는 날이 돼.'},
  육합:{h:'合', t:'오늘의 지지가 네 일지와 <b>육합(六合)</b>을 이루는 날이야. 사람이 붙고 일이 순하게 묶이는 흐름이라 만남·협의·화해·계약 조율에 길해. 오래 미뤄둔 연락이 있다면 오늘이 그 타이밍이야.'},
  삼합:{h:'三合', t:'오늘의 지지가 네 일지와 <b>삼합(三合)</b>의 기운으로 묶이는 날이야. 뜻이 맞는 사람들과 판을 짜기 좋은, 협력과 팀워크의 하루 — 혼자 하던 일도 오늘은 같이 도모해봐.'},
  형:{h:'刑', t:'오늘의 지지가 네 일지와 <b>형(刑)</b>을 이루는 날이야. 규칙·서류·말실수에서 탈이 나기 쉬운 기운이니 벌금·계약 조항·구설을 특히 조심하고, 오늘은 원칙대로만 움직여.'},
  원진:{h:'怨嗔', t:'오늘의 지지가 네 일지와 <b>원진(怨嗔)</b> 관계인 날이야. 이유 없이 거슬리고 서운해지는 미묘한 기류가 흐르니, 중요한 관계일수록 오늘은 판단을 유보하고 하루 재워둬.'},
  해:{h:'害', t:'오늘의 지지가 네 일지를 <b>해(害)</b>하는 날이야. 가까운 사이에서 오해가 스며들기 쉬운 기운 — 전달은 문자보다 목소리로, 부탁은 명확한 문장으로 해.'},
  파:{h:'破', t:'오늘의 지지가 네 일지와 <b>파(破)</b>를 이루는 날이야. 사소한 균열·분실·일정 펑크가 생기기 쉬우니 소지품과 예약을 한 번 더 확인해.'},
  무난:{h:'安', t:'오늘의 지지는 네 일지와 부딪히지도 얽히지도 않는 <b>무난한 관계</b>야. 외부 변수가 적은 날이니, 오늘의 성패는 온전히 네 페이스 관리에 달려 있어.'}
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
const MBTI_JP = { // 오늘의 십성 그룹 × J/P 처방
  비겁:{J:'계획을 지키는 힘이 오늘의 무기야. 단, 남에게도 네 기준을 강요하면 충돌 — 내 일정만 통제해.',
        P:'즉흥이 고집으로 보일 수 있는 날. 하나만은 정해진 시간에 끝내서 신뢰를 지켜.'},
  식상:{J:'계획서보다 시제품이 먼저인 날. 완성도 욕심을 내려놓고 초안을 공개해.',
        P:'아이디어가 쏟아지는 날 — 그중 하나만 골라 오늘 안에 형태로 만들어.'},
  재성:{J:'숫자와 일정이 맞아떨어지는 날. 미뤄둔 정산·예산 정리를 오늘 끝내면 두고두고 편해.',
        P:'기회가 눈에 띄는 날이지만 충동 결제도 같이 와. 24시간 장바구니 규칙을 지켜.'},
  관성:{J:'책임이 실릴수록 빛나는 날. 부담스러운 역할을 먼저 손들어 가져가.',
        P:'규칙이 답답하게 느껴지는 날이지만, 오늘만은 절차대로 — 그게 제일 빠른 길이야.'},
  인성:{J:'배움을 체계로 바꾸기 좋은 날. 흩어진 메모를 하나의 문서로 묶어.',
        P:'영감이 잘 드는 날이니 입력을 늘려 — 책 한 챕터, 강의 하나가 다음 달의 밑천이 돼.'}
};
const MBTI_EI = {
  E:'바깥에서 에너지를 얻는 네게 오늘의 기운은 사람 속에서 증폭돼 — 단, 말의 양보다 질을 챙겨.',
  I:'안에서 힘을 모으는 네겐 혼자 정리하는 한 시간이 오늘 운의 촉매야. 그 시간을 먼저 확보해.'
};
const MISSION = {
  비견:'오늘은 남과 비교하지 않은 채로 하루를 끝내보기',
  겁재:'이기고 싶은 순간에 한 번만 져주기',
  식신:'뭐든 하나를 만들어서 남기기 — 글 한 줄이라도',
  상관:'하고 싶은 말을 딱 한 박자 늦게 하기',
  편재:'오늘 번 기회 하나를 기록해두기',
  정재:'가계부 또는 지출 내역 열어보기',
  편관:'가장 피하고 싶은 일을 가장 먼저 하기',
  정관:'약속 시간 전부 5분씩 일찍 움직이기',
  편인:'떠오른 직감 하나를 메모로 붙잡기',
  정인:'고마운 어른 한 명에게 안부 전하기'
};
const LUCKY_NUM = {목:'3 · 8',화:'2 · 7',토:'5 · 10',금:'4 · 9',수:'1 · 6'};
const OH_GUIDE = {
  목:{color:'초록 · 청색',dir:'동쪽',act:'새 배움 · 산책 · 식물 곁'},
  화:{color:'붉은 계열',dir:'남쪽',act:'표현 · 운동 · 밝은 조명'},
  토:{color:'황토 · 베이지',dir:'중앙 · 익숙한 곳',act:'정리 · 루틴 · 흙 밟기'},
  금:{color:'흰색 · 메탈',dir:'서쪽',act:'마무리 · 결단 · 음악'},
  수:{color:'검정 · 네이비',dir:'북쪽',act:'독서 · 명상 · 휴식'}
};

/* ══════════════════════════════════════════════════
   4. 점수 엔진 — 근거가 남는 계산
   ══════════════════════════════════════════════════ */
function favorableGroups(grade){
  if(grade === '태강' || grade === '신강') return {fav:['식상','재성','관성'], bad:['비겁','인성'], w:1};
  if(grade === '태약' || grade === '신약') return {fav:['비겁','인성'], bad:['재성','관성'], w:1};
  return {fav:['식상','재성'], bad:[], w:0.5}; // 중화는 약하게만 반영
}
function analyzeToday(user, shin, today){
  const factors = [];
  let score = 50;
  const F = favorableGroups(shin.grade);

  const ssGan = sipseong(user.dGan, today.gan);
  const gGan = SS_GROUP[ssGan];
  const ssJiGan = JI_JG[today.ji];
  const gJi = SS_GROUP[sipseong(user.dGan, ssJiGan)];

  if(F.fav.includes(gGan)){ score += 12*F.w; factors.push({t:`${ELH[GAN_EL[today.gan]]} 기운이 용신 방향 (+)`, d:'up'}); }
  else if(F.bad.includes(gGan)){ score -= 8*F.w; factors.push({t:`${ELH[GAN_EL[today.gan]]} 기운이 부담 방향 (−)`, d:'down'}); }
  if(F.fav.includes(gJi)){ score += 8*F.w; factors.push({t:`지지 속 ${gJi} 기운 (+)`, d:'up'}); }
  else if(F.bad.includes(gJi)){ score -= 6*F.w; factors.push({t:`지지 속 ${gJi} 기운 (−)`, d:'down'}); }

  const rel = branchRelation(today.ji, user.dJi);
  const relAdj = {육합:8, 삼합:6, 충:-12, 형:-7, 원진:-6, 해:-4, 파:-3, 무난:0}[rel];
  score += relAdj;
  if(rel !== '무난') factors.push({t:`일지와 ${rel} (${relAdj>0?'+':'−'})`, d:relAdj>0?'up':'down'});

  let extraChung = 0;
  [user.yJi, user.mJi, user.hJi].forEach(j => { if(j !== null && ((today.ji+6)%12) === j) extraChung++; });
  if(extraChung){ score -= Math.min(extraChung*3, 6); factors.push({t:'다른 기둥과도 충 (−)', d:'down'}); }

  const sins = daySinsal(user, today.ji);
  sins.forEach(s => {
    const adj = {천을귀인:8, 역마:3, 도화:4, 공망:-6}[s.n.split(' ')[0]] || 0;
    score += adj;
    factors.push({t:`${s.n} (${adj>0?'+':'−'})`, d:adj>0?'up':'down'});
  });

  const us = unseong(user.dGan, today.ji);
  const energy = UNSEONG_ENERGY[us];
  score += (energy - 50) * 0.2;

  score = Math.max(12, Math.min(98, Math.round(score)));

  /* 분야별 점수 */
  const areaAdj = (map) => Math.max(10, Math.min(98, Math.round(score + (map[gGan]||0))));
  const areas = {
    재물: areaAdj({재성:12, 식상:7, 비겁:-8, 인성:2, 관성:0}) + (rel==='충'?-4:0),
    애정: areaAdj({식상:8, 재성:6, 관성:5, 인성:2, 비겁:-3}) + (rel==='육합'||rel==='삼합'?8:0) + (rel==='원진'?-8:0) + (sins.some(s=>s.n.startsWith('도화'))?6:0),
    직장: areaAdj({관성:12, 인성:8, 식상:5, 재성:4, 비겁:-4}) + (sins.some(s=>s.n.startsWith('공망'))?-5:0),
    건강: Math.round((energy + score)/2) + (rel==='충'?-6:0) + (rel==='형'?-4:0)
  };
  Object.keys(areas).forEach(k => areas[k] = Math.max(10, Math.min(98, areas[k])));

  return {score, factors, rel, sins, us, energy, ssGan, gGan, areas};
}

/* 시간대 분석 */
function analyzeTimes(user, today, F){
  const rows = [];
  for(let i = 0; i < 12; i++){
    const hg = ((today.gan % 5) * 2 + i) % 10;
    const g = SS_GROUP[sipseong(user.dGan, hg)];
    let sc = 0; let why = [];
    if(F.fav.includes(g)){ sc += 2; why.push(`${g}의 때`); }
    if(F.bad.includes(g)){ sc -= 2; }
    if((CHEONEUL[user.dGan]||[]).includes(i)){ sc += 3; why.unshift('귀인이 드는 때'); }
    if(YUKHAP[i] === user.dJi){ sc += 2; why.push('일지와 합 — 만남·협의 유리'); }
    if(((i+6)%12) === user.dJi){ sc -= 3; why = ['일지 충 — 이동·구설 주의']; }
    rows.push({i, sc, why: why[0] || `${g}의 흐름`});
  }
  const sorted = [...rows].sort((a,b) => b.sc - a.sc);
  return {good: sorted.slice(0,2), bad: sorted[sorted.length-1]};
}

/* ══════════════════════════════════════════════════
   5. 프로필 저장/불러오기
   ══════════════════════════════════════════════════ */
const $ = s => ROOT.querySelector(s);
const PROFILE_KEY = 'mslab_profile';
function saveProfile(p){ try{ localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }catch(e){} }
function loadProfile(){ try{ return JSON.parse(localStorage.getItem(PROFILE_KEY)); }catch(e){ return null; } }

/* ══════════════════════════════════════════════════
   6. 잠금
   ══════════════════════════════════════════════════ */
function todayKey(){
  const n = new Date();
  return `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}`;
}
/* 아임웹 로그인 회원(간편가입 포함) 감지: 로그인 시에만 렌더되는 문구를 페이지에서 탐색 */
function isLoggedIn(){
  if(!CONFIG.UNLOCK_FOR_MEMBERS) return false;
  try{
    const qs = new URLSearchParams(location.search);
    if(qs.get('testlogin') === '1') return true; /* 로컬 테스트용: 실제 로그인 위젯 없이도 강제로 로그인 상태 확인 */
    if(!ROOT.body) return false;
    const clone = ROOT.body.cloneNode(true);
    clone.querySelectorAll('script,style').forEach(el => el.remove()); /* 스크립트 자신의 주석 텍스트가 섞여 들어가는 것 방지 */
    const text = clone.textContent || '';
    return CONFIG.LOGIN_INDICATOR_TEXTS.some(t => text.includes(t));
  }catch(e){ return false; }
}
function isUnlocked(){
  try{
    if(isLoggedIn()) return true; // 로그인 회원은 결제 없이 전체 공개
    const qs = new URLSearchParams(location.search);
    if(qs.get('pass') === CONFIG.TEST_PASS){ localStorage.setItem('mslab_daypass', todayKey()); return true; }
    if(localStorage.getItem('mslab_sub') === '1') return true;          // 구독 플래그 (추후 서버 검증으로 교체)
    if(localStorage.getItem('mslab_daypass') === todayKey()) return true; // 오늘 하루 이용권
  }catch(e){}
  return false;
}

/* ══════════════════════════════════════════════════
   7. UI 초기화
   ══════════════════════════════════════════════════ */
const birthInput = $('#tBirth'), hourSel = $('#tHour'), mbtiSel = $('#tMbti');
birthInput.addEventListener('input', () => { birthInput.value = birthInput.value.replace(/\D/g,'').slice(0,8); });
HOUR_NAMES.forEach((n,i) => hourSel.add(new Option(n, i*2)));
Object.keys(MBTI_DESC).forEach(t => mbtiSel.add(new Option(t, t)));

let calType = 'solar';
$('#tSegCal').addEventListener('click', e => {
  if(e.target.tagName !== 'BUTTON') return;
  ROOT.querySelectorAll('#tSegCal button').forEach(b => b.classList.remove('on'));
  e.target.classList.add('on'); calType = e.target.dataset.v;
  $('#tLeapRow').style.display = calType === 'lunar' ? 'flex' : 'none';
});

let genderType = 'male'; // 'male' | 'female' — 현재는 표시 목적이며 점수 계산에는 영향 없음
$('#tSegGender').addEventListener('click', e => {
  if(e.target.tagName !== 'BUTTON') return;
  ROOT.querySelectorAll('#tSegGender button').forEach(b => b.classList.remove('on'));
  e.target.classList.add('on'); genderType = e.target.dataset.v;
});

const WEEK = ['일','월','화','수','목','금','토'];
function dateLabel(d){ return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (${WEEK[d.getDay()]})`; }
$('#tTodayDate').textContent = dateLabel(new Date());

/* ══════════════════════════════════════════════════
   8. 실행 & 렌더
   ══════════════════════════════════════════════════ */
function runToday(profile){
  const p = profile;
  let y = p.y, m = p.m, d = p.d;
  if(p.cal === 'lunar'){
    const conv = lunarToSolar(y, m, d, p.leap);
    if(!conv || conv.err){ alert(conv ? conv.err : '변환 범위를 벗어났어요.'); return; }
    y = conv.y; m = conv.m; d = conv.d;
  }
  const user = calcSaju(y, m, d, p.hour);
  const pw = elementPower(user);
  const shin = shinStrength(user, pw);
  const F = favorableGroups(shin.grade);

  const now = new Date();
  const today = dayGanji(now);
  const A = analyzeToday(user, shin, today);

  /* 프로필 칩 */
  $('#tProfileForm').style.display = 'none';
  $('#tProfileChip').style.display = 'flex';
  $('#tpName').textContent = `${p.name || '방문자'} 님의 오늘`;
  $('#tpBirth').textContent = `${p.cal==='lunar'?'음력 ':''}${p.y}.${String(p.m).padStart(2,'0')}.${String(p.d).padStart(2,'0')} · ${p.hour>=0 ? HOUR_NAMES[p.hour/2].split(' ')[0]+'생' : '시간 미상'}${p.gender==='male' ? ' · 남' : p.gender==='female' ? ' · 여' : ''} · 일간 ${GANH[user.dGan]}(${GAN[user.dGan]}${GAN_EL[user.dGan]})${p.mbti!=='unknown' ? ' · '+p.mbti : ''}`;

  /* CH1 일력 카드 */
  $('#ilDate').textContent = dateLabel(now);
  $('#ilGanji').innerHTML =
    `<div class="ig iel-${GAN_EL[today.gan]}">${GANH[today.gan]}<small>${GAN[today.gan]} · ${GAN_EL[today.gan]}</small></div>
     <div class="ig iel-${JI_EL[today.ji]}">${JIH[today.ji]}<small>${JI[today.ji]} · ${JI_EL[today.ji]}</small></div>`;
  $('#ilSub').innerHTML = `${GAN[today.gan]}${JI[today.ji]}일 · 이 기운은 너에게 <b>${A.ssGan}(${A.gGan})</b>으로 들어와`;
  $('#ilDesc').innerHTML = DAY_SS_TXT[A.ssGan];

  /* CH2 총운 */
  $('#tScoreTitle').textContent = A.score >= 80 ? '크게 열리는 날' : A.score >= 65 ? '순풍이 부는 날' : A.score >= 45 ? '평온하게 흐르는 날' : A.score >= 30 ? '한 템포 쉬어갈 날' : '몸을 낮출 날';
  $('#tScore').textContent = A.score;
  $('#tScoreFill').style.width = A.score + '%';
  $('#tFactors').innerHTML = A.factors.length
    ? A.factors.map(f => `<span class="tfactor ${f.d}">${f.t}</span>`).join('')
    : '<span class="tfactor">특별한 충돌도 가세도 없는 담백한 일진</span>';
  $('#tSummary').innerHTML = `${shin.grade} 사주인 네게 오늘의 ${ELH[GAN_EL[today.gan]]}·${ELH[JI_EL[today.ji]]} 기운은 ${A.score>=60?'힘을 보태는 쪽':A.score>=45?'무게가 반반인 쪽':'힘을 빼가는 쪽'}이야. ${REL_TXT[A.rel].t}`;
  $('#tUnseong').textContent = `${A.us} (12운성)`;
  $('#tEnergyPct').textContent = A.energy + '%';
  $('#tEnergyFill').style.width = A.energy + '%';
  $('#tEnergyDesc').textContent = UNSEONG_DESC[A.us];

  /* CH3 분야별 */
  const areaMeta = [['재물','💰'],['애정','🤝'],['직장','🏛'],['건강','🌿']];
  const areaName = {재물:'재물운',애정:'애정·대인운',직장:'직장·학업운',건강:'건강운'};
  $('#tAreas').innerHTML = areaMeta.map(([k, ico]) => `
    <div class="tarea">
      <div class="tarea-top"><b>${ico} ${areaName[k]}</b><span class="tscore-mini">${A.areas[k]}</span></div>
      <p>${AREA_TXT[k][A.gGan]}</p>
      <p class="ttip">${AREA_TIP[k][A.gGan]}</p>
    </div>`).join('');

  /* CH4 사건 */
  $('#tEvent').innerHTML = `<b>${REL_TXT[A.rel].h}</b> · ${REL_TXT[A.rel].t}`;
  $('#tSinsalDay').innerHTML = A.sins.length
    ? A.sins.map(s => `<div class="tsd"><span class="tsd-char">${s.c}</span><p><b>${s.n}</b>${s.t}</p></div>`).join('')
    : `<div class="tsd"><span class="tsd-char">平</span><p><b>특별 신살 없음</b>오늘은 귀인도 역마도 들지 않는 평이한 일진 — 변수 없이 실력대로 가는 날이야.</p></div>`;

  /* CH5 시간대 */
  const T = analyzeTimes(user, today, F);
  const timeRow = (t, cls, badge) => `
    <div class="ttime ${cls}"><span class="tt-badge">${badge}</span>
      <span class="tt-name">${HOUR_NAMES[t.i].split(' ')[0]}</span>
      <p>${HOUR_NAMES[t.i].match(/\((.+)\)/)[1]} · ${t.why}</p></div>`;
  $('#tTimes').innerHTML =
    T.good.map(t => timeRow(t, 'good', '길시')).join('') + timeRow(T.bad, 'bad', '주의');

  /* CH6 행운 + 미션 */
  const helpEl = (shin.grade === '신약' || shin.grade === '태약') ? shin.inseongEl
               : (shin.grade === '신강' || shin.grade === '태강') ? SHENG[shin.de]
               : GAN_EL[today.gan];
  const g = OH_GUIDE[helpEl];
  $('#tLucky').innerHTML = `
    <div class="tg-item"><span class="tgk">행운의 색</span><span class="tgv">${g.color}</span></div>
    <div class="tg-item"><span class="tgk">행운의 방향</span><span class="tgv">${g.dir}</span></div>
    <div class="tg-item"><span class="tgk">행운의 숫자</span><span class="tgv">${LUCKY_NUM[helpEl]}</span></div>
    <div class="tg-item"><span class="tgk">권하는 행동</span><span class="tgv">${g.act}</span></div>`;
  $('#tMission').innerHTML = `<b>오늘의 미션</b> — ${MISSION[A.ssGan]}`;

  /* CH7 MBTI */
  if(p.mbti && p.mbti !== 'unknown'){
    const jp = p.mbti.includes('J') ? 'J' : 'P';
    const ei = p.mbti[0] === 'E' ? 'E' : 'I';
    $('#tChMbti').style.display = '';
    $('#tCross').innerHTML =
      `<b>${p.mbti}</b> — ${MBTI_DESC[p.mbti]}을 가진 네게, ${A.gGan}이 드는 오늘은 이렇게 쓰는 게 좋아.<br><br>
       ${MBTI_JP[A.gGan][jp]}<br><br>${MBTI_EI[ei]}`;
  } else {
    $('#tChMbti').style.display = 'none';
  }

  /* 내일 티저 */
  const tm = new Date(now); tm.setDate(tm.getDate()+1);
  const tomorrow = dayGanji(tm);
  const tmSS = sipseong(user.dGan, tomorrow.gan);
  $('#tTomorrow').textContent = `${GANH[tomorrow.gan]}${JIH[tomorrow.ji]} · ${GAN[tomorrow.gan]}${JI[tomorrow.ji]}일`;
  $('#tTomorrowDesc').textContent = `내일은 ${SS_GROUP[tmSS]}의 기운이 드는 날 — 오늘과는 결이 다른 하루가 준비되고 있어.`;

  /* 잠금 처리 */
  const zone = $('#tLockZone');
  if(isUnlocked()) zone.classList.remove('locked');
  else zone.classList.add('locked');

  /* 결제 버튼 노출 여부 (PAYMENT_ENABLED가 false면 완전히 숨김) */
  $('#btnSubscribe').style.display = CONFIG.PAYMENT_ENABLED ? '' : 'none';
  $('#btnDaypass').style.display = CONFIG.PAYMENT_ENABLED ? '' : 'none';
  if(CONFIG.PAYMENT_ENABLED){
    $('#btnSubscribe').href = CONFIG.SUBSCRIBE_URL;
    $('#btnDaypass').href = CONFIG.DAYPASS_URL;
  }

  /* 로그인 유도 버튼: 로그인 회원 무료 공개 기능이 켜져 있고, 아직 로그인 전일 때만 노출 */
  const loginCta = $('#btnLoginCta');
  if(CONFIG.UNLOCK_FOR_MEMBERS && !isLoggedIn()){
    loginCta.style.display = '';
    loginCta.href = CONFIG.LOGIN_URL;
  } else {
    loginCta.style.display = 'none';
  }
  $('#tLockNote').textContent = CONFIG.PAYMENT_ENABLED
    ? '구독 중이라면 카톡으로 받은 링크로 접속하면 자동으로 열려요'
    : '로그인 후에도 안 열리면 새로고침 한 번 해주세요';

  $('#tReport').style.display = 'block';
  setTimeout(() => $('#tReport').scrollIntoView({behavior:'smooth', block:'start'}), 150);
}

/* 로그인 유도 버튼 클릭 시: 사이트 자체 로그인 버튼/링크를 찾아 대신 클릭 (없으면 CONFIG.LOGIN_URL로 이동) */
function triggerSiteLogin(e){
  e.preventDefault();
  try{
    const candidates = ROOT.querySelectorAll('a,button');
    for(const el of candidates){
      if(el === e.currentTarget) continue;
      const t = (el.textContent || '').trim();
      if(t === '로그인' || t.includes('로그인') && !t.includes('로그인하고')){
        el.click(); return;
      }
    }
  }catch(err){}
  location.href = CONFIG.LOGIN_URL;
}
$('#btnLoginCta').addEventListener('click', triggerSiteLogin);

/* 입력 검증 */
function parseBirth(){
  const raw = birthInput.value.trim();
  if(!/^\d{8}$/.test(raw)) return {err:'생년월일 8자리를 숫자로만 입력해줘 (예: 19970602)'};
  const y = +raw.slice(0,4), m = +raw.slice(4,6), d = +raw.slice(6,8);
  const nowY = new Date().getFullYear();
  if(y < 1900 || y > nowY) return {err:`연도는 1900~${nowY} 사이로 입력해줘`};
  if(m < 1 || m > 12) return {err:'월은 01~12 사이로 입력해줘'};
  const maxD = calType === 'lunar' ? 30 : new Date(y, m, 0).getDate();
  if(d < 1 || d > maxD) return {err:`${calType==='lunar'?'음력 ':''}${m}월은 ${maxD}일까지 있어`};
  return {y, m, d};
}

$('#btnToday').addEventListener('click', () => {
  const parsed = parseBirth();
  if(parsed.err){ alert(parsed.err); birthInput.focus(); return; }
  const profile = {
    name: $('#tName').value.trim(),
    cal: calType, leap: $('#tLeap').checked,
    y: parsed.y, m: parsed.m, d: parsed.d,
    hour: +hourSel.value, mbti: mbtiSel.value,
    gender: genderType
  };
  saveProfile(profile);
  runToday(profile);
});

$('#btnEditProfile').addEventListener('click', () => {
  const p = loadProfile();
  if(p){
    $('#tName').value = p.name || '';
    birthInput.value = `${p.y}${String(p.m).padStart(2,'0')}${String(p.d).padStart(2,'0')}`;
    hourSel.value = p.hour; mbtiSel.value = p.mbti;
    calType = p.cal;
    ROOT.querySelectorAll('#tSegCal button').forEach(b => b.classList.toggle('on', b.dataset.v === p.cal));
    $('#tLeapRow').style.display = p.cal === 'lunar' ? 'flex' : 'none';
    $('#tLeap').checked = !!p.leap;
    genderType = p.gender || 'male';
    ROOT.querySelectorAll('#tSegGender button').forEach(b => b.classList.toggle('on', b.dataset.v === genderType));
  }
  $('#tProfileChip').style.display = 'none';
  $('#tProfileForm').style.display = 'block';
  $('#tReport').style.display = 'none';
  $('#tProfileForm').scrollIntoView({behavior:'smooth', block:'start'});
});

$('#btnResetProfile').addEventListener('click', () => {
  if(!confirm('저장된 명식 정보를 지우고 처음 화면으로 돌아갈까요?')) return;
  try{ localStorage.removeItem('mslab_profile'); }catch(e){}
  $('#tName').value = '';
  birthInput.value = '';
  hourSel.value = -1; mbtiSel.value = 'unknown';
  calType = 'solar';
  ROOT.querySelectorAll('#tSegCal button').forEach(b => b.classList.toggle('on', b.dataset.v === 'solar'));
  $('#tLeapRow').style.display = 'none';
  $('#tLeap').checked = false;
  genderType = 'male';
  ROOT.querySelectorAll('#tSegGender button').forEach(b => b.classList.toggle('on', b.dataset.v === 'male'));
  $('#tProfileChip').style.display = 'none';
  $('#tProfileForm').style.display = 'block';
  $('#tReport').style.display = 'none';
  $('#tProfileForm').scrollIntoView({behavior:'smooth', block:'start'});
});

/* 공유 */
$('#btnTShare').addEventListener('click', async () => {
  const shareData = {
    title: '명식LAB — 오늘의 운세',
    text: '자정마다 새로 열리는 오늘의 명식, 너도 확인해봐 🔮',
    url: location.href.split('?')[0]
  };
  if(navigator.share){ try{ await navigator.share(shareData); }catch(e){} }
  else {
    try{ await navigator.clipboard.writeText(shareData.url); alert('링크가 복사됐어요.'); }
    catch(e){ alert('링크: ' + shareData.url); }
  }
});

/* 재방문자: 저장된 명식으로 자동 실행 */
(function init(){
  const p = loadProfile();
  if(p && p.y){ runToday(p); }
})();

} /* __bootToday 끝 */

})();
