/* ═══════════════════════════════════════════════════════════
   명식LAB — 내 아이 이해하기 (부모용 자녀 사주 리포트) v1
   ─────────────────────────────────────────────────────────
   배포 방법:
   1) 이 파일(child-report.js)을 GitHub 저장소에 업로드
   2) 아임웹 [환경설정 > SEO·헤더설정 > 푸터(Footer)]에 아래 한 줄 추가:
      <script defer src="https://cdn.jsdelivr.net/gh/사용자명/저장소명@main/child-report.js"><\/script>
      ※ raw.githubusercontent.com 주소는 브라우저가 차단할 수 있으니
        반드시 jsDelivr CDN 주소를 사용하세요.
   3) 위젯이 없는 페이지에서는 자동으로 아무 동작도 하지 않습니다.
   ═══════════════════════════════════════════════════════════ */
function initChildApp(){
  /* 이 페이지에 위젯이 없으면 조용히 종료 (푸터 코드는 전체 페이지에 로드되므로) */
  if (!document.getElementById('btnAnalyze') || !document.getElementById('secChemi')) return;
/* ══════════════ 1. 기초 데이터 (기존 엔진 재사용) ══════════════ */
const GAN=['갑','을','병','정','무','기','경','신','임','계'];
const GANH=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JI=['자','축','인','묘','진','사','오','미','신','유','술','해'];
const JIH=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN_EL=['목','목','화','화','토','토','금','금','수','수'];
const JI_EL=['수','토','목','목','토','화','화','토','금','금','토','수'];
const JI_JG=[9,5,0,1,4,2,3,5,6,7,4,8];
const ELH={목:'木',화:'火',토:'土',금:'金',수:'水'};
const JEOLGI=[[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,8],[9,8],[10,8],[11,7],[12,7],[1,6]];
function jdn(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}

/* ══ 음력→양력 (1900–2100) ══ */
const LUNAR_INFO=[
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
const lInfo=y=>LUNAR_INFO[y-1900];
const leapMonth=y=>lInfo(y)&0xf;
const leapDays=y=>leapMonth(y)?((lInfo(y)&0x10000)?30:29):0;
const lMonthDays=(y,m)=>(lInfo(y)&(0x10000>>m))?30:29;
function lYearDays(y){let s=348;for(let i=0x8000;i>0x8;i>>=1)s+=(lInfo(y)&i)?1:0;return s+leapDays(y);}
function lunarToSolar(ly,lm,ld,isLeap){
  if(ly<1900||ly>2099)return null;
  if(isLeap&&leapMonth(ly)!==lm)isLeap=false;
  const maxD=isLeap?leapDays(ly):lMonthDays(ly,lm);
  if(ld>maxD)return{err:'음력 '+ly+'년 '+(isLeap?'윤':'')+lm+'월은 '+maxD+'일까지 있습니다.'};
  let off=0;
  for(let y=1900;y<ly;y++)off+=lYearDays(y);
  const leap=leapMonth(ly);
  for(let m=1;m<lm;m++){off+=lMonthDays(ly,m);if(m===leap)off+=leapDays(ly);}
  if(isLeap)off+=lMonthDays(ly,lm);
  off+=ld-1;
  const dt=new Date(Date.UTC(1900,0,31)+off*86400000);
  return{y:dt.getUTCFullYear(),m:dt.getUTCMonth()+1,d:dt.getUTCDate()};
}

/* ══ 사주 계산 ══ */
function calcSaju(y,m,d,hour){
  let sy=y;
  if(m<2||(m===2&&d<4))sy=y-1;
  const yIdx=((sy-4)%60+60)%60, yGan=yIdx%10, yJi=yIdx%12;
  let mIdx=-1;
  const cur=jdn(y,m,d);
  for(let i=0;i<12;i++){
    const [jm,jd_]=JEOLGI[i];
    const sD=jdn(jm===1?sy+1:sy,jm,jd_);
    const nxt=JEOLGI[(i+1)%12];
    const eY=(nxt[0]===1||nxt[0]<jm)?sy+1:sy;
    const eD=jdn(eY,nxt[0],nxt[1]);
    if(cur>=sD&&cur<eD){mIdx=i;break;}
  }
  if(mIdx<0)mIdx=11;
  const mJi=(mIdx+2)%12;
  const mGan=((yGan%5)*2+2+mIdx)%10;
  const dIdx=((cur+49)%60+60)%60;
  const dGan=dIdx%10,dJi=dIdx%12;
  let hGan=null,hJi=null;
  if(hour>=0){hJi=Math.floor(((hour+1)%24)/2);hGan=((dGan%5)*2+hJi)%10;}
  return{yGan,yJi,mGan,mJi,dGan,dJi,hGan,hJi};
}

/* ══ 십성 ══ */
const SHENG={목:'화',화:'토',토:'금',금:'수',수:'목'};
const KE={목:'토',토:'수',수:'화',화:'금',금:'목'};
function sipseong(dGan,tGan){
  const de=GAN_EL[dGan],te=GAN_EL[tGan];
  const same=(dGan%2)===(tGan%2);
  if(de===te)return same?'비견':'겁재';
  if(SHENG[de]===te)return same?'식신':'상관';
  if(KE[de]===te)return same?'편재':'정재';
  if(KE[te]===de)return same?'편관':'정관';
  return same?'편인':'정인';
}
const SS_GROUP={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};

const JANGGAN=[
  [[8,.33],[9,.67]],[[9,.30],[7,.10],[5,.60]],[[4,.23],[2,.23],[0,.54]],
  [[0,.33],[1,.67]],[[1,.30],[9,.10],[4,.60]],[[4,.23],[6,.23],[2,.54]],
  [[2,.33],[5,.30],[3,.37]],[[3,.30],[1,.10],[5,.60]],[[4,.23],[8,.23],[6,.54]],
  [[6,.33],[7,.67]],[[7,.30],[3,.10],[4,.60]],[[4,.23],[0,.23],[8,.54]]
];
function elementPower(s){
  const pw={목:0,화:0,토:0,금:0,수:0};
  [[s.yGan,1.0],[s.mGan,1.2],[s.dGan,1.2],[s.hGan,1.0]].forEach(([g,w])=>{if(g!==null)pw[GAN_EL[g]]+=w;});
  [[s.yJi,1.0],[s.mJi,2.5],[s.dJi,1.5],[s.hJi,1.0]].forEach(([j,w])=>{if(j!==null)JANGGAN[j].forEach(([g,r])=>pw[GAN_EL[g]]+=w*r);});
  return pw;
}
function shinStrength(s,pw){
  const de=GAN_EL[s.dGan];
  const inEl=Object.keys(SHENG).find(k=>SHENG[k]===de);
  const support=pw[de]+pw[inEl];
  const total=Object.values(pw).reduce((a,b)=>a+b,0);
  const ratio=support/total;
  return{ratio,de,inEl,grade:ratio>=0.62?'태강':ratio>=0.53?'신강':ratio>0.47?'중화':ratio>0.38?'신약':'태약'};
}
/* 첫 대운 시작 나이 */
function daeunStartAge(s,gender,y,m,d){
  const yang=s.yGan%2===0;
  const forward=(yang&&gender==='남')||(!yang&&gender==='여');
  const cur=jdn(y,m,d);
  const dates=[];
  for(let yy=y-1;yy<=y+1;yy++)JEOLGI.forEach(([jm,jd_])=>dates.push(jdn(jm===1?yy+1:yy,jm,jd_)));
  dates.sort((a,b)=>a-b);
  let diff;
  if(forward){diff=dates.find(x=>x>cur)-cur;}
  else{diff=cur-[...dates].reverse().find(x=>x<=cur);}
  return Math.min(10,Math.max(1,Math.round(diff/3)));
}
/* 신살 */
const SAMHAP=b=>[[8,0,4],[2,6,10],[5,9,1],[11,3,7]].findIndex(g=>g.includes(b));
const YEOKMA=[2,8,11,5],DOHWA=[9,3,6,0],HWAGAE=[4,10,1,7];
const CHEONEUL={0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],7:[2,6],8:[5,3],9:[5,3]};

/* ══════════════ 2. 아이 전용 해석 뱅크 ══════════════ */
const ILGAN_CHILD={
  '갑':'곧게 자라는 큰 나무의 씨앗이에요. 뭐든 자기가 먼저 하겠다고 나서는 타고난 리더형인데, 꺾으려 들면 부러질지언정 굽히지 않아요. 방향만 잡아주고 앞자리는 아이에게 내어주세요.',
  '을':'바위 틈에서도 피어나는 들꽃이에요. 부드럽고 눈치가 빨라 어른들 사랑을 받지만, 그만큼 속으로 참는 게 많은 아이예요. "괜찮아?"보다 "오늘 어땠어?"라고 물어봐 주세요.',
  '병':'한낮의 태양이에요. 존재감이 크고 표현이 시원시원한 무대 체질이라, 관심을 먹고 자라는 아이예요. 이 아이에게 무관심은 어떤 꾸중보다 큰 벌이 됩니다.',
  '정':'밤을 밝히는 촛불이에요. 조용하지만 속이 깊고, 좋아하는 한 가지에 오래 몰두하는 아이예요. 이것저것 넓게 시키기보다 좋아하는 하나를 깊게 파도록 지켜봐 주세요.',
  '무':'우직한 큰 산이에요. 느긋하고 쉽게 흔들리지 않아 듬직하지만, 시동이 느린 만큼 재촉은 역효과예요. 산은 밀어서 옮기는 게 아니라, 길을 내어주는 것입니다.',
  '기':'만물을 기르는 기름진 밭이에요. 친구를 챙기고 돌보기를 좋아하는 속 깊은 아이인데, 양보가 몸에 배어 있어요. 가끔은 "네 것부터 챙겨도 돼"라고 꼭 말해주세요.',
  '경':'다듬기 전의 단단한 원석이에요. 씩씩하고 승부욕이 강하며 옳고 그름이 분명한 아이예요. 힘으로 누르면 더 강하게 튕겨 나오니, 규칙은 아이와 함께 정해주세요.',
  '신':'세공을 마친 보석이에요. 섬세하고 미적 감각이 뛰어나며 스스로에 대한 기준이 높은 아이예요. 결과보다 과정을 칭찬해 줘야 그 높은 기준이 아이를 찌르지 않아요.',
  '임':'넓은 강과 바다예요. 생각의 스케일이 크고 호기심이 바다처럼 넓은 아이예요. 자잘한 통제보다 큰 울타리 몇 개만 정해주면, 그 안에서 알아서 유유히 흘러갑니다.',
  '계':'풀잎에 스며드는 이슬이에요. 감수성이 풍부하고 관찰력이 뛰어난 조용한 영재형인데, 재능이 밖으로 잘 티가 나지 않아요. 어른이 먼저 발견해줘야 하는 보물이 많은 아이입니다.'
};
const ILGAN_PARENTING={
  '갑':{p:'"이건 네가 먼저 시작했구나!" — 주도성을 알아봐 주는 칭찬이 가장 크게 닿아요.',a:'"시키는 대로 해." — 자존심이 꺾이는 순간 마음의 문도 함께 닫히는 아이예요.',t:'지시 대신 "네 생각엔 어떻게 하는 게 좋을까?"라고 첫 결정권을 넘겨보세요. 책임감이 따라옵니다.'},
  '을':{p:'"힘들었을 텐데 잘 버텼네." — 보이지 않는 노력을 읽어주는 말에 마음이 풀려요.',a:'"넌 왜 이렇게 우물쭈물해." — 신중함을 단점으로 낙인찍으면 더 움츠러들어요.',t:'열린 질문보다 "이거랑 저거 중에 뭐가 좋아?"처럼 좁힌 선택지가 이 아이의 결정을 도와줍니다.'},
  '병':{p:'"우와, 진짜 대단한데?" — 리액션의 크기가 곧 사랑의 크기로 느껴지는 아이예요.',a:'무반응과 건성 대답 — 이 아이에게는 어떤 꾸중보다 아픈 벌이에요.',t:'하루 한 번, 아이가 주인공이 되는 짧은 발표 시간(오늘의 자랑)을 만들어 주세요.'},
  '정':{p:'"그걸 아직도 기억하고 있었어?" — 마음의 깊이를 알아봐 주는 말에 감동해요.',a:'"뭘 그런 걸 갖고 그래." — 섬세한 마음을 사소하게 취급하면 다시 꺼내 보이지 않아요.',t:'자기 전 10분, 불 끄고 나누는 조용한 일대일 대화가 이 아이의 마음 문을 엽니다.'},
  '무':{p:'"너는 정말 믿음직해." — 든든함을 인정받을 때 어깨가 쫙 펴지는 아이예요.',a:'"빨리빨리 좀 해!" — 재촉할수록 산처럼 더 굳어버려요.',t:'"10분 뒤에 나갈 거야"처럼 미리 예고해 주세요. 준비할 시간을 주면 누구보다 잘 해냅니다.'},
  '기':{p:'"네 덕분에 다들 편했어." — 돌봄과 배려를 알아주는 말이 최고의 상이에요.',a:'"동생한테 좀 양보해." — 이미 충분히 양보하며 사는 아이라 서운함이 쌓여요.',t:'"그래서 너는 뭐 하고 싶은데?"라고 아이 자신의 욕구를 먼저 물어봐 주세요.'},
  '경':{p:'"멋지게 해냈네, 역시 승부사야." — 성취를 돌려 말하지 말고 정면으로 인정해 주세요.',a:'"그냥 하라면 해." — 납득이 없는 강요에는 두 배의 반발로 돌아와요.',t:'규칙을 정할 때 아이를 협상 테이블에 앉혀 주세요. 함께 정한 약속은 끝까지 지키는 아이입니다.'},
  '신':{p:'"과정이 정말 꼼꼼했어." — 결과보다 과정을 칭찬해야 완벽주의가 독이 되지 않아요.',a:'"이 정도면 됐지, 대충 해." — 아이가 가진 기준을 무시하는 말로 들려요.',t:'아이가 실수했을 때 "그럴 수도 있지"를 부모가 먼저 소리 내어 말해 주세요. 자기 용서를 배웁니다.'},
  '임':{p:'"그런 생각을 다 했어? 스케일이 다르네." — 생각의 크기를 인정해 주세요.',a:'"쓸데없는 생각 하지 말고." — 상상력의 물길을 막는 가장 아픈 말이에요.',t:'"만약에 ~라면?" 놀이로 아이의 큰 생각에 함께 올라타 주세요. 대화가 강처럼 흘러갑니다.'},
  '계':{p:'"네가 조용히 다 보고 있었구나." — 관찰력을 발견해 주는 말이 특효약이에요.',a:'"왜 말을 안 해!" — 다그칠수록 이슬처럼 더 깊이 스며들어 숨어요.',t:'말 대신 글·그림·쪽지 같은 다른 통로를 열어주면 속마음이 조용히 흘러나옵니다.'}
};
const OH_STRONG_CHILD={
  '목':'木(성장) 기운이 강한 아이는 호기심이 크고 "왜?"가 많으며 새로운 걸 배우는 속도가 빨라요. 다만 벌여놓고 마무리가 약할 수 있으니, 작게라도 "끝내는 경험"을 자주 만들어 주세요.',
  '화':'火(표현) 기운이 강한 아이는 감정 표현이 크고 에너지가 넘쳐요. 신나면 과열되고 지치면 급격히 시무룩해지는 널뛰기가 있으니, 몸으로 발산할 시간과 식히는 시간을 함께 챙겨주세요.',
  '토':'土(안정) 기운이 강한 아이는 진득하고 믿음직하지만, 변화에 적응하는 데 시간이 필요해요. 새 학기·이사 같은 변화 전에는 미리 여러 번 예고하고 적응할 시간을 넉넉히 주세요.',
  '금':'金(원칙) 기운이 강한 아이는 규칙과 공정함에 민감하고 맺고 끊음이 분명해요. "그냥 해"가 통하지 않는 아이라, 이유를 설명해 주면 누구보다 잘 따라옵니다.',
  '수':'水(지혜) 기운이 강한 아이는 생각이 깊고 눈치가 빨라요. 겉으로 조용해도 속으로는 다 헤아리고 있으니 침묵을 "생각 중"으로 읽어주시고, 그 생각이 걱정으로 번지지 않게 마음을 자주 물어봐 주세요.'
};
const OH_WEAK_CHILD={
  '목':'시작하고 도전하는 木이 부족하면 새로운 것 앞에서 머뭇거릴 수 있어요. "일단 딱 한 번만 해보자"처럼 문턱을 낮춰주는 말이 이 아이의 약이 됩니다.',
  '화':'표현하고 발산하는 火가 부족하면 감정과 생각을 속에 쌓아두기 쉬워요. 답을 요구하지 않는 수다 시간과 신나는 몸 놀이가 표현의 물꼬를 터줍니다.',
  '토':'중심을 잡아주는 土가 부족하면 기분과 환경에 따라 흔들림이 커요. 같은 시간에 자고, 같은 자리에서 공부하는 일정한 루틴이 아이의 닻이 되어줍니다.',
  '금':'정리하고 끝맺는 金이 부족하면 하던 일을 쉽게 미루거나 어질러 두기 쉬워요. "10분 정리 타임"처럼 마무리를 놀이로 만들어 주세요.',
  '수':'쉬어가는 水가 부족하면 지치는 줄 모르고 달리다 갑자기 방전돼요. 멍때리는 시간과 충분한 잠을 "해야 할 일"처럼 지켜주세요.'
};
const SIP_TALENT={
  '비겁':'스스로 해내려는 <b>자립의 별</b>이 강해요. 시켜서 하는 일은 싫어해도 "내가 정한 일"은 끝까지 해내는 아이 — 선택지를 주고 결정은 아이가 하게 하는 것이 최고의 학습법입니다. 재능 방향: 운동·리더 역할·1인 프로젝트.',
  '식상':'만들고 표현하는 <b>창작의 별</b>이 강해요. 말·그림·만들기·노래, 뭐든 밖으로 꺼낼 때 눈이 반짝이는 아이예요. 정답 맞히기보다 "네 생각은 어때?"라고 물어봐 주세요. 재능 방향: 예술·글쓰기·발표·요리와 만들기.',
  '재성':'현실 감각과 목표 의식의 <b>성취의 별</b>이 강해요. 목표와 보상이 눈에 보일 때 놀라운 집중력을 발휘합니다. 용돈 기입장, 목표 스티커판처럼 "보이는 성취"가 잘 통해요. 재능 방향: 수 감각·경제 관념·기획 놀이.',
  '관성':'책임감과 질서의 <b>모범의 별</b>이 강해요. 규칙을 잘 지키고 맡은 역할에 진심인 아이지만, 그만큼 스스로에게 엄격해 부담을 속으로 삼켜요. "실수해도 괜찮아"를 자주 들려주세요. 재능 방향: 임원 역할·체계적 학습·팀 활동.',
  '인성':'배우고 이해하는 <b>지혜의 별</b>이 강해요. 책과 이야기, "왜 그런지"를 파고드는 지적 호기심이 이 아이의 재산입니다. 생각이 많아 행동이 느릴 수 있으니 재촉 대신 기다림이 필요해요. 재능 방향: 독서·관찰과 실험·깊이 있는 대화.'
};
const SIP_WEAK_CHILD={
  '비겁':'혼자 버티는 힘은 약한 편이라, 또래와 형제의 응원이 큰 힘이 돼요. "혼자 해봐"라고 두기보다 곁에서 함께 시작해 주세요.',
  '식상':'속마음을 꺼내는 통로가 좁은 편이에요. 그림·일기·역할 놀이처럼 간접 표현 도구를 쥐여주면 마음이 보이기 시작합니다.',
  '재성':'눈앞의 보상보다 재미와 의미로 움직이는 아이예요. "이거 하면 사줄게"보다 "이거 진짜 재밌겠다"가 훨씬 잘 통해요.',
  '관성':'틀에 맞추는 걸 답답해하는 자유로운 결이에요. 규칙은 최소한으로 줄이되, 그 몇 가지는 확실하게 지키게 해주세요.',
  '인성':'궁금하면 몸으로 먼저 부딪히는 실전형이에요. 책상 공부보다 체험과 실험으로 배울 때 흡수가 훨씬 빠릅니다.'
};
const ENERGY_TXT={
  '태강':'에너지 탱크가 아주 큰 <b>기운 넘침형</b>이에요. 이 힘을 쓸 곳이 없으면 집 안에서 엉뚱하게 터지니, 몸을 크게 쓰는 활동과 아이가 주도하는 프로젝트로 출구를 만들어 주세요.',
  '신강':'자기 중심이 단단한 <b>자가 발전형</b>이에요. 밀어붙이는 훈육보다 "네가 정해봐"라고 운전대를 맡길 때 오히려 책임감 있게 움직입니다.',
  '중화':'에너지 균형이 좋은 <b>유연 적응형</b>이에요. 환경에 잘 맞춰가는 만큼, 어떤 어른과 친구 곁에 두느냐가 그대로 아이의 색이 됩니다. 좋은 환경이 곧 최고의 교육이에요.',
  '신약':'에너지가 섬세하게 작동하는 <b>지지 충전형</b>이에요. 혼자 많은 걸 감당하게 하기보다, 어른의 지지와 안정된 환경 속에서 재능이 피어납니다. 칭찬과 인정이 이 아이의 연료예요.',
  '태약':'주변 기운에 민감한 <b>여린 결의 섬세형</b>이에요. 다그침에는 움츠러들지만 따뜻한 품에서는 놀랍게 자랍니다. 집과 부모라는 안전기지가 단단할수록 밖에서 더 용감해져요.'
};
const SINSAL_CHILD=[
  {arr:YEOKMA,h:'驛馬',n:'역마살 — 활동의 별',t:'몸을 움직여야 머리도 함께 도는 아이예요. 가만히 앉혀두는 공부보다 여행·현장학습·운동이 이 아이에게는 최고의 교과서입니다.'},
  {arr:DOHWA,h:'桃花',n:'도화살 — 매력의 별',t:'어딜 가나 예쁨받는 흡인력을 타고났어요. 시선을 즐기는 기질이니 발표·공연·무대 경험을 만들어 주면 매력이 재능으로 자랍니다.'},
  {arr:HWAGAE,h:'華蓋',n:'화개살 — 예술과 사색의 별',t:'혼자 노는 시간이 이 아이의 창작실이에요. 혼자 논다고 걱정하지 마시고, 그 몰입의 시간을 방해 없이 지켜주세요.'},
];
const CHEMI_TXT={
  same:{arrow:'⇄',name:'닮은꼴 케미',t:'부모와 아이의 오행이 같은 <b>비화(比和)</b> 관계예요. 말하지 않아도 통하는 순간이 많지만, 부딪히면 똑같은 고집이 정면충돌합니다. 훈육이 힘겨루기가 되기 쉬우니 "너 vs 나"가 아니라 "우리 같이"라는 같은 편 언어가 이 관계의 열쇠예요.'},
  pGivesC:{arrow:'→',name:'물 주는 케미',t:'부모의 기운이 아이를 살리는 <b>상생(부모→아이)</b> 관계예요. 부모의 지원과 가르침이 아이에게 자연스럽게 스며드는, 명리에서 가장 순한 부모-자녀 구도입니다. 다만 잘 흡수되는 만큼 다 해주게 되기 쉬워요. 아이 몫의 실패까지 대신 치우지 않도록, 반 걸음 뒤에서 걸어주세요.'},
  cGivesP:{arrow:'←',name:'효자 케미',t:'아이의 기운이 부모를 살리는 <b>상생(아이→부모)</b> 관계예요. 함께 있으면 부모가 힘을 얻는, 존재만으로 효도하는 아이입니다. 대신 이런 아이는 부모의 기분을 먼저 살피는 애어른이 되기 쉬워요. "엄마 아빠 걱정 말고, 네 마음 먼저"라고 자주 말해주세요.'},
  pKesC:{arrow:'⇥',name:'조련사 케미',t:'부모의 기운이 아이를 누르는 <b>상극(부모→아이)</b> 관계예요. 부모의 말이 아이에게는 두 배 크기로 꽂힙니다 — 같은 꾸중도 이 아이에게는 더 아프게 박혀요. 지시는 절반으로 줄이고 목소리는 한 톤 낮추면, 이 관계는 아이를 단단하게 벼려주는 좋은 담금질이 됩니다.'},
  cKesP:{arrow:'⤺',name:'맞수 케미',t:'아이의 기운이 부모를 치고 올라오는 <b>상극(아이→부모)</b> 관계예요. 아이가 유독 부모를 시험하고 이기고 싶어 하는 구도라, 말대꾸는 반항이 아니라 이 관계의 대화법입니다. 논리로 눌러 이기려 하지 말고 선택권을 내어주세요 — 져주는 것이 이기는 관계예요.'}
};
const OH_FILL={
  '목':{color:'초록 · 파랑',act:'식물 기르기 · 아침 산책 · 새로운 배움',food:'잎채소 · 새싹채소',dir:'동쪽 창가'},
  '화':{color:'빨강 · 주황',act:'몸 놀이 · 무대와 발표 · 신나는 음악',food:'토마토 · 붉은 과일',dir:'남쪽의 밝은 빛'},
  '토':{color:'노랑 · 베이지',act:'흙 놀이 · 요리 · 정리 루틴',food:'곡물 · 뿌리채소',dir:'집의 중심 공간'},
  '금':{color:'흰색 · 은색',act:'악기 연주 · 만들기 · 마무리 놀이',food:'배 · 무 · 흰살생선',dir:'서쪽의 노을'},
  '수':{color:'검정 · 네이비',act:'물놀이 · 독서 · 충분한 잠',food:'검은콩 · 해조류',dir:'북쪽의 고요함'}
};

/* ══════════════ 3. UI 초기화 ══════════════ */
const $=s=>document.querySelector(s);
const birthInput=$('#inBirth'),parentInput=$('#inParent'),hourSel=$('#inHour');
const nowY=new Date().getFullYear();
[birthInput,parentInput].forEach(el=>el.addEventListener('input',()=>{el.value=el.value.replace(/\D/g,'').slice(0,8);}));
const HOUR_NAMES=['자시 (23:30~01:29)','축시 (01:30~03:29)','인시 (03:30~05:29)','묘시 (05:30~07:29)','진시 (07:30~09:29)','사시 (09:30~11:29)','오시 (11:30~13:29)','미시 (13:30~15:29)','신시 (15:30~17:29)','유시 (17:30~19:29)','술시 (19:30~21:29)','해시 (21:30~23:29)'];
const hourSelP=$('#inHourP');
HOUR_NAMES.forEach((n,i)=>{hourSel.add(new Option(n,i*2));hourSelP.add(new Option(n,i*2));});

/* 카카오 시작 버튼 — 아임웹 배포 시 회원가입/로그인 위젯으로 교체 (상단 주석 참고) */
$('#btnKakaoStart').addEventListener('click',()=>{
  document.querySelector('#form-section .field').scrollIntoView({behavior:'smooth',block:'center'});
});

/* 보호자 생일 입력 시에만 추가 옵션 노출 */
parentInput.addEventListener('input',()=>{
  $('#parentExtra').style.display=parentInput.value.trim()?'block':'none';
});

let gender='남',calType='solar',calTypeP='solar';
$('#segCalP').addEventListener('click',e=>{
  if(e.target.tagName!=='BUTTON')return;
  document.querySelectorAll('#segCalP button').forEach(b=>b.classList.remove('on'));
  e.target.classList.add('on');calTypeP=e.target.dataset.v;
  $('#leapRowP').style.display=calTypeP==='lunar'?'flex':'none';
});
$('#segGender').addEventListener('click',e=>{
  if(e.target.tagName!=='BUTTON')return;
  document.querySelectorAll('#segGender button').forEach(b=>b.classList.remove('on'));
  e.target.classList.add('on');gender=e.target.dataset.v;
});
$('#segCal').addEventListener('click',e=>{
  if(e.target.tagName!=='BUTTON')return;
  document.querySelectorAll('#segCal button').forEach(b=>b.classList.remove('on'));
  e.target.classList.add('on');calType=e.target.dataset.v;
  $('#leapRow').style.display=calType==='lunar'?'flex':'none';
});

function parse8(raw,label,lunarOk){
  if(!/^\d{8}$/.test(raw))return{err:label+' 생년월일 8자리를 숫자로만 입력해 주세요 (예: 20190602)'};
  const y=+raw.slice(0,4),m=+raw.slice(4,6),d=+raw.slice(6,8);
  if(y<1900||y>nowY)return{err:'연도는 1900~'+nowY+' 사이로 입력해 주세요'};
  if(m<1||m>12)return{err:'월은 01~12 사이로 입력해 주세요'};
  const maxD=lunarOk?30:new Date(y,m,0).getDate();
  if(d<1||d>maxD)return{err:m+'월은 '+maxD+'일까지 있어요'};
  return{y,m,d};
}
function notFuture(y,m,d){
  const t=new Date();
  return y*10000+m*100+d<=t.getFullYear()*10000+(t.getMonth()+1)*100+t.getDate();
}

/* ══════════════ 4. 분석 실행 & 렌더 ══════════════ */
$('#btnAnalyze').addEventListener('click',()=>{
  const name=$('#inName').value.trim()||'우리 아이';
  const parsed=parse8(birthInput.value.trim(),'아이',calType==='lunar');
  if(parsed.err){alert(parsed.err);birthInput.focus();return;}
  let y=parsed.y,m=parsed.m,d=parsed.d;
  const h=+hourSel.value;
  let birthLine='';
  if(calType==='lunar'){
    const conv=lunarToSolar(y,m,d,$('#inLeap').checked);
    if(!conv||conv.err){alert(conv?conv.err:'변환 가능한 범위를 벗어났습니다.');return;}
    birthLine='음력 '+y+'년 '+($('#inLeap').checked?'윤':'')+m+'월 '+d+'일 (양력 '+conv.y+'년 '+conv.m+'월 '+conv.d+'일)';
    y=conv.y;m=conv.m;d=conv.d;
  }else{
    birthLine='양력 '+y+'년 '+m+'월 '+d+'일';
  }
  if(!notFuture(y,m,d)){alert('아직 오지 않은 날짜예요. 오늘 이전 날짜로 입력해 주세요.');return;}

  const s=calcSaju(y,m,d,h);
  const ilganName=GAN[s.dGan],ilganEl=GAN_EL[s.dGan];
  const born=new Date(y,m-1,d),today=new Date();
  let age=today.getFullYear()-y;
  if(today<new Date(today.getFullYear(),m-1,d))age--;
  const ageLabel=age<1?'첫돌 전':'만 '+age+'세';

  /* CH1 원국표 */
  $('#rIntroTitle').innerHTML='지금부터 '+name+'의 타고난 결을<br>하나씩 읽어드릴게요';
  $('#rName').textContent=name+' ('+(gender==='남'?'남아':'여아')+' · '+ageLabel+')의 사주 원국';
  $('#rBirth').innerHTML=birthLine+'<br>'+(h<0?'시간 미상':HOUR_NAMES[h/2].split(' ')[0])+' 생';
  const cols=[
    {label:'時柱 시주',g:s.hGan,j:s.hJi},
    {label:'日柱 일주',g:s.dGan,j:s.dJi,me:true},
    {label:'月柱 월주',g:s.mGan,j:s.mJi},
    {label:'年柱 연주',g:s.yGan,j:s.yJi},
  ];
  $('#rPillars').innerHTML=cols.map(c=>{
    if(c.g===null)return '<div class="col"><div class="plabel">'+c.label+'</div>'
      +'<div class="pchar"><span class="hanja" style="color:var(--muted)">?</span><span class="han">미상</span><span class="ss">—</span></div>'
      +'<div class="pchar"><span class="hanja" style="color:var(--muted)">?</span><span class="han">미상</span><span class="ss">—</span></div></div>';
    const gTag=c.me?'<span class="ss me">아이(일간)</span>':'<span class="ss">'+sipseong(s.dGan,c.g)+'</span>';
    const jTag='<span class="ss">'+sipseong(s.dGan,JI_JG[c.j])+'</span>';
    return '<div class="col"><div class="plabel">'+c.label+'</div>'
      +'<div class="pchar"><span class="hanja el-'+GAN_EL[c.g]+'">'+GANH[c.g]+'</span><span class="han">'+GAN[c.g]+'·'+GAN_EL[c.g]+'</span>'+gTag+'</div>'
      +'<div class="pchar"><span class="hanja el-'+JI_EL[c.j]+'">'+JIH[c.j]+'</span><span class="han">'+JI[c.j]+'·'+JI_EL[c.j]+'</span>'+jTag+'</div></div>';
  }).join('');
  $('#rIlgan').innerHTML=name+'의 일간은 <b>'+GANH[s.dGan]+'('+ilganName+ilganEl+')</b> — '+ILGAN_CHILD[ilganName];

  /* CH2 오행 */
  const rawCnt={목:0,화:0,토:0,금:0,수:0};
  [s.yGan,s.mGan,s.dGan,s.hGan].forEach(g=>{if(g!==null)rawCnt[GAN_EL[g]]++;});
  [s.yJi,s.mJi,s.dJi,s.hJi].forEach(j=>{if(j!==null)rawCnt[JI_EL[j]]++;});
  const total=Object.values(rawCnt).reduce((a,b)=>a+b,0);
  $('#rOhaeng').innerHTML=Object.entries(rawCnt).map(([el,c])=>
    '<div class="obar"><span class="oname el-'+el+'">'+ELH[el]+' '+el+'</span>'
    +'<div class="track"><div class="fill f-'+el+'" data-w="'+(c/total*100).toFixed(0)+'"></div></div>'
    +'<span class="cnt">'+c+'개</span></div>').join('');

  const sortedO=Object.entries(rawCnt).sort((a,b)=>b[1]-a[1]);
  const maxC=sortedO[0][1],minC=sortedO[4][1];
  const maxEls=sortedO.filter(([,c])=>c===maxC).map(([e])=>e);
  const zeros=sortedO.filter(([,c])=>c===0).map(([e])=>e);
  const minEls=sortedO.filter(([,c])=>c===minC).map(([e])=>e);
  const elName=arr=>arr.map(e=>ELH[e]+'('+e+')').join('·');

  let strongMsg;
  if(maxEls.length===1&&maxC>=3){
    strongMsg='<b>넘치는 기운 — '+elName(maxEls)+' '+maxC+'개.</b> 여덟 글자 중 '+maxC+'개면 이 기운이 아이의 개성을 주도합니다. '+OH_STRONG_CHILD[maxEls[0]];
  }else if(maxEls.length===1){
    strongMsg='<b>가장 발달한 기운 — '+elName(maxEls)+' '+maxC+'개.</b> '+OH_STRONG_CHILD[maxEls[0]];
  }else{
    strongMsg='<b>발달한 기운 — '+elName(maxEls)+' 각 '+maxC+'개 (동률).</b> 한 기운이 독주하지 않고 여러 기운이 나란한 균형형이에요. 상황마다 다른 얼굴을 보여주는 아이라, 한 가지 모습으로 단정 짓지 말고 여러 무대를 경험하게 해주세요.';
  }
  $('#rOhaengStrong').innerHTML=strongMsg;

  let weakMsg;
  if(zeros.length){
    weakMsg='<b>원국에 없는 기운 — '+elName(zeros)+' 0개.</b> 명리에서 없는 오행은 결핍이 아니라, 부모가 환경으로 채워줄 수 있는 자리입니다. '+zeros.map(e=>OH_WEAK_CHILD[e]).join(' ');
  }else if(minEls.length===1){
    weakMsg='<b>가장 약한 기운 — '+elName(minEls)+' '+minC+'개.</b> '+OH_WEAK_CHILD[minEls[0]];
  }else{
    weakMsg='<b>약한 기운 — '+elName(minEls)+' 각 '+minC+'개.</b> '+minEls.map(e=>OH_WEAK_CHILD[e]).join(' ');
  }
  $('#rOhaengWeak').innerHTML=weakMsg;

  const pw=elementPower(s);
  const shin=shinStrength(s,pw);
  $('#rEnergy').innerHTML='<b>'+name+'의 에너지 타입</b><br>'+ENERGY_TXT[shin.grade]
    +'<br><span style="font-size:11.5px;color:var(--muted)">※ 계절(월지)과 지장간의 힘까지 반영한 심화 판정 기준입니다.</span>';

  /* CH3 십성 */
  const sg={비겁:0,식상:0,재성:0,관성:0,인성:0};
  [s.yGan,s.mGan,s.hGan].forEach(gv=>{if(gv!==null)sg[SS_GROUP[sipseong(s.dGan,gv)]]++;});
  [s.yJi,s.mJi,s.dJi,s.hJi].forEach(j=>{if(j!==null)sg[SS_GROUP[sipseong(s.dGan,JI_JG[j])]]++;});
  const sTotal=Object.values(sg).reduce((a,b)=>a+b,0);
  const SG_LABEL={비겁:'比劫 비겁',식상:'食傷 식상',재성:'財星 재성',관성:'官星 관성',인성:'印星 인성'};
  $('#rSipseong').innerHTML=Object.entries(sg).map(([k,c])=>
    '<div class="obar"><span class="oname">'+SG_LABEL[k]+'</span>'
    +'<div class="track"><div class="fill f-'+k+'" data-w="'+(sTotal?(c/sTotal*100).toFixed(0):0)+'"></div></div>'
    +'<span class="cnt">'+c+'</span></div>').join('');
  const sortedS=Object.entries(sg).sort((a,b)=>b[1]-a[1]);
  const domS=sortedS[0][0],weakS=sortedS[4][0];
  $('#rTalent').innerHTML='<b>주도하는 별 — '+SG_LABEL[domS]+' ('+sortedS[0][1]+'개).</b> '+SIP_TALENT[domS];
  $('#rTalentWeak').innerHTML=(sortedS[4][1]===0
    ?'<b>비어 있는 별 — '+SG_LABEL[weakS]+'.</b> '
    :'<b>가장 약한 별 — '+SG_LABEL[weakS]+' ('+sortedS[4][1]+'개).</b> ')+SIP_WEAK_CHILD[weakS];

  /* CH4 사용설명서 */
  const man=ILGAN_PARENTING[ilganName];
  $('#rPraise').textContent=man.p;
  $('#rAvoid').textContent=man.a;
  $('#rTalk').textContent=man.t;

  /* CH5 신살 + 기질 전환기 */
  const branches=[s.yJi,s.mJi,s.dJi,s.hJi].filter(v=>v!==null);
  const bases=[s.yJi,s.dJi];
  const found=[];
  SINSAL_CHILD.forEach(x=>{
    if(bases.some(b=>branches.includes(x.arr[SAMHAP(b)])))found.push(x);
  });
  if((CHEONEUL[s.dGan]||[]).some(b=>branches.includes(b)))
    found.push({h:'天乙',n:'천을귀인 — 귀인의 별',t:'결정적인 순간마다 도와주는 어른과 친구가 나타나는 복을 타고났어요. "도와달라고 말해도 괜찮아"를 가르쳐 주시면 이 복이 두 배가 됩니다.'});
  $('#rSinsal').innerHTML=found.length
    ?found.map(x=>'<div class="sinsal"><div class="schar">'+x.h+'</div><div class="sbody"><b>'+x.n+'</b><p>'+x.t+'</p></div></div>').join('')
    :'<div class="sinsal"><div class="schar">淸</div><div class="sbody"><b>맑은 원국</b><p>대표 신살이 강하게 드러나지 않는 담백한 구조예요. 굴곡 대신 오행과 십성의 균형이 그대로 성장에 반영되는, 노력한 만큼 정직하게 자라는 아이입니다.</p></div></div>';
  const startAge=daeunStartAge(s,gender,y,m,d);
  $('#rTurn').innerHTML='<b>기질의 첫 전환기 — '+startAge+'세 무렵.</b> '
    +(age<startAge
      ?'명리에서는 이 나이에 첫 큰 운이 들어오면서 아이의 관심사와 기질이 눈에 띄게 또렷해진다고 봅니다. 그 전까지는 특정 방향을 정하기보다 다양한 경험을 넓게 깔아주는 시기예요.'
      :'이미 첫 큰 운이 들어온 뒤라, 지금 보이는 아이의 관심사와 기질은 지나가는 유행이 아니라 뿌리가 있는 방향일 가능성이 큽니다. 지금의 "좋아하는 것"을 눈여겨봐 주세요.');

  /* CH6 부모 케미 */
  const pRaw=parentInput.value.trim();
  if(pRaw){
    const pp=parse8(pRaw,'보호자',calTypeP==='lunar');
    if(pp.err){alert(pp.err);parentInput.focus();return;}
    let py=pp.y,pm=pp.m,pd=pp.d;
    if(calTypeP==='lunar'){
      const pconv=lunarToSolar(py,pm,pd,$('#inLeapP').checked);
      if(!pconv||pconv.err){alert(pconv?('보호자: '+pconv.err):'보호자 생년월일이 변환 가능한 범위를 벗어났습니다.');parentInput.focus();return;}
      py=pconv.y;pm=pconv.m;pd=pconv.d;
    }
    if(!notFuture(py,pm,pd)){alert('보호자 생년월일이 미래 날짜예요.');parentInput.focus();return;}
    const ps=calcSaju(py,pm,pd,+hourSelP.value);
    const pEl=GAN_EL[ps.dGan],cEl=ilganEl;
    let key;
    if(pEl===cEl)key='same';
    else if(SHENG[pEl]===cEl)key='pGivesC';
    else if(SHENG[cEl]===pEl)key='cGivesP';
    else if(KE[pEl]===cEl)key='pKesC';
    else key='cKesP';
    const c=CHEMI_TXT[key];
    $('#chParent').querySelector('.ch-el').innerHTML='<span class="el-'+pEl+'">'+ELH[pEl]+'</span> '+pEl;
    $('#chChild').querySelector('.ch-el').innerHTML='<span class="el-'+cEl+'">'+ELH[cEl]+'</span> '+cEl;
    $('#chArrow').textContent=c.arrow;
    $('#rChemi').innerHTML='<b>'+c.name+'</b> — 보호자 일간 '+GANH[ps.dGan]+'('+GAN[ps.dGan]+pEl+') × 아이 일간 '+GANH[s.dGan]+'('+ilganName+cEl+')<br>'+c.t;
    $('#secChemi').style.display='block';
  }else{
    $('#secChemi').style.display='none';
  }

  /* CH7 보완 가이드 + 원석 티저 */
  const targets=zeros.length?zeros:minEls;
  $('#rGuide').innerHTML=targets.map(el=>{
    const g=OH_FILL[el];
    return '<div class="g-item g-full"><span class="gk">채워줄 기운</span><span class="gv el-'+el+'">'+ELH[el]+'('+el+') — '+({목:'성장',화:'표현',토:'안정',금:'마무리',수:'휴식'}[el])+'의 기운</span></div>'
      +'<div class="g-item"><span class="gk">옷·소품 색</span><span class="gv">'+g.color+'</span></div>'
      +'<div class="g-item"><span class="gk">함께할 활동</span><span class="gv">'+g.act+'</span></div>'
      +'<div class="g-item"><span class="gk">밥상 위 보완</span><span class="gv">'+g.food+'</span></div>'
      +'<div class="g-item"><span class="gk">기운의 방위</span><span class="gv">'+g.dir+'</span></div>';
  }).join('');
  $('#gemTitle').innerHTML=name+'에게 부족한 <span class="el-'+targets[0]+'">'+ELH[targets[0]]+'('+targets[0]+')</span> 기운을 담은<br>수호 원석 팔찌';
  $('#gemDesc').textContent=name+'의 원국에 맞춘 원석 조합을 준비하고 있어요. 곧 만나요.';

  /* 표시 & 애니메이션 */
  $('#report').style.display='block';
  requestAnimationFrame(()=>{
    document.querySelectorAll('.fill').forEach(f=>{f.style.width=f.dataset.w+'%';});
  });
  document.querySelector('#report').scrollIntoView({behavior:'smooth',block:'start'});
});

/* 출시 알림 (임시) */
$('#btnGemNotify').addEventListener('click',()=>{
  alert('준비가 끝나면 이 자리에서 바로 만나보실 수 있어요. 조금만 기다려주세요 🙏');
});

/* 공유 */
$('#btnShare').addEventListener('click',async()=>{
  const nameEl=$('#rName');
  const who=(nameEl&&nameEl.textContent&&nameEl.textContent!=='—')?nameEl.textContent.split(' (')[0]:'우리 아이';
  const shareData={
    title:'명식LAB — 내 아이 이해하기',
    text:who+' 사주를 읽어봤는데, 그동안의 행동이 다 이해가 되더라 — 한번 열어봐!',
    url:location.href.split('#')[0]
  };
  if(navigator.share){
    try{await navigator.share(shareData);}catch(e){}
  }else{
    try{
      await navigator.clipboard.writeText(shareData.url);
      alert('링크가 복사됐어요. 원하는 곳에 붙여넣어 공유해 보세요.');
    }catch(e){
      alert('이 브라우저에서는 공유 기능이 지원되지 않아요. 링크: '+shareData.url);
    }
  }
});
}

/* DOM 준비 여부와 무관하게 안전하게 실행 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChildApp);
} else {
  initChildApp();
}
