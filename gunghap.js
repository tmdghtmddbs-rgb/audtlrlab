(function(){
  if (!document.getElementById('btnGunghapAnalyze')) return;  /* 궁합 리포트 페이지가 아니면 아무 것도 하지 않음 */
/* ══════════════════════════════════════════════════
   1. 기초 데이터 (개인 리포트 위젯과 동일한 계산 엔진)
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
const SHENG = {목:'화',화:'토',토:'금',금:'수',수:'목'};
const KE = {목:'토',토:'수',수:'화',화:'금',금:'목'};

function jdn(y,m,d){
  const a=Math.floor((14-m)/12), yy=y+4800-a, mm=m+12*a-3;
  return d + Math.floor((153*mm+2)/5) + 365*yy + Math.floor(yy/4) - Math.floor(yy/100) + Math.floor(yy/400) - 32045;
}

/* ── 음력→양력 변환 (1900–2100) ── */
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

/* ── 사주 계산 ── */
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

function sipseong(dGan, tGan){
  const de = GAN_EL[dGan], te = GAN_EL[tGan];
  const same = (dGan % 2) === (tGan % 2);
  if(de === te) return same ? '비견' : '겁재';
  if(SHENG[de] === te) return same ? '식신' : '상관';
  if(KE[de] === te) return same ? '편재' : '정재';
  if(KE[te] === de) return same ? '편관' : '정관';
  return same ? '편인' : '정인';
}

const ILGAN_DESC = {
  '갑':'하늘로 곧게 뻗는 큰 나무처럼 시작하는 힘과 리더의 기개를 타고났어.',
  '을':'바위 틈에서도 피어나는 넝쿨과 화초처럼 부드러움 속에 지독한 생존력을 숨기고 있어.',
  '병':'만물을 비추는 태양처럼 존재만으로 주목받는 기운을 가졌어.',
  '정':'어둠 속의 촛불처럼 은은하지만 가장 오래 타는 힘을 가졌어.',
  '무':'우직한 큰 산처럼 쉽게 흔들리지 않는 믿음을 줘.',
  '기':'만물을 기르는 기름진 밭처럼 품고 기르는 힘이 좋아.',
  '경':'제련되지 않은 원석과 무쇠처럼 강한 결단력과 승부사 기질을 타고났어.',
  '신':'세공을 마친 보석처럼 완벽주의와 미적 감각이 뛰어나.',
  '임':'막힘없이 흐르는 큰 강처럼 스케일 큰 지혜와 포용력이 있어.',
  '계':'스며드는 빗물처럼 겉은 조용해도 어디든 스며드는 대기만성형이야.'
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

/* 이름 받침 유무에 따른 한국어 조사 헬퍼 */
function hasBatchim(word){
  if(!word) return false;
  const last = word[word.length-1];
  const code = last.charCodeAt(0);
  if(code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}
function voc(name){ return name + (hasBatchim(name) ? '아' : '야'); }       // 아/야
function eunNeun(name){ return name + (hasBatchim(name) ? '은' : '는'); }   // 은/는
function iGa(name){ return name + (hasBatchim(name) ? '이' : '가'); }       // 이/가
function eulReul(name){ return name + (hasBatchim(name) ? '을' : '를'); }   // 을/를

const SS_GROUP = {비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
const GROUP_GIVES = {비겁:'대등한 동료애', 식상:'풍부한 표현과 애정', 재성:'현실적인 안정감', 관성:'책임감 있는 신뢰', 인성:'포용과 정서적 안정'};
const SPOUSE_TEXT = {
  비겁: (self,other) => `${self}의 배우자궁에는 비겁이 앉아 있어. ${other} 앞에서 ${eunNeun(self)} 자기도 모르게 '친구처럼 편하게 대하는 사람'이 돼. 대등하게 티키타카하는 걸 좋아하지만, 주도권이나 씀씀이를 두고 은근히 지지 않으려는 마음도 함께 있을 거야.`,
  식상: (self,other) => `${self}의 배우자궁에는 식상이 앉아 있어. ${other} 앞에서 ${eunNeun(self)} 자기도 모르게 '표현을 아끼지 않는 사람'이 돼. 좋아하는 마음을 말과 행동으로 자꾸 드러내고 싶어 하고, 그만큼 ${other}의 반응 하나하나에 예민하게 반응할 거야.`,
  재성: (self,other) => `${self}의 배우자궁에는 재성이 앉아 있어. ${other} 앞에서 ${eunNeun(self)} 자기도 모르게 '현실을 챙기는 사람'이 돼. 함께하는 미래나 생활의 구체적인 부분을 은근히 먼저 계산하고 챙기는 쪽이 ${self}일 확률이 높아.`,
  관성: (self,other) => `${self}의 배우자궁에는 관성이 앉아 있어. ${other} 앞에서 ${eunNeun(self)} 자기도 모르게 '책임감 있는 모습을 보이려는 사람'이 돼. 반듯하게 잘하고 싶은 마음이 커서, 가끔은 그 마음이 스스로를 압박하는 쪽으로 흐를 수도 있어.`,
  인성: (self,other) => `${self}의 배우자궁에는 인성이 앉아 있어. ${other} 앞에서 ${eunNeun(self)} 자기도 모르게 '어른스럽게 품어주는 사람'이 돼. ${iGa(other)} 지쳐 보일 때 먼저 다가가 챙기고 싶어 하고, 잔소리처럼 들려도 결국 다 ${eulReul(other)} 위한 마음일 거야.`
};

/* ══════════════════════════════════════════════════
   2. 사주 궁합 스코어링 로직 (유일한 점수 체계)
   ══════════════════════════════════════════════════ */
const GAN_HAP  = [[0,5],[1,6],[2,7],[3,8],[4,9]]; // 갑기·을경·병신·정임·무계
const YUKHAP   = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
const CHUNGJI  = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const SAMHAP = b => [ [8,0,4],[2,6,10],[5,9,1],[11,3,7] ].findIndex(g => g.includes(b));
const pairIn = (list,a,b) => list.some(p => p.includes(a) && p.includes(b));

function ilganRelation(g1,g2){
  if(g1 === g2) return {type:'동일'};
  if(pairIn(GAN_HAP,g1,g2)) return {type:'합'};
  const e1 = GAN_EL[g1], e2 = GAN_EL[g2];
  if(e1 === e2) return {type:'비화'};
  if(SHENG[e1] === e2) return {type:'상생', dir:'A→B'};
  if(SHENG[e2] === e1) return {type:'상생', dir:'B→A'};
  if(KE[e1] === e2) return {type:'상극', dir:'A→B'};
  if(KE[e2] === e1) return {type:'상극', dir:'B→A'};
  return {type:'중립'};
}
const ILGAN_SCORE = {합:95, 동일:78, 상생:88, 비화:72, 상극:45, 중립:60};

function jiRelation(j1,j2){
  if(j1 === j2) return {type:'동일'};
  if(pairIn(YUKHAP,j1,j2)) return {type:'육합'};
  if(pairIn(CHUNGJI,j1,j2)) return {type:'충'};
  if(SAMHAP(j1) === SAMHAP(j2)) return {type:'삼합'};
  const e1 = JI_EL[j1], e2 = JI_EL[j2];
  if(SHENG[e1] === e2 || SHENG[e2] === e1) return {type:'상생'};
  if(KE[e1] === e2 || KE[e2] === e1) return {type:'상극'};
  return {type:'중립'};
}
const JI_SCORE = {육합:96, 삼합:90, 동일:74, 상생:70, 중립:56, 상극:40, 충:22};

function analyzeElements(cnt){
  const entries = Object.entries(cnt);
  const maxV = Math.max(...entries.map(e => e[1]));
  const minV = Math.min(...entries.map(e => e[1]));
  const domList = entries.filter(e => e[1] === maxV).map(e => e[0]);
  const weakList = entries.filter(e => e[1] === minV).map(e => e[0]);
  const balanced = domList.length >= 4; // 8글자 중 4개 이상 오행이 동률이면 사실상 편중이 없는 균형형
  return {domList, weakList, balanced};
}
function ohaengComp(cntA, cntB){
  const a = analyzeElements(cntA), b = analyzeElements(cntB);
  const aFeedsB = a.domList.some(d => b.weakList.includes(SHENG[d]));
  const bFeedsA = b.domList.some(d => a.weakList.includes(SHENG[d]));
  const domOverlap = a.domList.filter(d => b.domList.includes(d));
  const conquerPair = (() => {
    for(const d1 of a.domList) for(const d2 of b.domList){ if(KE[d1] === d2 || KE[d2] === d1) return [d1,d2]; }
    return null;
  })();
  /* 타입(=점수) 판정은 실제 보완/동조/상극 관계로만 결정한다.
     '균형형'인지 여부는 타입 판정에 관여하지 않고, 텍스트 서술에서만 별도로 쓴다.
     (균형형이라는 이유로 진짜 상호보완 관계를 가려버리는 걸 방지) */
  let type;
  if(aFeedsB && bFeedsA) type = '상호보완';
  else if(aFeedsB || bFeedsA) type = '일방보완';
  else if(domOverlap.length) type = '동조';
  else if(conquerPair) type = '상극';
  else type = '무관';
  return {type, a, b, aFeedsB, bFeedsA, domOverlap, conquerPair};
}
const OHAENG_SCORE = {상호보완:92, 일방보완:78, 동조:64, 상극:42, 무관:56};
const elName = list => list.map(e => `${ELH[e]}(${e})`).join('·');
const elNameCap = list => elName(list.slice(0,3)) + (list.length > 3 ? ' 등' : '');
/* 균형형이면 "고르게 발달했다"로, 아니면 "OO 기운이 강하다"로 — 각자의 오행 프로필을 정직하게 서술 */
function domPhrase(name, info){
  return info.balanced ? `${eunNeun(name)} 오행이 고르게 발달한 균형형이야` : `${eunNeun(name)} ${elName(info.domList)} 기운이 강한 편이야`;
}

/* 궁합 유형 네임 — 점수 하나로 캐릭터화 (공유 임팩트용) */
function gunghapName(score){
  if(score >= 85) return {name:'천생연분', tag:'이유를 몰라도 자꾸 끌리는 사이'};
  if(score >= 70) return {name:'찰떡궁합', tag:'말 안 해도 척척 맞는 사이'};
  if(score >= 55) return {name:'티키타카 인연', tag:'티격태격해도 결국 웃게 되는 사이'};
  if(score >= 40) return {name:'밀당 인연', tag:'서로를 알아가는 재미가 있는 사이'};
  return {name:'다름이 매력인 사이', tag:'정반대라서 오히려 배우는 게 많은 사이'};
}

/* 사주 약점 → MBTI 축 매핑 */
const SAJU_LABEL = {ilgan:'일간 궁합', ji:'일지(생활 리듬) 궁합', ohaeng:'오행 궁합'};
const WEAK_TO_AXIS = {ilgan:'conflict', ji:'energy', ohaeng:'comm'};
const AXIS_LABEL = {comm:'마음이 통하는 방식', conflict:'다투고 화해하는 방식', energy:'함께 있는 시간의 온도'};
const AXIS_SUB = {comm:'S · N', conflict:'T·F / J·P', energy:'E · I'};
const CH_TITLE = {ilgan:'다투고 화해하는 방식부터 맞춰볼까', ji:'함께 있는 시간의 온도부터 맞춰볼까', ohaeng:'마음이 통하는 방식부터 알아볼까'};

/* ══════════════════════════════════════════════════
   3. 해설 텍스트 뱅크
   ══════════════════════════════════════════════════ */
const ILGAN_TEXT = {
  합: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일간은 하늘에서 짝을 이루는 <b>천간합(天干合)</b> 관계야. 명리학에서 최상급으로 꼽는 궁합 신호 중 하나로, 이유 없이 끌리고 서로를 자연스럽게 완성해주는 조합이지.`,
  동일: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘은 일간이 완전히 같아. 취향과 삶의 리듬이 신기할 정도로 비슷해서 대화가 잘 통하는 대신, 같은 지점에서 함께 흔들릴 수 있는 '닮은꼴 인연'이야.`,
  상생: (a,b,dir) => dir === 'A→B'
    ? `${voc(a)}, ${voc(b)} — ${a}의 기운이 ${eulReul(b)} 생(生)해주는 상생 관계야. ${iGa(a)} 무의식중에 ${b}에게 힘을 보태주는 흐름이 있어서, 함께 있을 때 ${iGa(b)} 유독 편안해지는 걸 느낄 수 있어.`
    : `${voc(a)}, ${voc(b)} — ${b}의 기운이 ${eulReul(a)} 생(生)해주는 상생 관계야. ${iGa(b)} 무의식중에 ${a}에게 힘을 보태주는 흐름이 있어서, 함께 있을 때 ${iGa(a)} 유독 편안해지는 걸 느낄 수 있어.`,
  비화: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘은 같은 오행의 일간이야. 결이 비슷해서 편안하고 이해가 빠른 대신, 자극이 부족해서 매너리즘에 빠지지 않게 새로운 경험을 의식적으로 만들어야 해.`,
  상극: (a,b,dir) => dir === 'A→B'
    ? `${voc(a)}, ${voc(b)} — ${a}의 기운이 ${eulReul(b)} 극(剋)하는 상극 관계야. 처음엔 강하게 끌리다가도 주도권 다툼이 생기기 쉬운 구조라, ${iGa(a)} 조금 더 배려하는 쪽으로 균형을 잡아야 오래가.`
    : `${voc(a)}, ${voc(b)} — ${b}의 기운이 ${eulReul(a)} 극(剋)하는 상극 관계야. 처음엔 강하게 끌리다가도 주도권 다툼이 생기기 쉬운 구조라, ${iGa(b)} 조금 더 배려하는 쪽으로 균형을 잡아야 오래가.`,
  중립: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일간은 직접적인 합도 충도 없는 무난한 관계야. 극적인 이끌림보다는 함께 지내며 천천히 다져지는 타입의 인연이지.`
};
const JI_TEXT = {
  육합: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일지(배우자궁)는 <b>육합(六合)</b>을 이루고 있어. 전통 명리에서 인연 궁합을 볼 때 가장 반기는 신호 중 하나로, 함께 있을 때 서로가 안정되고 자연스럽게 한 팀처럼 움직이는 조합이야.`,
  삼합: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일지는 같은 <b>삼합(三合)</b> 그룹에 속해 있어. 지금 당장은 방향이 달라 보여도, 결국 같은 곳을 바라보는 관계라서 큰 그림 앞에서 의외로 손발이 잘 맞아.`,
  동일: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일지가 완전히 같아. 생활 패턴과 취향이 놀랍도록 비슷한 인연이라 편안하지만, 서로의 단점까지 닮아 있을 수 있으니 그 부분만 서로 짚어줘.`,
  상생: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일지는 상생 관계에 있어. 둘 다 의식 못 해도, 같이 있으면 한쪽이 알아서 다른 쪽을 채워주는 흐름이 생겨. 그게 자연스러워서 오히려 '우리가 왜 이렇게 편하지?'라는 생각조차 안 들 정도일 거야.`,
  중립: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일지는 특별한 합도 충도 없는 무난한 관계야. 극적인 화학반응보다는 서로 알아가며 맞춰지는 스타일의 인연이지.`,
  상극: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일지는 상극 관계에 있어. 생활 리듬이나 취향에서 미묘하게 어긋나는 지점이 있을 수 있으니, 서로의 다름을 '틀림'이 아니라 '다름'으로 봐주는 연습이 필요해.`,
  충: (a,b) => `${voc(a)}, ${voc(b)} — 너희 둘의 일지는 <b>충(沖)</b> 관계야. 자석의 N극과 N극처럼 강하게 끌리다가도 부딪히는, 애증이 함께 있는 조합이지. 다만 충은 나쁜 것만은 아니라서 — 서로에게 없는 자극과 변화를 주는 관계로 잘 쓰면 오히려 서로를 성장시키는 인연이 돼. 대신 자존심 싸움이 길어지지 않게 먼저 숙이는 연습이 필요해.`
};
function ohaengText(a,b,d){
  const head = `${voc(a)}, ${voc(b)} — `;
  const profA = domPhrase(a, d.a);
  const profB = domPhrase(b, d.b);
  if(d.type === '상호보완') return `${head}${profA}. ${profB}. 그리고 이 두 기운이 서로의 부족한 지점을 정확히 채워주는 <b>상호보완</b> 구조야. 서로가 서로의 부족한 반쪽을 채워주는, 오행 궁합에서 가장 이상적인 그림이지.`;
  if(d.type === '일방보완'){
    const giver = d.aFeedsB ? a : b, receiver = d.aFeedsB ? b : a;
    return `${head}${profA}. ${profB}. ${giver}의 기운이 ${receiver}에게 부족한 기운을 채워주는 <b>일방보완</b> 구조야. ${iGa(giver)} ${receiver}에게 알게 모르게 힘이 되어주는 관계라서 ${receiver} 쪽이 유독 편안함을 느낄 수 있어. 받는 쪽도 의식적으로 돌려주려는 노력을 하면 관계가 더 균형 잡혀.`;
  }
  if(d.type === '동조') return `${head}${profA}. ${profB}. 공통으로 ${elNameCap(d.domOverlap)} 기운이 겹치는 <b>동조</b> 구조야. 에너지 쓰는 방식이 비슷해서 편하지만, 같은 지점이 동시에 약해질 수 있으니 서로에게 부족한 기운을 밖에서 채우는 습관이 필요해.`;
  if(d.type === '상극') return `${head}${profA}. ${profB}. 주도 기운끼리 서로 극(剋)하는 <b>상극</b> 구조야. 에너지를 쓰는 방식 자체가 달라서 부딪힐 때가 있지만, 그만큼 서로에게 없는 자극이 되기도 해. 각자의 방식을 존중하는 거리 조절이 관계의 핵심이야.`;
  return `${head}${profA}. ${profB}. 서로의 주도 기운이 직접적으로 얽히지 않는 <b>무관</b> 구조야. 극적인 화학작용은 적지만, 그만큼 서로의 영역을 침범하지 않고 편안하게 지낼 수 있는 조합이기도 해.`;
}

/* MBTI 축 서술형 텍스트 (점수 없음 — 이해·조언 전용) */
function commText(mA, mB){
  const same = mA[1] === mB[1];
  if(same) return `둘 다 ${mA[1] === 'S' ? '감각(S)' : '직관(N)'}형이라 세상을 읽는 방식이 비슷해. 대화는 잘 통하는 대신, 가끔은 서로에게 새로운 관점을 던져주는 대화를 의식적으로 시도해봐.`;
  return `한 명은 감각(S), 한 명은 직관(N)이라 세상을 보는 방식 자체가 달라. 처음엔 대화가 겉돌 수 있지만, 한쪽은 현실을 짚어주고 한쪽은 가능성을 열어주는 좋은 조합이 될 수 있어. 서로의 화법을 '틀렸다'가 아니라 '다르다'로 받아들이는 게 관건이야.`;
}
function conflictText(mA, mB){
  const tfSame = mA[2] === mB[2], jpSame = mA[3] === mB[3];
  const tf = tfSame
    ? `판단 기준이 비슷해서 갈등을 대하는 온도는 비슷해. 다만 같은 맹점을 공유하고 있을 수 있으니, 중요한 갈등일수록 반대쪽 관점을 의식적으로 물어봐줘.`
    : `한 명은 논리(T), 한 명은 감정(F)으로 갈등에 접근해서 초반엔 '왜 저렇게 반응하지?' 싶을 수 있어. 이 조합이 맞춰지면 이성과 감성을 둘 다 갖춘 균형 잡힌 팀이 돼.`;
  const jp = jpSame
    ? ` 갈등을 매듭짓는 속도도 비슷해서 리듬이 잘 맞는 편이야.`
    : ` 다만 갈등을 매듭짓는 속도는 서로 달라 — 한쪽은 빨리 정리하고 싶고 한쪽은 시간을 두고 싶어 하니, '언제까지 이 얘기를 매듭짓자'는 합의만 미리 해두면 이 차이가 오히려 균형이 돼.`;
  return tf + jp;
}
function energyText(mA, mB){
  const eSame = mA[0] === mB[0];
  if(eSame && mA[0] === 'E') return `둘 다 외향(E)이라 함께 있을 때 에너지가 폭발적으로 올라가. 활동적인 데이트나 모임이 잘 맞는 대신, 둘 다 동시에 방전되는 시기가 겹칠 수 있으니 각자 혼자 쉬는 시간도 존중해줘.`;
  if(eSame) return `둘 다 내향(I)이라 조용하고 편안한 시간을 함께 보내는 데 최적화된 조합이야. 다만 둘 다 먼저 다가가지 않으면 관계가 정체될 수 있으니, 가끔은 의식적으로 먼저 연락하고 먼저 제안해봐.`;
  return `한 명은 외향(E), 한 명은 내향(I)이라 에너지를 쓰는 리듬이 달라. E는 함께하는 시간에서, I는 혼자만의 시간에서 충전돼. 서로의 리듬을 '나를 덜 좋아해서'가 아니라 '원래 그런 사람'으로 이해해주는 게 핵심이야.`;
}
const AXIS_TEXT_FN = {comm: commText, conflict: conflictText, energy: energyText};
const AXIS_ACTION = {
  comm: '대화가 겉돈다고 느껴질 때, 결론보다 서로가 어떤 관점으로 보고 있는지부터 확인해봐.',
  conflict: '갈등이 생기면 감정이 상하기 전에 "언제까지 이 얘기를 정리하자"고 먼저 합의해봐.',
  energy: '둘의 에너지 리듬이 다르다는 걸 서운함이 아니라 서로의 특성으로 받아들여봐.'
};

/* ══════════════════════════════════════════════════
   4. UI 초기화
   ══════════════════════════════════════════════════ */
const $ = s => document.querySelector(s);
const nowY = new Date().getFullYear();
const HOUR_NAMES = ['자시 (23:30~01:29)','축시 (01:30~03:29)','인시 (03:30~05:29)','묘시 (05:30~07:29)','진시 (07:30~09:29)','사시 (09:30~11:29)','오시 (11:30~13:29)','미시 (13:30~15:29)','신시 (15:30~17:29)','유시 (17:30~19:29)','술시 (19:30~21:29)','해시 (21:30~23:29)'];

function initPerson(p){
  const birthInput = $(`#${p}Birth`);
  birthInput.addEventListener('input', () => { birthInput.value = birthInput.value.replace(/\D/g,'').slice(0,8); });
  const hourSel = $(`#${p}Hour`);
  HOUR_NAMES.forEach((n,i) => hourSel.add(new Option(n, i*2)));
  const mbtiSel = $(`#${p}Mbti`);
  mbtiSel.add(new Option('모릅니다 (사주만 볼게요)', 'unknown'));
  Object.keys(MBTI_DESC).forEach(t => mbtiSel.add(new Option(t, t)));

  const state = {gender:'남', calType:'solar'};
  $(`#${p}SegGender`).addEventListener('click', e => {
    if(e.target.tagName !== 'BUTTON') return;
    document.querySelectorAll(`#${p}SegGender button`).forEach(b => b.classList.remove('on'));
    e.target.classList.add('on'); state.gender = e.target.dataset.v;
  });
  $(`#${p}SegCal`).addEventListener('click', e => {
    if(e.target.tagName !== 'BUTTON') return;
    document.querySelectorAll(`#${p}SegCal button`).forEach(b => b.classList.remove('on'));
    e.target.classList.add('on'); state.calType = e.target.dataset.v;
    $(`#${p}LeapRow`).style.display = state.calType === 'lunar' ? 'flex' : 'none';
  });
  return state;
}
const stateA = initPerson('a');
const stateB = initPerson('b');

$('#btnGunghapShare').addEventListener('click', async () => {
  const shareData = {
    title: '명식LAB — 사주 × MBTI 무료 궁합 리포트',
    text: `우리 궁합을 무료로 봤는데 신기하더라 — 너도 무료로 열어봐!`,
    url: location.href.split('#')[0]
  };
  if(navigator.share){ try{ await navigator.share(shareData); }catch(e){} }
  else{
    try{ await navigator.clipboard.writeText(shareData.url); alert('링크가 복사됐어요. 원하는 곳에 붙여넣어 공유해보세요.'); }
    catch(e){ alert('이 브라우저에서는 공유 기능이 지원되지 않아요. 링크: ' + shareData.url); }
  }
});

/* ══════════════════════════════════════════════════
   5. 입력 파싱 & 원국 계산
   ══════════════════════════════════════════════════ */
function parseBirthInput(p, calType){
  const raw = $(`#${p}Birth`).value.trim();
  if(!/^\d{8}$/.test(raw)) return {err:`${p === 'a' ? '상대 1' : '상대 2'}의 생년월일 8자리를 숫자로만 입력해줘 (예: 19970602)`};
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
  return {y,m,d};
}

function buildPerson(p, state){
  const name = $(`#${p}Name`).value.trim() || (p === 'a' ? '상대 1' : '상대 2');
  const mbtiRaw = $(`#${p}Mbti`).value;
  const hasMbti = mbtiRaw && mbtiRaw !== 'unknown';
  const parsed = parseBirthInput(p, state.calType);
  if(parsed.err) return {err: parsed.err};
  let {y,m,d} = parsed;
  const h = +$(`#${p}Hour`).value;
  let birthLine;
  if(state.calType === 'lunar'){
    const conv = lunarToSolar(y, m, d, $(`#${p}Leap`).checked);
    if(!conv || conv.err) return {err: conv ? conv.err : '변환 가능한 범위를 벗어났습니다.'};
    birthLine = `음력 ${y}년 ${$(`#${p}Leap`).checked?'윤':''}${m}월 ${d}일 (양력 ${conv.y}년 ${conv.m}월 ${conv.d}일)`;
    y = conv.y; m = conv.m; d = conv.d;
  } else {
    birthLine = `양력 ${y}년 ${m}월 ${d}일`;
  }
  const s = calcSaju(y, m, d, h);
  const rawCnt = {목:0,화:0,토:0,금:0,수:0};
  [s.yGan,s.mGan,s.dGan,s.hGan].forEach(g => { if(g !== null) rawCnt[GAN_EL[g]]++; });
  [s.yJi,s.mJi,s.dJi,s.hJi].forEach(j => { if(j !== null) rawCnt[JI_EL[j]]++; });
  return {name, gender: state.gender, birthLine, hourIdx: h, s, rawCnt, mbti: hasMbti ? mbtiRaw : null};
}

function renderPillars(s){
  const cols = [
    {label:'時柱', g:s.hGan, j:s.hJi},
    {label:'日柱', g:s.dGan, j:s.dJi, me:true},
    {label:'月柱', g:s.mGan, j:s.mJi},
    {label:'年柱', g:s.yGan, j:s.yJi},
  ];
  return cols.map(c => {
    if(c.g === null) return `<div class="col"><div class="plabel">${c.label}</div>
      <div class="pchar"><span class="hanja" style="color:var(--muted)">?</span><span class="han">미상</span><span class="ss">—</span></div>
      <div class="pchar"><span class="hanja" style="color:var(--muted)">?</span><span class="han">미상</span><span class="ss">—</span></div></div>`;
    const gTag = c.me ? `<span class="ss me">일원</span>` : `<span class="ss">${sipseong(s.dGan, c.g)}</span>`;
    const jTag = `<span class="ss">${sipseong(s.dGan, JI_JG[c.j])}</span>`;
    return `<div class="col"><div class="plabel">${c.label}</div>
      <div class="pchar"><span class="hanja el-${GAN_EL[c.g]}">${GANH[c.g]}</span><span class="han">${GAN[c.g]}</span>${gTag}</div>
      <div class="pchar"><span class="hanja el-${JI_EL[c.j]}">${JIH[c.j]}</span><span class="han">${JI[c.j]}</span>${jTag}</div></div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════
   6. 실행 & 렌더
   ══════════════════════════════════════════════════ */
$('#btnGunghapAnalyze').addEventListener('click', () => {
  const A = buildPerson('a', stateA);
  if(A.err){ alert(A.err); return; }
  const B = buildPerson('b', stateB);
  if(B.err){ alert(B.err); return; }

  const nameA = A.name, nameB = B.name;
  const hasMbti = A.mbti && B.mbti;

  /* 원국 비교 */
  $('#aRName').textContent = `${nameA} (${A.gender})`;
  $('#aRBirth').innerHTML = `${A.birthLine}<br>${A.hourIdx < 0 ? '시간 미상' : HOUR_NAMES[A.hourIdx/2].split(' ')[0]} 생${A.mbti ? ' · MBTI ' + A.mbti : ''}`;
  $('#aRPillars').innerHTML = renderPillars(A.s);
  $('#aRIlgan').innerHTML = `${nameA}의 일간은 <b>${GANH[A.s.dGan]}(${GAN[A.s.dGan]}${GAN_EL[A.s.dGan]})</b> — ${ILGAN_DESC[GAN[A.s.dGan]]}`;

  $('#bRName').textContent = `${nameB} (${B.gender})`;
  $('#bRBirth').innerHTML = `${B.birthLine}<br>${B.hourIdx < 0 ? '시간 미상' : HOUR_NAMES[B.hourIdx/2].split(' ')[0]} 생${B.mbti ? ' · MBTI ' + B.mbti : ''}`;
  $('#bRPillars').innerHTML = renderPillars(B.s);
  $('#bRIlgan').innerHTML = `${nameB}의 일간은 <b>${GANH[B.s.dGan]}(${GAN[B.s.dGan]}${GAN_EL[B.s.dGan]})</b> — ${ILGAN_DESC[GAN[B.s.dGan]]}`;

  /* 사주 궁합 계산 (유일한 점수 소스) */
  const ilgan = ilganRelation(A.s.dGan, B.s.dGan);
  const ji = jiRelation(A.s.dJi, B.s.dJi);
  const ohaeng = ohaengComp(A.rawCnt, B.rawCnt);
  const ilganScore = ILGAN_SCORE[ilgan.type];
  const jiScore = JI_SCORE[ji.type];
  const ohaengScore = OHAENG_SCORE[ohaeng.type];
  const sajuScore = Math.round(ilganScore*0.4 + jiScore*0.4 + ohaengScore*0.2);

  /* 궁합 종합 (CH2) */
  const gh = gunghapName(sajuScore);
  $('#rGunghapName').textContent = gh.name;
  $('#rGunghapTag').textContent = gh.tag;
  $('#rGunghapScore').textContent = sajuScore + '점';
  $('#rGunghapGauge').dataset.w = sajuScore;

  /* 사주 궁합 상세 (CH3) */
  $('#rSajuBars').innerHTML = `
    <div class="gbar"><div class="gbar-top"><span class="gname">일간 궁합</span><span class="gval">${ilganScore}점</span></div>
      <div class="gtrack"><div class="gfill" data-w="${ilganScore}"></div></div></div>
    <div class="gbar"><div class="gbar-top"><span class="gname">일지(배우자궁) 궁합</span><span class="gval">${jiScore}점</span></div>
      <div class="gtrack"><div class="gfill" data-w="${jiScore}"></div></div></div>
    <div class="gbar"><div class="gbar-top"><span class="gname">오행 궁합</span><span class="gval">${ohaengScore}점</span></div>
      <div class="gtrack"><div class="gfill" data-w="${ohaengScore}"></div></div></div>`;
  $('#rIlganText').innerHTML = `<b>일간 — ${ilgan.type}</b><br>${ILGAN_TEXT[ilgan.type](nameA, nameB, ilgan.dir)}`;
  $('#rJiText').innerHTML = `<b>일지 — ${ji.type}</b><br>${JI_TEXT[ji.type](nameA, nameB)}`;
  $('#rOhaengText').innerHTML = `<b>오행 — ${ohaeng.type}</b><br>${ohaengText(nameA, nameB, ohaeng)}`;

  /* 서로를 대하는 우리의 마음 (배우자궁 십성 기반, 개인화) */
  const ssA = sipseong(A.s.dGan, JI_JG[A.s.dJi]);
  const ssB = sipseong(B.s.dGan, JI_JG[B.s.dJi]);
  const groupA = SS_GROUP[ssA], groupB = SS_GROUP[ssB];
  $('#sHeadA').textContent = `${voc(nameA)}, ${nameB} 앞에서 이런 모습이 돼`;
  $('#sBodyA').innerHTML = `<p>${SPOUSE_TEXT[groupA](nameA, nameB)}</p>`;
  $('#sHeadB').textContent = `${voc(nameB)}, ${nameA} 앞에서 이런 모습이 돼`;
  $('#sBodyB').innerHTML = `<p>${SPOUSE_TEXT[groupB](nameB, nameA)}</p>`;
  $('#sClose').innerHTML = `<b>그래서 이 둘은</b><br>${eunNeun(nameA)} ${eulReul(GROUP_GIVES[groupA])}, ${eunNeun(nameB)} ${eulReul(GROUP_GIVES[groupB])} 서로에게 건네고 있었던 거야. 무심코 지나쳤던 상대의 그 행동이, 사실은 이런 마음에서 나온 거였다는 걸 알면 관계가 한층 더 깊어질 수 있어.`;

  /* 사주 세 지표 중 최고/최저 */
  const metrics = [
    {key:'ilgan', label:'일간 궁합', score:ilganScore},
    {key:'ji', label:'일지 궁합', score:jiScore},
    {key:'ohaeng', label:'오행 궁합', score:ohaengScore}
  ];
  const sortedM = [...metrics].sort((a,b) => b.score - a.score);
  const best = sortedM[0], second = sortedM[1], worst = sortedM[sortedM.length-1];

  /* 케미 포인트 (CH4) */
  $('#cHead').textContent = `가장 강한 케미 — ${best.label} (${best.score}점)`;
  const bestBody = [];
  bestBody.push(`${voc(nameA)}, ${voc(nameB)} — 너희 둘의 궁합 항목 중 가장 빛나는 건 <b>${best.label}</b>이야. 이 지점은 특별히 의식하지 않아도 자연스럽게 잘 맞물리는 부분이니, 관계가 흔들릴 때일수록 오히려 이 강점을 먼저 떠올려봐.`);
  bestBody.push(`그다음으로 좋은 건 <b>${second.label}</b>(${second.score}점)이야. 이 두 가지가 이 커플을 지탱하는 두 개의 기둥이라고 보면 돼.`);
  bestBody.push(`좋은 궁합은 저절로 유지되는 게 아니라, 강점을 알고 자주 꺼내 쓸 때 오래가. 두 사람이 잘 맞는다고 느꼈던 순간을 떠올려보면, 아마 이 지점과 맞닿아 있을 거야.`);
  $('#cBody').innerHTML = bestBody.map(p => `<p>${p}</p>`).join('');

  /* 주의 포인트 (CH5) */
  $('#wHead').textContent = worst.score < 60 ? `조심할 지점 — ${worst.label} (${worst.score}점)` : `특별한 약점은 없지만…`;
  const warnBody = [];
  if(worst.score < 60){
    warnBody.push(`${voc(nameA)}, ${voc(nameB)} — 너희 둘 사이에서 상대적으로 가장 신경 써야 할 지점은 <b>${worst.label}</b>이야. 점수가 낮다는 건 '안 맞는다'는 뜻이 아니라, 저절로 되지 않으니 의식적으로 노력해야 하는 지점이라는 뜻이야.`);
  } else {
    warnBody.push(`${voc(nameA)}, ${voc(nameB)} — 전체적으로 궁합 점수가 고르게 안정적인 편이야. 다만 상대적으로 가장 낮은 <b>${worst.label}</b>(${worst.score}점)도 완전히 안심할 순 없으니, 이 부분만 가끔 서로 점검해봐.`);
  }
  warnBody.push(`모든 궁합에는 약한 고리가 하나쯤 있어. 그 고리를 숨기기보다 서로 알고 있는 관계가, 모르고 지내다 부딪히는 관계보다 훨씬 오래가.`);
  $('#wBody').innerHTML = warnBody.map(p => `<p>${p}</p>`).join('');

  /* MBTI로 서로 이해하기 (CH6) — 점수 없음, 사주 최약점과 연결 */
  const chUnderstand = $('#chMbtiUnderstand');
  const chInvite = $('#chMbtiInvite');
  if(hasMbti){
    chUnderstand.style.display = '';
    chInvite.style.display = 'none';
    const weakKey = worst.key; // ilgan | ji | ohaeng
    const primaryAxis = WEAK_TO_AXIS[weakKey];
    const axisOrder = [primaryAxis, ...['comm','conflict','energy'].filter(a => a !== primaryAxis)];
    $('#mHeadTitle').textContent = CH_TITLE[weakKey];
    $('#mHeadDesc').textContent = `사주에서 가장 아쉬웠던 건 ${SAJU_LABEL[weakKey]}이었지. 타고난 구조는 바꿀 수 없어도, MBTI로 보면 왜 그런지 그리고 어떻게 맞춰가면 되는지가 보여.`;
    $('#rMbtiAxes').innerHTML = axisOrder.map((axisKey, i) => {
      const isPrimary = i === 0;
      const text = AXIS_TEXT_FN[axisKey](A.mbti, B.mbti);
      const lead = isPrimary
        ? `사주에서 아쉬웠던 ${SAJU_LABEL[weakKey]}, 이 축으로 보면 이렇게 이해할 수 있어.`
        : `여기에 더해 이런 부분도 함께 알아두면 좋아.`;
      return `<div class="axis-block${isPrimary ? ' primary' : ''}">
        <div class="axis-top"><span class="axis-label">${AXIS_LABEL[axisKey]}</span>${isPrimary ? '<span class="axis-badge">먼저 채워볼 지점</span>' : ''}</div>
        <div class="axis-lead">${lead} (${AXIS_SUB[axisKey]})</div>
        <div class="axis-text">${text}</div>
      </div>`;
    }).join('');
  } else {
    chUnderstand.style.display = 'none';
    chInvite.style.display = '';
  }

  /* 실전 조언 (CH7) */
  const TIP_ACTION = {
    ilgan: '서로의 존재 방식이 다르다는 걸 인정하고, 상대의 속도를 존중하는 말 한마디를 더 건네봐.',
    ji: '생활 습관이나 리듬이 부딪힐 때, 누가 맞고 틀리고를 따지기보다 중간 지점을 먼저 찾아봐.',
    ohaeng: '서로에게 부족한 부분을 채워주는 활동(취미·루틴)을 의식적으로 같이 만들어봐.'
  };
  const tips = [];
  tips.push(`<b>${worst.label}</b>이 가장 신경 쓸 지점이야. ${TIP_ACTION[worst.key]}`);
  tips.push(`<b>${best.label}</b>은 이 관계의 무기야. 힘들 때일수록 이 강점을 더 적극적으로 써봐 — ${TIP_ACTION[best.key]}`);
  if(hasMbti){
    const primaryAxis = WEAK_TO_AXIS[worst.key];
    tips.push(`MBTI로 보면 <b>${AXIS_LABEL[primaryAxis]}</b>이 핵심이야. ${AXIS_ACTION[primaryAxis]}`);
  } else {
    tips.push(`아무리 좋은 궁합도 확인하지 않으면 무뎌져. 한 달에 한 번쯤 "요즘 우리 어때?"라고 서로에게 가볍게 물어보는 루틴을 만들어봐.`);
  }
  $('#rTips').innerHTML = tips.map((t,i) => `<div class="tip-item"><div class="tip-num">${i+1}</div><div class="tip-text">${t}</div></div>`).join('');

  /* 표시 & 챕터 번호 재정렬 (숨겨진 섹션 제외하고 순번 재부여) */
  const rep = $('#report');
  rep.style.display = 'block';
  let chNo = 1;
  document.querySelectorAll('#report .chapter-head .ch').forEach(el => {
    const sec = el.closest('section');
    if(sec && sec.style.display === 'none') return;
    el.textContent = 'CHAPTER ' + chNo++;
  });
  rep.scrollIntoView({behavior:'smooth'});
  setTimeout(() => document.querySelectorAll('.gfill').forEach(f => f.style.width = f.dataset.w + '%'), 300);
});
})();
