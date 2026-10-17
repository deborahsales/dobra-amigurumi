import { DEFAULTS, THEMES, LIDS, createModel, resolveTheme, faceSVG, nodesToSVG, artNodes, pageSVG, createPDF, windowGeometry } from './engine.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cm=v=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v/10);
const icons={
  box:'<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5"/>',
  ruler:'<path d="m4 15 11-11 5 5L9 20zM12 7l2 2m-5 1 2 2m-5 1 2 2"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-up-right':'<path d="M5 19 19 5M7 5h12v12"/>',
  reset:'<path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/>',
  rotate:'<path d="M4 8a8 8 0 0 1 14-2l2 3M20 3v6h-6M20 16A8 8 0 0 1 6 18l-2-3M4 21v-6h6"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>',
  sliders:'<path d="M4 7h6m4 0h6M4 17h10m4 0h2"/><circle cx="12" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
  shield:'<path d="m12 2 8 4v7c0 4-5 7-8 9-3-2-8-5-8-9V6zM8 12l3 3 5-6"/>',
  pages:'<path d="M8 3h10l3 3v14H8zM4 6H2v16h15v-2M17 3v5h4"/>',
  'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  'file-download':'<path d="M14 2H5v20h14V7zM14 2v6h5M12 10v8m-3-3 3 3 3-3"/>',
  download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
  printer:'<path d="M7 8V3h10v5M7 17H3V9h18v8h-4M7 14h10v8H7zM17 11h1"/>',
  save:'<path d="M4 3h13l4 4v14H3V3zM7 3v6h10V3M7 21v-8h10v8"/>',
  folder:'<path d="M3 7V4h7l3 3h8v13H3zM3 10h18"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.box}</svg>`;
function fillIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
const lidsArt={
  tuck:'<path d="m12 19 21-9 22 10v25l-22 9-21-10zM12 19l21 10 22-9M33 29v25M12 19l9-13 21 9-9 14M21 6l21 9"/>',
  cap:'<path d="m12 29 21-9 22 10v21l-22 9-21-10zM12 29l21 10 22-9M33 39v21M10 11l22-9 25 11-23 9zM10 11v8l24 10 23-9v-7M34 22v7"/>',
  handle:'<path d="m12 24 21-9 22 10v25l-22 9-21-10zM12 24l21 10 22-9M33 34v25M27 21V9c0-9 15-9 15 0v13"/>',
};
$$('[data-lid-art]').forEach(el=>el.innerHTML=`<svg viewBox="0 0 68 65" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round">${lidsArt[el.dataset.lidArt]}</svg>`);
fillIcons();

let state={...DEFAULTS,windows:[...DEFAULTS.windows]},uploadedImage=null,model,activeTab='box',toastTimer;
const storageKey='dobra-atelie-v1';
try {const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&typeof saved==='object')state={...DEFAULTS,...saved};}catch{}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}}
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function setForm(){
  for(const [key,value] of Object.entries(state)) {
    const el=document.getElementById(key);if(!el||el.type==='file'||key==='windows')continue;
    if(el.type==='checkbox')el.checked=Boolean(value);else el.value=value;
  }
  $$('input[name=windows]').forEach(el=>el.checked=state.windows?.includes(el.value));
}
function readForm(){
  for(const key of ['height','width','depth','ease','thickness','margin','windowBorder']) {
    const field=document.getElementById(key);state[key]=field.value===''?NaN:Number(field.value);
  }
  for(const key of ['window','folds','ink'])state[key]=$('#'+key).checked;
  state.color=$('#color').value;state.description=$('#description').value;
  state.windows=$$('input[name=windows]:checked').map(el=>el.value);
}
function renderThemes(){
  $('#theme-grid').innerHTML=THEMES.map(t=>{
    const selected=state.theme===t.id;
    return `<button type="button" class="theme-option${selected?' selected':''}" data-theme="${t.id}" aria-pressed="${selected}" aria-label="${t.name}"><span class="theme-sample"><svg viewBox="0 0 60 65" aria-hidden="true">${nodesToSVG([artNodes(60,65,{...DEFAULTS,theme:t.id,color:t.ink},'front')])}</svg></span><strong>${t.short}</strong></button>`;
  }).join('');
  $('#theme-grid').addEventListener('click',e=>{const btn=e.target.closest('[data-theme]');if(!btn)return;const t=THEMES.find(v=>v.id===btn.dataset.theme);state.theme=t.id;state.color=t.ink;state.description='';setForm();update();});
}
function renderSwatches(){
  const palette=[['#697e63','Verde sálvia'],['#b38570','Terracota'],['#b77e94','Rosa antigo'],['#7b8ea5','Azul suave'],['#aa9468','Dourado natural']];
  $('#swatches').innerHTML=palette.map(([color,name])=>`<button type="button" class="swatch${state.color===color?' selected':''}" data-color="${color}" style="background:${color}" aria-label="${name}" title="${name}" aria-pressed="${state.color===color}"></button>`).join('');
}
$('#swatches').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;state.color=b.dataset.color;$('#color').value=state.color;update();});

function renderBox(){
  const valid=Number.isFinite(model.W)&&Number.isFinite(model.H)&&Number.isFinite(model.D)&&model.W>0&&model.H>0&&model.D>0;
  const W=valid?model.W:85,D=valid?model.D:75,H=valid?model.H:195;
  const stage=$('#panel-box'),mobile=innerWidth<571;
  const availableH=mobile?258:320,availableW=Math.max(150,stage.clientWidth*.51);
  const scale=Math.min(availableH/H,availableW/(W+D*.65));
  const bw=W*scale,bd=D*scale,bh=H*scale,box=$('#box-3d');
  box.style.width=bw+'px';box.style.height=bh+'px';box.style.transform=`rotateX(-15deg) rotateY(${$('#rotation').value}deg)`;
  const definitions=[['front',W,H,bw,bh,`translateZ(${bd/2}px)`],['back',W,H,bw,bh,`rotateY(180deg) translateZ(${bd/2}px)`],['right',D,H,bd,bh,`rotateY(90deg) translateZ(${bw/2}px)`],['left',D,H,bd,bh,`rotateY(-90deg) translateZ(${bw/2}px)`],['top',W,D,bw,bd,`translateY(${-bh/2}px) rotateX(90deg)`],['bottom',W,D,bw,bd,`translateY(${bh/2}px) rotateX(-90deg)`]];
  box.innerHTML=definitions.map(([id,w,h,pw,ph,transform])=>{
    let artwork=faceSVG(w,h,state,id==='top'?'lid':id,uploadedImage);
    const isWindow=state.window&&state.windows.includes(id),v=isWindow?windowGeometry(w,h,state):null;
    if(v) {
      // A white material aperture is replaced by a translucent surface in 3D.
      const maskId=`visor-${id}`;
      artwork=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><mask id="${maskId}"><rect width="${w}" height="${h}" fill="white"/><rect x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" fill="black"/></mask></defs><g mask="url(#${maskId})">${nodesToSVG([artNodes(w,h,state,id,uploadedImage)])}</g></svg>`;
    }
    const visor=v?`<div class="preview-visor" style="left:${v.x/w*100}%;top:${v.y/h*100}%;width:${v.w/w*100}%;height:${v.h/h*100}%"></div>`:'';
    const cap=state.lid==='cap'&&!['top','bottom'].includes(id)?'<span class="cap-band"></span>':'';
    const seam=state.lid!=='cap'&&id==='front'?'<span class="tuck-seam"></span>':'';
    const handle=state.lid==='handle'&&id==='top'?'<span class="preview-handle"></span>':'';
    return `<div class="box-face ${id}${v?' visor-outline':''}" style="width:${pw}px;height:${ph}px;margin-left:${-pw/2}px;margin-top:${-ph/2}px;transform:${transform}">${artwork}${visor}${cap}${seam}${handle}</div>`;
  }).join('');
  const t=resolveTheme(state);$('#collection-name').textContent='COLEÇÃO '+t.name.toLocaleUpperCase('pt-BR');
  $('#height-label').textContent=cm(valid?model.internal.h:195)+' cm';$('#width-label').textContent=cm(valid?model.internal.w:85)+' cm';
  $('#scene').setAttribute('aria-label',`Prévia 3D, coleção ${t.name}, tampa ${LIDS.find(t=>t.id===state.lid)?.name||''}${state.window?', com visor transparente':''}. Use o controle para girar.`);
}
function renderSheets(){
  $('#pages-grid').innerHTML=model.pages.map((page,index)=>`<div class="sheet-item"><div class="sheet-paper">${pageSVG(page,state)}</div><div class="sheet-label"><span>Folha ${String(index+1).padStart(2,'0')}</span><span>${page.placements.map(p=>htmlEscape(p.piece.name)).join(' · ')}</span></div></div>`).join('')||'<p class="micro">Ajuste as medidas para visualizar as folhas A4.</p>';
}
function renderVisors(){
  $('#visor-settings').hidden=!state.window;$('#border-value').textContent=cm(state.windowBorder*10)+' cm';
  if(!state.window)return;
  const defs=[['front','Frente',model.W],['right','Lateral direita',model.D],['left','Lateral esquerda',model.D],['back','Verso',model.W]];
  $('#visor-sizes').innerHTML='<strong>Corte do acrílico / acetato</strong>'+defs.filter(([id])=>state.windows.includes(id)).map(([,label,w])=>{
    if(!Number.isFinite(w)||!Number.isFinite(model.H))return '';
    const v=windowGeometry(w,model.H,state);return v?`<div class="visor-size-line"><span>${label}</span><span>${cm(v.acrylicW)} × ${cm(v.acrylicH)} cm</span></div>`:`<div class="visor-size-line">${label}: diminua a moldura.</div>`;
  }).join('')+(state.windows.length?'':'<span>Escolha ao menos uma face para o visor.</span>');
}
function update(){
  model=createModel(state,uploadedImage);
  $('#inside-size').innerHTML=icon('box')+' Espaço interno: '+(model.internal?[model.internal.h,model.internal.w,model.internal.d].map(cm).join(' × ')+' cm':'informe as três medidas');
  $$('[data-theme]').forEach(btn=>{const on=btn.dataset.theme===resolveTheme(state).id;btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on));});
  $$('[data-lid]').forEach(btn=>{const on=btn.dataset.lid===state.lid;btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on));});
  renderSwatches();renderBox();renderVisors();
  if(activeTab==='pages')renderSheets();
  const errs=[...model.errors];if(state.window&&!state.windows.length)errs.push('Escolha pelo menos uma face para o visor ou desative a opção de visor transparente.');
  $('#model-errors').innerHTML=errs.map(e=>`<p>${htmlEscape(e)}</p>`).join('');$('#model-errors').hidden=!errs.length;
  const note=model.notices?.[0];$('#model-notices').hidden=!note;$('#model-notices').innerHTML=note?icon('info')+`<span>${htmlEscape(note)} As instruções de união aparecem no guia, fora do PDF.</span>`:'';
  $('#download').disabled=!!errs.length;$('#print').disabled=!!errs.length;
  $('#page-count-tab').textContent=model.pages.length||'—';
  $('#export-summary').textContent=errs.length?'Ajuste as medidas para gerar o PDF':`${model.pages.length} folhas A4 · PDF vetorial · escala 1:1`;
  const typed=state.description.trim();const theme=resolveTheme(state);
  $('#theme-hint').textContent=typed?(theme.customMatched?`Tema reconhecido: ${theme.name}. O tema orienta a estampa e não é impresso como texto.`:`Usando a coleção ${theme.name}. Para representar “${typed}” com fidelidade, envie a sua arte.`):'Palavras reconhecidas selecionam uma coleção. Para uma arte específica, envie uma imagem.';
  persist();
}
$('#box-form').addEventListener('submit',e=>e.preventDefault());
$('#box-form').addEventListener('input',e=>{
  if(e.target.type==='file')return;
  readForm();if(e.target.id==='window'&&state.window&&!state.windows.length){state.windows=['front'];$('input[name=windows][value=front]').checked=true;}
  update();
});
$$('[data-lid]').forEach(btn=>btn.addEventListener('click',()=>{state.lid=btn.dataset.lid;update();}));
function switchTab(tab){
  activeTab=tab;for(const id of ['box','pages']){const selected=id===tab;$('#tab-'+id).classList.toggle('active',selected);$('#tab-'+id).setAttribute('aria-selected',String(selected));$('#tab-'+id).tabIndex=selected?0:-1;$('#panel-'+id).hidden=!selected;}
  if(tab==='pages')renderSheets();else renderBox();
}
$('#tab-box').addEventListener('click',()=>switchTab('box'));$('#tab-pages').addEventListener('click',()=>switchTab('pages'));
$('.tabs').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const target=e.key==='Home'?'box':e.key==='End'?'pages':activeTab==='box'?'pages':'box';switchTab(target);$('#tab-'+target).focus();}});
$('#rotation').addEventListener('input',()=>{$('#box-3d').style.transform=`rotateX(-15deg) rotateY(${$('#rotation').value}deg)`;});
$('#rotation-reset').addEventListener('click',()=>{$('#rotation').value=-28;renderBox();});
window.addEventListener('resize',()=>{if(activeTab==='box')renderBox();});

function downloadBytes(bytes,name,type){const blob=new Blob([bytes],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function fileBase(){return `dobra-${state.height}x${state.width}x${state.depth}-${state.lid}`;}
$('#download').addEventListener('click',()=>{try{downloadBytes(createPDF(model),fileBase()+'.pdf','application/pdf');toast('Seu molde está pronto. Imprima em A4 a 100%.');}catch(err){toast('Não foi possível gerar o PDF. '+err.message);}});
$('#print').addEventListener('click',()=>{
  if(model.errors.length)return;
  let root=$('#print-root');if(!root){root=document.createElement('div');root.id='print-root';root.hidden=true;document.body.appendChild(root);}
  root.innerHTML=model.pages.map(p=>`<div class="print-page">${pageSVG(p,state)}</div>`).join('');
  root.hidden=false;window.print();
});
window.addEventListener('afterprint',()=>{const root=$('#print-root');if(root)root.hidden=true;});

async function prepareImage(file){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Escolha uma imagem PNG, JPG ou WebP.');
  if(file.size>12*1024*1024)throw new Error('A imagem deve ter até 12 MB.');
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Não foi possível abrir a imagem.'));im.src=url;});
    const ratio=img.naturalWidth/img.naturalHeight,scale=Math.min(1,1800/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');
    canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
    const ctx=canvas.getContext('2d');ctx.fillStyle=resolveTheme(state).bg;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    return {dataUrl:canvas.toDataURL('image/jpeg',.94),width:canvas.width,height:canvas.height,ratio,name:file.name.slice(0,160)};
  }finally{URL.revokeObjectURL(url);}
}
function updateUpload(){const has=!!uploadedImage;$('#upload-label').textContent=has?uploadedImage.name:'Adicionar minha arte';$('#remove-art').hidden=!has;}
$('#art-upload').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{uploadedImage=await prepareImage(file);updateUpload();update();toast('Arte adicionada à frente e ao verso.');}catch(err){toast(err.message);}e.target.value='';});
$('#remove-art').addEventListener('click',()=>{uploadedImage=null;updateUpload();update();});
$('#reset').addEventListener('click',()=>{state={...DEFAULTS,windows:[...DEFAULTS.windows]};uploadedImage=null;setForm();updateUpload();update();toast('Uma folha em branco para sua próxima ideia.');});
$('#save-project').addEventListener('click',()=>{downloadBytes(JSON.stringify({app:'dobra-atelie',version:1,config:state,image:uploadedImage},null,2),fileBase()+'.json','application/json');toast('Projeto salvo. Use “Abrir projeto” para continuar depois.');});
$('#load-project').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    if(f.size>18*1024*1024)throw new Error('Arquivo de projeto muito grande.');
    const doc=JSON.parse(await f.text());if(doc.app!=='dobra-atelie'||doc.version!==1||!doc.config)throw new Error('Este arquivo não é um projeto Dobra Ateliê.');
    const next={...DEFAULTS};for(const key of Object.keys(DEFAULTS)){if(Object.hasOwn(doc.config,key))next[key]=doc.config[key];}
    const checked=createModel(next);if(checked.config&&checked.config.description!==undefined)next.description=checked.config.description;
    if(!Array.isArray(next.windows)||!next.windows.every(x=>['front','right','back','left'].includes(x)))throw new Error('Seleção de visores inválida.');
    if(!THEMES.some(t=>t.id===next.theme)||!/^#[\da-f]{6}$/i.test(next.color))throw new Error('Tema ou cor inválida.');
    if(checked.errors.some(msg=>msg.includes('intervalo permitido')||msg.includes('deve estar')||msg.includes('tampa válida')))throw new Error('Configurações de projeto inválidas.');
    let image=null;
    if(doc.image){
      if(typeof doc.image.dataUrl!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(doc.image.dataUrl))throw new Error('Imagem do projeto inválida.');
      const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Imagem do projeto corrompida.'));im.src=doc.image.dataUrl;});
      image={dataUrl:doc.image.dataUrl,width:img.naturalWidth,height:img.naturalHeight,ratio:img.naturalWidth/img.naturalHeight,name:String(doc.image.name||'Minha arte').slice(0,160)};
    }
    state=next;uploadedImage=image;setForm();updateUpload();update();toast('Projeto aberto. Pode continuar a criar!');
  }catch(err){toast('Não foi possível abrir o projeto. '+err.message);}e.target.value='';
});

function assemblyGuide(){
  const b=model.internal?`${cm(model.internal.h)} × ${cm(model.internal.w)} × ${cm(model.internal.d)} cm`:'';
  const t=LIDS.find(l=>l.id===state.lid)?.name;
  const lidHelp=state.lid==='cap'?'Una as abas dos cantos da tampa por dentro. Se as laterais vierem em peças separadas, cole as abas superiores sob o topo e depois una os cantos. A tampa veste o corpo por fora.':state.lid==='handle'?'Dobre a aba de cobertura e embuta a aba curta por dentro da frente. Dobre as duas pontas da alça e passe-as pelos dois rasgos da tampa, deixando as pontas ancoradas por baixo. A alça é decorativa.':'Dobre as abas laterais menores, feche a aba de cobertura e embuta a aba curta por dentro da frente.';
  return `<div class="guide-meta"><strong>Sua caixa:</strong> ${htmlEscape(b)} de espaço interno<br><strong>Tampa:</strong> ${htmlEscape(t||'')} · <strong>Folhas:</strong> ${model.pages.length} A4</div><ol><li><strong>Prepare o papel.</strong> Imprima em A4 a 100%, em uma face. Use papel com rigidez adequada ao tamanho e peso da peça; 180 a 240 g/m² é um ponto de partida para protótipos pequenos. A espessura configurada ajusta as dimensões de dobra e a folga da tampa.</li><li><strong>Recorte e vinque.</strong> Linhas contínuas são cortes; tracejadas são vincos. Não corte as dobras. Se desligou os vincos no PDF, consulte a visualização com as linhas ativadas antes de montar.</li>${state.window?'<li><strong>Aplique os visores.</strong> Recorte as aberturas escolhidas. Corte o acrílico ou acetato nas medidas mostradas no painel, já com 5 mm extras em cada borda. Cole por dentro, mantendo as bordas longe das linhas de dobra. Prefira uma chapa fina compatível com o papel; a espessura do visor não é descontada do espaço interno.</li>':''}<li><strong>Una as faces.</strong> A sequência ao redor da caixa é frente → lateral direita → verso → lateral esquerda → frente. Cole a aba direita de cada face por dentro da próxima. Se houver uma tira de união separada, dobre-a ao meio e cole uma metade em cada face, por dentro.</li><li><strong>Una as abas separadas.</strong> Abas que precisaram sair em outra peça têm uma faixa branca de 1 cm. Cole essa faixa por dentro do corpo, alinhando a linha de vinco à borda superior ou inferior. A face maior do fundo, com um rasgo, pertence ao verso; a aba curta com lingueta pertence à frente. As abas trapezoidais menores são das laterais. Veja a identificação ao lado de cada folha na aba “Folhas A4”.</li><li><strong>Feche o fundo por encaixe.</strong> Dobre as duas abas laterais para dentro. Dobre a face maior do fundo, presa ao verso, sobre elas. Por último, dobre a aba curta da frente e empurre sua lingueta pelo rasgo do fundo. A trava fecha sem cola; as uniões laterais e as abas que saíram separadas usam cola.</li><li><strong>Finalize a tampa.</strong> ${lidHelp}</li></ol><p class="guide-notice">Faça uma montagem de teste antes da impressão final: papel, cola, visor e impressora alteram o ajuste físico. O molde mantém a escala real e nunca reduz uma face para fazê-la caber em A4.</p><h3>O que aparece na impressão?</h3><p>Somente a estampa, os contornos de corte e os vincos, quando ativados. Nomes de peças, medidas, instruções e numeração de folhas ficam apenas aqui no site. O tema digitado também não vira texto na embalagem.</p><h3>Seu projeto, com você</h3><p>As configurações são lembradas neste navegador. Para guardar também a imagem enviada ou transferir para outro dispositivo, use “Salvar projeto” e conserve o arquivo JSON.</p>`;
}
$$('[data-help]').forEach(b=>b.addEventListener('click',()=>{$('#assembly-guide').innerHTML=assemblyGuide();$('#help-dialog').showModal();}));
$$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>$('#help-dialog').close()));
$('#help-dialog').addEventListener('click',e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
setForm();renderThemes();updateUpload();update();
