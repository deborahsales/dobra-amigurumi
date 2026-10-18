import { FONT_LIBRARY } from './fonts.js';
/* All manufacturing geometry is expressed in millimetres. No DOM dependencies. */
export const DEFAULTS = Object.freeze({ height: 19, width: 8, depth: 7, ease: 0.5, thickness: 0.3, margin: 6, theme: 'botanico', description: '', lid: 'tuck', mainColor: '#f5f1e5', detailColor: '#6c8267', folds: true, window: false, windows: ['front'], windowBorder: 1.2, ink: false, textEnabled:false, texts:{front:'',back:'',left:'',right:''},textFont:'classic',textSize:16,textPosition:'bottom',artPromptStyle:'flat',panoramaCuts:null,imageTransforms:{} });
export const FACES = Object.freeze([{id:'front',name:'Frente'},{id:'back',name:'Verso'},{id:'left',name:'Lateral esquerda'},{id:'right',name:'Lateral direita'}]);
export const PANORAMA_ORDER = Object.freeze(['front','right','back','left']);
export const TEXT_FONTS = Object.freeze(FONT_LIBRARY.map(({id,name})=>({id,name})));
export const ART_STYLES = Object.freeze([
  {id:'flat',name:'Ilustração delicada',instruction:'Ilustração delicada, formas suaves, cores sólidas e acabamento limpo, como uma coleção de papelaria artesanal.'},
  {id:'watercolor',name:'Aquarela suave',instruction:'Aquarela suave com textura sutil de pintura, bordas delicadas e contornos legíveis na impressão.'},
  {id:'storybook',name:'Livro infantil',instruction:'Ilustração original de livro infantil, acolhedora, com traços expressivos e composição simples.'},
  {id:'toy',name:'Personagem 3D',instruction:'Ilustração 3D de personagem com aparência de brinquedo, formas arredondadas, luz suave e materiais foscos. Sem cenário ou base de apoio.'},
  {id:'line',name:'Traço minimalista',instruction:'Desenho minimalista com linhas limpas, traço contínuo legível e poucos detalhes, adequado para papelaria.'},
]);
export const THEMES = Object.freeze([
  { id: 'botanico', name: 'Jardim delicado', short: 'Jardim', bg: '#f5f1e5', ink: '#6c8267', accent: '#c99579', motif: 'flower', keywords: ['flor', 'jardim', 'botanic', 'planta', 'verde', 'natureza'] },
  { id: 'bosque', name: 'Amigos do bosque', short: 'Bosque', bg: '#f4eade', ink: '#8c735d', accent: '#b6b997', motif: 'bunny', keywords: ['coelh', 'pascoa', 'bosque', 'floresta'] },
  { id: 'safari', name: 'Pequeno safari', short: 'Safari', bg: '#f8efd9', ink: '#af8451', accent: '#78906b', motif: 'lion', keywords: ['safari', 'leao', 'selva', 'girafa', 'animal'] },
  { id: 'ceu', name: 'Um céu de sonhos', short: 'Céu', bg: '#edf1f5', ink: '#7b8ea5', accent: '#d1b77f', motif: 'moon', keywords: ['ceu', 'lua', 'estrela', 'sonho', 'nuvem'] },
  { id: 'oceano', name: 'Fundo do mar', short: 'Oceano', bg: '#eaf3ee', ink: '#598d88', accent: '#d6a083', motif: 'whale', keywords: ['mar', 'oceano', 'baleia', 'peixe', 'praia'] },
  { id: 'jesus', name: 'Fé e afeto', short: 'Fé e afeto', bg: '#f9f3e5', ink: '#aa9468', accent: '#a8b8a0', motif: 'faith', keywords: ['jesus', 'fe', 'batizado', 'batismo', 'anjo', 'santo', 'santa', 'religios', 'nossa senhora'] },
  { id: 'festa', name: 'Doce celebração', short: 'Festa', bg: '#f7eaf0', ink: '#b67e95', accent: '#d1b16e', motif: 'bow', keywords: ['princesa', 'laco', 'bailarina', 'festa', 'boneca', 'rosa'] },
  { id: 'liso', name: 'Essencial', short: 'Liso', bg: '#eee7dc', ink: '#8a7c67', accent: '#c6ad91', motif: 'plain', keywords: ['liso', 'minimalista', 'neutro', 'sem estampa'] },
  { id: 'ursinho', name: 'Abraço de ursinho', short: 'Ursinho', bg: '#f5eadd', ink: '#a47c5b', accent: '#d4b28d', motif: 'bear', keywords: ['urso', 'ursinh', 'teddy'] },
  { id: 'gatinho', name: 'Carinho de gatinho', short: 'Gatinho', bg: '#f6eee7', ink: '#9c7d73', accent: '#d7b2ad', motif: 'cat', keywords: ['gato', 'gatinh', 'felino'] },
  { id: 'cachorrinho', name: 'Meu melhor amigo', short: 'Cachorrinho', bg: '#f0eee1', ink: '#9c855b', accent: '#d2bd8c', motif: 'dog', keywords: ['cachorr', 'dog', 'cao', 'pet'] },
  { id: 'dinossauro', name: 'Pequeno dinossauro', short: 'Dinossauro', bg: '#eef1de', ink: '#7c925f', accent: '#b8bf83', motif: 'dinosaur', keywords: ['dino', 'jurass'] },
  { id: 'unicornio', name: 'Magia de unicórnio', short: 'Unicórnio', bg: '#f4eaf4', ink: '#ad87b6', accent: '#d3adc4', motif: 'unicorn', keywords: ['unicorn', 'magia', 'encantad'] },
  { id: 'borboletas', name: 'Jardim de borboletas', short: 'Borboletas', bg: '#f4edf5', ink: '#a385ac', accent: '#c9b1d1', motif: 'butterfly', keywords: ['borbolet'] },
  { id: 'abelhas', name: 'Doce como mel', short: 'Abelhinhas', bg: '#faf1d8', ink: '#af8d3e', accent: '#dbc875', motif: 'bee', keywords: ['abelh', 'mel', 'colmeia'] },
  { id: 'arcoiris', name: 'Depois da chuva', short: 'Arco-íris', bg: '#f8eee4', ink: '#bb8c7b', accent: '#d9b19b', motif: 'rainbow', keywords: ['arco-iris', 'arco iris', 'arcoiris', 'rainbow'] },
  { id: 'astronauta', name: 'Uma viagem às estrelas', short: 'Astronauta', bg: '#edf0f7', ink: '#7787af', accent: '#b2bddd', motif: 'astronaut', keywords: ['astronaut', 'espaco', 'espacial', 'foguete', 'planeta'] },
  { id: 'sereia', name: 'Encantos de sereia', short: 'Sereia', bg: '#e8f2ef', ink: '#6d9a9c', accent: '#b5d1c8', motif: 'mermaid', keywords: ['sereia', 'sereinh', 'concha'] },
  { id: 'natal', name: 'Um Natal de afeto', short: 'Natal', bg: '#f7efe2', ink: '#6f8864', accent: '#c39279', motif: 'christmas', keywords: ['natal', 'natalin', 'noel', 'rena'] },
  { id: 'fazendinha', name: 'Um dia na fazendinha', short: 'Fazendinha', bg: '#f4efd9', ink: '#8f9468', accent: '#c2c599', motif: 'cow', keywords: ['fazend', 'vaquinh', 'vaca', 'boi', 'bovino'] },
]);
export const LIDS = Object.freeze([{id:'tuck',name:'De embutir'}, {id:'cap',name:'Separada'}, {id:'handle',name:'Com alça'}]);
export const A4 = Object.freeze({ width: 210, height: 297 });
const round = n => Math.round(n * 1000) / 1000;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const hexOK = s => /^#[0-9a-f]{6}$/i.test(s);
const matrix = (x = 0, y = 0, sx = 1, sy = sx) => [sx, 0, 0, sy, x, y];
export function mixColor(hex, target = '#ffffff', ratio = .5) {
  const a = hex.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16));
  const b = target.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16));
  return '#' + a.map((v,i) => Math.round(v*(1-ratio)+b[i]*ratio).toString(16).padStart(2,'0')).join('');
}
export function resolveTheme(config) {
  const description = norm(config.description);
  const explicit = THEMES.find(t=>t.id === config.theme) || THEMES[0];
  const ranked = THEMES.flatMap(t=>t.keywords.filter(k=>k.length<=3?new RegExp('(?:^|\\W)'+k+'(?:$|\\W)').test(description):description.includes(k)).map(k=>({theme:t,length:k.length})));
  const match = description ? ranked.sort((a,b)=>b.length-a.length)[0]?.theme : null;
  const theme = {...(match || explicit)};
  theme.bg = hexOK(config.mainColor || '') ? config.mainColor : theme.bg;
  const details=config.detailColor ?? config.color;
  theme.ink = hexOK(details || '') ? details : theme.ink;
  // Accents follow the selected detail colour; tonal shades keep illustrations legible.
  theme.accent = mixColor(theme.ink,theme.bg,.38);
  if (config.ink) { theme.bg = '#ffffff'; theme.accent = mixColor(theme.ink, '#ffffff', .36); }
  theme.customMatched = Boolean(match);
  return theme;
}
export function normalizeConfig(input={}) {
  const preset=THEMES.find(t=>t.id===input.theme)||THEMES[0];
  const c={...DEFAULTS};
  for(const key of Object.keys(DEFAULTS))if(Object.hasOwn(input,key))c[key]=input[key];
  c.mainColor=input.mainColor??preset.bg;
  c.detailColor=input.detailColor??input.color??preset.ink;
  c.windows=Array.isArray(c.windows)?[...c.windows]:['front'];
  c.texts=Object.fromEntries(FACES.map(f=>[f.id,String(input.texts?.[f.id]||'').normalize('NFC').replace(/[\r\n\t]/g,' ').slice(0,80)]));
  c.panoramaCuts=Array.isArray(c.panoramaCuts)?[...c.panoramaCuts]:c.panoramaCuts;
  c.imageTransforms=Object.fromEntries(FACES.map(({id})=>{const t=input.imageTransforms?.[id]||{};return [id,{scale:t.scale??1,x:t.x??0,y:t.y??0,fit:t.fit??'original'}];}));
  return c;
}
export function projectData(config,images={}) {
  const artwork=[],references=new Map(),faces={};
  for(const {id}of FACES){const image=images[id];if(!image)continue;if(!references.has(image)){references.set(image,artwork.length);artwork.push(image);}faces[id]=references.get(image);}
  return {app:'dobra-atelie',version:3,config:normalizeConfig(config),artwork,faces};
}
export function parseProject(doc) {
  if(!doc||doc.app!=='dobra-atelie'||![1,2,3].includes(doc.version)||!doc.config||typeof doc.config!=='object')throw new Error('Este arquivo não é um projeto Dobra Ateliê.');
  const checked=validateConfig(normalizeConfig(doc.config));
  if(checked.errors.length)throw new Error(checked.errors.join(' '));
  let images=doc.version===1?(doc.image?{front:doc.image,back:doc.image}:{}):(doc.images||{});
  if(doc.version===3){
    if(!Array.isArray(doc.artwork)||doc.artwork.length>4||!doc.faces||typeof doc.faces!=='object'||Array.isArray(doc.faces))throw new Error('Artes do projeto inválidas.');
    images={};
    for(const [face,index]of Object.entries(doc.faces)){
      if(!FACES.some(f=>f.id===face)||!Number.isInteger(index)||index<0||index>=doc.artwork.length||!doc.artwork[index])throw new Error('Referência de imagem inválida.');
      images[face]=doc.artwork[index];
    }
  }
  if(typeof images!=='object'||Array.isArray(images)||Object.keys(images).some(k=>!FACES.some(f=>f.id===k)))throw new Error('Faces das imagens inválidas.');
  for(const image of Object.values(images)) {
    if(!image)continue;
    if(typeof image.dataUrl!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(image.dataUrl))throw new Error('Imagem do projeto inválida.');
    if(image.sourceDataUrl&&!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(image.sourceDataUrl))throw new Error('Imagem de origem inválida.');
    if(image.mode!==undefined&&image.mode!=='panorama')throw new Error('Modo de imagem inválido.');
    if(image.mode==='panorama'&&(!Number.isFinite(image.ratio)||image.ratio<=0))throw new Error('Proporção do panorama inválida.');
  }
  return {config:checked.config,images};
}
export function validateConfig(input) {
  const c = normalizeConfig(input);
  const errors = [];
  for (const [key, label] of [['height','altura'],['width','largura'],['depth','profundidade']]) {
    if (!Number.isFinite(Number(c[key])) || Number(c[key]) < 3 || Number(c[key]) > 60) errors.push(`A ${label} deve estar entre 3 e 60 cm.`);
    c[key] = Number(c[key]);
  }
  for (const [key, min, max, label] of [['ease',0,3,'folga'],['thickness',.1,1,'espessura'],['margin',3,15,'margem'],['windowBorder',.6,3,'moldura do visor'],['textSize',9,120,'tamanho da fonte']]) {
    if (!Number.isFinite(Number(c[key])) || Number(c[key]) < min || Number(c[key]) > max) errors.push(`A ${label} está fora do intervalo permitido.`);
    c[key] = Number(c[key]);
  }
  if (!LIDS.some(l=>l.id === c.lid)) errors.push('Escolha uma tampa válida.');
  if (!THEMES.some(t=>t.id===c.theme))errors.push('Escolha um tema válido.');
  if (!ART_STYLES.some(s=>s.id===c.artPromptStyle))errors.push('Escolha um estilo válido para o pedido de arte.');
  if (!hexOK(c.mainColor||'')||!hexOK(c.detailColor||''))errors.push('Escolha cores válidas para o fundo e os detalhes.');
  if(c.panoramaCuts!==null&&(!Array.isArray(c.panoramaCuts)||c.panoramaCuts.length!==3||[0,...c.panoramaCuts,1].some((v,i,a)=>!Number.isFinite(v)||(i&&v-a[i-1]<.01-1e-10))))errors.push('Os cortes do panorama devem ficar em ordem, com pelo menos 1% da imagem para cada face.');
  for(const face of FACES){
    const t=c.imageTransforms[face.id];
    for(const [key,min,max]of [['scale',.1,5],['x',-100,100],['y',-100,100]]){t[key]=Number(t[key]);if(!Number.isFinite(t[key])||t[key]<min||t[key]>max)errors.push(`Confira o tamanho e a posição da imagem de ${face.name.toLowerCase()}.`);}
    if(!['original','contain','cover'].includes(t.fit))errors.push('Escolha um ajuste válido para a imagem.');
  }
  const font=FONT_LIBRARY.find(f=>f.id===c.textFont);
  if(!font)errors.push('Escolha uma fonte válida.');
  if(!['top','center','bottom'].includes(c.textPosition))errors.push('Escolha uma posição válida para o texto.');
  if(c.textEnabled&&font){const unsupported=[...new Set(Object.values(c.texts).join(''))].filter(char=>!font.glyphs[char]);if(unsupported.length)errors.push(`A fonte não contém ${unsupported.map(x=>'“'+x+'”').join(', ')}. Use letras, números e símbolos simples.`);}
  c.description = String(c.description || '').slice(0,120);
  c.windows = Array.isArray(c.windows) ? [...new Set(c.windows.filter(x=>['front','right','back','left'].includes(x)))] : ['front'];
  return {config:c, errors};
}
export function panoramaLayout(input={}) {
  const {config:c,errors}=validateConfig({...input,textEnabled:false});
  if(errors.length)throw new Error('Confira as medidas e as opções da caixa antes de preparar o panorama.');
  const front=(c.width+c.ease)*10+c.thickness,side=(c.depth+c.ease)*10+c.thickness,height=(c.height+c.ease)*10+c.thickness;
  const width=2*(front+side),automatic=c.panoramaCuts===null;let x=0;
  const edges=automatic?null:[0,...c.panoramaCuts,1];
  const faces=PANORAMA_ORDER.map((id,i)=>{const w=['front','back'].includes(id)?front:side,face={id,name:FACES.find(f=>f.id===id).name,x,width:w,height,start:edges?edges[i]:x/width,end:edges?edges[i+1]:(x+w)/width};x+=w;return face;});
  return {width,height,ratio:width/height,faces,automatic,cuts:faces.slice(0,3).map(f=>f.end)};
}
export function movePanoramaCut(input,index,fraction) {
  if(!Number.isInteger(index)||index<0||index>2||!Number.isFinite(fraction))throw new Error('Corte do panorama inválido.');
  const cuts=[...panoramaLayout(input).cuts],min=index?cuts[index-1]+.01:.01,max=index<2?cuts[index+1]-.01:.99;
  cuts[index]=clamp(fraction,min,max);return cuts;
}
export function panoramaPlacement(layout,ratio,faceId=null) {
  if(!Number.isFinite(ratio)||ratio<=0)throw new Error('Proporção do panorama inválida.');
  const face=faceId===null?null:layout.faces.find(f=>f.id===faceId);
  if(faceId!==null&&!face)throw new Error('Face do panorama inválida.');
  // Keep every horizontal source pixel: only the vertical framing can change.
  const w=face&&layout.automatic===false?face.width/(face.end-face.start):layout.width,h=w/ratio;
  return {x:face?(layout.automatic===false?-face.start*w:-face.x):0,y:(layout.height-h)/2,w,h};
}
export function imagePlacement(w,h,config,face,image) {
  const t={scale:1,x:0,y:0,fit:'original',...config.imageTransforms?.[face]};
  const transform=r=>({x:w/2+(r.x-w/2)*t.scale+t.x*w/100,y:h/2+(r.y-h/2)*t.scale+t.y*h/100,w:r.w*t.scale,h:r.h*t.scale});
  let rect,clip;
  if(image.mode==='panorama'){
    const layout=panoramaLayout(config),section=layout.faces.find(f=>f.id===face),span=section.end-section.start;
    rect=panoramaPlacement(layout,image.ratio,face);
    if(t.fit!=='original'){
      const ratio=image.ratio*span,paneH=(t.fit==='cover'?Math.max:Math.min)(w/ratio,h),paneW=paneH*ratio;
      rect={x:(w-paneW)/2-section.start*paneW/span,y:(h-paneH)/2,w:paneW/span,h:paneH};
    }
    // Clip to this source strip before zooming or moving it, so neighbouring faces never leak in.
    clip=transform({x:rect.x+section.start*rect.w,y:rect.y,w:span*rect.w,h:rect.h});
  }else{
    const areaW=t.fit==='original'?Math.min(w*.8,h*.55):w,areaH=t.fit==='original'?h*.55:h;
    const ih=(t.fit==='cover'?Math.max:Math.min)(areaW/image.ratio,areaH),iw=ih*image.ratio;
    rect={x:(w-iw)/2,y:(h-ih)/2,w:iw,h:ih};
  }
  return {rect:transform(rect),clip};
}
export function buildArtPrompt(input={},target='all') {
  const {config:c,errors}=validateConfig({...input,textEnabled:false,mainColor:DEFAULTS.mainColor,detailColor:DEFAULTS.detailColor,ink:false});
  if(errors.length)throw new Error('Confira as medidas, as cores e as opções da caixa antes de preparar o pedido.');
  if(target!=='all'&&!FACES.some(f=>f.id===target))throw new Error('Escolha uma face válida.');
  const theme=resolveTheme(c),style=ART_STYLES.find(s=>s.id===c.artPromptStyle),layout=panoramaLayout({...c,panoramaCuts:null});
  const requested=c.description.trim()||theme.name,panoramic=target==='all';
  const format=n=>(Math.round(n*100)/100).toLocaleString('pt-BR',{maximumFractionDigits:2});
  const ratio=layout.ratio.toLocaleString('pt-BR',{maximumFractionDigits:6});
  const selected=panoramic?layout.faces:layout.faces.filter(f=>f.id===target);
  const plan=selected.map((face,i)=>{
    const w=face.width,h=face.height,hasWindow=c.window&&c.windows.includes(face.id);
    const visor=hasWindow?windowGeometry(w,h,c):null;
    if(hasWindow&&!visor)throw new Error('Confira a largura da moldura do visor antes de preparar o pedido de arte.');
    const position=panoramic?` Faixa horizontal de x=${format(face.x/10)} até x=${format((face.x+w)/10)} cm, equivalente a ${format(face.start*100)}% até ${format(face.end*100)}% da largura total.`:` A arte será centralizada numa área de até ${format(Math.min(w*.8,h*.55)/10)} × ${format(h*.55/10)} cm.`;
    const window=visor?` Esta face terá visor central de ${format(visor.w/10)} × ${format(visor.h/10)} cm, com moldura de ${format(c.windowBorder)} cm. A abertura recortará a imagem: concentre os detalhes dessa faixa na moldura e não coloque personagens ou elementos essenciais no centro. Não desenhe o visor nem seu contorno na arte.`:'';
    return `${i+1}. ${face.name.toUpperCase()}: ${format(w/10)} × ${format(h/10)} cm (largura × altura).${position}${window}`;
  });
  const scale=4096/Math.max(layout.width,layout.height);
  return [
    panoramic?'Crie uma única imagem panorâmica original com as quatro faces de uma caixa de amigurumi lado a lado, em uma única fileira, na ordem e nas larguras indicadas abaixo. Cada faixa terá sua própria composição; tudo deve estar dentro de um único arquivo.':'Crie uma ilustração original para decorar uma face de uma caixa de amigurumi.',
    `TEMA: ${requested}`,
    `ESTILO: ${style.instruction}`,
    'CORES E FUNDO: escolha livremente uma paleta harmoniosa e uma cor de fundo que combinem com o tema e o estilo. Crie a arte finalizada com seu próprio fundo e mantenha essa identidade visual em todas as faces.',
    ...(panoramic?[
      `TAMANHO TOTAL DA ARTE: ${format(layout.width/10)} × ${format(layout.height/10)} cm (largura total × altura). Proporção largura/altura: ${ratio}:1. Uma referência de resolução é ${Math.round(layout.width*scale)} × ${Math.round(layout.height*scale)} px. Preserve a proporção se usar outra resolução.`,
      'ORDEM DA ESQUERDA PARA A DIREITA: frente → lateral direita → verso → lateral esquerda. As faixas ocupam toda a altura. A largura total é a soma das quatro larguras, sem espaços, margens externas ou separadores. As medidas já incluem os ajustes da caixa; não acrescente folga.',
      'As faixas não são necessariamente iguais: respeite as larguras e posições de cada face. Faça um fundo visualmente contínuo e composições complementares. Mantenha personagens e detalhes importantes dentro da faixa correspondente, longe das transições. A borda direita do panorama encontrará a borda esquerda ao fechar a caixa.',
    ]:['Use uma composição centralizada, com os elementos inteiros e respiro transparente nas bordas. Preserve as proporções da área de aplicação.']),
    '\nMEDIDAS DE REFERÊNCIA — NÃO DESENHAR NA IMAGEM',
    ...plan,
    '\nARQUIVO A ENTREGAR',
    panoramic?'Somente um arquivo PNG, chamado panorama-caixa.png, com as quatro faces lado a lado. O site dividirá a imagem horizontalmente nas larguras indicadas e aplicará cada trecho na face correspondente, preenchendo a face inteira. Não repita uma mesma imagem inteira em cada face.':`Somente um arquivo PNG para a face ${selected[0].name.toLowerCase()}. Não inclua as outras faces nesta imagem.`,
    panoramic?'Preencha a área útil inteira do panorama; não adicione bordas, espaços entre faixas, linhas divisórias, rótulos ou guias. Não inclua tampa, fundo de encaixe nem abas de colagem.':'Prefira alta resolução, com pelo menos 1500 px no maior lado quando disponível. Não corte os personagens.',
    'Entregue somente a arte plana, sem caixa montada, simulação 3D de embalagem, molde, abas, linhas de corte, cotas, grades, colagem ou marcas de montagem.',
    'Não inclua letras, nomes, frases, números, logotipos nem marca-d’água. Os textos serão adicionados depois no próprio site, com a fonte escolhida.',
  ].join('\n\n');
}
export function windowGeometry(w,h,config) {
  const border=config.windowBorder*10;
  if(w-2*border<10||h-2*border<10)return null;
  return {x:border,y:border,w:w-2*border,h:h-2*border,acrylicW:w-2*border+10,acrylicH:h-2*border+10,overlap:5};
}
const pth = (commands, fill = null, stroke = null, width = .18, extra = {}) => ({type:'path',commands,fill,stroke,width,...extra});
const polygon = (points, fill = null, stroke = null, width = .18, extra = {}) => pth([['M',...points[0]],...points.slice(1).map(p=>['L',...p]),['Z']],fill,stroke,width,extra);
const rectangle = (x,y,w,h,fill,extra={}) => ({type:'rect',x,y,w,h,fill,...extra});
const ellipse = (x,y,rx,ry,fill,extra={}) => ({type:'ellipse',x,y,rx,ry,fill,...extra});
const group = (children,transform = [1,0,0,1,0,0],extra={}) => ({type:'group',children,transform,...extra});
const line = (x1,y1,x2,y2,fold=false) => pth([['M',x1,y1],['L',x2,y2]],null,fold?'#9a9a92':'#3a3d37',fold?.13:.2, {fold, dash:fold?[1.4,1.3]:null});

export function layoutText(w,h,config,face='front') {
  const content=String(config.texts?.[face]||'').trim();
  if(!config.textEnabled||!content)return null;
  const font=FONT_LIBRARY.find(f=>f.id===config.textFont)||FONT_LIBRARY[0];
  if([...content].some(char=>!font.glyphs[char]))return {error:'O texto contém caracteres indisponíveis na fonte.'};
  function measure(text){
    let pen=0,minX=0,maxX=0,ascent=.85,descent=.2;
    for(const char of text){
      const glyph=font.glyphs[char],b=glyph.bounds||[0,-200,glyph.advance,850],slants=[font.shear*b[1],font.shear*b[3]];
      minX=Math.min(minX,pen+b[0]+Math.min(...slants));maxX=Math.max(maxX,pen+b[2]+Math.max(...slants));
      ascent=Math.max(ascent,b[3]/1000);descent=Math.max(descent,-b[1]/1000);pen+=glyph.advance;maxX=Math.max(maxX,pen);
    }
    return {width:(maxX-minX)/1000,minX:minX/1000,advance:pen/1000,ascent,descent};
  }
  const metrics=measure(content),lineEm=Math.max(1.25,metrics.ascent+metrics.descent+.12),requested=config.textSize*25.4/72;
  const hasWindow=config.window&&config.windows.includes(face),padding=hasWindow?3:5,width=w-padding*2;
  const height=hasWindow?config.windowBorder*10-2:Math.min(h-6,Math.max(Math.min(26,h*.24),requested*lineEm));
  const position=hasWindow&&config.textPosition==='center'?'bottom':config.textPosition;
  const y=position==='top'?(hasWindow?1:3):position==='center'?(h-height)/2:h-height-(hasWindow?1:3),area={x:padding,y,w:width,h:height};
  const advance=text=>measure(text).advance;
  function wrap(size){
    const lines=[];let current='';const limit=width-size*.08;
    for(const word of content.replace(/\s+/g,' ').split(' ')){
      const candidate=current?current+' '+word:word;
      if(measure(candidate).width*size<=limit){current=candidate;continue;}
      if(current){lines.push(current);current='';}
      for(const char of word){if(current&&measure(current+char).width*size>limit){lines.push(current);current='';}current+=char;}
    }
    if(current)lines.push(current);return lines;
  }
  let size=requested,lines=wrap(size);
  while((lines.length*size*lineEm>height||lines.some(t=>measure(t).width*size>width))&&size>2.2){size=Math.max(2.2,size*.9);lines=wrap(size);}
  if(lines.length*size*lineEm>height+.001||lines.some(t=>measure(t).width*size>width+.001))return {error:'O texto não cabe na área disponível. Encurte a mensagem ou aumente a moldura do visor.'};
  return {font,area,size,lines,lineHeight:size*lineEm,advance,measure,ascent:metrics.ascent,descent:metrics.descent};
}
export function textNodes(w,h,config,face='front') {
  const layout=layoutText(w,h,config,face);if(!layout||layout.error)return [];
  const {font,area,size,lines,lineHeight,measure,ascent,descent}=layout,children=[],scale=size/1000,ink=resolveTheme(config).ink;
  const top=area.y+(area.h-lines.length*lineHeight)/2;
  lines.forEach((text,index)=>{
    const metrics=measure(text);let x=area.x+(area.w-metrics.width*size)/2-metrics.minX*size;
    const baseline=top+index*lineHeight+(lineHeight-(ascent+descent)*size)/2+ascent*size;
    for(const char of text){const glyph=font.glyphs[char];if(glyph.commands.length)children.push(group([pth(glyph.commands,ink,null,.18,{textGlyph:true})],[scale,0,font.shear*scale,-scale,x,baseline]));x+=glyph.advance*scale;}
  });
  return [group(children,[1,0,0,1,0,0],{clip:area,textContent:config.texts[face]})];
}
export function fontSampleSVG(id){
  const font=FONT_LIBRARY.find(f=>f.id===id)||FONT_LIBRARY[0],scale=.016;
  let x=(70-[...'Abc'].reduce((n,char)=>n+font.glyphs[char].advance,0)*scale)/2;
  const nodes=[...'Abc'].map(char=>{const glyph=font.glyphs[char],node=group([pth(glyph.commands,'#536943')],[scale,0,font.shear*scale,-scale,x,18]);x+=glyph.advance*scale;return node;});
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 23" aria-hidden="true">${nodesToSVG(nodes)}</svg>`;
}

function flowerMotif(t) {
  const n=[];
  for(let i=0;i<6;i++) {
    const a=Math.PI*i/3;
    n.push(ellipse(50+Math.cos(a)*13,35+Math.sin(a)*13,11,10,t.accent));
  }
  n.push(ellipse(50,35,8,8,mixColor(t.ink,'#ffffff',.3)),pth([['M',50,53],['C',46,64,53,80,48,94]],null,t.ink,2.5));
  n.push(pth([['M',49,72],['C',29,75,29,56,47,64],['Z']],t.ink));
  n.push(pth([['M',50,83],['C',68,84,76,64,53,74],['Z']],mixColor(t.ink,'#ffffff',.22)));
  return n;
}
function leafMotif(t) {
  return [pth([['M',25,90],['C',43,64,55,29,75,10]],null,t.ink,2),...Array.from({length:5},(_,i)=>{
    const y=26+i*12,x=67-i*8;
    return pth([['M',x,y],['C',x-26,y-10,x-26,y-25,x,y-6],['C',x+25,y-14,x+20,y+4,x,y],['Z']],mixColor(t.ink,'#ffffff',i%2?.15:.4));
  })];
}
function motifNodes(t, kind = t.motif) {
  const skin = '#ead7c0', light=mixColor(t.ink,'#ffffff',.68);
  if(kind==='flower') return flowerMotif(t);
  if(kind==='leaf') return leafMotif(t);
  if(kind==='bunny') return [ellipse(35,25,10,24,skin),ellipse(65,25,10,24,skin),ellipse(35,24,4,16,t.accent),ellipse(65,24,4,16,t.accent),ellipse(50,65,32,28,skin),ellipse(39,63,2,2,t.ink),ellipse(61,63,2,2,t.ink),ellipse(50,73,3,2,t.accent),pth([['M',43,78],['Q',50,83,57,78]],null,t.ink,1.5),ellipse(29,73,5,3,'#e4b9ac'),ellipse(71,73,5,3,'#e4b9ac')];
  if(kind==='lion') return [...Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return ellipse(50+29*Math.cos(a),50+29*Math.sin(a),16,16,t.ink);}),ellipse(50,50,29,29,'#e8c986'),ellipse(40,46,2.2,2.2,'#6d5841'),ellipse(60,46,2.2,2.2,'#6d5841'),ellipse(50,59,12,9,'#f5dfb4'),polygon([[46,56],[54,56],[50,61]],'#6d5841'),pth([['M',45,64],['Q',50,69,55,64]],null,'#6d5841',1.5)];
  if(kind==='moon') return [pth([['M',65,12],['C',13,12,8,83,60,91],['C',82,94,91,81,91,75],['C',47,88,27,39,65,12],['Z']],t.accent),polygon([[78,14],[82,24],[93,25],[84,33],[86,44],[77,38],[68,44],[70,33],[63,25],[74,24]],t.ink),ellipse(34,56,2,2,t.ink)];
  if(kind==='whale') return [pth([['M',15,57],['C',16,20,67,16,77,56],['C',83,59,88,47,96,48],['C',97,63,91,72,81,72],['C',66,95,16,92,15,57],['Z']],t.ink),pth([['M',19,65],['C',31,86,68,86,80,67],['C',61,77,32,76,19,65],['Z']],light),ellipse(33,52,2.8,2.8,'#334a48'),pth([['M',40,19],['Q',34,4,29,15],['M',41,17],['Q',47,1,52,12]],null,t.ink,2.5),ellipse(27,62,5,3,t.accent)];
  if(kind==='faith') return [rectangle(44,16,12,68,t.ink),rectangle(24,36,52,12,t.ink),...leafMotif({...t,ink:t.accent}).map(n=>n),ellipse(82,16,3,3,t.accent),ellipse(19,71,2.5,2.5,t.accent)];
  if(kind==='bow') return [pth([['M',48,48],['C',5,8,0,62,18,72],['C',27,74,37,61,48,55],['Z']],t.ink),pth([['M',52,48],['C',95,8,100,62,82,72],['C',73,74,63,61,52,55],['Z']],t.ink),polygon([[44,53],[26,91],[44,84],[49,94],[53,55]],t.accent),polygon([[51,54],[64,94],[70,82],[86,88],[57,52]],t.accent),ellipse(50,52,9,11,mixColor(t.ink,'#ffffff',.25))];
  if(kind==='bear') return [ellipse(26,25,15,15,t.ink),ellipse(74,25,15,15,t.ink),ellipse(26,25,8,8,t.accent),ellipse(74,25,8,8,t.accent),ellipse(50,55,35,34,t.ink),ellipse(50,69,19,14,light),ellipse(37,52,2.5,3,'#473e35'),ellipse(63,52,2.5,3,'#473e35'),ellipse(50,65,5,3,'#473e35'),pth([['M',50,67],['L',50,73],['M',43,73],['Q',50,79,57,73]],null,'#473e35',1.7)];
  if(kind==='cat') return [polygon([[19,42],[19,8],[41,28]],t.ink),polygon([[59,28],[81,8],[81,42]],t.ink),polygon([[24,33],[24,17],[35,29]],t.accent),polygon([[65,29],[76,17],[76,33]],t.accent),ellipse(50,57,35,30,light),ellipse(36,53,2.5,3,t.ink),ellipse(64,53,2.5,3,t.ink),polygon([[46,63],[54,63],[50,68]],t.ink),pth([['M',50,68],['Q',43,77,39,71],['M',50,68],['Q',57,77,61,71],['M',8,58],['L',30,63],['M',7,70],['L',30,69],['M',70,63],['L',92,58],['M',70,69],['L',93,70]],null,t.ink,1.5)];
  if(kind==='dog') return [ellipse(24,50,14,29,t.ink),ellipse(76,50,14,29,t.ink),ellipse(50,51,30,32,light),ellipse(63,46,11,15,t.accent),ellipse(38,48,2.7,3,'#493e33'),ellipse(63,48,2.7,3,'#493e33'),ellipse(50,63,6,4,'#493e33'),pth([['M',42,72],['Q',50,79,58,72]],null,'#493e33',1.7),pth([['M',47,76],['C',46,90,58,90,55,76],['Z']],t.accent)];
  if(kind==='dinosaur') return [polygon([[48,37],[49,24],[59,35],[64,22],[71,34],[80,27],[81,40],[91,40],[84,49]],t.accent),pth([['M',24,66],['C',9,67,5,53,8,43],['C',18,57,24,53,29,49],['L',37,34],['C',45,16,72,16,81,34],['C',88,47,76,52,65,47],['L',62,73],['L',72,88],['L',55,88],['L',48,77],['L',40,88],['L',24,88],['L',30,72],['Z']],t.ink),ellipse(40,63,13,16,light),ellipse(68,34,2.4,2.4,'#344a36'),pth([['M',71,43],['Q',76,46,81,42]],null,'#344a36',1.5),ellipse(31,56,3,4,t.accent)];
  if(kind==='unicorn') return [polygon([[46,30],[54,4],[61,33]],t.accent),polygon([[23,40],[24,15],[42,35]],light),polygon([[61,35],[79,15],[78,43]],light),pth([['M',25,43],['C',12,67,25,91,50,91],['C',78,91,89,68,75,40],['C',63,23,38,23,25,43],['Z']],light),pth([['M',23,42],['C',10,51,12,77,24,91],['C',32,77,29,60,35,52],['C',45,37,68,48,70,30],['C',51,22,32,25,23,42],['Z']],t.ink),pth([['M',35,63],['Q',41,69,47,63],['M',59,63],['Q',65,69,71,63]],null,t.ink,2),ellipse(54,78,14,8,t.accent),ellipse(49,77,1.5,2,t.ink),ellipse(60,77,1.5,2,t.ink)];
  if(kind==='butterfly') return [pth([['M',48,50],['C',7,-4,-1,38,17,55],['C',1,76,30,98,48,61],['Z']],t.ink),pth([['M',52,50],['C',93,-4,101,38,83,55],['C',99,76,70,98,52,61],['Z']],t.ink),ellipse(27,35,10,13,t.accent),ellipse(73,35,10,13,t.accent),ellipse(31,72,7,9,light),ellipse(69,72,7,9,light),ellipse(50,55,4,24,t.accent),pth([['M',48,32],['Q',36,12,33,22],['M',52,32],['Q',64,12,67,22]],null,t.ink,2)];
  if(kind==='bee') return [ellipse(34,29,17,20,light),ellipse(66,29,17,20,light),ellipse(50,59,33,26,t.accent),rectangle(32,35,9,48,t.ink),rectangle(52,34,9,50,t.ink),ellipse(73,57,17,20,t.accent),ellipse(79,52,2.5,2.5,'#544a34'),pth([['M',78,63],['Q',83,67,87,62],['M',68,38],['L',69,29],['M',76,39],['L',81,31]],null,t.ink,2),polygon([[17,55],[6,60],[18,65]],t.ink)];
  if(kind==='rainbow') return [pth([['M',13,77],['C',13,5,87,5,87,77]],null,t.ink,12),pth([['M',28,77],['C',28,27,72,27,72,77]],null,t.accent,10),pth([['M',41,77],['C',41,48,59,48,59,77]],null,light,8),ellipse(18,81,16,10,light),ellipse(83,81,16,10,light)];
  if(kind==='astronaut') return [rectangle(31,48,38,37,light),ellipse(50,30,28,27,light),ellipse(50,30,21,19,t.ink),pth([['M',36,24],['Q',42,14,53,17]],null,light,3),rectangle(40,55,20,13,t.accent),ellipse(46,61,2,2,t.ink),ellipse(55,61,2,2,t.ink),polygon([[30,53],[14,66],[21,75],[34,67]],light),polygon([[70,53],[86,65],[79,74],[66,67]],light),rectangle(31,79,15,15,t.ink),rectangle(54,79,15,15,t.ink)];
  if(kind==='mermaid') return [pth([['M',30,31],['C',20,1,76,0,73,37],['L',73,56],['L',28,56],['Z']],t.ink),ellipse(50,27,17,20,skin),pth([['M',30,20],['Q',47,-2,70,14],['Q',53,12,45,23],['Z']],t.ink),ellipse(44,27,1.7,1.7,t.ink),ellipse(57,27,1.7,1.7,t.ink),pth([['M',46,35],['Q',51,39,56,35]],null,t.ink,1.4),polygon([[38,46],[62,46],[60,62],[40,62]],skin),pth([['M',39,57],['L',62,57],['C',66,70,56,78,62,84],['C',80,67,92,83,82,95],['C',70,99,58,93,55,88],['C',26,83,31,70,39,57],['Z']],t.accent),pth([['M',40,61],['Q',51,68,62,61]],null,t.ink,1.5)];
  if(kind==='christmas') return [rectangle(43,76,14,18,t.ink),polygon([[50,9],[28,36],[38,36],[17,60],[31,60],[9,83],[91,83],[69,60],[83,60],[62,36],[72,36]],t.ink),polygon([[50,1],[54,10],[64,11],[57,18],[59,28],[50,23],[41,28],[43,18],[36,11],[46,10]],t.accent),ellipse(40,43,4,4,light),ellipse(60,57,4,4,t.accent),ellipse(34,71,4,4,t.accent),ellipse(70,73,4,4,light),pth([['M',32,46],['Q',48,54,68,46],['M',24,67],['Q',49,78,77,67]],null,light,2)];
  if(kind==='cow') return [polygon([[23,33],[18,8],[35,27]],t.accent),polygon([[65,27],[82,8],[77,33]],t.accent),ellipse(18,40,14,9,t.ink),ellipse(82,40,14,9,t.ink),ellipse(50,53,32,33,light),ellipse(33,39,11,14,t.ink),ellipse(37,48,2.2,2.2,'#3f4638'),ellipse(64,48,2.2,2.2,'#3f4638'),ellipse(50,71,25,15,t.accent),ellipse(40,70,3,4,t.ink),ellipse(60,70,3,4,t.ink),pth([['M',43,79],['Q',50,83,57,79]],null,t.ink,1.5)];
  return [];
}
export function artNodes(w,h,config,face='front',images=null) {
  const t=resolveTheme(config), children=[rectangle(0,0,w,h,t.bg)];
  const image=images?.dataUrl?(['front','back'].includes(face)?images:null):images?.[face];
  const panoramic=image?.mode==='panorama';
  if(t.motif !== 'plain'&&!panoramic) {
    children.push(pth([['M',0,h*.81],['C',w*.3,h*.74,w*.66,h*.95,w,h*.83],['L',w,h],['L',0,h],['Z']],mixColor(t.ink,t.bg,.86)));
    for(let i=0;i<18;i++) {const x=((i*47+9)%97)/100*w, y=((i*31+11)%97)/100*h;children.push(ellipse(x,y,.35+(i%3)*.1,.35+(i%3)*.1,mixColor(t.ink,t.bg,.68)));}
    const s=Math.min(w*.66,h*.39), y=clamp(h*.32-s*.16,4,Math.max(4,h-s-4));
    const kind=(face==='right'||face==='left')?'leaf':t.motif;
    children.push(group(motifNodes(t,kind),matrix((w-s)/2,y,s/100)));
    const tiny=Math.min(w*.17,12);
    const label=layoutText(w,h,config,face);
    if(!label||label.error||label.area.y<h/2)children.push(group(motifNodes(t,'leaf'),matrix(w*.08,h-tiny*1.9,tiny/100)));
    if(!label||label.error||label.area.y>h/3)children.push(group(motifNodes(t,'leaf'),matrix(w*.79,h*.08,tiny/100)));
  }
  if(image) {
    const placement=imagePlacement(w,h,config,face,image),node={type:'image',...placement.rect,image};
    if(placement.clip)children.push(group([node],[1,0,0,1,0,0],{clip:placement.clip}));
    else children.push(rectangle(placement.rect.x,placement.rect.y,placement.rect.w,placement.rect.h,t.bg),node);
  }
  children.push(...textNodes(w,h,config,face));
  return group(children,[1,0,0,1,0,0],{clip:{x:0,y:0,w,h}});
}

/* Piece scene graphs use the same geometry in SVG preview and vector PDF. */
function makePiece(id,name,w,h,nodes,faces=[],joins=[]) {return {id,name,w:round(w),h:round(h),nodes,faces,joins};}
function tabRight(x,y,length,g) {return polygon([[x,y],[x+g,y+3],[x+g,y+length-3],[x,y+length]],'#ffffff');}
function horizontalTab(w,g) {return polygon([[0,g],[3,0],[w-3,0],[w,g]],'#ffffff');}
const fitsA4=(w,h,m)=> (w<=210-2*m+1e-5&&h<=297-2*m+1e-5)||(h<=210-2*m+1e-5&&w<=297-2*m+1e-5);
function boundary(nodes,points) {nodes.push(polygon(points,null,'#3a3d37',.2));}

function bottomFlaps(W,D) {
  const tongue=clamp(W*.25,10,24), lockDepth=12, tabLength=7, inset=.7;
  return {
    front:{length:lockDepth+tabLength, points:[[inset,0],[W-inset,0],[W-2,lockDepth],[W/2+tongue/2-1,lockDepth],[W/2+tongue/2+1,lockDepth+3],[W/2+tongue/2-1,lockDepth+tabLength],[W/2-tongue/2+1,lockDepth+tabLength],[W/2-tongue/2-1,lockDepth+3],[W/2-tongue/2+1,lockDepth],[2,lockDepth]], cuts:[],folds:[[W/2-tongue/2+1,lockDepth,W/2+tongue/2-1,lockDepth]]},
    back:{length:D-.4, points:[[inset,0],[W-inset,0],[W-1.5,D-.4],[1.5,D-.4]], cuts:[[W/2-tongue/2-.5,D-lockDepth,W/2+tongue/2+.5,D-lockDepth]],folds:[]},
    right:{length:Math.min(W*.46,D*.75),points:null,cuts:[],folds:[]},
    left:{length:Math.min(W*.46,D*.75),points:null,cuts:[],folds:[]},
  };
}
function flapShape(fl,w) {return fl.points || [[.7,0],[w-.7,0],[w-3,fl.length],[3,fl.length]];}
function flapNodes(fl,w) {return [polygon(flapShape(fl,w),'#ffffff'),...fl.cuts.map(a=>line(...a)),...fl.folds.map(a=>line(...a,true))];}

export function createModel(input={},image=null) {
  const {config:c,errors}=validateConfig(input);
  if(errors.length) return {config:c,errors,pieces:[],pages:[]};
  const internal={w:(c.width+c.ease)*10,d:(c.depth+c.ease)*10,h:(c.height+c.ease)*10};
  const W=internal.w+c.thickness,D=internal.d+c.thickness,H=internal.h+c.thickness,g=10;
  const pieces=[], notices=[], m=c.margin;
  const floor=bottomFlaps(W,D);
  const sideDust=Math.min(W*.45,D*.5);
  const tops=c.lid==='cap'?{}:{back:{length:D+14,type:'lid'},right:{length:sideDust,type:'dust'},left:{length:sideDust,type:'dust'}};
  const faceDefs=[['front','Frente',W],['right','Lateral direita',D],['back','Verso',W],['left','Lateral esquerda',D]];
  for(const [id,label,width] of faceDefs) {
    if(!fitsA4(width,H,m)) errors.push(`${label}: a face de ${(width/10).toFixed(1).replace('.',',')} × ${(H/10).toFixed(1).replace('.',',')} cm não cabe inteira em A4. Reduza as medidas ou a folga.`);
    if(c.window&&c.windows.includes(id)&&!windowGeometry(width,H,c)) errors.push(`${label}: a moldura é grande demais para o visor. Diminua a moldura ou aumente essa face.`);
    const text=layoutText(width,H,c,id);if(text?.error)errors.push(`${label}: ${text.error}`);
  }
  if(!fitsA4(W,D-.4,m)) errors.push('A face do fundo não cabe inteira em A4. Reduza a largura ou a profundidade.');
  if(errors.length) return {config:c,internal,W,D,H,errors,pieces:[],pages:[]};

  function topNodes(spec,width) {
    const n=[];
    if(spec.type==='lid') {
      n.push(artNodes(width,D,c,'lid'));
      const pts=[[0,0],[width,0],[width,D],[width-2,D],[width-4,D+14],[4,D+14],[2,D],[0,D]];
      // Local top flap points down; artwork is rotated with the flap on the back face.
      n.push(polygon([[2,D],[width-2,D],[width-4,D+14],[4,D+14]],'#ffffff'));
      n.push(pth([['M',...pts[1]],...pts.slice(2).map(p=>['L',...p]),['L',...pts[0]]],null,'#3a3d37',.2));n.push(line(0,D,width,D,true));
      if(c.lid==='handle') {
        const span=Math.min(D*.55,42), cx=width/2,cy=D/2;
        n.push(line(cx-6.3,cy-span/2,cx+6.3,cy-span/2),line(cx-6.3,cy+span/2,cx+6.3,cy+span/2));
      }
    } else {const pts=[[.7,0],[width-.7,0],[width-3,spec.length],[3,spec.length]];n.push(polygon(pts,'#ffffff'));n.push(pth([['M',width,0],['L',...pts[1]],...pts.slice(2).map(p=>['L',...p]),['L',...pts[0]],['L',0,0]],null,'#3a3d37',.2));}
    return n;
  }

  for(const [id,label,width] of faceDefs) {
    const bot=floor[id],top=tops[id];
    let tab=g, detachTab=false;
    if(!fitsA4(width+tab,H,m)) {tab=0;detachTab=true;}
    let ib=true,it=!!top;
    const variants=[[true,!!top],[true,false],[false,!!top],[false,false]];
    const choice=variants.find(([b,t])=>fitsA4(width+tab,H+(b?bot.length:0)+(t?top?.length||0:0),m));
    [ib,it]=choice || [false,false];
    const topH=it?top.length:0, bh=ib?bot.length:0;
    const n=[], outline=[[0,topH],[width,topH],[width+tab,topH+3],[width+tab,topH+H-3],[width,topH+H],[0,topH+H]];
    // Body exterior, joined on its right edge; faces themselves are never tiled.
    if(tab) {n.push(group([tabRight(width,0,H,tab)],matrix(0,topH)));n.push(line(width,topH,width,topH+H,true));}
    n.push(group([artNodes(width,H,c,id,image)],matrix(0,topH)));
    n.push(line(0,topH,0,topH+H));
    if(tab) {n.push(line(width,topH,width+tab,topH+3),line(width+tab,topH+3,width+tab,topH+H-3),line(width+tab,topH+H-3,width,topH+H));}
    else n.push(line(width,topH,width,topH+H));
    if(ib) {
      n.push(group(flapNodes(bot,width),matrix(0,topH+H)));
      const pts=flapShape(bot,width);
      n.push(group([pth([['M',0,0],['L',...pts[0]],...pts.slice(1).reverse().map(p=>['L',...p]),['L',width,0]],null,'#3a3d37',.2)],matrix(0,topH+H)));
      n.push(line(0,topH+H,width,topH+H,true));
    } else {
      n.push(line(0,topH+H,width,topH+H));
      const sn=[horizontalTab(width,g),...flapNodes(bot,width).map(a=>group([a],matrix(0,g)))];
      boundary(sn,[[0,g],[3,0],[width-3,0],[width,g],...flapShape(bot,width).slice(1).map(([x,y])=>[x,g+y]),[0,g]]);
      sn.push(line(0,g,width,g,true));
      // Attachment strip belongs to the inside, at the lower edge of the body.
      pieces.push(makePiece(`base-${id}`,id==='back'?'Fundo com rasgo':id==='front'?'Trava do fundo':`Aba de fundo · ${label.toLowerCase()}`,width,g+bot.length,sn,[],[{edge:`${id}-bottom`,kind:'glue'}]));
      notices.push('Algumas abas são separadas na dobra para manter as faces inteiras.');
    }
    if(it) {
      n.push(group(topNodes(top,width),[1,0,0,-1,0,topH]));
      n.push(line(0,topH,width,topH,true));
    } else {
      n.push(line(0,topH,width,topH));
      if(top) {
        const tn=[horizontalTab(width,g),group(topNodes(top,width),matrix(0,g)),line(0,g,width,g,true)];
        tn.push(pth([['M',0,g],['L',3,0],['L',width-3,0],['L',width,g]],null,'#3a3d37',.2));
        pieces.push(makePiece(`top-${id}`,top.type==='lid'?'Tampa de embutir':`Aba superior · ${label.toLowerCase()}`,width,g+top.length,tn,top.type==='lid'?[{id:'lid',w:W,h:D}]:[],[{edge:`${id}-top`,kind:'glue'}]));
        notices.push('Algumas abas são separadas na dobra para manter as faces inteiras.');
      }
    }
    if(c.window&&c.windows.includes(id)) {
      const v=windowGeometry(width,H,c);
      n.push(rectangle(v.x,topH+v.y,v.w,v.h,'#ffffff',{stroke:'#3a3d37',width:.2,windowCut:true}));
    }
    pieces.push(makePiece(id,label,width+tab,topH+H+bh,n,[{id,w:width,h:H,x:0,y:topH}],[{edge:`${id}-right`,kind:'glue',strip:detachTab}]));
    if(detachTab) {
      const stripW=Math.min(g,H*.15);
      const jn=[polygon([[0,0],[2*g,0],[2*g,H],[0,H]],'#ffffff','#3a3d37',.2),line(g,0,g,H,true)];
      pieces.push(makePiece(`join-${id}`,`União · ${label.toLowerCase()}`,g*2,H,jn));
    }
  }

  if(c.lid==='cap') {
    const clearance=1.2+c.thickness*2,LW=W+clearance,LD=D+clearance,skirt=24;
    const fullW=LW+2*skirt,fullH=LD+2*skirt;
    if(fitsA4(fullW,fullH,m)) {
      const cn=[group([artNodes(LW,LD,c,'lid')],matrix(skirt,skirt))];
      const pts=[[skirt,0],[skirt+LW,0],[skirt+LW+g,3],[skirt+LW+g,skirt-3],[skirt+LW,skirt],[fullW,skirt],[fullW,skirt+LD],[skirt+LW,skirt+LD],[skirt+LW+g,skirt+LD+3],[skirt+LW+g,fullH-3],[skirt+LW,fullH],[skirt,fullH],[skirt-g,fullH-3],[skirt-g,skirt+LD+3],[skirt,skirt+LD],[0,skirt+LD],[0,skirt],[skirt,skirt],[skirt-g,skirt-3],[skirt-g,3]];
      cn.unshift(polygon(pts,resolveTheme(c).bg));
      boundary(cn,pts);
      cn.push(line(skirt,skirt,skirt+LW,skirt,true),line(skirt,skirt+LD,skirt+LW,skirt+LD,true),line(skirt,0,skirt,fullH,true),line(skirt+LW,0,skirt+LW,fullH,true));
      pieces.push(makePiece('cap','Tampa separada',fullW,fullH,cn,[{id:'lid',w:LW,h:LD,x:skirt,y:skirt}]));
    } else {
      pieces.push(makePiece('cap-top','Topo da tampa',LW,LD,[artNodes(LW,LD,c,'lid'),rectangle(0,0,LW,LD,null,{stroke:'#3a3d37',width:.2})],[{id:'lid',w:LW,h:LD}]));
      for(const [i,width] of [LW,LD,LW,LD].entries()) {
        const nn=[rectangle(0,g,width,skirt,resolveTheme(c).bg),polygon([[0,g],[3,0],[width-3,0],[width,g]],'#ffffff'),tabRight(width,g,skirt,g)];
        boundary(nn,[[0,g],[3,0],[width-3,0],[width,g],[width+g,g+3],[width+g,g+skirt-3],[width,g+skirt],[0,g+skirt]]);
        nn.push(line(0,g,width,g,true),line(width,g,width,g+skirt,true));
        pieces.push(makePiece(`cap-side-${i}`,`Lateral da tampa ${i+1}`,width+g,g+skirt,nn));
      }
      notices.push('A tampa separada é unida pelas bordas: topo inteiro e laterais com abas internas.');
    }
  }
  if(c.lid==='handle') {
    const span=Math.min(D*.55,42), length=span+26, hw=12;
    const hn=[polygon([[0,4],[2,0],[hw-2,0],[hw,4],[hw-2,8],[hw-2,length-8],[hw,length-4],[hw-2,length],[2,length],[0,length-4],[2,length-8],[2,8]],resolveTheme(c).bg,'#3a3d37',.2),line(2,8,hw-2,8,true),line(2,length-8,hw-2,length-8,true)];
    pieces.push(makePiece('handle','Alça com linguetas',hw,length,hn));
  }
  for(const piece of pieces) if(!fitsA4(piece.w,piece.h,m)) errors.push(`${piece.name} não cabe inteira em uma folha A4 com essa margem. Reduza as medidas ou escolha outra tampa.`);
  const pages=errors.length?[]:packPieces(pieces,m);
  return {config:c,internal,W,D,H,pieces,pages,errors,notices:[...new Set(notices)],theme:resolveTheme(c)};
}

/* MaxRects packing: rotations are rigid 90 degrees, never scaling or face tiling. */
export function packPieces(pieces, margin=6) {
  const PW=210-2*margin,PH=297-2*margin,gap=3;
  const pages=[];
  for(const piece of [...pieces].sort((a,b)=>b.w*b.h-a.w*a.h)) {
    let best=null;
    for(let pi=0;pi<=pages.length;pi++) {
      const free=pi===pages.length?[{x:0,y:0,w:PW+gap,h:PH+gap}]:pages[pi].free;
      for(let fi=0;fi<free.length;fi++) for(const rotated of [false,true]) {
        const w=(rotated?piece.h:piece.w)+gap,h=(rotated?piece.w:piece.h)+gap,r=free[fi];
        if(w<=r.w+1e-5&&h<=r.h+1e-5) {
          const score=pi*1e8+Math.min(r.w-w,r.h-h)*1000+(r.w*r.h-w*h);
          if(!best||score<best.score) best={pi,fi,rotated,w,h,x:r.x,y:r.y,score};
        }
      }
      if(best) break;
    }
    if(!best) throw new Error(`Peça fora da área A4: ${piece.id}`);
    if(best.pi===pages.length) pages.push({placements:[],free:[{x:0,y:0,w:PW+gap,h:PH+gap}]});
    const page=pages[best.pi],used={x:best.x,y:best.y,w:best.w,h:best.h},next=[];
    for(const r of page.free) {
      if(used.x>=r.x+r.w||used.x+used.w<=r.x||used.y>=r.y+r.h||used.y+used.h<=r.y) {next.push(r);continue;}
      if(used.x>r.x) next.push({x:r.x,y:r.y,w:used.x-r.x,h:r.h});
      if(used.x+used.w<r.x+r.w) next.push({x:used.x+used.w,y:r.y,w:r.x+r.w-used.x-used.w,h:r.h});
      if(used.y>r.y) next.push({x:r.x,y:r.y,w:r.w,h:used.y-r.y});
      if(used.y+used.h<r.y+r.h) next.push({x:r.x,y:used.y+used.h,w:r.w,h:r.y+r.h-used.y-used.h});
    }
    page.free=next.filter((r,i)=>r.w>.1&&r.h>.1&&!next.some((s,j)=>i!==j&&r.x>=s.x&&r.y>=s.y&&r.x+r.w<=s.x+s.w&&r.y+r.h<=s.y+s.h&&(j<i||r.w*r.h<s.w*s.h)));
    page.placements.push({piece,x:round(margin+best.x),y:round(margin+best.y),rotated:best.rotated,w:round(best.w-gap),h:round(best.h-gap)});
  }
  return pages.map(({placements})=>({placements}));
}
export function placementMatrix(p) {return p.rotated?[0,1,-1,0,p.x+p.piece.h,p.y]:[1,0,0,1,p.x,p.y];}
export function pageNodes(page) {return page.placements.map(p=>group(p.piece.nodes,placementMatrix(p)));}

let svgCounter=0;
const xmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function pathString(commands) {return commands.map(a=>a[0]+a.slice(1).map(round).join(' ')).join(' ');}
export function nodesToSVG(nodes,options={}) {
  let defs='';const render=n=> {
    if(n.fold&&options.folds===false)return '';
    const fill=n.fill?`fill="${n.fill}"`:'fill="none"',stroke=n.stroke?` stroke="${n.stroke}" stroke-width="${n.width||.2}" stroke-linecap="round" stroke-linejoin="round"${n.dash?` stroke-dasharray="${n.dash.join(' ')}"`:''}`:'';
    if(n.type==='group') {
      let clip='';if(n.clip) {const id=`dobra-clip-${++svgCounter}`;defs+=`<clipPath id="${id}"><rect x="${n.clip.x}" y="${n.clip.y}" width="${n.clip.w}" height="${n.clip.h}"/></clipPath>`;clip=` clip-path="url(#${id})"`;}
      return `<g transform="matrix(${n.transform.join(' ')})"${clip}>${n.children.map(render).join('')}</g>`;
    }
    if(n.type==='rect')return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" ${fill}${stroke}/>`;
    if(n.type==='ellipse')return `<ellipse cx="${n.x}" cy="${n.y}" rx="${n.rx}" ry="${n.ry}" ${fill}${stroke}/>`;
    if(n.type==='path')return `<path d="${pathString(n.commands)}" ${fill}${stroke}/>`;
    if(n.type==='image') return `<image href="${xmlEscape(n.image.sourceDataUrl||n.image.dataUrl)}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" preserveAspectRatio="xMidYMid meet"/>`;
    return '';
  };
  const body=nodes.map(render).join('');return `<defs>${defs}</defs>${body}`;
}
export function pageSVG(page,config) {return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297" role="img" aria-label="Molde em folha A4">${nodesToSVG(pageNodes(page),{folds:config.folds})}</svg>`;}
export function faceSVG(w,h,config,face='front',image=null) {return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">${nodesToSVG([artNodes(w,h,config,face,image)])}</svg>`;}

/* Small vector PDF writer. Artwork, cuts and scores share one millimetre space.
 * User lettering is outlined; page labels and assembly instructions are omitted. */
const PDF_MM=72/25.4;
function pdfRGB(hex) {return hex.match(/[0-9a-f]{2}/gi).map(v=>(parseInt(v,16)/255).toFixed(4)).join(' ');}
function pdfPath(cmds) {
  let x=0,y=0,startX=0,startY=0;const out=[];
  for(const a of cmds) {
    if(a[0]==='M') {x=a[1];y=a[2];startX=x;startY=y;out.push(`${round(x)} ${round(y)} m`);}
    if(a[0]==='L') {x=a[1];y=a[2];out.push(`${round(x)} ${round(y)} l`);}
    if(a[0]==='C') {x=a[5];y=a[6];out.push(`${a.slice(1).map(round).join(' ')} c`);}
    if(a[0]==='Q') {const c1x=x+2/3*(a[1]-x),c1y=y+2/3*(a[2]-y),c2x=a[3]+2/3*(a[1]-a[3]),c2y=a[4]+2/3*(a[2]-a[4]);x=a[3];y=a[4];out.push(`${[c1x,c1y,c2x,c2y,x,y].map(round).join(' ')} c`);}
    if(a[0]==='Z') {x=startX;y=startY;out.push('h');}
  }return out.join('\n');
}
function ellipsePDF(n) {
  const k=.5522847498,{x,y,rx,ry}=n;
  return pdfPath([['M',x+rx,y],['C',x+rx,y+k*ry,x+k*rx,y+ry,x,y+ry],['C',x-k*rx,y+ry,x-rx,y+k*ry,x-rx,y],['C',x-rx,y-k*ry,x-k*rx,y-ry,x,y-ry],['C',x+k*rx,y-ry,x+rx,y-k*ry,x+rx,y],['Z']]);
}
function renderPDFNodes(nodes,config,imageMap) {
  const out=[];
  for(const n of nodes) {
    if(n.fold&&!config.folds)continue;
    out.push('q');
    if(n.type==='group') {
      out.push(`${n.transform.map(round).join(' ')} cm`);
      if(n.clip)out.push(`${[n.clip.x,n.clip.y,n.clip.w,n.clip.h].map(round).join(' ')} re W n`);
      out.push(renderPDFNodes(n.children,config,imageMap));
    } else if(n.type==='image') {
      // Image samples run top to bottom; cancel the page's y reflection.
      out.push(`${[n.w,0,0,-n.h,n.x,n.y+n.h].map(round).join(' ')} cm /${imageMap.get(n.image).name} Do`);
    } else {
      if(n.fill)out.push(`${pdfRGB(n.fill)} rg`);
      if(n.stroke)out.push(`${pdfRGB(n.stroke)} RG ${n.width||.2} w 1 J 1 j`);
      if(n.dash)out.push(`[${n.dash.join(' ')}] 0 d`);
      if(n.type==='rect')out.push(`${[n.x,n.y,n.w,n.h].map(round).join(' ')} re`);
      if(n.type==='ellipse')out.push(ellipsePDF(n));
      if(n.type==='path')out.push(pdfPath(n.commands));
      out.push(n.fill&&n.stroke?'B':n.fill?'f':n.stroke?'S':'n');
    }
    out.push('Q');
  }return out.join('\n');
}
function collectImages(nodes,map) {for(const n of nodes){if(n.type==='image'&&!map.has(n.image))map.set(n.image,{name:`Im${map.size+1}`});if(n.children)collectImages(n.children,map);}}
function bytesConcat(parts) {const n=parts.reduce((s,p)=>s+p.length,0),out=new Uint8Array(n);let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;}
export function createPDF(model) {
  if(model.errors.length||!model.pages.length)throw new Error(model.errors.join(' ')||'Não há páginas para exportar.');
  const encoder=new TextEncoder(),enc=s=>encoder.encode(s),objects=[null,null],images=new Map();
  const add=o=>{objects.push(o);return objects.length;};
  const pageScenes=model.pages.map(pageNodes);pageScenes.forEach(n=>collectImages(n,images));
  for(const [img,entry] of images) {
    const base64=img.dataUrl.split(',')[1];
    const jpeg=typeof atob==='function'?Uint8Array.from(atob(base64),c=>c.charCodeAt(0)):Uint8Array.from(Buffer.from(base64,'base64'));
    entry.id=add(bytesConcat([enc(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),jpeg,enc('\nendstream')]));
  }
  const pageIds=[];
  for(const nodes of pageScenes) {
    const content=`q\n${PDF_MM} 0 0 ${-PDF_MM} 0 ${297*PDF_MM} cm\n${renderPDFNodes(nodes,model.config,images)}\nQ\n`;
    const data=enc(content),streamId=add(bytesConcat([enc(`<< /Length ${data.length} >>\nstream\n`),data,enc('endstream')]));
    const resources=[...images.values()].map(i=>`/${i.name} ${i.id} 0 R`).join(' ');
    const pageId=add(enc(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${210*PDF_MM} ${297*PDF_MM}] /Resources << /XObject << ${resources} >> >> /Contents ${streamId} 0 R >>`));
    pageIds.push(pageId);
  }
  objects[0]=enc('<< /Type /Catalog /Pages 2 0 R /ViewerPreferences << /PrintScaling /None >> >>');
  objects[1]=enc(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(i=>`${i} 0 R`).join(' ')}] >>`);
  const parts=[enc('%PDF-1.4\n% Dobra Atelie\n')],offsets=[0];let offset=parts[0].length;
  for(let i=0;i<objects.length;i++) {offsets.push(offset);const bytes=bytesConcat([enc(`${i+1} 0 obj\n`),objects[i],enc('\nendobj\n')]);parts.push(bytes);offset+=bytes.length;}
  const xref=offset;
  parts.push(enc(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
  return bytesConcat(parts);
}
