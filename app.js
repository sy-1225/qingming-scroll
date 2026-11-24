const el=id=>document.getElementById(id);
const view=el('view'),world=el('world'),painting=el('painting'),card=el('card');
let center=.5,vertical=.5,zoom=1,w,h,x,y,category='全部',drag,lastMove=0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function render(){
  if(!painting.naturalWidth)return;
  h=view.clientHeight*zoom;w=h*painting.naturalWidth/painting.naturalHeight;
  x=clamp(w*center-view.clientWidth/2,0,Math.max(0,w-view.clientWidth));
  y=clamp(h*vertical-view.clientHeight/2,0,h-view.clientHeight);
  center=(x+view.clientWidth/2)/w;vertical=(y+view.clientHeight/2)/h;
  Object.assign(world.style,{width:w+'px',height:h+'px',transform:'translate('+(-x)+'px,'+(-y)+'px)'});
  el('frame').style.left=(x/w*100)+'%';el('frame').style.width=Math.min(100,view.clientWidth/w*100)+'%';
  el('map').setAttribute('aria-valuenow',Math.round(center*100));el('ratio').value=zoom.toFixed(1)+'×';
}
function hide(){card.hidden=true}
function show(title,cat,body,event){
  if(Date.now()-lastMove<200)return;
  el('detail').hidden=false;detailImage(event);el('kind').textContent='画中风物　／　'+cat;el('name').textContent=title;el('desc').textContent=body;card.hidden=false;
  const box=view.getBoundingClientRect(),cx=event?.clientX??box.width*.62,cy=(event?.clientY??box.height*.65)-box.top;
  card.style.left=clamp(cx+14,9,box.width-card.offsetWidth-9)+'px';
  card.style.top=clamp(cy-card.offsetHeight-10,9,box.height-card.offsetHeight-9)+'px';
}
function filter(cat,move){
  category=cat;hide();
  document.querySelectorAll('#filters button').forEach(b=>b.classList.toggle('on',b.textContent===cat));
  const visible=[];document.querySelectorAll('.spot').forEach(b=>{b.hidden=cat!=='画卷漫游'&&b.dataset.cat!==cat;if(!b.hidden)visible.push(parseFloat(b.style.left)/100)});
  if(move&&cat!=='画卷漫游'&&visible.length){center=visible.sort((a,b)=>Math.abs(a-center)-Math.abs(b-center))[0];render()}
}
for(const cat of ['画卷漫游','市井百业','衣食住行','科技工艺','宋代风物']){const b=document.createElement('button');b.textContent=cat;b.onclick=()=>filter(cat,true);el('filters').append(b)}
function addSpots(records){for(const [pos,level,title,cat,body] of records){
 const b=document.createElement('button');b.className='spot';b.textContent=title;b.dataset.cat=cat;b.style.left=pos+'%';b.style.top=level+'%';b.onclick=e=>show(title,cat,body,e);world.append(b)
}}
view.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();drag={sx:e.clientX,sy:e.clientY,x,y,moved:false}};
view.onpointermove=e=>{if(!drag||!e.buttons)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>4){drag.moved=true;view.setPointerCapture(e.pointerId);hide();center=(drag.x-dx+view.clientWidth/2)/w;vertical=(drag.y-dy+view.clientHeight/2)/h;render()}};
window.addEventListener('pointerup',()=>{if(drag?.moved)lastMove=Date.now();drag=null});view.onpointercancel=()=>drag=null;
function scale(d){zoom=clamp(Math.round((zoom+d)*10)/10,1,3);hide();render()}
el('plus').onclick=()=>scale(.2);el('minus').onclick=()=>scale(-.2);
view.onwheel=e=>{e.preventDefault();if(e.ctrlKey||Math.abs(e.deltaY)>Math.abs(e.deltaX))scale(e.deltaY<0?.1:-.1);else{center+=e.deltaX/w;hide();render()}};
function goto(n){center=n;hide();render()}
document.querySelectorAll('[data-pos]').forEach(b=>b.onclick=()=>{filter('画卷漫游');goto(+b.dataset.pos);el('notes').close()});
function mapMove(e){const r=el('map').getBoundingClientRect();goto((e.clientX-r.left)/r.width)}
el('map').onpointerdown=e=>{el('map').setPointerCapture(e.pointerId);mapMove(e)};el('map').onpointermove=e=>{if(e.buttons)mapMove(e)};
window.addEventListener('keydown',e=>{if(el('notes').open)return;if(e.key==='Escape')hide();if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();goto(center+(e.key==='ArrowLeft'?-1:1)*view.clientWidth*.35/w)}});
el('full').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();card.querySelector('button').onclick=hide;el('about').onclick=()=>el('notes').showModal();el('notes').querySelector('button').onclick=()=>el('notes').close();
new ResizeObserver(render).observe(view);painting.onload=render;render();
function detailImage(event){
 const t=event?.target?.closest('.spot,.actor');if(!t)return;
 const thumbEl=el('detail');const porcelain=t.textContent==='瓷器铺';thumbEl.style.backgroundImage=porcelain?'url(porcelain.jpg)':'url(scroll.jpg)';if(porcelain){thumbEl.style.backgroundSize='cover';thumbEl.style.backgroundPosition='center';return;}const rx=parseFloat(t.style.left)/100,ry=parseFloat(t.style.top)/100;
 const thumb=el('detail');thumb.hidden=false;
 const targetH=painting.naturalHeight*.45;
 const targetW=targetH*painting.naturalWidth/painting.naturalHeight;
 thumb.style.backgroundSize=targetW+'px '+targetH+'px';
 thumb.style.backgroundPosition=(72-rx*targetW)+'px '+(82-ry*targetH)+'px';
}

el('prev').onclick=()=>goto(center-view.clientWidth*.68/w);
el('next').onclick=()=>goto(center+view.clientWidth*.68/w);
el('more').onclick=()=>{el('readingKind').textContent=el('kind').textContent;el('readingTitle').textContent=el('name').textContent;el('readingText').textContent=el('desc').textContent+' '+(further[el('name').textContent]||'细看人物的衣摆、脚步与视线，可以发现他们和周围街道、摊位及舟船之间的呼应。');el('reading').showModal()};
for(const d of ['finder','reading'])el(d).querySelector('.close').onclick=()=>el(d).close();
function searchResults(){
 const results=el('results');results.replaceChildren();
 const spots=[...world.querySelectorAll('.spot')].filter(b=>b.textContent.includes(el('query').value.trim()));
 if(!spots.length)results.textContent='卷中未找到相关标记。';
 for(const spot of spots){const b=document.createElement('button');b.textContent=spot.textContent;b.onclick=()=>{el('finder').close();filter('画卷漫游');goto(parseFloat(spot.style.left)/100);openSpot(spot)};results.append(b)}
}
function openSpot(spot){const r=spot.getBoundingClientRect();show(spot.textContent,spot.dataset.cat,records.find(row=>row[2]===spot.textContent)[4],{target:spot,clientX:r.right,clientY:r.bottom+85})}
el('query').oninput=searchResults;el('search').onclick=()=>{el('query').value='';searchResults();el('finder').showModal();el('query').focus()};
// Coordinates are in each painted scene, before joining the three panels.
const sceneRecords=[
 [0,415,152,'药铺','市井百业','木铺临街开门，行人停在柜台前问询。这里以药铺为题，呈现街坊买药的日常。'],
 [0,849,396,'布庄','衣食住行','布帛成匹陈列，顾客可到铺前看颜色、摸质地，再请店家量裁。'],
 [0,1120,492,'驼队','宋代风物','驮货的骆驼沿街前行，商旅把远方的货物带进汴京。'],
 [0,1460,170,'城门','科技工艺','道路在门洞前收拢，城外来的车马和行人由此进入街市。'],
 [0,913,571,'牛车','衣食住行','沉重的货捆叠在车上，前方的牲畜拉着车轮缓缓向前。'],
 [1,357,542,'瓷器铺','市井百业','碗、盘、瓶、罐沿木架排开。临街的铺面把瓷器摆到客人眼前，方便端详釉色、比较器形。'],
 [1,850,263,'茶楼','衣食住行','楼上茶客凭栏而坐，一边饮茶，一边看桥头人流。楼下的街巷也成了茶席旁的一景。'],
 [1,550,475,'食肆','衣食住行','炉上蒸汽升起，食案边坐着歇脚的客人。摊主在炉灶与桌案之间照应生意。'],
 [1,1508,243,'虹桥','科技工艺','相互搭接的木构件撑起桥面，为桥下舟船留出通道。桥上挑担的行人与河中船工在这里相遇。'],
 [1,1860,494,'漕船','科技工艺','宽大的船舱用来装载货物，舱篷遮风避雨。船到埠头，水上的货物便可转上街市。'],
 [1,859,660,'挑夫','宋代风物','一根扁担挑起两头货篮。挑夫沿桥市穿行，替商户搬运货物。'],
 [1,1125,466,'果子摊','市井百业','摊主在布棚下摆开各色果品，过路人可以停下来拣选。'],
 [1,1406,547,'船工','宋代风物','船工俯身执篙，在靠岸时调整船身与码头的距离。'],
 [2,172,396,'河埠','市井百业','货舟在岸边停靠，等候搬运。河埠把水路与通往城里的道路接在一起。'],
 [2,723,578,'村店','衣食住行','行人沿乡道走到屋舍前，可以在路边歇脚用饭。'],
 [2,1310,390,'驴队','宋代风物','驮货的牲畜沿小路结队而行，乡野与城镇之间的往来由此可见。'],
 [2,1950,591,'春耕','科技工艺','耕畜在田间拉犁，农人随行照看。由繁忙的街市向东，画卷在春日农事中收束。']
];
const records=sceneRecords.map(([s,x,y,...info])=>[(2124*s+x)/6420*100,y/724*100,...info]);
const further={'瓷器铺':'赏画时可以从上往下看三层木架，比较细颈瓶的纵向轮廓、浅盘的开口和碗的弧线。柜台外站着的顾客，把陈列的器物与街上的买卖联系起来。','虹桥':'从桥脚往上看，成组的斜木托住桥身，桥面的弧线与下方船篷的弧线彼此呼应。','茶楼':'留意临河一侧的开窗与栏杆。坐在二楼的人看得见桥面，也与街上的喧闹隔开了一层。','漕船':'顺着船身辨认篙、舱篷与船尾，再看岸上的货捆，便能串起靠岸、卸载和转运的过程。'};
center=.48;addSpots(records);filter('画卷漫游');window.initMotion?.(world,show);
if(painting.complete && painting.naturalWidth) render();
else painting.addEventListener('load',render,{once:true});
