import { DEFAULTS, THEMES, LIDS, FACES, PANORAMA_ORDER, TEXT_FONTS, ART_STYLES, buildArtPrompt, layoutText, panoramaLayout, panoramaPlacement, movePanoramaCut, fontSampleSVG, normalizeConfig, projectData, parseProject, createModel, resolveTheme, faceSVG, nodesToSVG, artNodes, pageSVG, createPDF, windowGeometry } from './engine.js';
import { initPricing } from './pricing-ui.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cm=v=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v/10);
const icons={
  calculator:'<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M8 6h8v4H8zM8 14h1m6 0h1m-8 4h1m6 0h1"/>',
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
  sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5zM20 2v4m-2-2h4"/>',
  copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
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

let state=normalizeConfig(),uploadedImages={},model,activeTab='box',toastTimer,colorTimer,themeExpanded=false,sharedUploadToken=null;
const imageSources=new WeakMap(),uploadTokens={};
let editFrame=0,cutDrag=null,imageDrag=null;
const defaultImageTransform=()=>({scale:1,x:0,y:0,fit:'original'});
function scheduleEdit(){if(!editFrame)editFrame=requestAnimationFrame(()=>{editFrame=0;update();});}
function flushEdit(){if(editFrame){cancelAnimationFrame(editFrame);editFrame=0;}update();}
const storageKey='dobra-atelie-v1';
try {const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&typeof saved==='object')state=normalizeConfig(saved);}catch{}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}}
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function setForm(){
  for(const [key,value] of Object.entries(state)) {
    const el=document.getElementById(key);if(!el||el.type==='file'||key==='windows')continue;
    if(el.type==='checkbox')el.checked=Boolean(value);else el.value=value;
  }
  $$('input[name=windows]').forEach(el=>el.checked=state.windows?.includes(el.value));
  if(THEMES.findIndex(t=>t.id===state.theme)>=8)themeExpanded=true;
}
function readForm(){
  for(const key of ['height','width','depth','ease','thickness','margin','windowBorder','textSize']) {
    const field=document.getElementById(key);state[key]=field.value===''?NaN:Number(field.value);
  }
  for(const key of ['window','folds','ink','textEnabled'])state[key]=$('#'+key).checked;
  state.mainColor=$('#mainColor').value;state.detailColor=$('#detailColor').value;state.description=$('#description').value;
  state.windows=$$('input[name=windows]:checked').map(el=>el.value);
  state.textPosition=$('#textPosition').value;
  state.artPromptStyle=$('#artPromptStyle').value;
  state.texts=Object.fromEntries(FACES.map(f=>[f.id,$('#text-'+f.id).value]));
}
function renderThemes(){
  $('#theme-grid').innerHTML=THEMES.map((t,i)=>{
    const selected=state.theme===t.id;
    return `<button type="button" class="theme-option${i>=8?' extra-theme':''}${selected?' selected':''}" data-theme="${t.id}" aria-pressed="${selected}" aria-label="${t.name}"><span class="theme-sample"><svg viewBox="0 0 60 65" aria-hidden="true">${nodesToSVG([artNodes(60,65,{...DEFAULTS,theme:t.id,mainColor:t.bg,detailColor:t.ink},'front')])}</svg></span><strong>${t.short}</strong></button>`;
  }).join('');
  $('#theme-grid').addEventListener('click',e=>{const btn=e.target.closest('[data-theme]');if(!btn)return;const t=THEMES.find(v=>v.id===btn.dataset.theme);state.theme=t.id;state.mainColor=t.bg;state.detailColor=t.ink;state.description='';setForm();update();});
}
function renderSwatches(){
  const palettes={mainColor:[['#f5f1e5','Creme'],['#e4eddd','Verde claro'],['#f3e0e7','Rosa claro'],['#e2eaf4','Azul claro'],['#eae0f1','Lavanda'],['#ffffff','Branco']],detailColor:[['#697e63','Verde sálvia'],['#b38570','Terracota'],['#b77e94','Rosa antigo'],['#7b8ea5','Azul suave'],['#aa9468','Dourado natural'],['#263f33','Verde escuro']]};
  for(const [key,palette]of Object.entries(palettes))$('#swatches-'+key).innerHTML=palette.map(([color,name])=>`<button type="button" class="swatch${state[key]===color?' selected':''}" data-color="${color}" data-color-key="${key}" style="background:${color}" aria-label="${key==='mainColor'?'Fundo':'Detalhes'}: ${name}" title="${name}" aria-pressed="${state[key]===color}"></button>`).join('');
}
$('#color-controls').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;const key=b.dataset.colorKey;state[key]=b.dataset.color;$('#'+key).value=state[key];clearTimeout(colorTimer);update();});
$('#more-themes').addEventListener('click',()=>{themeExpanded=!themeExpanded;renderThemeExpansion();});
function renderThemeExpansion(){const selected=THEMES.findIndex(t=>t.id===resolveTheme(state).id);$('#theme-grid').classList.toggle('is-expanded',themeExpanded);$$('.extra-theme').forEach((el,i)=>el.hidden=!themeExpanded&&i+8!==selected);$('#more-themes').setAttribute('aria-expanded',String(themeExpanded));$('#more-themes').textContent=themeExpanded?'Mostrar menos temas':`Ver todos os ${THEMES.length} temas`;}

function renderBox(){
  const valid=Number.isFinite(model.W)&&Number.isFinite(model.H)&&Number.isFinite(model.D)&&model.W>0&&model.H>0&&model.D>0;
  const W=valid?model.W:85,D=valid?model.D:75,H=valid?model.H:195;
  const previewImages=valid?uploadedImages:{};
  const stage=$('#panel-box'),mobile=innerWidth<571;
  const availableH=mobile?258:320,availableW=Math.max(150,stage.clientWidth*.51);
  const scale=Math.min(availableH/H,availableW/(W+D*.65));
  const bw=W*scale,bd=D*scale,bh=H*scale,box=$('#box-3d');
  box.style.width=bw+'px';box.style.height=bh+'px';box.style.transform=`rotateX(-15deg) rotateY(${$('#rotation').value}deg)`;
  const definitions=[['front',W,H,bw,bh,`translateZ(${bd/2}px)`],['back',W,H,bw,bh,`rotateY(180deg) translateZ(${bd/2}px)`],['right',D,H,bd,bh,`rotateY(90deg) translateZ(${bw/2}px)`],['left',D,H,bd,bh,`rotateY(-90deg) translateZ(${bw/2}px)`],['top',W,D,bw,bd,`translateY(${-bh/2}px) rotateX(90deg)`],['bottom',W,D,bw,bd,`translateY(${bh/2}px) rotateX(-90deg)`]];
  box.innerHTML=definitions.map(([id,w,h,pw,ph,transform])=>{
    let artwork=faceSVG(w,h,state,id==='top'?'lid':id,previewImages);
    const isWindow=state.window&&state.windows.includes(id),v=isWindow?windowGeometry(w,h,state):null;
    if(v) {
      // A white material aperture is replaced by a translucent surface in 3D.
      const maskId=`visor-${id}`;
      artwork=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><mask id="${maskId}"><rect width="${w}" height="${h}" fill="white"/><rect x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" fill="black"/></mask></defs><g mask="url(#${maskId})">${nodesToSVG([artNodes(w,h,state,id,previewImages)])}</g></svg>`;
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
  refreshImageBackgrounds();
  model=createModel(state,uploadedImages);
  $('#inside-size').innerHTML=icon('box')+' Espaço interno: '+(model.internal?[model.internal.h,model.internal.w,model.internal.d].map(cm).join(' × ')+' cm':'informe as três medidas');
  $$('[data-theme]').forEach(btn=>{const on=btn.dataset.theme===resolveTheme(state).id;btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on));});
  $$('[data-lid]').forEach(btn=>{const on=btn.dataset.lid===state.lid;btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on));});
  renderSwatches();renderThemeExpansion();renderBox();renderVisors();renderTextSettings();renderArtPrompt();updateUpload();
  if(activeTab==='pages')renderSheets();
  const errs=[...model.errors];if(state.window&&!state.windows.length)errs.push('Escolha pelo menos uma face para o visor ou desative a opção de visor transparente.');
  $('#model-errors').innerHTML=errs.map(e=>`<p>${htmlEscape(e)}</p>`).join('');$('#model-errors').hidden=!errs.length;
  const note=model.notices?.[0];$('#model-notices').hidden=!note;$('#model-notices').innerHTML=note?icon('info')+`<span>${htmlEscape(note)} As instruções de união aparecem no guia, fora do PDF.</span>`:'';
  $('#download').disabled=!!errs.length;$('#print').disabled=!!errs.length;
  $('#page-count-tab').textContent=model.pages.length||'—';
  $('#export-summary').textContent=errs.length?'Ajuste as opções para gerar o PDF':`${model.pages.length} folhas A4 · PDF vetorial · escala 1:1`;
  const typed=state.description.trim();const theme=resolveTheme(state);
  $('#theme-hint').textContent=typed?(theme.customMatched?`Tema reconhecido: ${theme.name}. Use “Preparar uma arte” para criar um pedido personalizado.`:`Usando a coleção ${theme.name}. Para representar “${typed}”, prepare o pedido de arte abaixo e depois envie suas imagens.`):'Escolha uma coleção ou escreva o tema para preparar um pedido de arte personalizado.';
  persist();
}
$('#box-form').addEventListener('submit',e=>e.preventDefault());
$('#box-form').addEventListener('input',e=>{
  if(e.target.type==='file'||e.target.matches('[data-image-adjust],[data-panorama-cut]'))return;
  readForm();if(e.target.id==='window'&&state.window&&!state.windows.length){state.windows=['front'];$('input[name=windows][value=front]').checked=true;}
  if(['mainColor','detailColor'].includes(e.target.id)){clearTimeout(colorTimer);colorTimer=setTimeout(update,90);}else update();
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
$('#download').addEventListener('click',()=>{try{clearTimeout(colorTimer);update();downloadBytes(createPDF(model),fileBase()+'.pdf','application/pdf');toast('Seu molde está pronto. Imprima em A4 a 100%.');}catch(err){toast('Não foi possível gerar o PDF. '+err.message);}});
$('#print').addEventListener('click',()=>{
  clearTimeout(colorTimer);update();if(model.errors.length)return;
  let root=$('#print-root');if(!root){root=document.createElement('div');root.id='print-root';root.hidden=true;document.body.appendChild(root);}
  root.innerHTML=model.pages.map(p=>`<div class="print-page">${pageSVG(p,state)}</div>`).join('');
  root.hidden=false;window.print();
});
window.addEventListener('afterprint',()=>{const root=$('#print-root');if(root)root.hidden=true;});

function decodeImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Não foi possível abrir a imagem.'));im.src=src;});}
function flattenImage(asset,source,bg){
  const canvas=document.createElement('canvas');canvas.width=asset.width;canvas.height=asset.height;
  const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);
  asset.dataUrl=canvas.toDataURL('image/jpeg',.94);asset.background=bg;
}
function refreshImageBackgrounds(){const bg=resolveTheme(state).bg;for(const asset of new Set(Object.values(uploadedImages))){const source=imageSources.get(asset);if(source&&asset.background!==bg)flattenImage(asset,source,bg);}}
async function prepareImage(file,mode=null){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Escolha uma imagem PNG, JPG ou WebP.');
  if(file.size>12*1024*1024)throw new Error('A imagem deve ter até 12 MB.');
  const url=URL.createObjectURL(file);
  try{
    const img=await decodeImage(url);
    const limit=mode==='panorama'?4096:1600,scale=Math.min(1,limit/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const asset={sourceDataUrl:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height,ratio:canvas.width/canvas.height,name:file.name.slice(0,160)};
    if(mode)asset.mode=mode;
    imageSources.set(asset,canvas);flattenImage(asset,canvas,resolveTheme(state).bg);return asset;
  }finally{URL.revokeObjectURL(url);}
}
function renderUploads(){
  $('#face-uploads').innerHTML=PANORAMA_ORDER.map(id=>FACES.find(f=>f.id===id)).map(f=>`<div class="face-art-card" data-art-face="${f.id}">
    <label class="face-upload" for="art-${f.id}"><span class="face-art-title">${f.name}</span><span class="face-art-preview"><span class="face-art-thumb" id="thumb-${f.id}" hidden></span><span id="empty-${f.id}">${icon('image')}</span></span><span class="face-art-action" id="action-${f.id}">Escolher imagem</span><span class="face-art-name" id="name-${f.id}">PNG · JPG · WebP</span></label>
    <input id="art-${f.id}" type="file" class="sr-only face-art-input" data-face="${f.id}" accept="image/png,image/jpeg,image/webp">
    <details class="face-editor" id="editor-${f.id}" hidden><summary>Ajustar arte <span>${icon('sliders')}</span></summary><div class="face-editor-content">
      <div class="face-editor-preview" data-editor-face="${f.id}" id="editor-preview-${f.id}" role="img" aria-label="Prévia de ${f.name.toLowerCase()}; arraste para mover a arte"></div>
      <p class="micro">Arraste a arte ou use os controles.</p>
      <label for="image-scale-${f.id}">Tamanho <output id="image-scale-value-${f.id}" for="image-scale-${f.id}">100%</output></label><input id="image-scale-${f.id}" data-image-adjust="scale" data-face="${f.id}" type="range" min="10" max="500" step="1" value="100">
      <label for="image-x-${f.id}">Horizontal <output id="image-x-value-${f.id}" for="image-x-${f.id}">0%</output></label><input id="image-x-${f.id}" data-image-adjust="x" data-face="${f.id}" type="range" min="-100" max="100" step="1" value="0">
      <label for="image-y-${f.id}">Vertical <output id="image-y-value-${f.id}" for="image-y-${f.id}">0%</output></label><input id="image-y-${f.id}" data-image-adjust="y" data-face="${f.id}" type="range" min="-100" max="100" step="1" value="0">
      <div class="image-fit-actions"><button type="button" data-image-fit="contain" data-face="${f.id}">Caber na face</button><button type="button" data-image-fit="cover" data-face="${f.id}">Preencher face</button><button type="button" data-image-fit="original" data-face="${f.id}">Restaurar</button></div>
    </div></details>
    <button type="button" class="repeat-face-art" data-repeat-face="${f.id}" aria-label="Repetir a imagem de ${f.name.toLowerCase()} nas quatro faces" hidden>Repetir nas quatro</button><button type="button" class="remove-face-art" data-remove-face="${f.id}" aria-label="Remover arte: ${f.name}" hidden>${icon('close')}</button>
  </div>`).join('');
  $$('.face-editor').forEach(editor=>editor.addEventListener('toggle',()=>{editor.closest('.face-art-card').classList.toggle('editing',editor.open);if(editor.open)updateUpload();}));
}
function faceEditorSVG(part,face){
  const nodes=[artNodes(part.width,part.height,state,face,uploadedImages)];
  const v=state.window&&state.windows.includes(face)?windowGeometry(part.width,part.height,state):null;
  if(v)nodes.push({type:'rect',...v,fill:'#ffffff',stroke:'#b8c2ad',width:.4,w:v.w,h:v.h});
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${part.width} ${part.height}" aria-hidden="true">${nodesToSVG(nodes)}</svg>`;
}
function currentPanorama(){return Object.values(uploadedImages).find(image=>image?.mode==='panorama');}
function renderPanorama(){
  const asset=currentPanorama();$('#remove-panorama').hidden=!asset;$('#apply-panorama').hidden=!asset;$('#reset-panorama-cuts').disabled=!asset;
  try{
    const layout=panoramaLayout(state),bg=resolveTheme(state).bg;
    $('#panorama-size').textContent=`Arte total: ${cm(layout.width)} × ${cm(layout.height)} cm (largura × altura)`;
    const nodes=[{type:'rect',x:0,y:0,w:layout.width,h:layout.height,fill:bg}];
    if(asset)nodes.push({type:'image',...panoramaPlacement(layout,asset.ratio),image:asset});
    $('#panorama-strip').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="Panorama com cortes ajustáveis das quatro faces; guias não impressas">${nodesToSVG(nodes)}</svg>`;
    for(let i=0;i<3;i++){
      const value=layout.cuts[i]*100,min=(i?layout.cuts[i-1]*100:0)+1,max=(i<2?layout.cuts[i+1]*100:100)-1,handle=$(`[data-cut-handle="${i}"]`),range=$('#panorama-cut-'+i);
      handle.style.left=value+'%';handle.disabled=!asset;handle.setAttribute('aria-valuemin',min);handle.setAttribute('aria-valuemax',max);handle.setAttribute('aria-valuenow',value);handle.setAttribute('aria-valuetext',value.toLocaleString('pt-BR',{maximumFractionDigits:2})+'% da imagem');
      range.min=min;range.max=max;range.value=value;range.disabled=!asset;$('#panorama-cut-value-'+i).textContent=value.toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
    }
    $('#panorama-labels').innerHTML=layout.faces.map(face=>`<span style="flex:${face.end-face.start}"><strong>${face.name}</strong><small>${cm(face.width)} cm</small>${asset&&uploadedImages[face.id]!==asset?'<em>'+(uploadedImages[face.id]?'Imagem individual':'Coleção padrão')+'</em>':''}</span>`).join('');
    const count=asset?FACES.filter(f=>uploadedImages[f.id]===asset).length:0;
    $('#panorama-note').textContent=(asset?`Panorama aplicado em ${count} de 4 faces. `:'Envie uma imagem com as quatro faces lado a lado. ')+(layout.automatic?'Cortes automáticos conforme as medidas. ':'Cortes personalizados; as posições escolhidas são mantidas ao mudar as medidas. ')+'Arraste as linhas ou use os controles abaixo. As guias aparecem só no site. Confira cada trecho em “Ajustar arte”.';
  }catch(err){
    $('#panorama-size').textContent=err.message;$('#panorama-strip').innerHTML='';$('#panorama-labels').innerHTML='';$('#panorama-note').textContent='Confira as medidas para visualizar a divisão do panorama.';
    $$('[data-cut-handle],[data-panorama-cut]').forEach(el=>el.disabled=true);
  }
}
function changePanoramaCut(index,value){try{state.panoramaCuts=movePanoramaCut(state,index,value);scheduleEdit();}catch{}}
$('#panorama-cut-controls').addEventListener('input',e=>{if(e.target.matches('[data-panorama-cut]'))changePanoramaCut(Number(e.target.dataset.panoramaCut),Number(e.target.value)/100);});
$('#reset-panorama-cuts').addEventListener('click',()=>{state.panoramaCuts=null;flushEdit();toast('Cortes automáticos restaurados.');});
$('#panorama-handles').addEventListener('pointerdown',e=>{
  const handle=e.target.closest('[data-cut-handle]');if(!handle||handle.disabled||e.button!==0)return;
  const rect=$('#panorama-strip').getBoundingClientRect();cutDrag={pointer:e.pointerId,index:Number(handle.dataset.cutHandle),rect};handle.setPointerCapture(e.pointerId);e.preventDefault();
});
$('#panorama-handles').addEventListener('pointermove',e=>{if(cutDrag&&cutDrag.pointer===e.pointerId)changePanoramaCut(cutDrag.index,(e.clientX-cutDrag.rect.left)/cutDrag.rect.width);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('#panorama-handles').addEventListener(event,e=>{if(cutDrag&&cutDrag.pointer===e.pointerId){cutDrag=null;flushEdit();}});
$('#panorama-handles').addEventListener('keydown',e=>{
  const handle=e.target.closest('[data-cut-handle]');if(!handle||handle.disabled)return;
  const i=Number(handle.dataset.cutHandle),cuts=panoramaLayout(state).cuts,step=e.shiftKey ? .01 : .001;
  let value=cuts[i];if(['ArrowLeft','ArrowDown'].includes(e.key))value-=step;else if(['ArrowRight','ArrowUp'].includes(e.key))value+=step;else if(e.key==='Home')value=0;else if(e.key==='End')value=1;else return;
  e.preventDefault();changePanoramaCut(i,value);
});
$('#face-uploads').addEventListener('input',e=>{
  const input=e.target;if(!input.matches('[data-image-adjust]'))return;
  const key=input.dataset.imageAdjust,face=input.dataset.face;state.imageTransforms[face][key]=Number(input.value)/(key==='scale'?100:1);scheduleEdit();
});
$('#face-uploads').addEventListener('pointerdown',e=>{
  const preview=e.target.closest('[data-editor-face]');if(!preview||e.button!==0||!uploadedImages[preview.dataset.editorFace])return;
  let layout;try{layout=panoramaLayout(state);}catch{return;}
  const face=preview.dataset.editorFace,part=layout.faces.find(f=>f.id===face),rect=preview.getBoundingClientRect(),scale=Math.min(rect.width/part.width,rect.height/part.height);
  imageDrag={pointer:e.pointerId,face,startX:e.clientX,startY:e.clientY,x:state.imageTransforms[face].x,y:state.imageTransforms[face].y,width:part.width*scale,height:part.height*scale};preview.setPointerCapture(e.pointerId);e.preventDefault();
});
$('#face-uploads').addEventListener('pointermove',e=>{
  if(!imageDrag||imageDrag.pointer!==e.pointerId)return;const d=imageDrag,t=state.imageTransforms[d.face];
  t.x=Math.max(-100,Math.min(100,d.x+(e.clientX-d.startX)/d.width*100));t.y=Math.max(-100,Math.min(100,d.y+(e.clientY-d.startY)/d.height*100));scheduleEdit();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('#face-uploads').addEventListener(event,e=>{if(imageDrag&&imageDrag.pointer===e.pointerId){imageDrag=null;flushEdit();}});
function renderArtPrompt(){
  try{$('#art-prompt-text').value=buildArtPrompt(state,$('#prompt-target').value);$('#copy-art-prompt').disabled=false;}
  catch(err){$('#art-prompt-text').value=err.message;$('#copy-art-prompt').disabled=true;}
}
$('#copy-art-prompt').addEventListener('click',async()=>{
  clearTimeout(colorTimer);readForm();update();if($('#copy-art-prompt').disabled)return;
  const field=$('#art-prompt-text');
  const success=$('#prompt-target').value==='all'?'Pedido copiado. Gere o panorama e use “Enviar panorama”.':'Pedido copiado. Gere a arte e envie na face escolhida.';
  try{await navigator.clipboard.writeText(field.value);toast(success);}
  catch{field.focus();field.select();field.setSelectionRange(0,field.value.length);let copied=false;try{copied=document.execCommand('copy');}catch{}toast(copied?success:'Pedido selecionado. Use a opção Copiar do seu navegador.');}
});
$('#go-to-uploads').addEventListener('click',()=>{const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,shared=$('#prompt-target').value==='all';$(shared?'#shared-art-upload':'#face-uploads').scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});$(shared?'#art-all':'#art-'+$('#prompt-target').value).focus({preventScroll:true});});
function renderTextControls(){
  $('#face-texts').innerHTML=FACES.map(f=>`<label for="text-${f.id}">${f.name}<input id="text-${f.id}" type="text" maxlength="80" placeholder="Sem texto nesta face" value="${htmlEscape(state.texts[f.id])}"></label>`).join('');
  $('#font-options').innerHTML=TEXT_FONTS.map(f=>`<button type="button" class="font-option" data-font="${f.id}" aria-label="Fonte ${f.name}" aria-pressed="false"><span class="font-sample">${fontSampleSVG(f.id)}</span><strong>${f.name}</strong></button>`).join('');
}
function renderTextSettings(){
  $('#text-settings').hidden=!state.textEnabled;$('#text-size-value').textContent=state.textSize+' pt';
  const adjusted=[];
  if(state.textEnabled&&model?.W&&model?.H)for(const face of FACES){const width=['front','back'].includes(face.id)?model.W:model.D,l=layoutText(width,model.H,state,face.id);if(l&&!l.error&&l.size*72/25.4<state.textSize-.1)adjusted.push(face.name.toLowerCase()+' '+(l.size*72/25.4).toLocaleString('pt-BR',{maximumFractionDigits:1})+' pt');}
  $('#text-fit-note').hidden=!adjusted.length;$('#text-fit-note').textContent=adjusted.length?'Para caber no espaço disponível: '+adjusted.join(' · ')+'. Encurte o texto ou amplie a área para usar o tamanho escolhido.':'';

  $$('[data-font]').forEach(b=>{const on=b.dataset.font===state.textFont;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
}
$('#font-options').addEventListener('click',e=>{const b=e.target.closest('[data-font]');if(!b)return;state.textFont=b.dataset.font;update();});
function updateUpload(){
  $('#shared-art-action').textContent=sharedUploadToken?'Carregando panorama…':'Enviar panorama';$('#art-all').disabled=!!sharedUploadToken;$('#shared-art-upload').setAttribute('aria-busy',String(!!sharedUploadToken));
  let layout;try{layout=panoramaLayout(state);}catch{}
  for(const face of FACES){
    const asset=uploadedImages[face.id],thumb=$('#thumb-'+face.id),panoramic=asset?.mode==='panorama',part=layout?.faces.find(f=>f.id===face.id);
    thumb.hidden=!asset;$('#empty-'+face.id).hidden=!!asset;
    thumb.innerHTML=asset?(part?faceSVG(part.width,part.height,{...state,textEnabled:false},face.id,uploadedImages):`<img src="${htmlEscape(asset.sourceDataUrl||asset.dataUrl)}" alt="Arte para ${face.name.toLowerCase()}">`):'';
    $('#action-'+face.id).textContent=asset?'Trocar imagem':'Escolher imagem';$('#name-'+face.id).textContent=asset?(panoramic?'Trecho do panorama · ':'')+asset.name:'PNG · JPG · WebP';
    $(`[data-remove-face="${face.id}"]`).hidden=!asset;$(`[data-repeat-face="${face.id}"]`).hidden=!asset||panoramic;
    const editor=$('#editor-'+face.id);editor.hidden=!asset;if(!asset){editor.open=false;$('#editor-preview-'+face.id).innerHTML='';}
    const t=state.imageTransforms[face.id];
    for(const key of ['scale','x','y']){const value=key==='scale'?t.scale*100:t[key],input=$('#image-'+key+'-'+face.id);input.value=value;input.disabled=!part;$('#image-'+key+'-value-'+face.id).textContent=value.toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';}
    if(editor.open&&asset&&part)$('#editor-preview-'+face.id).innerHTML=faceEditorSVG(part,face.id);
    $$('#editor-'+face.id+' [data-image-fit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.imageFit===t.fit&&(t.fit!=='original'||t.scale===1&&t.x===0&&t.y===0))));
  }
  renderPanorama();
}
$('#art-all').addEventListener('change',async e=>{
  const input=e.target,file=input.files[0];if(!file)return;
  cancelImageUploads();const token=Symbol();sharedUploadToken=token;for(const face of FACES)uploadTokens[face.id]=token;updateUpload();
  try{
    const asset=await prepareImage(file,'panorama'),faces=FACES.filter(f=>uploadTokens[f.id]===token);
    if(!faces.length)return;
    for(const face of faces){uploadedImages[face.id]=asset;state.imageTransforms[face.id]=defaultImageTransform();}
    update();toast(faces.length===4?'Panorama dividido e aplicado nas quatro faces.':`Panorama aplicado em ${faces.length} ${faces.length===1?'face':'faces'}. As trocas individuais foram mantidas.`);
  }catch(err){if(sharedUploadToken===token)toast(err.message);}
  finally{if(sharedUploadToken===token){sharedUploadToken=null;input.value='';updateUpload();}}
});
$('#face-uploads').addEventListener('change',async e=>{const input=e.target;if(!input.classList.contains('face-art-input'))return;const file=input.files[0],face=input.dataset.face;if(!file)return;const token=Symbol();uploadTokens[face]=token;$('#action-'+face).textContent='Carregando…';try{const asset=await prepareImage(file);if(uploadTokens[face]!==token)return;uploadedImages[face]=asset;state.imageTransforms[face]=defaultImageTransform();update();toast(`Arte adicionada: ${FACES.find(f=>f.id===face).name.toLowerCase()}.`);}catch(err){toast(err.message);updateUpload();}finally{input.value='';}});
$('#face-uploads').addEventListener('click',e=>{
  const fit=e.target.closest('[data-image-fit]');if(fit){state.imageTransforms[fit.dataset.face]={...defaultImageTransform(),fit:fit.dataset.imageFit};flushEdit();return;}
  const repeat=e.target.closest('[data-repeat-face]');
  if(repeat){const asset=uploadedImages[repeat.dataset.repeatFace],transform={...state.imageTransforms[repeat.dataset.repeatFace]};if(!asset)return;cancelImageUploads();uploadedImages=Object.fromEntries(FACES.map(f=>[f.id,asset]));for(const face of FACES)state.imageTransforms[face.id]={...transform};update();toast('A mesma arte foi aplicada nas quatro faces.');return;}
  const b=e.target.closest('[data-remove-face]');if(!b)return;const face=b.dataset.removeFace;uploadTokens[face]=Symbol();delete uploadedImages[face];updateUpload();update();
});
$('#apply-panorama').addEventListener('click',()=>{const asset=currentPanorama();if(!asset)return;cancelImageUploads();uploadedImages=Object.fromEntries(FACES.map(f=>[f.id,asset]));update();toast('Os quatro trechos do panorama foram aplicados novamente.');});
$('#remove-panorama').addEventListener('click',()=>{cancelImageUploads();uploadedImages=Object.fromEntries(Object.entries(uploadedImages).filter(([,asset])=>asset.mode!=='panorama'));update();toast('Panorama removido. As imagens individuais foram mantidas.');});
function cancelImageUploads(){sharedUploadToken=null;$('#art-all').value='';for(const face of FACES)uploadTokens[face.id]=Symbol();}
$('#reset').addEventListener('click',()=>{cancelImageUploads();clearTimeout(colorTimer);state=normalizeConfig();uploadedImages={};themeExpanded=false;renderTextControls();setForm();updateUpload();update();toast('Uma folha em branco para sua próxima ideia.');});
$('#save-project').addEventListener('click',()=>{clearTimeout(colorTimer);update();downloadBytes(JSON.stringify(projectData(state,uploadedImages),null,2),fileBase()+'.json','application/json');toast('Projeto salvo com as artes de cada face.');});
$('#load-project').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    if(f.size>96*1024*1024)throw new Error('Arquivo de projeto muito grande.');
    const doc=parseProject(JSON.parse(await f.text())),next=doc.config,images={},decoded=new Map();
    for(const face of FACES){
      const raw=doc.images[face.id];if(!raw)continue;
      if(decoded.has(raw)){images[face.id]=decoded.get(raw);continue;}
      const source=await decodeImage(raw.sourceDataUrl||raw.dataUrl);
      const limit=raw.mode==='panorama'?4096:1800;
      if(source.naturalWidth>limit||source.naturalHeight>limit)throw new Error('Imagem de projeto acima do limite de resolução.');
      const asset={width:source.naturalWidth,height:source.naturalHeight,ratio:source.naturalWidth/source.naturalHeight,name:String(raw.name||'Minha arte').slice(0,160),sourceDataUrl:raw.sourceDataUrl||null,dataUrl:raw.dataUrl};
      if(raw.mode==='panorama')asset.mode='panorama';
      imageSources.set(asset,source);flattenImage(asset,source,resolveTheme(next).bg);images[face.id]=asset;decoded.set(raw,asset);
    }
    cancelImageUploads();clearTimeout(colorTimer);state=next;uploadedImages=images;renderTextControls();setForm();updateUpload();update();toast('Projeto aberto com as artes e os textos de cada face.');
  }catch(err){toast('Não foi possível abrir o projeto. '+err.message);}e.target.value='';
});

function assemblyGuide(){
  const b=model.internal?`${cm(model.internal.h)} × ${cm(model.internal.w)} × ${cm(model.internal.d)} cm`:'';
  const t=LIDS.find(l=>l.id===state.lid)?.name;
  const lidHelp=state.lid==='cap'?'Una as abas dos cantos da tampa por dentro. Se as laterais vierem em peças separadas, cole as abas superiores sob o topo e depois una os cantos. A tampa veste o corpo por fora.':state.lid==='handle'?'Dobre a aba de cobertura e embuta a aba curta por dentro da frente. Dobre as duas pontas da alça e passe-as pelos dois rasgos da tampa, deixando as pontas ancoradas por baixo. A alça é decorativa.':'Dobre as abas laterais menores, feche a aba de cobertura e embuta a aba curta por dentro da frente.';
  return `<div class="guide-meta"><strong>Sua caixa:</strong> ${htmlEscape(b)} de espaço interno<br><strong>Tampa:</strong> ${htmlEscape(t||'')} · <strong>Folhas:</strong> ${model.pages.length} A4</div><ol><li><strong>Prepare o papel.</strong> Imprima em A4 a 100%, em uma face. Use papel com rigidez adequada ao tamanho e peso da peça; 180 a 240 g/m² é um ponto de partida para protótipos pequenos. A espessura configurada ajusta as dimensões de dobra e a folga da tampa.</li><li><strong>Recorte e vinque.</strong> Linhas contínuas são cortes; tracejadas são vincos. Não corte as dobras. Se desligou os vincos no PDF, consulte a visualização com as linhas ativadas antes de montar.</li>${state.window?'<li><strong>Aplique os visores.</strong> Recorte as aberturas escolhidas. Corte o acrílico ou acetato nas medidas mostradas no painel, já com 5 mm extras em cada borda. Cole por dentro, mantendo as bordas longe das linhas de dobra. Prefira uma chapa fina compatível com o papel; a espessura do visor não é descontada do espaço interno.</li>':''}<li><strong>Una as faces.</strong> A sequência ao redor da caixa é frente → lateral direita → verso → lateral esquerda → frente. Cole a aba direita de cada face por dentro da próxima. Se houver uma tira de união separada, dobre-a ao meio e cole uma metade em cada face, por dentro.</li><li><strong>Una as abas separadas.</strong> Abas que precisaram sair em outra peça têm uma faixa branca de 1 cm. Cole essa faixa por dentro do corpo, alinhando a linha de vinco à borda superior ou inferior. A face maior do fundo, com um rasgo, pertence ao verso; a aba curta com lingueta pertence à frente. As abas trapezoidais menores são das laterais. Veja a identificação ao lado de cada folha na aba “Folhas A4”.</li><li><strong>Feche o fundo por encaixe.</strong> Dobre as duas abas laterais para dentro. Dobre a face maior do fundo, presa ao verso, sobre elas. Por último, dobre a aba curta da frente e empurre sua lingueta pelo rasgo do fundo. A trava fecha sem cola; as uniões laterais e as abas que saíram separadas usam cola.</li><li><strong>Finalize a tampa.</strong> ${lidHelp}</li></ol><p class="guide-notice">Faça uma montagem de teste antes da impressão final: papel, cola, visor e impressora alteram o ajuste físico. O molde mantém a escala real e nunca reduz uma face para fazê-la caber em A4.</p><h3>O que aparece na impressão?</h3><p>Somente a estampa, os textos que você escreveu, os contornos de corte e os vincos, quando ativados. Nomes de peças, medidas, instruções e numeração de folhas ficam apenas aqui no site. O tema digitado também não vira texto na embalagem.</p><h3>Seu projeto, com você</h3><p>As configurações são lembradas neste navegador. Para guardar também as quatro artes e os textos ou transferir para outro dispositivo, use “Salvar projeto” e conserve o arquivo JSON.</p>`;
}
$$('[data-help]').forEach(b=>b.addEventListener('click',()=>{$('#assembly-guide').innerHTML=assemblyGuide();$('#help-dialog').showModal();}));
$$('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>$('#help-dialog').close()));
$('#help-dialog').addEventListener('click',e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#artPromptStyle').innerHTML=ART_STYLES.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
renderTextControls();setForm();renderThemes();renderUploads();updateUpload();update();
initPricing({toast,downloadBytes,onBoxShown:renderBox});
