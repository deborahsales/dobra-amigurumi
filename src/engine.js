/* All manufacturing geometry is expressed in millimetres. No DOM dependencies. */
export const DEFAULTS = Object.freeze({ height: 19, width: 8, depth: 7, ease: 0.5, thickness: 0.3, margin: 6, theme: 'botanico', description: '', lid: 'tuck', color: '#697e63', folds: true, window: false, windows: ['front'], windowBorder: 1.2, ink: false });
export const THEMES = Object.freeze([
  { id: 'botanico', name: 'Jardim delicado', short: 'Jardim', bg: '#f5f1e5', ink: '#6c8267', accent: '#c99579', motif: 'flower', keywords: ['flor', 'jardim', 'botanic', 'planta', 'verde', 'natureza'] },
  { id: 'bosque', name: 'Amigos do bosque', short: 'Bosque', bg: '#f4eade', ink: '#8c735d', accent: '#b6b997', motif: 'bunny', keywords: ['coelh', 'pascoa', 'bosque', 'urso', 'floresta'] },
  { id: 'safari', name: 'Pequeno safari', short: 'Safari', bg: '#f8efd9', ink: '#af8451', accent: '#78906b', motif: 'lion', keywords: ['safari', 'leao', 'selva', 'girafa', 'animal'] },
  { id: 'ceu', name: 'Um céu de sonhos', short: 'Céu', bg: '#edf1f5', ink: '#7b8ea5', accent: '#d1b77f', motif: 'moon', keywords: ['ceu', 'lua', 'estrela', 'espaco', 'astronauta', 'sonho', 'nuvem'] },
  { id: 'oceano', name: 'Fundo do mar', short: 'Oceano', bg: '#eaf3ee', ink: '#598d88', accent: '#d6a083', motif: 'whale', keywords: ['mar', 'oceano', 'baleia', 'sereia', 'peixe', 'praia'] },
  { id: 'jesus', name: 'Fé e afeto', short: 'Fé e afeto', bg: '#f9f3e5', ink: '#aa9468', accent: '#a8b8a0', motif: 'faith', keywords: ['jesus', 'fe', 'batizado', 'batismo', 'anjo', 'santo', 'santa', 'religios', 'nossa senhora'] },
  { id: 'festa', name: 'Doce celebração', short: 'Festa', bg: '#f7eaf0', ink: '#b67e95', accent: '#d1b16e', motif: 'bow', keywords: ['princesa', 'laco', 'bailarina', 'festa', 'boneca', 'rosa', 'unicornio'] },
  { id: 'liso', name: 'Essencial', short: 'Liso', bg: '#eee7dc', ink: '#8a7c67', accent: '#c6ad91', motif: 'plain', keywords: ['liso', 'minimalista', 'neutro', 'sem estampa'] },
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
  const match = description ? THEMES.find(t=>t.keywords.some(k=>k.length<=3?new RegExp('(?:^|\\W)'+k+'(?:$|\\W)').test(description):description.includes(k))) : null;
  const theme = {...(match || explicit)};
  theme.ink = hexOK(config.color || '') ? config.color : theme.ink;
  if (config.ink) { theme.bg = '#ffffff'; theme.accent = mixColor(theme.ink, '#ffffff', .36); }
  theme.customMatched = Boolean(match);
  return theme;
}
export function validateConfig(input) {
  const c = {...DEFAULTS,...input};
  const errors = [];
  for (const [key, label] of [['height','altura'],['width','largura'],['depth','profundidade']]) {
    if (!Number.isFinite(Number(c[key])) || Number(c[key]) < 3 || Number(c[key]) > 60) errors.push(`A ${label} deve estar entre 3 e 60 cm.`);
    c[key] = Number(c[key]);
  }
  for (const [key, min, max, label] of [['ease',0,3,'folga'],['thickness',.1,1,'espessura'],['margin',3,15,'margem'],['windowBorder',.6,3,'moldura do visor']]) {
    if (!Number.isFinite(Number(c[key])) || Number(c[key]) < min || Number(c[key]) > max) errors.push(`A ${label} está fora do intervalo permitido.`);
    c[key] = Number(c[key]);
  }
  if (!LIDS.some(l=>l.id === c.lid)) errors.push('Escolha uma tampa válida.');
  c.description = String(c.description || '').slice(0,120);
  c.windows = Array.isArray(c.windows) ? [...new Set(c.windows.filter(x=>['front','right','back','left'].includes(x)))] : ['front'];
  return {config:c, errors};
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
  return [];
}
export function artNodes(w,h,config,face='front',image=null) {
  const t=resolveTheme(config), children=[rectangle(0,0,w,h,t.bg)];
  if(t.motif !== 'plain') {
    children.push(pth([['M',0,h*.81],['C',w*.3,h*.74,w*.66,h*.95,w,h*.83],['L',w,h],['L',0,h],['Z']],mixColor(t.ink,t.bg,.86)));
    for(let i=0;i<18;i++) {const x=((i*47+9)%97)/100*w, y=((i*31+11)%97)/100*h;children.push(ellipse(x,y,.35+(i%3)*.1,.35+(i%3)*.1,mixColor(t.ink,t.bg,.68)));}
    const s=Math.min(w*.66,h*.39), y=clamp(h*.32-s*.16,4,Math.max(4,h-s-4));
    const kind=(face==='right'||face==='left')?'leaf':t.motif;
    children.push(group(motifNodes(t,kind),matrix((w-s)/2,y,s/100)));
    const tiny=Math.min(w*.17,12);
    children.push(group(motifNodes(t,'leaf'),matrix(w*.08,h-tiny*1.9,tiny/100)));
    children.push(group(motifNodes(t,'leaf'),matrix(w*.79,h*.08,tiny/100)));
  }
  if(image && (face==='front'||face==='back')) {
    const iw=Math.min(w*.8,h*.55), ih=iw/image.ratio;
    const fit=Math.min(1,h*.55/ih);
    children.push({type:'image',x:(w-iw*fit)/2,y:(h-ih*fit)/2,w:iw*fit,h:ih*fit,image});
  }
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
    if(n.type==='image') return `<image href="${xmlEscape(n.image.dataUrl)}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" preserveAspectRatio="xMidYMid meet"/>`;
    return '';
  };
  const body=nodes.map(render).join('');return `<defs>${defs}</defs>${body}`;
}
export function pageSVG(page,config) {return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297" role="img" aria-label="Molde em folha A4">${nodesToSVG(pageNodes(page),{folds:config.folds})}</svg>`;}
export function faceSVG(w,h,config,face='front',image=null) {return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">${nodesToSVG([artNodes(w,h,config,face,image)])}</svg>`;}

/* Small vector PDF writer. Artwork, cuts and scores share one millimetre space.
 * PDF content contains no text operators, page labels or instructions. */
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
      if(n.clip)out.push(`${n.clip.x} ${n.clip.y} ${n.clip.w} ${n.clip.h} re W n`);
      out.push(renderPDFNodes(n.children,config,imageMap));
    } else if(n.type==='image') {
      // Image samples run top to bottom; cancel the page's y reflection.
      out.push(`${n.w} 0 0 ${-n.h} ${n.x} ${n.y+n.h} cm /${imageMap.get(n.image).name} Do`);
    } else {
      if(n.fill)out.push(`${pdfRGB(n.fill)} rg`);
      if(n.stroke)out.push(`${pdfRGB(n.stroke)} RG ${n.width||.2} w 1 J 1 j`);
      if(n.dash)out.push(`[${n.dash.join(' ')}] 0 d`);
      if(n.type==='rect')out.push(`${n.x} ${n.y} ${n.w} ${n.h} re`);
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
