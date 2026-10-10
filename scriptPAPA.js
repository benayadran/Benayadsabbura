const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d'),wrap=$('#wrap');
let tool='pen',color='#ffffff',size=4,drawing=false,last=null,hist=[],n=0,bgMode=0,typeMode=true,zc=3,cnt=0,lastCell=null;
const BGS=[{n:' سبورة خضراء',c:'board',d:1},{n:' سبورة سوداء',c:'black',d:1},{n:' ورقة بيضاء',c:'white'},{n:' ورقة صفراء',c:'yellow'},{n:'▦ مربعات',c:'grid'},{n:' مخططة',c:'lined'},{n:' ميليمترية',c:'mm'},{n:'⋯ نقطية',c:'dots'},{n:' سيس',c:'seyes'},{n:' ورقة محاسبية',c:'ledger'}],COLS=['#ffffff','#111111','#ffd84d','#ff6b6b','#4dabff','#5be37d'];
const FONT='"Noto Kufi Arabic",sans-serif';
function fit(){
  const r=wrap.getBoundingClientRect(),d=window.devicePixelRatio||1;
  const old=document.createElement('canvas');old.width=cv.width;old.height=cv.height;old.getContext('2d').drawImage(cv,0,0);
  cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);
  cv.style.width=r.width+'px';cv.style.height=r.height+'px';
  ctx.setTransform(d,0,0,d,0,0);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.drawImage(old,0,0,old.width/d,old.height/d);hist=[];
}
new ResizeObserver(fit).observe(wrap);
function snap(){hist.push(ctx.getImageData(0,0,cv.width,cv.height));if(hist.length>20)hist.shift()}
function pt(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);snap();drawing=true;last=pt(e);seg(last,last)});
cv.addEventListener('pointermove',e=>{if(!drawing)return;const p=pt(e);seg(last,p);last=p});
['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>drawing=false));
function seg(a,b){
  ctx.save();
  ctx.globalCompositeOperation=tool==='er'?'destination-out':'source-over';
  ctx.globalAlpha=tool==='hl'?.4:1;
  ctx.strokeStyle=color;ctx.lineWidth=tool==='pen'?size:size*4;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x+.01,b.y);ctx.stroke();ctx.restore();
}
$$('[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.classList.toggle('on',x===b))});
COLS.forEach((c,i)=>{const s=document.createElement('button');s.className='sw'+(i?'':' on');s.style.background=c;s.setAttribute('aria-label','لون '+(i+1));
  s.onclick=()=>{color=c;if(tool==='er')$('[data-tool=pen]').click();$$('.sw').forEach(x=>x.classList.toggle('on',x===s))};$('#sw').appendChild(s)});
$('#sz').oninput=e=>size=+e.target.value;
$('#undo').onclick=()=>{if(hist.length)ctx.putImageData(hist.pop(),0,0)};
$('#clr').onclick=()=>{snap();ctx.clearRect(0,0,cv.width,cv.height)};
BGS.forEach((b,i)=>{const o=document.createElement('option');o.value=i;o.textContent=b.n;$('#bgSel').appendChild(o)});
$('#bgSel').onchange=e=>{bgMode=+e.target.value;const b=BGS[bgMode];wrap.className=b.c+(typeMode?'':' dm');
  if(!b.d&&color==='#ffffff')$$('.sw')[1].click();else if(b.d&&color==='#111111')$$('.sw')[0].click()};
function setMode(t){typeMode=t;wrap.classList.toggle('dm',!t);$('#mode').textContent=t?' الرسم فوق القوالب':' الكتابة في القوالب';$('#mode').classList.toggle('on',!t)}
$('#mode').onclick=()=>setMode(!typeMode);
$('#fs').onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}};
function download(c){const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='sabbura.png';a.click()}
function canvasOnly(){
  const o=document.createElement('canvas'),w=o.width=cv.width,h=o.height=cv.height,d=w/wrap.clientWidth,c=o.getContext('2d'),m=BGS[bgMode].c,mm=3.7795*d;
  c.fillStyle={board:'#1d3b34',black:'#14181c',yellow:'#fff8d6'}[m]||'#ffffff';c.fillRect(0,0,w,h);
  const L=(x1,y1,x2,y2,col,lw)=>{c.strokeStyle=col;c.lineWidth=lw*d;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()};
  const V=(st,col,lw,sk)=>{for(let i=0,x=0;x<w;i++,x=i*st)if(!sk||sk(i))L(x,0,x,h,col,lw)};
  const H=(st,col,lw,sk)=>{for(let i=0,y=0;y<h;i++,y=i*st)if(!sk||sk(i))L(0,y,w,y,col,lw)};
  if(m==='grid'){V(32*d,'#cfd8e3',1);H(32*d,'#cfd8e3',1)}
  if(m==='lined'){H(36*d,'#9db7d6',1);L(w-70*d,0,w-70*d,h,'#e8888a',2)}
  if(m==='mm'){[[1,'#f6d8c3',1,i=>i%5],[5,'#eba878',1,i=>i%10&&i%5===0],[10,'#d9773a',1.5,i=>i%10===0]].forEach(([k,col,lw])=>{const f=i=>k===1?i%5:k===5?(i%10&&!(i%5)):!(i%10);V(mm,col,lw,f);H(mm,col,lw,f)})}
  if(m==='dots'){c.fillStyle='#9aa8b5';for(let x=14*d;x<w;x+=28*d)for(let y=14*d;y<h;y+=28*d){c.beginPath();c.arc(x,y,1.3*d,0,7);c.fill()}}
  if(m==='seyes'){H(2*mm,'#ddd6f5',1,i=>i%4);H(8*mm,'#8f7fd0',1);V(8*mm,'#b9a5e8',1)}
  if(m==='ledger'){H(36*d,'#c5d3e3',1);[90,160,230].forEach(x=>L(w-x*d,0,w-x*d,h,'#4a7fb5',2));[110,220].forEach(x=>L(x*d,0,x*d,h,'#4a7fb5',2))}
  c.drawImage(cv,0,0);download(o);
}
$('#save').onclick=()=>{
  if(!$('.card'))return canvasOnly();
  try{
    const W=wrap.clientWidth,H=wrap.clientHeight,clone=wrap.cloneNode(true),img=document.createElement('img');
    img.src=cv.toDataURL();clone.querySelector('canvas').replaceWith(img);
     const o=[wrap,...wrap.querySelectorAll('*')],c=[clone,...clone.querySelectorAll('*')];
    o.forEach((e,i)=>{if(e.tagName==='CANVAS')return;const cs=getComputedStyle(e);let t='';for(const p of cs)t+=p+':'+cs.getPropertyValue(p)+';';c[i].setAttribute('style',t)});
    img.setAttribute('style','position:absolute;left:0;top:0;width:'+W+'px;height:'+H+'px');
    clone.querySelectorAll('.cb').forEach(x=>x.style.display='none');
    clone.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"><foreignObject width="100%" height="100%">'+new XMLSerializer().serializeToString(clone)+'</foreignObject></svg>';
    const im=new Image();
    im.onload=()=>{try{const o2=document.createElement('canvas');o2.width=W*2;o2.height=H*2;o2.getContext('2d').drawImage(im,0,0,W*2,H*2);download(o2)}catch(e){canvasOnly()}};
    im.onerror=canvasOnly;im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }catch(e){canvasOnly()}
};

/* ---- stamped text (accounts / calculators) ---- */
const T=(t,x,y,sz=20)=>{ctx.font='600 '+sz+'px '+FONT;ctx.fillText(t,x,y)};
function stampLines(lines){
  snap();document.fonts.load('600 28px "Noto Kufi Arabic"').finally(()=>{
    const W=wrap.clientWidth,off=(n++%4)*28;
    ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';
    ctx.font='600 28px '+FONT;const mw=W*0.85,L2=[];
    lines.forEach(l=>{let cur='';l.split(' ').forEach(x=>{const tt=cur?cur+' '+x:x;if(cur&&ctx.measureText(tt).width>mw){L2.push(cur);cur=x}else cur=tt});if(cur)L2.push(cur)});
    L2.forEach((t,i)=>T(t,W/2+off,60+off+i*42,28));ctx.restore();
  });
}

/* ---- editable templates ---- */
const AMT='المبلغ (DA)';
const rowsH=a=>a.map(r=>'<tr'+(r[1]?' class="t"':'')+'><td contenteditable>'+r[0]+'</td><td class="n" contenteditable></td></tr>').join('');
const tbl=(head,body)=>'<table><thead><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table>';
const cell=(c,t)=>'<td class="'+(c||'')+'" contenteditable>'+(t||'')+'</td>';
const grid=(cols,k)=>tbl(cols.map(c=>c[0]),('<tr>'+cols.map(c=>cell(c[1])).join('')+'</tr>').repeat(k));
const NAT_R=[['رقم الأعمال'],['تغير مخزونات المنتجات المصنعة والمنتجات قيد الصنع'],['الإنتاج المثبت'],['إعانات الاستغلال'],['(1) إنتاج السنة المالية',1],['المشتريات المستهلكة'],['الخدمات الخارجية والاستهلاكات الأخرى'],['(2) استهلاك السنة المالية',1],['(3) القيمة المضافة للاستغلال (1-2)',1],['أعباء المستخدمين'],['الضرائب والرسوم والمدفوعات المماثلة'],['(4) الفائض الإجمالي عن الاستغلال',1],['المنتجات العملياتية الأخرى'],['الأعباء العملياتية الأخرى'],['المخصصات للاهتلاكات والمؤونات وخسائر القيمة'],['استئناف عن خسائر القيمة والمؤونات'],['(5) النتيجة العملياتية',1]];
const NAT_L=[['المنتجات المالية'],['الأعباء المالية'],['(6) النتيجة المالية',1],['(7) النتيجة العادية قبل الضرائب (5+6)',1],['الضرائب الواجبة عن النتائج العادية'],['الضرائب المؤجلة عن النتائج العادية (تغيرات)'],['مجموع منتجات الأنشطة العادية'],['مجموع أعباء الأنشطة العادية'],['( النتيجة الصافية للأنشطة العادية',1],['الأعباء غير العادية'],['المنتجات غير العادية'],['(9) النتيجة غير العادية',1],['(10) صافي نتيجة السنة المالية',1]];
const FUN_R=[['رقم الأعمال'],['تكلفة المبيعات'],['(1) هامش الربح الإجمالي',1],['المنتجات العملياتية الأخرى'],['التكاليف التجارية'],['الأعباء الإدارية'],['الأعباء العملياتية الأخرى'],['استئناف عن خسائر القيمة والمؤونات'],['(2) النتيجة العملياتية',1]];
const FUN_L=[['المنتجات المالية'],['الأعباء المالية'],['(3) النتيجة المالية',1],['(4) النتيجة العادية قبل الضرائب (2+3)',1],['الضرائب الواجبة عن النتائج العادية'],['الضرائب المؤجلة عن النتائج العادية (تغيرات)'],['(5) النتيجة الصافية للأنشطة العادية',1],['الأعباء غير العادية'],['المنتجات غير العادية'],['(6) النتيجة غير العادية',1],['(7) صافي نتيجة السنة المالية',1]];
const CAF1=[['النتيجة الصافية للسنة المالية'],['(+) مخصصات الاهتلاكات والمؤونات وخسائر القيمة'],['(-) استئناف عن خسائر القيمة والمؤونات'],['(+) نواقص القيمة عن خروج الأصول المثبتة'],['(-) فوائض القيمة عن خروج الأصول المثبتة'],['= قدرة التمويل الذاتي',1]];
const CAF2=[['الفائض الإجمالي عن الاستغلال'],['(+) المنتجات العملياتية الأخرى (ما عدا فوائض القيمة عن التنازل)'],['(-) الأعباء العملياتية الأخرى (ما عدا نواقص القيمة عن التنازل)'],['(+) المنتجات المالية (ما عدا الاستئنافات)'],['(-) الأعباء المالية (ما عدا المخصصات)'],['(+) المنتجات غير العادية (ما عدا فوائض القيمة والاستئنافات)'],['(-) الأعباء غير العادية (ما عدا نواقص القيمة والمخصصات)'],['(-) الضرائب على النتائج (الواجبة والمؤجلة)'],['= قدرة التمويل الذاتي',1]];
const bank=(title,a,b)=>'<table><thead><tr><th colspan="3">'+title+'</th></tr><tr><th>البيان</th><th>مدين</th><th>دائن</th></tr></thead><tbody><tr>'+cell('',a)+cell('n')+cell('n')+'</tr>'+('<tr>'+cell()+cell('n')+cell('n')+'</tr>').repeat(5)+'<tr class="t">'+cell('',b)+cell('n')+cell('n')+'</tr></tbody></table>';
const sec=(a,b)=>'<tr><td class="sec" colspan="2" contenteditable>'+a+'</td><td class="sec" colspan="2" contenteditable>'+b+'</td></tr>';
const br='<tr>'+cell()+cell('n')+cell()+cell('n')+'</tr>';
const lines=c=>'<td class="'+c+' tl"><div class="ln '+c+' dr" contenteditable></div><div class="ln '+c+' cr" contenteditable></div></td>';
const CTL='<div class="ln cx"><button type="button" class="dx" aria-label="حذف السطر">✕</button></div>';
const jrow='<tr>'+cell('d')+lines('k')+lines('k')+lines('bn')+lines('n')+lines('n')+'<td class="ctl">'+CTL+CTL+'</td></tr>';
const bsec='<tr><td class="sec" colspan="4" contenteditable>@A</td><td class="sec" colspan="2" contenteditable>@L</td></tr>';
const bbr='<tr>'+cell()+cell('n')+cell('n')+cell('n')+cell()+cell('n')+'</tr>';
const TPL={
 t:{name:'حساب T',w:700,g:1,html:()=>'<h3 class="tt" contenteditable>الحساب: ................</h3><table><thead><tr><th colspan="2">مدين</th><th colspan="2">دائن</th></tr></thead><tbody>'+br.repeat(7)+'<tr class="t">'+cell('','المجموع')+cell('n')+cell('','المجموع')+cell('n')+'</tr><tr class="t">'+cell('','الرصيد')+cell('n')+cell('','الرصيد')+cell('n')+'</tr></tbody></table>'},
 j:{name:'قيد يومية',w:1200,g:1,rl:'＋ قيد جديد',x:'<button data-a="ld">＋ مدين</button><button data-a="lc">＋ دائن</button><button data-a="le"> القيد</button>',html:()=>tbl(['التاريخ','ح/ مدين','ح/ دائن','البيان','مدين (DA)','دائن (DA)',''],jrow.repeat(5)).replace('<th></th>','<th class="ctl"></th>')+'<p style="margin:8px 0 0;font-size:15px">«＋ مدين» و«＋ دائن» (أو Shift+Enter) يضيفان سطرًا في القيد المحدد. زر ✕ على يسار كل سطر يحذفه، و« القيد» يحذف القيد كله. (Backspace في سطر فارغ يحذفه أيضًا.)</p>'},
 b:{name:'الميزانية',w:1300,g:1,html:()=>tbl(['الأصول','المبلغ الإجمالي (DA)','الاهتلاك وخسائر القيمة (DA)','القيمة المحاسبية الصافية (DA)','الخصوم','المبلغ (DA)'],bsec.replace('@A','الأصول غير الجارية').replace('@L','الأموال الخاصة')+bbr.repeat(3)+bsec.replace('@A','الأصول الجارية').replace('@L','الخصوم غير الجارية')+bbr.repeat(2)+bsec.replace('@A','').replace('@L','الخصوم الجارية')+bbr.repeat(2)+'<tr class="t">'+cell('','مجموع الأصول')+cell('n')+cell('n')+cell('n')+cell('','مجموع الخصوم')+cell('n')+'</tr>')},
 a:{name:'جدول الاهتلاك',w:1100,g:1,html:()=>grid([['السنة','d'],['القيمة القابلة للاهتلاك (DA)','n'],['القسط السنوي (DA)','n'],['مجموع الاهتلاك (DA)','n'],['القيمة المحاسبية الصافية (DA)','n']],6)},
 r:{name:'جدول التقارب البنكي',w:1150,g:1,html:()=>'<div class="tbls">'+bank('حساب البنك (512) في دفاتر المؤسسة','الرصيد قبل التسوية','الرصيد بعد التسوية')+bank('كشف الحساب البنكي','رصيد الكشف','الرصيد بعد التسوية')+'</div><p style="font-weight:700;margin:10px 0 0">الرصيد المعدل للمؤسسة = الرصيد المعدل للبنك</p>'},
 n:{name:'حساب النتائج حسب الطبيعة',w:1250,g:1,html:()=>'<div class="tbls">'+tbl(['البيان',AMT],rowsH(NAT_R))+tbl(['البيان',AMT],rowsH(NAT_L))+'</div>'},
 f:{name:'حساب النتائج حسب الوظيفة',w:1250,g:1,html:()=>'<div class="tbls">'+tbl(['البيان',AMT],rowsH(FUN_R))+tbl(['البيان',AMT],rowsH(FUN_L))+'</div>'},
 c1:{name:'قدرة التمويل الذاتي – الطريقة التفاضلية',w:950,g:1,html:()=>tbl(['البيان',AMT],rowsH(CAF1))},
 c2:{name:'قدرة التمويل الذاتي – الطريقة الإجمالية',w:950,g:1,html:()=>tbl(['البيان',AMT],rowsH(CAF2))}
};
function addCard(k){
  const d=TPLA[k],W=wrap.clientWidth,cw=Math.min(W-16,d.w),off=(cnt++%4)*24;
  const c=document.createElement('div');c.className='card';
  c.style.cssText='width:'+cw+'px;left:'+Math.max(8,(W-cw)/2+off)+'px;top:'+(8+off)+'px;z-index:'+(++zc)+';--fs:'+Math.max(16,Math.min(24,W/52))+'px';
  c.innerHTML='<div class="ch"><b>'+d.name+'</b><span class="cb">'+(d.g?'<button data-a="row">'+(d.rl||'＋ سطر')+'</button>'+(d.rl?'':'<button data-a="rm">－ سطر</button>'):'')+(d.x||'')+'<button data-a="up" aria-label="تكبير الخط">A+</button><button data-a="dn" aria-label="تصغير الخط">A−</button><button data-a="x" aria-label="حذف">✕</button></span></div><div class="cbody">'+d.html()+'</div>';
  wrap.appendChild(c);c.querySelectorAll('tbody tr').forEach(refreshTr);setMode(true);
}
function entryRow(c){
  let tr=lastCell&&c.contains(lastCell)?lastCell.closest('tbody tr'):null;
  if(!tr){const r=c.querySelectorAll('tbody tr');tr=r[r.length-1]}return tr;
}
function lnCells(tr){return{t:[...tr.querySelectorAll('td.tl')],c:tr.querySelector('td.ctl')}}
function refreshTr(tr){
  const{t,c}=lnCells(tr);if(!t.length||!c)return;
  const ls=[...t[0].querySelectorAll('.ln')],nd=ls.filter(x=>x.classList.contains('dr')).length,nc=ls.length-nd;
  [...c.querySelectorAll('.dx')].forEach((b,i)=>{b.disabled=ls[i]&&ls[i].classList.contains('dr')?nd<2:nc<2});
}
function addLn(tr,kind,col){
  const{t,c}=lnCells(tr);if(!t.length)return;
  const l0=[...t[0].querySelectorAll('.ln')];let idx=l0.length;
  if(kind==='d'){let k=-1;l0.forEach((x,i)=>{if(x.classList.contains('dr'))k=i});idx=k+1}
  let f=null;
  t.forEach(td=>{const ls=[...td.querySelectorAll('.ln')],n=document.createElement('div');
    n.contentEditable='true';n.className=ls[0].className.replace(/\b(dr|cr)\b/g,'').trim()+' '+(kind==='d'?'dr':'cr');
    td.insertBefore(n,ls[idx]||null);
    if(col===undefined?td.classList.contains('bn'):td.cellIndex===col)f=n});
  if(c){const h=document.createElement('div');h.innerHTML=CTL;c.insertBefore(h.firstChild,c.querySelectorAll('.ln')[idx]||null)}
  refreshTr(tr);if(f)f.focus();
}
function rmLn(tr,idx){
  const{t,c}=lnCells(tr);if(!t.length)return false;
  const all=t[0].querySelectorAll('.ln');if(!all[idx])return false;
  const k=all[idx].classList.contains('dr')?'dr':'cr';if(t[0].querySelectorAll('.ln.'+k).length<2)return false;
  t.forEach(td=>{const l=td.querySelectorAll('.ln')[idx];if(l)l.remove()});
  if(c){const l=c.querySelectorAll('.ln')[idx];if(l)l.remove()}
  refreshTr(tr);return true;
}
function resetEntry(tr){
  tr.querySelectorAll('[contenteditable]').forEach(x=>x.textContent='');
  tr.querySelectorAll('td.tl').forEach(td=>{let d=0,k=0;[...td.querySelectorAll('.ln')].forEach(x=>{if(x.classList.contains('dr')&&!d)d=1;else if(x.classList.contains('cr')&&!k)k=1;else x.remove()})});
  const c=tr.querySelector('td.ctl');if(c)[...c.querySelectorAll('.ln')].forEach((x,i)=>{if(i>1)x.remove()});
  refreshTr(tr);
}
const isData=r=>!r.classList.contains('t')&&!r.querySelector('td.sec');
function gTargets(c){
  const f=lastCell&&c.contains(lastCell)?lastCell.closest('tbody tr'):null;
  if(f)return[{tb:f.parentElement,tr:f}];
  return[...c.querySelectorAll('tbody')].map(tb=>({tb,tr:null}));
}
function addRowAt(tb,tr){
  const rows=[...tb.rows],tpl=rows.find(isData);if(!tpl)return;
  const n=tpl.cloneNode(true);n.querySelectorAll('[contenteditable]').forEach(x=>x.textContent='');
  let ref;
  if(!tr){let i=rows.length;while(i>0&&rows[i-1].classList.contains('t'))i--;ref=rows[i]||null}
  else if(tr.classList.contains('t')&&rows.slice(rows.indexOf(tr)).every(r=>r.classList.contains('t'))){
    ref=tr;while(ref.previousElementSibling&&ref.previousElementSibling.classList.contains('t'))ref=ref.previousElementSibling}
  else ref=tr.nextElementSibling;
  tb.insertBefore(n,ref);const f=n.querySelector('[contenteditable]');if(f)f.focus();
}
function rmRowAt(tb,tr){
  const rows=[...tb.rows],data=rows.filter(isData);
  if(!tr)tr=data[data.length-1];
  if(!tr||tr.querySelector('td.sec'))return;
  if(isData(tr)&&data.length<2){tr.querySelectorAll('[contenteditable]').forEach(x=>x.textContent='');return}
  const nx=tr.nextElementSibling||tr.previousElementSibling;tr.remove();
  const f=nx&&nx.querySelector('[contenteditable]');if(f)f.focus();
}
wrap.addEventListener('click',e=>{
  const dx=e.target.closest('.dx');
  if(dx){const ln=dx.closest('.ln');rmLn(dx.closest('tr'),[...ln.parentElement.children].indexOf(ln));return}
  const b=e.target.closest('.cb button');if(!b)return;const c=b.closest('.card'),a=b.dataset.a;
  if(a==='x')c.remove();
  else if(a==='up'||a==='dn'){const f=parseFloat(c.style.getPropertyValue('--fs'))+(a==='up'?2:-2);c.style.setProperty('--fs',Math.max(12,Math.min(44,f))+'px')}
  else if(a==='ld'||a==='lc')addLn(entryRow(c),a==='ld'?'d':'c');
  else if(a==='le'){const tr=entryRow(c);if(tr.parentElement.rows.length>1)tr.remove();else resetEntry(tr)}
  else if(a==='row'&&!c.querySelector('td.tl'))gTargets(c).forEach(o=>addRowAt(o.tb,o.tr));
  else if(a==='rm')gTargets(c).forEach(o=>rmRowAt(o.tb,o.tr));
  else if(a==='row')c.querySelectorAll('tbody').forEach(tb=>{
    const r=[...tb.rows];let i=r.length;while(i>0&&r[i-1].classList.contains('t'))i--;
    const cl=r[i-1].cloneNode(true);cl.querySelectorAll('[contenteditable]').forEach(x=>x.textContent='');tb.insertBefore(cl,r[i]||null);resetEntry(cl);
  });
});
let drag=null;
wrap.addEventListener('pointerdown',e=>{
  const h=e.target.closest('.ch');if(!h||e.target.closest('button'))return;
  const c=h.closest('.card');c.style.zIndex=++zc;
  drag={c,dx:e.clientX-c.offsetLeft,dy:e.clientY-c.offsetTop};h.setPointerCapture(e.pointerId);
});
wrap.addEventListener('pointermove',e=>{if(!drag)return;drag.c.style.left=(e.clientX-drag.dx)+'px';drag.c.style.top=Math.max(0,e.clientY-drag.dy)+'px'});
['pointerup','pointercancel'].forEach(t=>wrap.addEventListener(t,()=>drag=null));
wrap.addEventListener('focusin',e=>{const c=e.target.closest&&e.target.closest('[contenteditable]');if(c)lastCell=c});
wrap.addEventListener('focusout',e=>{
  const c=e.target;if(!c.classList||!c.classList.contains('n'))return;
  const t=c.textContent.replace(/[\s\u00a0]/g,'').replace(',','.');
  if(/^-?\d+(\.\d+)?$/.test(t)){const p=t.split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0');c.textContent=p.join(',')}
});
const foc=x=>(x.querySelector('.ln')||x).focus();
wrap.addEventListener('keydown',e=>{
  const c=e.target;if(e.key!=='Enter'||!c.matches||!c.matches('td[contenteditable],.ln[contenteditable]'))return;
  e.preventDefault();
  if(e.shiftKey&&c.classList.contains('ln')){addLn(c.closest('tr'),c.classList.contains('cr')?'c':'d',c.parentElement.cellIndex);return}
  if(c.classList.contains('ln')&&c.nextElementSibling){c.nextElementSibling.focus();return}
  const td=c.classList.contains('ln')?c.parentElement:c,nx=td.parentElement.nextElementSibling;
  if(nx&&nx.cells[td.cellIndex])foc(nx.cells[td.cellIndex]);
});
wrap.addEventListener('keydown',e=>{
  const c=e.target;if(e.key!=='Backspace'||!c.classList||!c.classList.contains('ln')||c.textContent||c.contentEditable!=='true')return;
  const tr=c.closest('tr'),idx=[...c.parentElement.children].indexOf(c);
  if([...tr.querySelectorAll('td.tl')].some(td=>td.querySelectorAll('.ln')[idx].textContent))return;
  const pv=c.previousElementSibling||c.nextElementSibling;
  if(rmLn(tr,idx)){e.preventDefault();if(pv)pv.focus()}
});
wrap.addEventListener('paste',e=>{
  if(!e.target.closest||!e.target.closest('[contenteditable]'))return;
  e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text'));
});

const ts=$('#tplSel');
function fillTpl(){ts.innerHTML='<option value=""> قوالب</option>';const gs={};if(subj!=='acc3'&&subj!=='eco2'){const o=document.createElement('option');o.disabled=true;o.textContent='لا قوالب لهذه المادة بعد';ts.appendChild(o)}
  Object.entries(subj==='eco2'?TPL_E:subj==='acc3'?TPL:{}).forEach(([k,v])=>{(gs[v.grp||'']=gs[v.grp||'']||[]).push([k,v])});
  Object.entries(gs).forEach(([g,a])=>{let pr=ts;if(g){pr=document.createElement('optgroup');pr.label=g;ts.appendChild(pr)}
    a.forEach(([k,v])=>{const o=document.createElement('option');o.value=k;o.textContent=v.name;pr.appendChild(o)})})}
ts.onchange=()=>{if(ts.value){addCard(ts.value);ts.value=''}};

/* ---- الاقتصاد والمناجمنت ---- */
let subj='acc3';
const gp=(h,rows)=>tbl(h,rows.map(r=>'<tr>'+r.map(c=>'<td contenteditable>'+c+'</td>').join('')+'</tr>').join(''));
const mkD=(id,col)=>'<marker id="'+id+'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="'+col+'"/></marker>';
const dia=(H,svg,items)=>'<div class="dia" style="aspect-ratio:1000/'+H+'"><svg viewBox="0 0 1000 '+H+'">'+svg+'</svg>'+items+'</div>';
const bxD=(H,x,y,w,t,st)=>'<div class="bx" contenteditable style="left:'+(x/10)+'%;top:'+(y/H*100)+'%;width:'+(w/10)+'%;'+(st||'')+'">'+t+'</div>';
const lbD=(H,x,y,w,t,st)=>'<div class="lb" contenteditable style="left:'+(x/10)+'%;top:'+(y/H*100)+'%;width:'+(w/10)+'%;'+(st||'')+'">'+t+'</div>';
const OB='background:#fbc4c4;border-color:#a33;';
/* الدورة الاقتصادية (كتاب الياس بلقاسم ص20) */
function cycD(){const H=440;
  let sv=mkD('mr','#e02424')+mkD('mg','#12a150');
  sv+='<path d="M810 172Q500 -40 190 172" fill="none" stroke="#e02424" stroke-width="7" marker-end="url(#mr)"/><path d="M250 172Q500 70 750 172" fill="none" stroke="#12a150" stroke-width="7" marker-end="url(#mg)"/><path d="M750 248Q500 350 250 248" fill="none" stroke="#12a150" stroke-width="7" marker-end="url(#mg)"/><path d="M190 248Q500 470 810 248" fill="none" stroke="#e02424" stroke-width="7" marker-end="url(#mr)"/>';
  const R='color:#e02424;font-weight:700;background:none;font-size:.95em',G='color:#12a150;font-weight:700;background:none;font-size:.95em';
  return dia(H,sv,bxD(H,150,210,250,'المؤسسات الاقتصادية','background:#18c0ff;font-size:1.15em;padding:.8em .2em')+bxD(H,850,210,250,'العائلات','background:#ffe94d;font-size:1.15em;padding:.8em .2em')+
   lbD(H,500,45,300,'تقديم خدمة العمل',R)+lbD(H,500,100,300,'تسديد الأجور',G)+lbD(H,500,325,330,'تسديد قيمة السلع والخدمات',G)+lbD(H,500,385,300,'بيع السلع والخدمات',R)+
   lbD(H,380,428,200,'■ الدورة الحقيقية','color:#e02424;font-weight:700;background:none')+lbD(H,620,428,200,'■ الدورة النقدية','color:#12a150;font-weight:700;background:none'));
}
/* مخطط التدفقات بين الأعوان الاقتصاديين (ص21) */
function flwD(){const H=720,
  A={Ext:[500,90,'العالم الخارجي','#000','#fff'],Adm:[120,360,'الإدارات العمومية','#00e676','#000'],Ent:[500,360,'المؤسسات الاقتصادية','#00e5ff','#000'],Fin:[880,360,'المؤسسات المالية','#ff3b3b','#fff'],Fam:[500,640,'العائلات','#ffff00','#000']},
  FL=[['Ent','Ext','تصدير إلى الخارج'],['Ext','Ent','استيراد من الخارج'],['Fin','Ext','انتقال رؤوس الأموال إلى الخارج'],['Ext','Fin','انتقال رؤوس الأموال من الخارج'],['Ent','Adm','تسديد الضرائب'],['Adm','Ent','الاستثمار'],['Fin','Ent','تقديم قروض'],['Ent','Fin','تسديد القروض'],['Adm','Fam','تقديم خدمة عامة'],['Fam','Adm','تسديد الرسوم'],['Ent','Fam','بيع السلع'],['Fam','Ent','تسديد قيمة السلع'],['Fin','Fam','تسديد الأجور'],['Fam','Fin','تقديم خدمات العمل']];
  let sv=mkD('mf','#1c1c1c'),lb='';
  FL.forEach(([a,b,t])=>{
    const[x1,y1]=A[a],[x2,y2]=A[b],dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux,
      R=Math.min(88/(Math.abs(ux)||1e-6),34/(Math.abs(uy)||1e-6))+8,off=14,
      sx=x1+ux*R+nx*off,sy=y1+uy*R+ny*off,ex=x2-ux*R+nx*off,ey=y2-uy*R+ny*off,
      lo=off+4+Math.abs(nx)*75+Math.abs(ny)*14,mx=(x1+x2)/2+nx*lo,my=(y1+y2)/2+ny*lo;
    sv+='<line x1="'+sx+'" y1="'+sy+'" x2="'+ex+'" y2="'+ey+'" stroke="#1c1c1c" stroke-width="2.5" marker-end="url(#mf)"/>';
    lb+=lbD(H,mx,my,150,t);
  });
  return dia(H,sv,Object.values(A).map(a=>bxD(H,a[0],a[1],176,a[2],'background:'+a[3]+';color:'+a[4]+';padding:.7em .2em')).join('')+lb);
}
/* تخصيص الدخل (ص41) */
function incD(){const H=330;
  const sv=mkD('mi','#333')+'<path d="M500 85V125H180V212" fill="none" stroke="#333" stroke-width="3" marker-end="url(#mi)"/><path d="M500 85V212" fill="none" stroke="#333" stroke-width="3" marker-end="url(#mi)"/><path d="M500 85V125H820V212" fill="none" stroke="#333" stroke-width="3" marker-end="url(#mi)"/>';
  return dia(H,sv,bxD(H,500,55,260,'تخصيص الدخل','background:#dde8f4;font-size:1.1em')+bxD(H,180,250,220,'الاستهلاك','background:#dcebe5')+bxD(H,500,250,220,'الادخار','background:#dcebe5')+bxD(H,820,250,220,'الاستثمار','background:#dcebe5'));
}
/* تنسيق عوامل الإنتاج (ص33) */
function crdD(){const H=440;
  const sv='<polygon points="250,135 750,135 560,300 440,300" fill="#cfe0f3"/><ellipse cx="500" cy="125" rx="260" ry="85" fill="#eaf2fb" stroke="#9db7d6" stroke-width="3"/><circle cx="435" cy="118" r="58" fill="#34b38a" fill-opacity=".85"/><circle cx="590" cy="105" r="64" fill="#6ab04c" fill-opacity=".9"/><circle cx="515" cy="185" r="58" fill="#6f95d6" fill-opacity=".9"/><polygon points="470,305 530,305 530,340 565,340 500,390 435,340 470,340" fill="#b8c7d9"/>';
  const t='background:none;border:0;font-size:.9em;';
  return dia(H,sv,bxD(H,435,118,110,'العمل',t)+bxD(H,590,105,120,'العامل الطبيعي',t)+bxD(H,515,185,110,'رأس المال',t)+bxD(H,500,420,560,'منتج ذو جودة عالية وبأقل التكاليف','background:none;border:0;color:#d62020;font-size:1.1em'));
}
/* قنوات التوزيع (ص63) */
function dstH(){
  const ch=(t,a)=>'<div style="margin:6px 0 14px"><b contenteditable>'+t+'</b><div style="display:flex;align-items:center;gap:10px;margin-top:6px;flex-wrap:wrap">'+a.map(x=>'<span class="bx2" contenteditable>'+x+'</span>').join('<span class="ar2">←</span>')+'</div></div>';
  return ch('التوزيع المباشر',['المنتج','المستهلك'])+ch('التوزيع القصير',['المنتج','تجار التجزئة','المستهلك'])+ch('التوزيع الطويل',['المنتج','تجار الجملة','تجار التجزئة','المستهلك']);
}
/* الهيكل التنظيمي (ص75-76) */
function o1D(){const H=330,n=['إدارة الانتاج','إدارة التمويل','إدارة الموظفين','إدارة البحوث','إدارة التسويق'],xs=[900,700,500,300,100];
  const sv='<path d="M500 75V140M100 140H900'+xs.map(x=>'M'+x+' 140V218').join('')+'" fill="none" stroke="#333" stroke-width="3"/>';
  return dia(H,sv,bxD(H,500,45,220,'الرئيس',OB)+xs.map((x,i)=>bxD(H,x,250,170,n[i],OB)).join(''));
}
function o2D(){const H=700,xs=[200,500,800],ys=[170,285,400,515,630],n=['نائب الرئيس','رئيس مصلحة','رئيس مكتب','رئيس فوج عمل','العمال'];
  let sv=mkD('mo','#333')+'<path d="M500 65V105M200 105H800M200 105V138M500 105V138M800 105V138" fill="none" stroke="#333" stroke-width="3"/>',it=bxD(H,500,40,200,'الرئيس',OB);
  xs.forEach(x=>{ys.forEach((y,i)=>{it+=bxD(H,x,y,190,n[i],OB);if(i<4)sv+='<path d="M'+x+' '+(y+26)+'V'+(ys[i+1]-28)+'" stroke="#333" stroke-width="3" marker-end="url(#mo)"/>'})});
  return dia(H,sv,it);
}
const gt=(h,k)=>grid(h.map(x=>[x,'']),k);
const TPL_E={
 e_cyc:{grp:'مخططات',name:'الدورة الاقتصادية',w:1100,html:cycD},
 e_flw:{grp:'مخططات',name:'مخطط التدفقات بين الأعوان الاقتصاديين',w:1150,html:flwD},
 e_inc:{grp:'مخططات',name:'تخصيص الدخل',w:1000,html:incD},
 e_crd:{grp:'مخططات',name:'تنسيق عوامل الإنتاج',w:900,html:crdD},
 e_dst:{grp:'مخططات',name:'قنوات التوزيع',w:900,html:dstH},
 e_o1:{grp:'مخططات',name:'الهيكل التنظيمي حسب الوظائف',w:1100,html:o1D},
 e_o2:{grp:'مخططات',name:'الهيكل التنظيمي حسب تدرج المسؤولية',w:1000,html:o2D},
 e_t1:{grp:'جداول التصنيف',name:'تصنيف الحاجات',w:900,g:1,html:()=>gt(['الحاجات الأساسية','الحاجات الثانوية'],6)},
 e_t2:{grp:'جداول التصنيف',name:'تصنيف الخيرات',w:900,g:1,html:()=>gt(['الخيرات الحرة','الخيرات الاقتصادية'],6)},
 e_t3:{grp:'جداول التصنيف',name:'تصنيف الخيرات (استهلاكية/إنتاجية، معمرة/غير معمرة)',w:1150,g:1,html:()=>gt(['الخيرات','سلع استهلاكية','سلع انتاجية','سلع معمرة','سلع غير معمرة'],6)},
 e_t4:{grp:'جداول التصنيف',name:'السلع المتنافسة والمتكاملة',w:900,g:1,html:()=>gt(['السلع','متنافسة','متكاملة'],6)},
 e_t5:{grp:'جداول التصنيف',name:'تصنيف الأنشطة الاقتصادية',w:1000,g:1,html:()=>gt(['النشاط','الانتاج','المبادلة','الاستهلاك'],6)},
 e_t6:{grp:'جداول التصنيف',name:'تصنيف الأعوان الاقتصاديين',w:1100,g:1,html:()=>gt(['الأعوان الاقتصاديون','المؤسسات الاقتصادية','المؤسسات المالية','الادارات العمومية','العالم الخارجي'],6)},
 e_t7:{grp:'جداول التصنيف',name:'تصنيف النشاط الإنتاجي',w:1100,g:1,html:()=>'<table><thead><tr><th rowspan="2">النشاط الإنتاجي</th><th colspan="2">إنتاج سوقي</th><th rowspan="2">إنتاج غير سوقي</th></tr><tr><th>سلعي</th><th>غير سلعي</th></tr></thead><tbody>'+('<tr>'+cell()+cell()+cell()+cell()+'</tr>').repeat(6)+'</tbody></table>'},
 e_t8:{grp:'جداول التصنيف',name:'تصنيف السلع والخدمات',w:1250,g:1,html:()=>gt(['السلع والخدمات','سلع استهلاكية','سلع انتاجية','سلع معمرة','سلع غير معمرة','سلع ضرورية','سلع كمالية'],6)}
};
const TPLA=Object.assign({},TPL,TPL_E);
const TERMS=[["الوحدة 1 · المبادئ الأساسية للنشاط الاقتصادي",[["المشكلة الاقتصادية","عدم التوفيق بين الحاجات المتزايدة من جهة والندرة النسبية للموارد (الخيرات) المستخدمة في إشباع تلك الحاجات من جهة أخرى."],["الحاجات","شعور الفرد وإحساسه بالحرمان أو فقدان شيء ما، بحيث لا تزول الحاجة لذلك الشيء إلا بعد تلبيتها وعندها يشعر الإنسان بالارتياح والاطمئنان."],["قابلية الحاجات للإشباع","أي أن الإنسان يشعر بالارتياح فور تلبية حاجاته."],["تعدد الحاجات","أي أنها غير محدودة، وتتضاعف بفعل التطور البشري والتقدم الحضاري، كما أنها تختلف باختلاف الزمان والمكان."],["قابلية الحاجات للتكامل","أي أن إشباع حاجة ما يتطلب حاجة أخرى تكملها."],["قابلية الحاجات للاستبدال","أي يمكن تعويض الحاجة بحاجة أخرى إما إراديا أو للضرورة بسبب ندرتها أو ارتفاع تكاليفها."],["الحاجات الأساسية","حاجات لا يمكن الاستغناء عنها وإلا سوف تعرض حياة الإنسان للخطر كالحاجة الى الغذاء."],["الحاجات الثانوية","حاجات توفر الراحة والطمأنينة للإنسان من أجل أداء واجبه على أكمل وجه كالسياحة والمطالعة."],["الحاجات الحاضرة","حاجات تتطلب إشباعا فوريا كالحاجة الى الماء عند العطش."],["الحاجات المستقبلية","حاجات يتطلع إليها الإنسان من أجل تحسين أوضاعه الاقتصادية والاجتماعية كالحاجة الى سيارة."],["الخيرات","مجمل الأموال والوسائل التي تستعمل لإشباع حاجات الإنسان المتنوعة."],["الخيرات الحرة","خيرات موجودة في الطبيعة أكثر من حاجة الإنسان إليها ولا تتطلب أي جهد أو تكلفة لإشباع الحاجة منها كالهواء وأشعة الشمس."],["الخيرات الاقتصادية","خيرات نادرة نسبيا وتتطلب مجهودا أو تكلفة لتحويلها حتى تصبح صالحة لإشباع حاجة ما وتشمل مختلف السلع والخدمات، وتعتبر خيرات اقتصادية إذا توفر فيها: الندرة النسبية ووجود حاجة الإنسان إليها."],["السلع الاستهلاكية","السلع التي تشبع حاجة الإنسان مباشرة كاللباس."],["السلع الإنتاجية","سلع تستعمل لغرض إنتاج سلع أخرى كالآلات الإنتاجية."],["السلع المعمرة","السلع التي لا تستهلك مرة واحدة وإنما تستعمل خلال فترة زمنية كالسيارة."],["السلع غير المعمرة","سلع تستهلك كلها مرة واحدة كالغذاء."],["السلع الضرورية","سلع لا يمكن الاستغناء عنها باعتبار أن حياة الإنسان مرتبطة بها كالغذاء."],["السلع الكمالية","سلع يمكن الاستغناء عنها دون التعرض للخطر كالتلفاز."],["السلع المتنافسة","السلع البديلة فإشباع الحاجة من احدى هذه السلع يؤدي إلى زوال الحاجة إلى السلعة الأخرى كالشاي والقهوة."],["السلع المتكاملة","سلع لا يمكن إشباع الحاجة من احداها إلا بوجود سلعة أخرى تكملها كالقهوة والسكر."],["النشاط الاقتصادي","مجموعة من الأعمال المنجزة من قبل الأعوان الاقتصاديين بهدف ضمان إشباع حاجاتهم."],["الإنتاج","عملية تحويل الثروات الطبيعية (المواد الخام) إلى سلع قابلة للاستهلاك عن طريق مزج عوامل الإنتاج بهدف تحقيق المنافع أو زيادتها."],["المبادلة","عملية التنازل عن شيء مقابل الحصول على شيء آخر، يمكن أن تتم مباشرة بين منتج السلعة ومستهلكها أو بواسطة وسطاء (تجار الجملة والتجزئة)."],["الاستهلاك","استعمال السلع والخدمات من قبل الأفراد بهدف إشباع مختلف حاجاتهم."]]],["الوحدة 2 · الأعوان الاقتصاديون",[["العون الاقتصادي","كل شخص طبيعي أو معنوي يزاول نشاطا اقتصاديا."],["قطاع العائلات","العائلة هي الخلية الأساسية في تكوين المجتمع ويتلخص نشاطها فيما يلي: استعمال جزء أو كل دخلها في الإنفاق الاستهلاكي – ادخار الجزء المتبقي من دخلها – استثمار مدخراتها – تدفع الضرائب والرسوم للدولة."],["المؤسسات الاقتصادية","كيانات تقوم بتنسيق مواردها المادية والمالية والبشرية من أجل انتاج وبيع السلع وتقديم الخدمات في السوق بهدف تحقيق الأرباح، ويتلخص نشاطها فيما يلي: إنتاج وبيع مختلف السلع وتقديم الخدمات – تقوم بالاستثمار من أجل تجديد وسائل الإنتاج أو توسيع نشاطها – تدفع الضرائب والرسوم للدولة."],["المؤسسات المالية (البنوك)","كيانات تقوم بتجميع المدخرات من الأعوان الاقتصاديين وتقدمها في شكل قروض للأعوان الآخرين مقابل فوائد أو تستثمرها في مشاريع أخرى تجني من خلالها أرباحا، ويتلخص نشاط البنوك فيما يلي: تجميع مدخرات الأعوان الاقتصاديين الآخرين – تقديم قروض للأعوان الاقتصاديين مقابل فوائد – تستهلك السلع والخدمات – تدفع الضرائب والرسوم."],["الإدارات العمومية","هيئات تقدم خدمات عامة غير سوقية (مجانا)، ويتلخص نشاطها فيما يلي: تقديم خدمات للأفراد – تتحصل على الإيرادات في شكل ضرائب ورسوم من الأعوان الاقتصاديين الآخرين – تستهلك السلع والخدمات – تقوم بالاستثمار في مجالات متعددة."],["العالم الخارجي","الأعوان الاقتصاديين المتواجدين خارج الوطن وتربطهم علاقات اقتصادية مع الأعوان الاقتصاديين المتواجدين داخل الوطن، ويتلخص نشاطهم فيما يلي: تصدير واستيراد السلع والخدمات – انتقال رؤوس الأموال من والى العالم الخارجي."]]],["الوحدة 3 · الدورة الاقتصادية",[["التدفقات الاقتصادية","حركة السلع والخدمات والنقود التي تتم بين مختلف الأعوان الاقتصاديين."],["التدفقات الحقيقية","تعبر عن حركة السلع والخدمات التي تتم بين مختلف الأعوان الاقتصاديين."],["التدفقات النقدية","تعبر عن حركة النقود التي تتم بين مختلف الأعوان الاقتصاديين في اتجاه معاكس للتدفق الحقيقي."],["الدورة الاقتصادية","عبارة عن حركة في شكل دائري تمثل التدفقات الحقيقية والتدفقات النقدية التي تنشأ بين مختلف الأعوان الاقتصاديين."],["الدورة الحقيقية (دورة السلع والخدمات)","تعبر عن حركة أو انتقال خدمة العمل مثلا من العائلات إلى المؤسسات الاقتصادية وانتقال السلع والخدمات من المؤسسات الاقتصادية إلى العائلات."],["الدورة النقدية","تعبر عن حركة أو انتقال النقود في مقابل (باتجاه معاكس) التدفقات الحقيقية."]]],["الوحدة 4 · الإنتاج",[["الإنتاج","محور كل نشاط اقتصادي، ويقصد به مزج ودمج وتنسيق وتأليف بين مجموعة من العوامل تسمى عوامل الإنتاج، بهدف تحقيق منفعة أو إضافة منفعة جديدة."],["الإنتاج السوقي","ويتضمن: الإنتاج السلعي والإنتاج غير السلعي."],["الإنتاج السلعي","يتم فيه تحويل المواد الأولية الخام إلى منتجات تامة الصنع موجهة الى البيع لإشباع حاجات الأفراد."],["الإنتاج غير السلعي","ويشمل تقديم الخدمات السوقية (بمقابل) للأفراد لإشباع حاجاتهم كخدمات النقل والسياحة."],["الإنتاج غير السوقي","ويشمل تقديم الإدارات العمومية مختلف الخدمات المجانية الموجهة لإشباع حاجات الأفراد كخدمات التعليم والصحة العمومية."],["القيمة المضافة","القيمة التي تضيفها المؤسسة إلى قيمة ما تم استهلاكه من مستلزمات وسيطة للإنتاج داخل العملية الإنتاجية خلال فترة زمنية محددة. القيمة المضافة = قيمة الإنتاج – قيمة الاستهلاكات الوسيطة."],["قيمة الإنتاج","كمية الإنتاج × سعر بيع الوحدة."],["قيمة الاستهلاكات الوسيطة","مواد أولية ولوازم مستهلكة + طاقة + خدمات خارجية واستهلاكات وسيطة أخرى."]]],["الوحدة 5 · عوامل الإنتاج وتنسيقها",[["العامل الطبيعي","يمثل كل الموارد الموجودة في الطبيعة على تعددها واختلافها، التي خلقها الله سبحانه وتعالى وسخرها في خدمة الإنسان."],["الموارد الحرة","تتميز بالوفرة وبدرجة تكفي إشباع حاجات من يطلبها كالهواء والشمس."],["الموارد الاقتصادية","تتميز بالندرة النسبية وتحتاج إلى وقت وجهد ومال للحصول عليها كالبترول، الحديد."],["الأرض","وتشمل الثروات السطحية (الأراضي الزراعية والغابات) والثروات الباطنية (المعادن والطاقات)."],["التضاريس","وتشمل السهول والهضاب والجبال."],["الموقع الجغرافي","المكان أو الحيز الذي يشغله البلد على الكرة الأرضية."],["المناخ","ويشمل الطقس، الرياح والأمطار."],["المياه","وتشمل البحيرات والأنهار والمحيطات والمياه الجوفية."],["إنتاجية الأرض","إنتاجية الأرض = كمية الإنتاج ÷ مساحة الأرض المزروعة."],["العمل","ذلك المجهود الذي يبذله الإنسان عن قصد ووعي سواء عضليا أو ذهنيا بهدف تحقيق المنافع الاقتصادية."],["تقسيم العمل الفني","تقسيم العملية الإنتاجية الواحدة إلى مجموعة من المراحل بحيث يتخصص كل عامل بجزء معين من مراحل الإنتاج، هذا التقسيم يزيد من مهارة وكفاءة العمل مما يؤدي إلى زيادة الإنتاجية ويوفر الوقت والجهد."],["تقسيم العمل المهني","تقسيم العمل وفقا للمهنة الممارسة من قبل الفرد كالنجار والفلاح والمحاسب."],["تقسيم العمل القطاعي","تقسيم العمل حسب قطاعات الاقتصاد الوطني مثل القطاع الزراعي، القطاع الصناعي وقطاع الخدمات."],["تقسيم العمل الدولي","تقسيم الدول تبعا لنوع العمل الأكثر انتشارا فيها فنجد بلدانا زراعية، وأخرى صناعية."],["إنتاجية العمل","إنتاجية العمل = حجم الإنتاج ÷ كمية العمل المستخدمة. (كمية العمل المستخدمة قد تكون عدد العمال أو الساعات المستخدمة في العمل)."],["الديمغرافيا","علم يهتم بدراسة السكان سواء من الناحية الكمية أو النوعية."],["الهرم السكاني","شكل يوضح التركيبة العمرية لأي مجتمع ويأخذ أشكال متعددة حسب المجتمع الذي يمثله."],["المؤشرات الديمغرافية","تتمثل أساسا في معدل الولادات، معدل الوفيات، النمو السكاني، الكثافة السكانية."],["الفئة النشطة","السكان الذين هم في سن العمل (أكبر من 16 سنة وأقل من سن التقاعد) ويكونون قادرين على العمل، وتنقسم هذه الفئة بدورها الى قسمين: الفئة المنتجة والفئة غير المنتجة."],["الفئة المنتجة","السكان الذين يتوفر فيهم سن العمل ويشتغلون."],["الفئة غير المنتجة","السكان الذين يتوفر فيهم سن العمل ولا يشتغلون."],["الفئة غير النشطة","السكان خارج سن العمل (أقل من 16 سنة والمتقاعدين)."],["رأس المال","ذلك المال الناتج عن عمل سابق والذي يساهم في إنتاج أموال أخرى."],["رأس المال الثابت","يتمثل في الآلات والتجهيزات والمعدات التي يتم استخدامها خلال عملية الإنتاج للعديد من المرات، ويؤدي هذا الاستخدام المتكرر إلى تغير طفيف عليها، بحيث تفقد قيمتها بالتدريج مع مرور الزمان."],["رأس المال المتداول","يتمثل في المواد الأولية والسلع الوسيطة التي يتم استخدامها خلال العملية الإنتاجية لمرة واحدة وبصفة نهائية، ويؤدي استخدامها الى تغيير عميق في مادتها وتنتقل قيمتها الكلية إلى السلعة المنتجة."],["رأس المال القانوني","مجموعة الحقوق التي تدر دخلا على صاحبها دون قيامه بعمل مباشر كالعلامات التجارية، والبراءات، وسميت برأس المال القانوني لأن القانون يحميها."],["رأس المال المالي","مجموعة الأموال التي تستخدم في المضاربة سواء في الأوراق المالية أو العملات الأجنبية."],["رأس المال المحاسبي","يتمثل في القيمة النقدية لإجمالي أصول المؤسسة مطروحا منها الديون."],["إنتاجية رأس المال","إنتاجية رأس المال = حجم الإنتاج ÷ رأس المال المستخدم."],["تنسيق عوامل الإنتاج","عملية مزج وتجميع عوامل الإنتاج بطريقة مثلى وعقلانية للحصول على منتج بجودة عالية وبأقل التكاليف، والمنظم هو الشخص الذي يقوم بعملية التنسيق، قد يكون فردا أو جماعة، مالكا لرأس المال أو جزء منه."],["إنتاجية تنسيق عوامل الإنتاج","تدل على مدى كفاءة عوامل الإنتاج مجتمعة في العملية الإنتاجية."],["التقدم التقني (التكنولوجيا)","تعبر عن مدى تطبيق نتائج البحث العلمي في إنتاج المنتجات بمختلف أشكالها."]]],["الوحدة 6 · تخصيص الدخل – الاستهلاك",[["الدخل الوطني","مجمل الإيرادات والمداخيل المحققة والمصرح بها من قبل الأعوان الاقتصاديين الذين يحملون جنسية البلد المعني بغض النظر عن مكان إقامتهم."],["تخصيص الدخل الوطني","يخصص الدخل الوطني للاستهلاك بالدرجة الأولى ومن ثم الادخار والاستثمار كدرجة ثانية."],["الاستهلاك","استعمال السلع والخدمات من طرف الأعوان الاقتصاديين لإشباع مختلف حاجاتهم."],["الاستهلاك النهائي","الاستعمال المباشر للسلع والخدمات من أجل إشباع مختلف الحاجات كاستعمال الملابس وتناول الغذاء واستعمال السيارة."],["الاستهلاك الوسيط","استخدام السلع والخدمات داخل العملية الإنتاجية كاستعمال المواد الأولية في إنتاج منتجات تامة قابلة للاستهلاك النهائي."],["الاستهلاك الفوري","استعمال السلعة مرة واحدة كاستهلاك الغذاء."],["الاستهلاك التدريجي","استعمال المنتج عدة مرات كالأجهزة الكهرومنزلية والسيارات."],["الاستهلاك الفردي","استعمال السلع والخدمات من طرف شخص واحد كاستعمال الهاتف النقال."],["الاستهلاك الجماعي","استعمال السلع والخدمات من طرف مجموعة معينة من الأفراد كالاستفادة من الإنارة العمومية."],["العلاقة بين الاستهلاك والدخل","الدخل = الاستهلاك + الادخار."],["الميل المتوسط للاستهلاك","نسبة يمثلها الاستهلاك من الدخل. الميل المتوسط للاستهلاك = الاستهلاك ÷ الدخل."],["الميل الحدي للاستهلاك","نسبة يمثلها التغير الذي يحدث للاستهلاك نتيجة للتغير الذي يحدث للدخل. الميل الحدي للاستهلاك = التغير في الاستهلاك ÷ التغير في الدخل."]]],["الوحدة 7 · تخصيص الدخل – الادخار والاستثمار",[["الادخار","جزء من الدخل لم يتم إنفاقه على الاستهلاك النهائي."],["الادخار الاختياري","ادخار يكون بإرادة العون الاقتصادي."],["الادخار الاجباري","ادخار لا يكون بإرادة العون الاقتصادي بل نتيجة لقرارات الحكومة كالضرائب والرسوم والاشتراكات الاجتماعية."],["الميل المتوسط للادخار","نسبة يمثلها الادخار من الدخل. الميل المتوسط للادخار = الادخار ÷ الدخل."],["الميل الحدي للادخار","نسبة يمثلها التغير الذي يحدث للادخار نتيجة للتغير الذي يحدث للدخل. الميل الحدي للادخار = التغير في الادخار ÷ التغير في الدخل."],["العلاقة بين الميلين","الميل المتوسط للاستهلاك + الميل المتوسط للادخار = 1. الميل الحدي للاستهلاك + الميل الحدي للادخار = 1."],["الاستثمار","الإنفاق على السلع الرأسمالية (الآلات، التجهيزات، المعدات) سواء من أجل الحفاظ على الطاقة الإنتاجية الحالية أو من أجل زيادتها."],["الاستثمار التعويضي","الإنفاق على السلع الرأسمالية من أجل المحافظة على نفس مستوى الطاقة الإنتاجية الحالية وذلك بتعويض الاهتلاكات التي حدثت للتثبيتات."],["الاستثمار الصافي","الإنفاق على السلع الرأسمالية من أجل زيادة مستوى الطاقة الإنتاجية مستقبلا، ويتم ذلك بتوسيع المشاريع القديمة أو زيادة مشاريع جديدة."],["الاستثمار الإجمالي","ويتضمن الاستثمار التعويضي والاستثمار الصافي."],["تمويل الاستثمارات","بالنسبة للمؤسسة: تخصيص موارد مالية معينة وتحديد مصادرها من أجل تجديد استثماراتها أو زيادتها. بالنسبة للدولة: تخصيص موارد مالية معينة وتحديد مصادرها من أجل مجابهة نفقات التجهيز العمومية."],["التمويل الذاتي","استخدام الموارد المالية الداخلية للمؤسسة بهدف تمويل استثماراتها وأهم الموارد الداخلية تتمثل في الاحتياطات."],["زيادة رأس المال","تتم الزيادة في رأس المال عن طريق طرح أسهم جديدة للاكتتاب وهذا في شركات الأموال، أو عن طريق زيادة حصص الشركاء أو إدخال شركاء جدد في شركات الأشخاص."],["القروض","مصادر تمويل خارجية تقترضها المؤسسة لمدة معينة، وتلتزم بعد انتهاء المدة بإرجاعها مقابل فوائد، ولها شكلان: قروض عادية وقروض سندية."],["الإعانات","مساعدات في شكل مبالغ مالية تتلقاها المؤسسات من جهة حكومية ولا تقوم بإرجاعها، الهدف منها تشجيع المؤسسات على إنتاج منتج معين، أو دعم أسعار بعض السلع، قد تكون هذه الإعانات في شكل مباشر (مبلغ نقدي أو تجهيزات) أو غير مباشر كالإعفاء الضريبي."]]],["الوحدة 8 · مدخل إلى المؤسسة الاقتصادية",[["المؤسسة الاقتصادية","وحدة اقتصادية منظمة تقوم بمزج مختلف الوسائل (المادية، المالية والبشرية) بطريقة مثلى وعقلانية بهدف تحقيق أقصى ربح ممكن."],["الوسائل المادية","الأراضي، البنايات، المعدات والتجهيزات."],["الوسائل المالية","رؤوس الأموال التي توضع تحت تصرف المؤسسة."],["الوسائل البشرية","العمال والموظفين."],["المؤسسات الصناعية (الإنتاجية)","المؤسسات التي تقوم باستخراج أو تحويل المواد الأولية إلى منتجات مصنعة."],["المؤسسات التجارية","المؤسسات التي تقوم بشراء البضائع واعادة بيعها على حالتها الطبيعية دون اجراء أي تغيير جوهري عليها."],["المؤسسات الخدماتية","المؤسسات التي تقدم خدمات سوقية كالنقل والفندقة."],["المؤسسات العمومية","المؤسسات التي تعود ملكية رأسمالها للدولة حصرا دون غيرها."],["المؤسسات الخاصة","المؤسسات التي تعود ملكية رأسمالها لفرد واحد في المؤسسة الفردية أو مجموعة من الأشخاص في الشركات."],["المؤسسات المختلطة","مؤسسات يشترك في ملكية رأسمالها كل من الدولة والخواص."],["المؤسسات الصغيرة","المؤسسات التي لا يتعدى فيها عدد العمال (50) عامل."],["المؤسسات المتوسطة","المؤسسات التي تشغل ما بين (50) و(500) عامل."],["المؤسسات الكبيرة","المؤسسات التي تشغل أكثر من (500) عامل."],["محيط المؤسسة","كل ما يقع خارج المؤسسة من تغيرات التي من شأنها أن تؤثر عليها."],["المحيط الاقتصادي","ويتمثل في القرارات الاقتصادية المتخذة من الدولة مثل سياسات منح القروض، الإعانات، الضرائب."],["المحيط القانوني","ويتمثل في القوانين المتعلقة بتنظيم المؤسسات كالنظام المحاسبي المالي، القانون التجاري."],["المحيط السياسي","يتمثل في مختلف القرارات السياسية المتخذة من قبل الحكومات والتي من شأنها أن تؤثر على المؤسسة كمقاطعة المنتجات من دول أصبحت معادية لأسباب سياسية، أو قرار الحكومة بمقاطعة بعض المنتجات التي تهدد الصحة العمومية."],["المحيط الثقافي","يتمثل في نمط معيشة الأفراد وأذواق المستهلكين."],["المحيط التكنولوجي","يتمثل في التغيرات التي تحدث في مجال التقدم التقني (التجهيزات الحديثة، طرق إنتاج مبتكرة)."]]],["الوحدة 9 · المؤسسة الاقتصادية والوظيفة التجارية",[["الوظيفة","مجموعة من الأنشطة والعمليات والمهام التي يمكن أن تكون من طبيعة مختلفة إلا أنها تخدم نفس الهدف."],["وظيفة الإنتاج","مجموعة الأنشطة المتعلقة بإنتاج المنتجات (تحويل المواد الأولية إلى منتجات مصنعة)، اختيار المواد الأولية، اختيار التجهيزات وتركيبها، مراقبة الإنتاج."],["الوظيفة المالية","مجموعة الأنشطة المتعلقة بتوفير رؤوس الأموال التي تحتاجها المؤسسة في الوقت المناسب وتسيير هذه الأموال."],["الوظيفة الإدارية","مجموعة الأنشطة المتعلقة بالتسيير الإداري للمؤسسة (التخطيط، التنظيم، القيادة، والرقابة)."],["الوظيفة التجارية","مجموعة الأنشطة المتعلقة بعمليتي التموين والتسويق."],["التموين","مجمل العمليات المتعلقة بشراء السلع والخدمات (توفير أحسن السلع في الوقت المناسب من حيث الكمية والنوعية، بأقل التكاليف وبأفضل الشروط) وكيفية تسييرها. عملية التموين تتضمن: الشراء، وتسيير المخزونات."],["الشراء","النشاط الرئيسي في التموين ويقصد به حيازة مختلف السلع والخدمات التي تحتاجها المؤسسة في نشاطها لضمان سيرها واستمرارها."],["تسيير المخزونات","العملية الموالية للشراء وتتضمن: التسيير المادي للمخزونات والتسيير الاقتصادي للمخزونات."],["التسويق","مجموعة من الأنشطة التي تسمح للمؤسسة بوضع سلعها أو خدماتها تحت تصرف المستهلك بالمواصفات التي ترضيه، وبالقدر المطلوب، وفي الوقت والمكان المناسبين."],["قنوات التوزيع","السبيل الذي تسلكه السلعة من المنتج إلى المستهلك."],["التوزيع المباشر","عادة يكون هذا النوع من التوزيع عند صغار المنتجين، حيث تنتقل السلعة مباشرة من المنتج إلى المستهلك."],["التوزيع القصير","ويكون في حالة تصريف المنتجات عن طريق تجار التجزئة."],["التوزيع الطويل","ويمر المسار من المنتج إلى تجار الجملة ثم إلى تجار التجزئة إلى أن يصل إلى المستهلك."],["الإشهار","مجموعة الوسائل التي تستعمل في إعلام الجمهور بهدف توليد الرغبة لديه بشراء السلعة أو الخدمة."]]],["الوحدة 10 · المبادئ الأساسية للمناجمنت",[["المناجمنت","عملية مركبة من التخطيط والتنظيم والقيادة والرقابة، الغاية منها تحقيق الأهداف المسطرة بأقل تكلفة ممكنة عن طريق الاستخدام الأمثل لموارد المنظمة المادية والبشرية والمالية."],["تعريف جون مي (John Mee)","الإدارة هي فن الحصول على أقصى النتائج بأقل جهد ممكن حتى يمكن تحقيق أقصى ربح وسعادة لكل من صاحب العمل والعاملين مع تقديم أفضل خدمة ممكنة للمجتمع."],["تعريف هنري فايول (Henri Fayol)","إن معنى أن تدير هي أن تتنبأ، وتخطط وتنظم وتصدر الأوامر وتنسق وتراقب."],["تعريف فريدريك تايلور (Frederik Taylor)","إن الإدارة هي أن تعرف بالضبط ما تريده، ثم تتأكد من أن الأفراد يؤدونه بأحسن طريقة وبأقل تكلفة."],["التخطيط","أول وظيفة من حيث الترتيب، يتم فيها تحديد أهداف المنظمة ووسائل تحقيق هذه الأهداف عن طريق اختيار وتحضير وتنفيذ المخططات."],["التنظيم","يتم فيه توزيع المهام لكل فرد من أفراد المنظمة، وتفويض السلطة والصلاحيات اللازمة."],["القيادة","التأثير بشكل ايجابي على أعضاء فريق العمل (المرؤوسين) وتوجيههم وتحفيزهم نحو تحقيق أهداف المنظمة."],["الرقابة","تقويم النشاط الفعلي للمنظمة ومقارنته بالنشاط المخطط وتعديل الانحرافات إن وجدت وهذه الوظيفة ترتبط ارتباطا وثيقا بالتخطيط."],["المنظمة","مصطلح مشتق من كلمة التنظيم (organiser) ويقصد بها كيان مستقل ومنظم يتم فيه جمع مختلف الموارد المادية والبشرية والمالية من طرف شخص يسمى المسير، للقيام بمختلف الأنشطة التي تحقق الأهداف المرجوة."],["المسير","شخص يعمل بالمنظمة، يقوم بأعمال وينجز مهام من خلال أشخاص آخرين، عن طريق السلطة الممنوحة له في اتخاذ القرارات، ومن أهم المسؤوليات الموكلة له ضمان الاستعمال الأمثل للموارد."],["المستوى الأدنى","يقع في أسفل الهرم وهم إطارات مسؤولون عن العمل الذي يقوم به الموظفون في أدنى مستوى."],["المستوى المتوسط","يقع في وسط الهرم وهم إطارات مسؤولون عن الإشراف على إطارات المستوى الأدنى ويتحملون مسؤولية أكبر من المستوى الأدنى كما أنهم يتمتعون بسلطة أكبر."],["المستوى الأعلى","الإطارات العليا في المنظمة يأتون في قمة الهرم، تتمثل مهامهم في اتخاذ القرارات الهامة على مستوى المنظمة وإعداد الخطط طويلة الأجل والتنسيق بين مختلف أعضاء المنظمة والتأكد من أنهم يعملون بشكل ملائم ويسعون إلى تحقيق الأهداف، وبالتالي مصير المنظمة بأيديهم."],["المهارات الفنية","توفر المعرفة العلمية والخبرة الكافية في مجال عمله التي تمكنه من إيجاد أنسب الحلول للمشاكل التي تواجهه، إضافة إلى توافر قدرات فكرية وعقلية تمكنه من التفكير المنطقي وتحليل أسباب المشاكل لإيجاد الحلول."],["المهارات الإنسانية","القدرة على التعامل مع المرؤوسين وتوجيه جهودهم نحو تحقيق أهداف المنظمة."],["المهارات الشخصية","تتعلق بالنزاهة والإخلاص في العمل والقدرة على تحمل المسؤولية ومجابهة المشاكل بشجاعة والقدرة على جلب ثقة الآخرين واحترامهم."]]],["الوحدة 11 · التخطيط والتنظيم",[["التخطيط (تعريف)","ذلك التصور الذهني الذي يهدف الى ايجاد وتحديد ما يجب عمله مستقبلا من قبل المنظمة من أجل بلوغ الأهداف المرغوب فيها."],["التخطيط قصير الأجل","يكون لمدة أقل من السنة وهو من اختصاص الادارة القاعدية، ومن أمثلته: التخطيط لترقية المبيعات خلال الشهر المقبل بتخفيض نسبة من السعر."],["التخطيط طويل الأجل","يكون لمدة تفوق السنة وقد يصل الى 20 سنة أو أكثر، ومن أمثلته: التخطيط لإنتاج منتج جديد، أو فتح فرع جديد."],["خطط الإنتاج","يتم فيها تحديد نوعية وحجم ومراحل الانتاج."],["خطط الاستثمار","وفيها تتحدد نوعية الاستثمارات المبرمجة، والمبالغ المخصصة لها وكيفية تمويلها."],["خطط التسويق","تتضمن سياسات التوزيع المتبعة من طرف المنظمة."],["خطط البحث والتطوير","تتضمن سياسات البحث العلمي المتبعة من طرف المنظمة التي تهدف للوصول الى منتجات تنافسية يمكن تسويقها."],["الأوامر والاجراءات","خطط تحتوي على تفاصيل دقيقة للكيفية التي يجب اتباعها لتنفيذ نشاط معين، ويتقيد بهذه الخطط المدراء الفرعيون بحيث لا يترك لهم المجال لاتخاذ قرارات معينة."],["السياسات","خطط لا تحتوي على تفاصيل دقيقة للكيفية التي يجب اتباعها لتنفيذ نشاط معين، وإنما تحتوي على قواعد يسترشد بها المدراء الفرعيون، فالسياسة لا تعلم المدير الفرعي ما يجب العمل به بالضبط وإنما تحدد له المجال الذي سيتخذ قراره داخله."],["التنظيم (تعريف)","الوظيفة الثانية للتسيير، يتم فيها تقسيم العمل داخل المنظمة الى عدة أنشطة ووظائف، وتعيين الأفراد لشغل هذه الوظائف وأداء تلك الأنشطة، والتنسيق بين جهودهم حتى لا يحدث أي تضارب أو ازدواج فيها."],["الهيكل التنظيمي للمنظمة","مخطط (خريطة) يحدد مواقع اتخاذ وتنفيذ القرارات الادارية داخل المنظمة، بهدف توضيح السلطات المسؤوليات الخاصة بكل وظيفة من وظائف المؤسسة."],["الهيكل التنظيمي حسب الوظائف","تجمع فيه أنشطة المنظمة حول الوظائف التي تقوم بها وتصنف الى: إدارة الانتاج، إدارة التمويل، إدارة الموظفين."],["الهيكل التنظيمي حسب تدرج المسؤولية","يكون الهيكل التنظيمي هنا في قالب هرمي أو تدرجي توزع فيه المسؤوليات على مستويات (درجات) متعددة تربط بين القاعدة والقمة."]]],["الوحدة 12 · القيادة والرقابة",[["القيادة (تعريف)","عملية التأثير على المرؤوسين وتوجيههم وتحفيزهم نحو تحقيق أهداف المنظمة."],["عملية اتخاذ القرار","عملية اختيار بديل واحد من مجموعة من البدائل المطروحة بناء على مجموعة من المعايير لتحقيق أهداف المنظمة."],["معيار الكفاءة","مدى قدرة القرار على تحقيق الهدف المنشود بأفضل كفاءة ممكنة وبأقل جهد وأقصر وقت وأدنى تكلفة."],["معيار القبول","عند اتخاذ القرار يجب الأخذ بعين الاعتبار مدى قبوله من طرف العاملين في المنظمة والمجتمع حتى يتم تنفيذه بكفاءة عالية."],["معيار السلامة والأمان","عند اتخاذ القرار يجب أخذ معيار السلامة والأمان بالاعتبار، لأن تجاهل ذلك سيؤدي الى أثار سلبية على المنظمة ذاتها وعلى المجتمع."],["الرقابة (تعريف)","تقويم النشاط الفعلي (المنجز) للمنظمة ومقارنته بالنشاط المخطط له، ومن ثم تحديد الانحرافات بطريقة وصفية أو كمية بهدف اتخاذ ما يلزم لمعالجة الانحرافات."],["الرقابة على مستوى المنظمة","يسعى هذا النوع من الرقابة الى تقييم الأداء الكلي للمنظمة أو أجزاء منها خلال فترة زمنية."],["الرقابة على مستوى العمليات","يقيس هذا النوع من الرقابة الأداء اليومي للعمليات المختلفة في أنشطة مختلفة كالإنتاج والتسويق."],["الرقابة على مستوى الأفراد","يقوم هذا النوع من الرقابة أداء الأفراد والرقابة على ناتج أعمالهم وسلوك أدائهم."],["تحديد المعايير الرقابية","تحدد المعايير الرقابية المناسبة، والمعيار الرقابي هو \"رقم أو مقياس للجودة أو لمستوى الأداء يحدد مسبقا في خطة المنظمة\"، ويستخدم لقياس النتائج المحققة قد يكون في شكل كمي ككمية الإنتاج أو وصفي كمستوى أداء الموظفين."],["قياس الأداء","يتم قياس الأداء الفعلي من طرف المنظمة كقياس كمية الإنتاج المنجزة أو عدد الغيابات."],["المقارنة بين الأداء الفعلي والأداء المخطط","مقارنة الأداء المنجز فعلا مع المعايير الرقابية المحددة مسبقا. الحالة الأولى: عدم وجود انحرافات أي توافق بين الأداء الفعلي والمخطط له. الحالة الثانية: وجود انحرافات موجبة أي أن الأداء الفعلي يفوق المخطط له وهذا يدل على أن الأداء جيد. الحالة الثالثة: وجود انحرافات سالبة أي أن الأداء الفعلي أقل من المخطط له وهذا يدل على أن الأداء سيء."],["تحليل أسباب الانحرافات واتخاذ القرارات اللازمة","يتم فيها تحليل أسباب وجود الانحرافات سواء الموجبة أو السالبة لاتخاذ القرار المناسب حسب كل حالة."]]]];
const qa=x=>x.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
function termsPanel(){
  let h='<input id="q" class="srch" type="search" placeholder="ابحث عن مصطلح أو مفهوم" aria-label="بحث في المصطلحات"><p class="hint">اضغط خانة في قالب ثم المصطلح أو تعريفه ليُكتب فيها؛ وبدون قالب يُكتب على السبورة.</p>';
  TERMS.forEach(g=>{h+='<section class="grp"><h4>'+g[0]+'</h4><div class="ag ag2">'+g[1].map(t=>'<div class="ar" data-q="'+qa(t[0]+' '+t[1])+'"><button class="an tm" data-v="'+qa(t[0])+'">'+t[0]+'</button><button class="am" data-v="'+qa(t[1])+'">'+t[1]+'</button></div>').join('')+'</div></section>'});
  dr.innerHTML=h;
  $$('.ar button').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>putAcc(b.dataset.v)});
  $('#q').oninput=e=>{const v=e.target.value.trim();
    $$('.ar').forEach(r=>r.style.display=(!v||r.dataset.q.includes(v))?'':'none');
    $$('.grp').forEach(g=>g.style.display=[...g.querySelectorAll('.ar')].some(r=>r.style.display!=='none')?'':'none')};
}
/* ---- drawer ---- */
const dr=$('#drawer');let cur=null;
const ACC=[["151","مؤونة الأخطار"],["158","المؤونات الأخرى للأعباء – خصوم غير جارية"],["204","برمجيات المعلوماتية وما شابهها"],["213","البنايات"],["215","المنشآت التقنية، المعدات والأدوات الصناعية"],["2182","معدات نقل"],["2183","أثاث مكتب"],["2184","معدات الإعلام الآلي"],["26","مساهمات وحسابات دائنة مرتبطة بالمساهمات"],["2804","اهتلاك برمجيات المعلوماتية وما شابهها"],["2813","اهتلاك البنايات"],["2815","اهتلاك المنشآت التقنية، المعدات والأدوات الصناعية"],["28182","اهتلاك معدات النقل"],["28183","اهتلاك أثاث مكتب"],["28184","اهتلاك معدات الإعلام الآلي"],["2904","خسائر القيمة عن برمجيات المعلوماتية"],["2913","خسائر القيمة عن البنايات"],["2915","خسائر القيمة عن المنشآت التقنية، المعدات والأدوات الصناعية"],["29182","خسائر القيمة عن معدات النقل"],["29183","خسائر القيمة عن أثاث مكتب"],["29184","خسائر القيمة عن معدات الإعلام الآلي"],["296","خسائر القيمة عن المساهمات والحسابات الدائنة المرتبطة بالمساهمات"],["30","مخزونات البضائع"],["31","المواد الأولية واللوازم"],["32","التموينات الأخرى"],["355","المنتجات المصنعة"],["37","المخزونات في الخارج"],["380","البضائع المخزنة"],["381","المواد الأولية واللوازم المخزنة"],["382","التموينات الأخرى المخزنة"],["390","خسائر القيمة عن مخزونات البضائع"],["391","خسائر القيمة عن المواد الأولية واللوازم"],["392","خسائر القيمة عن التموينات الأخرى"],["3955","خسائر القيمة عن المنتجات المصنعة"],["401","موردو المخزونات والخدمات"],["408","موردو الفواتير التي لم تصل إلى أصحابها"],["409","الموردون المدينون"],["411","الزبائن"],["416","الزبائن المشكوك فيهم"],["418","الزبائن – المنتوجات التي لم تعد فواتيرها"],["4457","الرسم على القيمة المضافة المحصل"],["462","الحسابات الدائنة عن عمليات التنازل عن التثبيتات"],["486","الأعباء المعاينة مسبقًا"],["487","المنتوجات المعاينة مسبقًا"],["491","خسائر القيمة عن حسابات الزبائن"],["503","الأسهم الأخرى أو السندات المحولة حقًا في الملكية"],["506","السندات، سندات الخزينة وقسائم الصندوق قصيرة الأجل"],["512","البنوك الحسابات الجارية"],["53","الصندوق"],["591","خسائر القيمة عن القيم الموددة في البنوك والمؤسسات المالية"],["600","مشتريات البضائع المبيعة"],["601","المواد الأولية (المستهلكة)"],["602","التموينات الأخرى (المستهلكة)"],["603","تغيرات المخزونات"],["607","المشتريات غير المخزنة من المواد والتوريدات"],["609","التخفيضات و ت و م المتحصل عليها"],["611","التقاول العام"],["613","الإيجارات"],["615","الصيانة والتصليحات، والرعاية"],["616","أقساط التأمين"],["623","الإشهار والنشر والعلاقات العمومية"],["624","نقل السلع والنقل الجماعي للمستخدمين"],["626","مصاريف البريد والاتصالات السلكية واللاسلكية"],["627","الخدمات المصرفية وما شابهها"],["63","أعباء المستخدمين"],["645","الضرائب والرسوم الأخرى"],["652","نواقص القيمة عن خروج أصول مثبتة غير مالية"],["654","خسائر عن حسابات دائنة غير قابلة للتحصيل"],["656","الغرامات والعقوبات والإعانات الممنوحة"],["657","الأعباء الاستثنائية للتسيير الجاري"],["661","أعباء الفوائد"],["665","فارق التقييم عن الأصول المالية – نواقص القيمة"],["667","الخسائر الصافية عن التنازل عن الأصول المالية"],["681","مخصصات الاهتلاكات والمؤونات وخسائر القيمة – الأصول غير الجارية"],["683","مخصصات المؤونات – الخصوم غير الجارية"],["685","مخصصات الاهتلاكات والمؤونات وخسائر القيمة – الأصول الجارية"],["686","مخصصات الاهتلاكات والمؤونات وخسائر القيمة – العناصر المالية"],["700","المبيعات من البضائع"],["701","المبيعات من المنتجات تامة الصنع"],["706","تقديم الخدمات الأخرى"],["724","تغير المخزونات من المنتجات"],["752","فوائض القيمة عن خروج أصول مثبتة غير مالية"],["757","المنتوجات الاستثنائية عن عمليات التسيير"],["765","فارق التقييم عن الأصول المالية – فوائض القيمة"],["767","الأرباح الصافية عن التنازل عن الأصول المالية"],["781","استرجاعات الاستغلال عن خسائر القيمة والمؤونات – الأصول غير الجارية"],["783","استرجاعات الاستغلال عن المؤونات – الخصوم غير الجارية"],["785","استرجاعات الاستغلال عن خسائر القيمة والمؤونات – الأصول الجارية"],["786","الاسترجاعات المالية عن خسائر القيمة والمؤونات"]];
const CLS={1:'الصنف 1 – رؤوس الأموال',2:'الصنف 2 – التثبيتات',3:'الصنف 3 – المخزونات',4:'الصنف 4 – الغير',5:'الصنف 5 – الحسابات المالية',6:'الصنف 6 – الأعباء',7:'الصنف 7 – المنتوجات'};
const fmt=v=>Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+'\u00a0DA';
const num=id=>parseFloat($(id).value)||0;
function putAcc(v){
  if(lastCell&&document.body.contains(lastCell)&&lastCell.closest('.card')){const o=lastCell.textContent.trim(),ln=lastCell.classList.contains('ln')&&(lastCell.parentElement.classList.contains('k')||lastCell.parentElement.classList.contains('bn'));lastCell.textContent=(o&&!ln)?o+' '+v:v;if(ln)jAuto(lastCell)}
  else stampLines([v]);
}

/* ---- accounting calculators ---- */
const fN=v=>Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0');
const fD=v=>{const q=(Math.abs(v)<1?Math.round(v*1000)/1000:Math.round(v*100)/100).toString().split('.');q[0]=q[0].replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0');return q.join(',')};
const txt=r=>r[2]==='m'?fN(r[1]):r[2]==='p'?fD(r[1])+' %':r[2]==='x'?fD(r[1]):r[1];
const show=r=>r[2]==='m'?fN(r[1])+'\u00a0DA':txt(r);
const F=(k,l,d=0,t='n',o)=>({k,l,d,t,o});
const dv=(a,b)=>b?a/b:0;
const RAT=['السيولة العامة = الأصول المتداولة ÷ الديون قصيرة الأجل','السيولة المختصرة = (القيم القابلة للتحقيق + القيم الجاهزة) ÷ الديون قصيرة الأجل','السيولة الفورية = القيم الجاهزة ÷ الديون قصيرة الأجل','الاستقلالية المالية = الأموال الخاصة ÷ مجموع الديون','التمويل الدائم = الأموال الدائمة ÷ الأصول الثابتة','المديونية = مجموع الديون ÷ الأموال الخاصة','المردودية المالية = النتيجة الصافية ÷ الأموال الخاصة','المردودية الاقتصادية = النتيجة العملياتية ÷ مجموع الأصول','هامش الربح الصافي = النتيجة الصافية ÷ رقم الأعمال'];
const adj=(l1,l2,l3,due,prev)=>{const d=due-prev;return[[l1,due,'m'],[d>=0?l2:l3,Math.abs(d),'m']]};
const CALCS={
 lin:{t:'الاهتلاك الثابت (مع جدول)',f:[F('c','التكلفة (DA)',600000),F('r','القيمة المتبقية (DA)',0),F('n','المدة (سنوات)',5),F('m','أشهر السنة الأولى (12 = سنة كاملة)',12)],
  run:v=>{const base=v.c-v.r,n=v.n||1,m=Math.min(12,Math.max(1,v.m||12)),an=base/n,rows=[];let rem=base,cum=0;
   for(let k=1;rem>0.5&&k<40;k++){const a=k===1?an*m/12:Math.min(an,rem);cum+=a;rem-=a;rows.push([k,base,a,cum,v.c-cum])}
   return{r:[['القيمة القابلة للاهتلاك',base,'m'],['القسط السنوي',an,'m'],['معدل الاهتلاك',100/n,'p']],s:rows}}},
 deg:{t:'الاهتلاك المتناقص (مع جدول)',f:[F('c','التكلفة (DA)',600000),F('n','المدة (سنوات)',5),F('m','أشهر السنة الأولى (12 = سنة كاملة)',12),F('k','المعامل (0 = تلقائي: 1,5 / 2 / 2,5)',0)],
  run:v=>{const n=v.n||1,m=Math.min(12,Math.max(1,v.m||12)),co=v.k||(n<=4?1.5:n<=6?2:2.5),rt=co/n,rows=[];let vnc=v.c,cum=0,el=0;
   for(let k=1;vnc>0.5&&k<40;k++){const rem=n-el/12;let a=Math.max(vnc*rt,rem>0?vnc/rem:vnc);if(k===1)a=v.c*rt*m/12;a=Math.min(a,vnc);const b=vnc;cum+=a;vnc-=a;el+=k===1?m:12;rows.push([k,b,a,cum,vnc])}
   return{r:[['المعامل',co,'x'],['معدل الاهتلاك المتناقص',rt*100,'p']],s:rows}}},
 pro:{t:'الاهتلاك المتزايد (مع جدول)',f:[F('c','التكلفة (DA)',150000),F('r','القيمة المتبقية (DA)',0),F('n','المدة (سنوات)',5)],
  run:v=>{const n=Math.max(1,Math.round(v.n)),base=v.c-v.r,S=n*(n+1)/2,u=base/S,rows=[];let cum=0;
   for(let k=1;k<=n;k++){const a=u*k;cum+=a;rows.push([k,base,a,cum,v.c-cum])}
   return{r:[['القيمة القابلة للاهتلاك',base,'m'],['مجموع أرقام الترتيب = 1 + 2 + … + n',S,'x'],['الوحدة = القيمة القابلة للاهتلاك ÷ المجموع',u,'m'],['القسط الأول (k = 1)',u,'m'],['القسط الأخير (k = n)',u*n,'m']],s:rows}}},
 uni:{t:'اهتلاك وحدات الإنتاج',f:[F('c','التكلفة (DA)',600000),F('r','القيمة المتبقية (DA)',0),F('T','الطاقة الكلية (وحدات)',100000),F('u','إنتاج السنة (وحدات)',20000)],
  run:v=>({r:[['اهتلاك الوحدة',dv(v.c-v.r,v.T),'x'],['قسط السنة',dv((v.c-v.r)*v.u,v.T),'m']]})},
 ces:{t:'التنازل عن تثبيت (فائض / نقص القيمة)',f:[F('c','تكلفة التثبيت (DA)',600000),F('a','مجموع الاهتلاك المتراكم (DA)',360000),F('b','تكملة اهتلاك السنة حتى التنازل (DA)',0),F('p','ثمن التنازل (DA)',200000)],
  run:v=>{const n=v.c-v.a-v.b,d=v.p-n;return{r:[['القيمة المحاسبية الصافية',n,'m'],[d>=0?'فائض القيمة (752)':'نقص القيمة (652)',Math.abs(d),'m']]}}},
 imp:{t:'خسارة القيمة (تثبيتات، مخزونات، زبائن)',f:[F('v','القيمة المحاسبية أو التكلفة (DA)',500000),F('q','القيمة القابلة للاسترداد أو الصافية للتحقق (DA)',420000),F('p','الخسارة السابقة (DA)',0),F('y','السنوات المتبقية (اختياري)',0)],
  run:v=>{const due=Math.max(0,v.v-v.q),r=adj('الخسارة المستحقة','المخصص (الإضافة)','الاسترجاع',due,v.p);if(v.y>0)r.push(['القسط الجديد',(v.v-due)/v.y,'m']);return{r}}},
 prv:{t:'المؤونة للأعباء (التعديل)',f:[F('n','المؤونة اللازمة (DA)',300000),F('p','المؤونة القائمة (DA)',100000)],run:v=>({r:adj('المؤونة اللازمة','المخصص (الإضافة)','الاسترجاع',v.n,v.p)})},
 cmup:{t:'متوسط التكلفة المرجح (CMUP)',f:[F('a','كل سطر: الكمية ثم السعر (المخزون الأول ثم الدخولات)','100 250\n200 270','a'),F('q','كمية المخزون الأخير (اختياري)',0)],
  run:v=>{let Q=0,V=0;v.a.split('\n').forEach(l=>{const x=(l.replace(/,/g,'.').match(/\d+(\.\d+)?/g)||[]).map(Number);if(x.length>1){Q+=x[0];V+=x[0]*x[1]}});
   const c=dv(V,Q),r=[['مجموع الكميات',Q,'x'],['مجموع القيم',V,'m'],['CMUP (للوحدة)',c,'x']];if(v.q>0)r.push(['قيمة المخزون الأخير',c*v.q,'m']);return{r}}},
 inv:{t:'الجرد المتناوب للبضائع',f:[F('si','المخزون الأول (DA)',400000),F('pu','المشتريات الصافية (DA)',1500000),F('sf','المخزون الأخير (DA)',300000),F('v','المبيعات (اختياري)',0)],
  run:v=>{const c=v.si+v.pu-v.sf,r=[['تكلفة شراء البضاعة المباعة',c,'m'],['تغير المخزونات (الأول − الأخير)',v.si-v.sf,'m']];if(v.v>0){r.push(['الهامش الإجمالي',v.v-c,'m'],['نسبة الهامش من المبيعات',dv(v.v-c,v.v)*100,'p'])}return{r}}},
 fac:{t:'الفاتورة: التخفيضات والخصم',f:[F('g','المبلغ الإجمالي (DA)',100000),F('rb','التخفيض (rabais) %',5),F('rm','التنزيل (remise) %',2),F('rs','المسموح (ristourne) %',0),F('fr','المصاريف: النقل... (DA)',0),F('es','الخصم النقدي (escompte) %',2),F('t','معدل الرسم %',19)],
  run:v=>{const nc=v.g*(1-v.rb/100)*(1-v.rm/100)*(1-v.rs/100),ht=nc+v.fr,tv=ht*v.t/100,ttc=ht+tv,es=nc*v.es/100;
   return{r:[['الصافي التجاري',nc,'m'],['المبلغ خارج الرسم',ht,'m'],['الرسم',tv,'m'],['المبلغ مع الرسم',ttc,'m'],['الخصم النقدي (على الصافي التجاري)',es,'m'],['الصافي للدفع',ttc-es,'m']]}}},
 tva:{t:'الرسم على القيمة المضافة',f:[F('h','المبلغ خارج الرسم (DA)',100000),F('tt','المبلغ مع الرسم (DA) (إن كان خارج الرسم = 0)',0),F('t','المعدل %',19)],
  run:v=>{const h=v.h>0?v.h:v.tt/(1+v.t/100);return{r:[['المبلغ خارج الرسم',h,'m'],['الرسم',h*v.t/100,'m'],['المبلغ مع الرسم',h*(1+v.t/100),'m']]}}},
 dou:{t:'الزبون المشكوك فيه',f:[F('d','الدين مع الرسم (DA)',119000),F('t','معدل الرسم %',19),F('q','المتوقع تحصيله مع الرسم (DA)',59500),F('p','الخسارة السابقة (DA)',0)],
  run:v=>{const h=v.d/(1+v.t/100),due=h*(1-dv(v.q,v.d));return{r:[['الدين خارج الرسم',h,'m'],...adj('خسارة القيمة المستحقة','المخصص (الإضافة)','الاسترجاع',due,v.p)]}}},
 pre:{t:'أعباء / منتوجات معاينة سلفًا (486 / 487)',f:[F('a','المبلغ الإجمالي (DA)',120000),F('d','مدة العقد (أشهر)',12),F('m','أشهر ما بعد تاريخ الجرد',3)],
  run:v=>{const x=dv(v.a*v.m,v.d);return{r:[['المعاين سلفًا (للسنة القادمة)',x,'m'],['الخاص بالسنة الحالية',v.a-x,'m']]}}},
 acc:{t:'الفوائد المستحقة',f:[F('k','رأس المال (DA)',1000000),F('r','المعدل السنوي %',8),F('m','عدد الأشهر',3)],run:v=>({r:[['الفوائد المستحقة',v.k*v.r/100*v.m/12,'m']]})},
 inc:{t:'الأعباء المعتبرة (التكلفة الكاملة)',f:[F('c','الأعباء حسب المحاسبة المالية (DA)',0),F('n','الأعباء غير المعتبرة (DA)',0),F('s','الأعباء الإضافية (DA)',0)],
  run:v=>({r:[['الأعباء المعتبرة',v.c-v.n+v.s,'m']]})},
 ful:{t:'التكلفة الكاملة وسعر التكلفة',f:[F('pa','ثمن شراء المواد (DA)',0),F('ca','أعباء الشراء (DA)',0),F('cp','أعباء الإنتاج (DA)',0),F('cd','أعباء التوزيع (DA)',0),F('ra','رقم الأعمال (DA)',0),F('q','الكمية (اختياري)',0)],
  run:v=>{const a=v.pa+v.ca,p=a+v.cp,c=p+v.cd,r=[['تكلفة الشراء',a,'m'],['تكلفة الإنتاج',p,'m'],['سعر التكلفة',c,'m'],['النتيجة التحليلية',v.ra-c,'m']];if(v.q>0)r.push(['سعر التكلفة للوحدة',c/v.q,'x']);return{r}}},
 var:{t:'التكاليف المتغيرة وعتبة المردودية',f:[F('ca','رقم الأعمال (DA)',1000000),F('cv','التكاليف المتغيرة (DA)',600000),F('cf','التكاليف الثابتة (DA)',250000)],
  run:v=>{const m=v.ca-v.cv,t=dv(m,v.ca),s=dv(v.cf,t),res=m-v.cf;return{r:[['الهامش على التكلفة المتغيرة',m,'m'],['نسبة الهامش',t*100,'p'],['النتيجة',res,'m'],['عتبة المردودية (رقم الأعمال الحرج)',s,'m'],['بلوغ العتبة (أشهر)',dv(s,v.ca)*12,'x'],['بلوغ العتبة (أيام، سنة = 360)',dv(s,v.ca)*360,'x'],['هامش الأمان',v.ca-s,'m'],['مؤشر الأمان',dv(v.ca-s,v.ca)*100,'p'],['معامل الاستغلال',dv(m,res),'x']]}}},
 sol:{t:'الأرصدة الوسيطة ونتيجة السنة',f:[F('ca','رقم الأعمال'),F('st','تغير مخزون المنتجات (±)'),F('im','الإنتاج المثبت'),F('sb','إعانات الاستغلال'),F('ac','المشتريات المستهلكة'),F('se','الخدمات الخارجية والاستهلاكات الأخرى'),F('pe','أعباء المستخدمين'),F('tx','الضرائب والرسوم'),F('po','المنتجات العملياتية الأخرى'),F('ao','الأعباء العملياتية الأخرى'),F('dt','المخصصات للاهتلاكات والمؤونات'),F('rp','استئناف عن خسائر القيمة والمؤونات'),F('pf','المنتجات المالية'),F('af','الأعباء المالية'),F('it','الضرائب على النتائج'),F('px','المنتجات غير العادية'),F('ax','الأعباء غير العادية')],
  run:v=>{const pr=v.ca+v.st+v.im+v.sb,co=v.ac+v.se,va=pr-co,eb=va-v.pe-v.tx,ro=eb+v.po-v.ao-v.dt+v.rp,rf=v.pf-v.af,rc=ro+rf,ra=rc-v.it,re=v.px-v.ax;
   return{r:[['إنتاج السنة المالية',pr,'m'],['استهلاك السنة المالية',co,'m'],['القيمة المضافة للاستغلال',va,'m'],['الفائض الإجمالي عن الاستغلال',eb,'m'],['النتيجة العملياتية',ro,'m'],['النتيجة المالية',rf,'m'],['النتيجة العادية قبل الضرائب',rc,'m'],['النتيجة الصافية للأنشطة العادية',ra,'m'],['النتيجة غير العادية',re,'m'],['صافي نتيجة السنة المالية',ra+re,'m']]}}},
 caf1:{t:'قدرة التمويل الذاتي (تفاضلية)',f:[F('n','النتيجة الصافية'),F('d','المخصصات (اهتلاكات ومؤونات)'),F('r','الاسترجاعات'),F('nv','نواقص القيمة عن خروج الأصول'),F('fv','فوائض القيمة عن خروج الأصول')],run:v=>({r:[['قدرة التمويل الذاتي',v.n+v.d-v.r+v.nv-v.fv,'m']]})},
 caf2:{t:'قدرة التمويل الذاتي (إجمالية)',f:[F('e','الفائض الإجمالي عن الاستغلال'),F('po','المنتجات العملياتية الأخرى (دون فوائض التنازل)'),F('ao','الأعباء العملياتية الأخرى (دون نواقص التنازل)'),F('pf','المنتجات المالية (دون الاستئنافات)'),F('af','الأعباء المالية (دون المخصصات)'),F('px','المنتجات غير العادية'),F('ax','الأعباء غير العادية'),F('it','الضرائب على النتائج')],
  run:v=>({r:[['قدرة التمويل الذاتي',v.e+v.po-v.ao+v.pf-v.af+v.px-v.ax-v.it,'m']]})},
 fr:{t:'رأس المال العامل والاحتياج والخزينة',f:[F('cp','الأموال الدائمة'),F('ai','الأصول الثابتة'),F('ve','قيم الاستغلال'),F('vr','القيم القابلة للتحقيق'),F('vd','القيم الجاهزة'),F('dc','الديون قصيرة الأجل (دون السلفات المصرفية)'),F('ab','السلفات المصرفية')],
  run:v=>{const f=v.cp-v.ai,b=v.ve+v.vr-v.dc;return{r:[['رأس المال العامل (FR)',f,'m'],['الاحتياج في رأس المال العامل (BFR)',b,'m'],['الخزينة (FR − BFR)',f-b,'m'],['الخزينة (القيم الجاهزة − السلفات)',v.vd-v.ab,'m']]}}},
 rat:{t:'النسب المالية',f:[F('k','النسبة',0,'s',RAT),F('a','البسط (DA)',0),F('b','المقام (DA)',0)],
  run:v=>({r:[[RAT[v.k].split('=')[0].trim(),dv(v.a,v.b),'x'],['بالنسبة المئوية',dv(v.a,v.b)*100,'p']]})}
};
const GR=[['الاهتلاك والتثبيتات',['lin','deg','pro','uni','ces','imp','prv']],['المخزونات',['cmup','inv']],['الفواتير والزبائن',['fac','tva','dou']],['تسويات الجرد',['pre','acc']],['التكاليف',['inc','ful','var']],['التحليل المالي',['sol','caf1','caf2','fr','rat']]];

Object.assign(CALCS,{
 e_va:{t:'القيمة المضافة',f:[F('q','كمية الإنتاج'),F('p','سعر بيع الوحدة (DA)'),F('a','مواد أولية ولوازم مستهلكة (DA)'),F('e','طاقة (DA)'),F('s','خدمات خارجية واستهلاكات وسيطة أخرى (DA)')],
  run:v=>{const P=v.q*v.p,C=v.a+v.e+v.s;return{r:[['قيمة الإنتاج = كمية الإنتاج × سعر بيع الوحدة',P,'m'],['قيمة الاستهلاكات الوسيطة',C,'m'],['القيمة المضافة = قيمة الإنتاج − قيمة الاستهلاكات الوسيطة',P-C,'m']]}}},
 e_land:{t:'إنتاجية الأرض',f:[F('q','كمية الإنتاج'),F('a','مساحة الأرض المزروعة')],run:v=>({r:[['إنتاجية الأرض = كمية الإنتاج ÷ مساحة الأرض المزروعة',dv(v.q,v.a),'x']]})},
 e_lab:{t:'إنتاجية العمل',f:[F('q','حجم الإنتاج'),F('w','كمية العمل المستخدمة (عدد العمال أو الساعات)')],run:v=>({r:[['إنتاجية العمل = حجم الإنتاج ÷ كمية العمل المستخدمة',dv(v.q,v.w),'x']]})},
 e_cap:{t:'إنتاجية رأس المال',f:[F('q','حجم الإنتاج'),F('c','رأس المال المستخدم')],run:v=>({r:[['إنتاجية رأس المال = حجم الإنتاج ÷ رأس المال المستخدم',dv(v.q,v.c),'x']]})},
 e_crd:{t:'إنتاجية تنسيق عوامل الإنتاج',f:[F('q','حجم الإنتاج'),F('c','رأس المال المستخدم'),F('w','تكلفة ساعات العمل المستخدمة')],run:v=>({r:[['حجم الإنتاج ÷ (رأس المال + تكلفة العمل)',dv(v.q,v.c+v.w),'x'],['عدد الوحدات في كل 1000 DA',dv(v.q,v.c+v.w)*1000,'x']]})},
 e_avc:{t:'الميل المتوسط للاستهلاك والادخار',f:[F('y','الدخل'),F('c','الاستهلاك')],run:v=>({r:[['الادخار = الدخل − الاستهلاك',v.y-v.c,'m'],['الميل المتوسط للاستهلاك = الاستهلاك ÷ الدخل',dv(v.c,v.y),'x'],['الميل المتوسط للادخار = الادخار ÷ الدخل',dv(v.y-v.c,v.y),'x']]})},
 e_mrg:{t:'الميل الحدي للاستهلاك والادخار',f:[F('dy','التغير في الدخل'),F('dc','التغير في الاستهلاك')],run:v=>({r:[['الميل الحدي للاستهلاك = التغير في الاستهلاك ÷ التغير في الدخل',dv(v.dc,v.dy),'x'],['الميل الحدي للادخار = التغير في الادخار ÷ التغير في الدخل',dv(v.dy-v.dc,v.dy),'x']]})}
});
const GR_E=[['الإنتاج',['e_va']],['عوامل الإنتاج',['e_land','e_lab','e_cap','e_crd']],['تخصيص الدخل',['e_avc','e_mrg']]];
function calcExpr(s){
  s=s.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-').replace(/,/g,'.').replace(/[\s\u00a0]/g,'');let i=0;
  const ex=()=>{let v=tm();while(s[i]==='+'||s[i]==='-'){const o=s[i++],r=tm();v=o==='+'?v+r:v-r}return v};
  const tm=()=>{let v=fa();while(s[i]==='*'||s[i]==='/'){const o=s[i++],r=fa();v=o==='*'?v*r:v/r}return v};
  const fa=()=>{if(s[i]==='-'){i++;return -fa()}if(s[i]==='+'){i++;return fa()}let v;
    if(s[i]==='('){i++;v=ex();if(s[i]!==')')throw 0;i++}else{const m=/^\d+(\.\d+)?|^\.\d+/.exec(s.slice(i));if(!m)throw 0;v=parseFloat(m[0]);i+=m[0].length}
    while(s[i]==='%'){i++;v/=100}return v};
  const v=ex();if(i!==s.length||!isFinite(v))throw 0;return v;
}
let cres=[];
function showRes(r){cres=r;$('#cres').innerHTML=r.map((x,i)=>'<div class="rr"><span>'+x[0]+'</span><button class="rv" data-i="'+i+'">'+show(x)+'</button></div>').join('');
  $$('.rv').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>{const x=cres[+b.dataset.i];
    if(lastCell&&document.body.contains(lastCell)&&lastCell.closest('.card')){const o=lastCell.textContent.trim();lastCell.textContent=(lastCell.classList.contains('n')||!o)?txt(x):o+' '+txt(x)}
    else stampLines([x[0]+' = '+show(x)])}})}
function sendSched(rows){
  addCard('a');const c=wrap.lastElementChild;
  for(let i=6;i<rows.length;i++)c.querySelector('[data-a=row]').click();
  const trs=c.querySelectorAll('tbody tr');
  rows.forEach((r,i)=>{const t=trs[i].querySelectorAll('td');t[0].textContent=r[0];for(let j=1;j<5;j++)t[j].textContent=fN(r[j])});
}
function renderCalc(id){
  const box=$('#cbox');
  if(id==='basic'){
    const keys=['7','8','9','÷','C','4','5','6','×','⌫','1','2','3','−','(','0','.','%','+',')'];
    box.innerHTML='<input id="bx" class="srch" dir="ltr" inputmode="decimal" placeholder="مثال: (600000 − 50000) ÷ 5" aria-label="العملية الحسابية"><div class="kp">'+keys.map(k=>'<button class="b">'+k+'</button>').join('')+'</div><div id="cres"></div><div id="csch"></div>';
    const bx=$('#bx'),u=()=>{try{showRes([['النتيجة',calcExpr(bx.value),'x']])}catch(e){showRes([])}};
    bx.oninput=u;bx.onkeydown=e=>{if(e.key==='Enter'){try{bx.value=fD(calcExpr(bx.value)).replace(/\u00a0/g,'');u()}catch(x){}}};
    $$('.kp button').forEach(b=>b.onclick=()=>{const k=b.textContent;if(k==='C')bx.value='';else if(k==='⌫')bx.value=bx.value.slice(0,-1);else bx.value+=k;u()});
    return;
  }
  const c=CALCS[id];
  box.innerHTML='<div class="cf">'+c.f.map(f=>f.t==='a'?'<label class="wide">'+f.l+'<textarea id="f_'+f.k+'" rows="3">'+f.d+'</textarea></label>':f.t==='s'?'<label class="wide">'+f.l+'<select id="f_'+f.k+'">'+f.o.map((o,i)=>'<option value="'+i+'">'+o+'</option>').join('')+'</select></label>':'<label>'+f.l+'<input id="f_'+f.k+'" type="number" step="any" inputmode="decimal" value="'+f.d+'"></label>').join('')+'</div><div id="cres"></div><div id="csch"></div>';
  let sched=null;
  const u=()=>{const v={};c.f.forEach(f=>{const e=$('#f_'+f.k);v[f.k]=f.t==='a'?e.value:f.t==='s'?+e.value:(parseFloat(e.value)||0)});
    const o=c.run(v);showRes(o.r);sched=o.s||null;
    $('#csch').innerHTML=sched?'<table class="sch"><tr><th>السنة</th><th>القاعدة</th><th>القسط</th><th>المجموع</th><th>الصافية</th></tr>'+sched.map(r=>'<tr><td>'+r[0]+'</td>'+[1,2,3,4].map(j=>'<td>'+fN(r[j])+'</td>').join('')+'</tr>').join('')+'</table><button class="b" id="snd">إرسال إلى جدول الاهتلاك</button>':'';
    if(sched)$('#snd').onclick=()=>sendSched(sched)};
  box.querySelectorAll('input,textarea,select').forEach(e=>e.oninput=u);u();
}

/* ---- قيد اليومية: رقم الحساب  اسمه ---- */
const dig=t=>t.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s/g,'');
const norm=t=>t.replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
const ACCN=ACC.map(a=>[a[0],a[1],norm(a[1])]);
function jCtx(ln){
  const td=ln.closest&&ln.closest('td.tl');if(!td||!ln.classList.contains('ln'))return null;
  const tr=td.parentElement,idx=[...ln.parentElement.children].indexOf(ln),ks=[...tr.querySelectorAll('td.k')],bn=tr.querySelector('td.bn');
  if(ks.length<2||!bn)return null;
  return{idx,k:ks.map(t=>t.children[idx]),b:bn.children[idx],dr:ln.classList.contains('dr')};
}
function jAuto(ln){
  const c=jCtx(ln);if(!c)return;const pc=ln.parentElement.classList;
  if(pc.contains('k')){
    delete ln.dataset.auto;const a=ACC.find(x=>x[0]===dig(ln.textContent));
    if(a){if(c.b&&(!c.b.textContent.trim()||c.b.dataset.auto)){c.b.textContent=a[1];c.b.dataset.auto='1'}}
    else if(c.b&&c.b.dataset.auto){c.b.textContent='';delete c.b.dataset.auto}
  }else if(pc.contains('bn')){
    delete ln.dataset.auto;const nv=norm(ln.textContent),a=nv&&ACCN.find(x=>x[2]===nv),t=c.k[c.dr?0:1];
    if(a){if(t&&(!t.textContent.trim()||t.dataset.auto)){t.textContent=a[0];t.dataset.auto='1'}}
    else if(t&&t.dataset.auto){t.textContent='';delete t.dataset.auto}
  }
}
const sg=document.createElement('div');sg.id='sg';sg.hidden=true;document.body.appendChild(sg);
let sgl=[],sgi=0,sgln=null;
function sgHide(){sg.hidden=true;sgln=null}
function sgMark(){[...sg.children].forEach((x,i)=>x.classList.toggle('on',i===sgi))}
function sgUpdate(ln){
  const c=jCtx(ln);if(!c){sgHide();return}
  const t=ln.textContent.trim();let l=[];
  if(ln.parentElement.classList.contains('k')){const v=dig(t);if(v)l=ACC.filter(a=>a[0].startsWith(v)&&a[0]!==v)}
  else if(ln.parentElement.classList.contains('bn')){const nv=norm(t);if(nv.length>1)l=ACCN.filter(a=>a[2].includes(nv)&&a[2]!==nv).map(a=>[a[0],a[1]])}
  l=l.slice(0,8);if(!l.length){sgHide();return}
  sgl=l;sgi=0;sgln=ln;
  sg.innerHTML=l.map((a,i)=>'<div class="sgi" data-i="'+i+'"><b>'+a[0]+'</b> '+a[1]+'</div>').join('');sgMark();
  const r=ln.getBoundingClientRect();sg.hidden=false;
  sg.style.top=Math.min(r.bottom+4,innerHeight-sg.offsetHeight-8)+'px';sg.style.left=Math.max(8,Math.min(r.left,innerWidth-sg.offsetWidth-8))+'px';
}
function sgPick(i){
  const a=sgl[i],ln=sgln,c=ln&&jCtx(ln);if(!a||!c)return sgHide();
  const k=ln.parentElement.classList.contains('k')?ln:c.k[c.dr?0:1];
  if(k){k.textContent=a[0];delete k.dataset.auto}
  if(c.b){c.b.textContent=a[1];delete c.b.dataset.auto}
  sgHide();
}
wrap.addEventListener('input',e=>{const ln=e.target;if(ln.classList&&ln.classList.contains('ln')){jAuto(ln);sgUpdate(ln)}});
wrap.addEventListener('focusout',e=>{if(e.target===sgln)sgHide()});
wrap.addEventListener('keydown',e=>{
  if(sg.hidden||e.target!==sgln)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();e.stopPropagation();sgi=(sgi+(e.key==='ArrowDown'?1:sgl.length-1))%sgl.length;sgMark()}
  else if(e.key==='Enter'||e.key==='Tab'&&!e.shiftKey){e.preventDefault();e.stopPropagation();sgPick(sgi)}
  else if(e.key==='Escape'){e.stopPropagation();sgHide()}
},true);
sg.addEventListener('pointerdown',e=>{e.preventDefault();const it=e.target.closest('.sgi');if(it)sgPick(+it.dataset.i)});
const panels={
 tpl:()=>{dr.innerHTML='<div class="row">'+Object.entries(TPL).map(([k,v])=>'<button class="chip" data-t="'+k+'">'+v.name+'</button>').join('')+'</div>';
   $$('[data-t]').forEach(b=>b.onclick=()=>addCard(b.dataset.t))},
 acc:()=>{if(subj==='eco2')return termsPanel();if(subj!=='acc3'){dr.innerHTML='<p class="hint" style="font-size:18px">لم يُضف محتوى لهذه المادة بعد (قوالب أو مصطلحات أو حسابات).</p>';return}
   let h='<input id="q" class="srch" type="search" placeholder="ابحث برقم الحساب أو اسمه" aria-label="بحث في الحسابات"><p class="hint">اضغط خانة في قالب ثم اضغط الرقم أو الاسم ليُكتب فيها؛ وبدون قالب يُكتب على السبورة.</p>',c=0;
   ACC.forEach(a=>{const k=a[0][0];if(k!==c){if(c)h+='</div></section>';c=k;h+='<section class="grp"><h4>'+CLS[k]+'</h4><div class="ag">'}
     h+='<div class="ar" data-q="'+a[0]+' '+a[1]+'"><button class="an" data-v="'+a[0]+'">'+a[0]+'</button><button class="am" data-v="'+a[1]+'">'+a[1]+'</button></div>'});
   dr.innerHTML=h+'</div></section>';
   $$('.ar button').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>putAcc(b.dataset.v)});
   $('#q').oninput=e=>{const v=e.target.value.trim();
     $$('.ar').forEach(r=>r.style.display=(!v||r.dataset.q.includes(v))?'':'none');
     $$('.grp').forEach(g=>g.style.display=[...g.querySelectorAll('.ar')].some(r=>r.style.display!=='none')?'':'none')}},
 calc:()=>{
   dr.innerHTML='<select id="csel" class="b" aria-label="نوع الحساب" style="margin-bottom:8px;max-width:100%"><option value="basic"> آلة حاسبة</option>'+(subj==='eco2'?GR_E:subj==='acc3'?GR:[]).map(g=>'<optgroup label="'+g[0]+'">'+g[1].map(i=>'<option value="'+i+'">'+CALCS[i].t+'</option>').join('')+'</optgroup>').join('')+'</select><div id="cbox"></div>';
   $('#csel').onchange=e=>renderCalc(e.target.value);renderCalc('basic')}
};
$$('[data-tab]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.tab;
  if(cur===k){dr.classList.remove('open');cur=null;$$('[data-tab]').forEach(x=>x.classList.remove('on'));return}
  cur=k;dr.style.maxHeight=k==='calc'?'60%':'';panels[k]();dr.classList.add('open');$$('[data-tab]').forEach(x=>x.classList.toggle('on',x===b));
});

/* ---- ساعة إلكترونية خضراء مربعة ---- */
const SEG={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
const SPL={a:'8,4 34,4 38,8 34,12 8,12 4,8',b:'39,9 43,13 43,35 39,39 35,35 35,13',c:'39,43 43,47 43,69 39,73 35,69 35,47',d:'8,70 34,70 38,74 34,78 8,78 4,74',e:'3,43 7,47 7,69 3,73 -1,69 -1,47',f:'3,9 7,13 7,35 3,39 -1,35 -1,13',g:'8,37 34,37 38,41 34,45 8,45 4,41'};
const dgt=(n,x)=>'<g transform="translate('+x+' 0)">'+Object.keys(SPL).map(k=>'<polygon class="'+(SEG[n].includes(k)?'on':'off')+'" points="'+SPL[k]+'"/>').join('')+'</g>';
function clockHTML(d){
  const h=String(d.getHours()).padStart(2,'0'),m=String(d.getMinutes()).padStart(2,'0'),sc=String(d.getSeconds()).padStart(2,'0'),b=d.getSeconds()%2?'off':'on';
  const dot=y=>'<rect class="'+b+'" x="113" y="'+y+'" width="10" height="10"/>';
  const tm='<svg viewBox="-3 0 238 82">'+dgt(h[0],0)+dgt(h[1],55)+dot(23)+dot(50)+dgt(m[0],132)+dgt(m[1],187)+'</svg>';
  const ss='<svg viewBox="-3 0 108 82">'+dgt(sc[0],0)+dgt(sc[1],55)+'</svg>';
  const L='ar-DZ-u-nu-latn';
  return '<div class="ct">'+tm+'</div><div class="cs">'+ss+'</div><div class="cd">'+d.toLocaleDateString(L,{weekday:'long'})+'<br>'+d.toLocaleDateString(L,{day:'numeric',month:'long',year:'numeric'})+'</div>';
}
let clkEl=null,clkSize=125,clkTimer=null;
function clkTick(){if(clkEl)clkEl.querySelector('.cf2').innerHTML=clockHTML(new Date())}
function clkSet(on){
  if(on&&!clkEl){
    clkEl=document.createElement('div');clkEl.id='clock';
    clkEl.innerHTML='<div class="cf2"></div><div class="cc"><button data-c="up" aria-label="تكبير الساعة">＋</button><button data-c="dn" aria-label="تصغير الساعة">－</button><button data-c="x" aria-label="إخفاء الساعة">✕</button></div>';
    clkEl.style.setProperty('--cs',clkSize+'px');clkEl.style.left='12px';clkEl.style.top=Math.max(8,wrap.clientHeight-clkSize-12)+'px';
    wrap.appendChild(clkEl);clkTick();clkTimer=setInterval(clkTick,1000);
  }else if(!on&&clkEl){clearInterval(clkTimer);clkEl.remove();clkEl=null}
  $('#clk').classList.toggle('on',!!clkEl);try{localStorage.setItem('clk',clkEl?'1':'0')}catch(e){}
}
$('#clk').onclick=()=>clkSet(!clkEl);
wrap.addEventListener('click',e=>{
  const b=e.target.closest('#clock .cc button');if(!b)return;const a=b.dataset.c;
  if(a==='x')return clkSet(false);
  clkSize=Math.max(90,Math.min(520,clkSize+(a==='up'?20:-20)));clkEl.style.setProperty('--cs',clkSize+'px');
});
let clkDrag=null;
wrap.addEventListener('pointerdown',e=>{
  const c=e.target.closest('#clock');if(!c||e.target.closest('button'))return;
  clkDrag={dx:e.clientX-c.offsetLeft,dy:e.clientY-c.offsetTop};c.setPointerCapture(e.pointerId);
});
wrap.addEventListener('pointermove',e=>{if(clkDrag&&clkEl){clkEl.style.left=(e.clientX-clkDrag.dx)+'px';clkEl.style.top=(e.clientY-clkDrag.dy)+'px'}});
['pointerup','pointercancel'].forEach(t=>wrap.addEventListener(t,()=>clkDrag=null));
try{if(localStorage.getItem('clk')==='1')clkSet(true)}catch(e){}
function setSubj(v){
  subj=v;try{localStorage.setItem('sbj',v)}catch(e){}
  $('#subj').value=v;fillTpl();$('[data-tab=acc]').textContent=v==='acc3'?' الحسابات':v==='eco2'?' المصطلحات':' المحتوى';
  if(cur==='acc'||cur==='calc')panels[cur]();
}
$('#subj').onchange=e=>setSubj(e.target.value);
try{const sv=localStorage.getItem('sbj'),mp={acc:'acc3',eco:'eco2'};const k=mp[sv]||sv;if(['acc3','acc2','eco3','eco2','law3','law2'].includes(k))subj=k}catch(e){}
setSubj(subj);