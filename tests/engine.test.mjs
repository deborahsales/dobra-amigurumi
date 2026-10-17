import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createModel, createPDF, DEFAULTS, LIDS, THEMES, FACES, TEXT_FONTS, ART_STYLES, buildArtPrompt, layoutText, normalizeConfig, projectData, parseProject, pageSVG, windowGeometry, placementMatrix, resolveTheme } from '../src/engine.js';

const epsilon=.006;
const overlaps=(a,b)=>a.x<b.x+b.w-epsilon&&a.x+a.w>b.x+epsilon&&a.y<b.y+b.h-epsilon&&a.y+a.h>b.y+epsilon;
function verifyPacking(model){
  assert.deepEqual(model.errors,[]);
  const seen=new Set();
  for(const page of model.pages){
    for(const p of page.placements){
      assert.ok(!seen.has(p.piece.id),`duplicate ${p.piece.id}`);seen.add(p.piece.id);
      assert.ok(p.x>=model.config.margin-epsilon&&p.y>=model.config.margin-epsilon);
      assert.ok(p.x+p.w<=210-model.config.margin+epsilon,`${p.piece.name} exceeds A4 width`);
      assert.ok(p.y+p.h<=297-model.config.margin+epsilon,`${p.piece.name} exceeds A4 height`);
      for(const other of page.placements)if(p!==other)assert.ok(!overlaps(p,other),`overlap: ${p.piece.id} / ${other.piece.id}`);
      const [a,b,c,d]=placementMatrix(p);assert.ok(Math.abs(a*d-b*c-1)<epsilon,'Rigid transformation only; no resizing');
    }
  }
  assert.equal(seen.size,model.pieces.length);
  const faces=model.pieces.flatMap(p=>p.faces).filter(f=>['front','back','left','right'].includes(f.id));
  assert.deepEqual(faces.map(f=>f.id).sort(),['back','front','left','right']);
  for(const f of faces){assert.equal(f.h,model.H);assert.equal(f.w,['front','back'].includes(f.id)?model.W:model.D);}
}
test('default 19 × 8 × 7 cm: true-sized, entire faces, unique pieces within A4',()=>{
  const model=createModel();verifyPacking(model);
  assert.deepEqual(model.internal,{w:85,d:75,h:195});
  assert.ok(model.pages.length>=2&&model.pages.length<=5);
});
test('all lids and representative sizes: no panel clipping, resizing, duplicates or overlap',()=>{
  let count=0;
  for(const lid of LIDS)for(const [height,width,depth] of [[3,3,3],[8,5,4],[19,8,7],[22,16,12],[26,16,8],[12,24,9],[17,17,17],[10,27,14],[27.5,17,7]]) {
    const model=createModel({lid:lid.id,height,width,depth});
    if(model.errors.length){assert.equal(model.pages.length,0);continue;}
    verifyPacking(model);count++;
  }
  assert.ok(count>=20);
});
test('oversized faces are rejected explicitly instead of tiled or scaled',()=>{
  const model=createModel({height:45,width:20,depth:15});
  assert.ok(model.errors.some(x=>x.includes('não cabe inteira')));assert.equal(model.pages.length,0);
  assert.throws(()=>createPDF(model));
});
test('invalid dimensions and margins cannot generate a PDF',()=>{
  for(const input of [{height:NaN},{depth:0},{width:-1},{margin:1},{ease:4},{thickness:2},{lid:'unknown'}]) {
    const m=createModel(input);assert.ok(m.errors.length);assert.throws(()=>createPDF(m));
  }
});
const flatten=nodes=>nodes.flatMap(n=>[n,...n.children?flatten(n.children):[]]);
test('selected transparent faces alone receive cutouts, with 5 mm material overlap',()=>{
  const model=createModel({window:true,windows:['front','left'],windowBorder:1.2});verifyPacking(model);
  for(const p of model.pieces.filter(p=>['front','back','left','right'].includes(p.id))){
    const holes=flatten(p.nodes).filter(n=>n.windowCut);
    assert.equal(holes.length,['front','left'].includes(p.id)?1:0);
    if(holes.length){const face=p.faces[0],v=windowGeometry(face.w,face.h,model.config);assert.ok(v.x>=6);assert.equal(v.acrylicW-v.w,10);assert.equal(v.acrylicH-v.h,10);assert.ok(v.acrylicW<face.w);}
  }
  assert.ok(createModel({width:3,window:true,windows:['front'],windowBorder:2}).errors.length);
});
test('all four faces may have transparent apertures; switch off removes them all',()=>{
  const windows=['front','right','back','left'];
  for(const window of [true,false]){const m=createModel({window,windows});assert.equal(flatten(m.pieces.flatMap(p=>p.nodes)).filter(n=>n.windowCut).length,window?4:0);}
});
test('floor locking tongue, slot and hinge have matching real positions',()=>{
  const m=createModel();const slotPiece=m.pieces.find(p=>p.id==='base-back')||m.pieces.find(p=>p.id==='back');
  const slots=flatten(slotPiece.nodes).filter(n=>n.type==='path'&&!n.fold&&n.commands.length===2&&n.commands[0][0]==='M'&&n.commands[1][0]==='L'&&Math.abs(n.commands[0][2]-n.commands[1][2])<epsilon);
  const slot=slots.find(n=>Math.abs(n.commands[0][2]-(m.D-12))<epsilon);
  assert.ok(slot,'A cut slot 12 mm from the opposite front hinge exists');
  assert.ok(slot.commands[1][1]-slot.commands[0][1]>10);
  const front=m.pieces.find(p=>p.id==='front')||m.pieces.find(p=>p.id==='base-front');
  assert.ok(flatten(front.nodes).some(n=>n.fold&&n.commands[0][2]===12),'Tongue folds at the slot reach');
});
test('all PDF pages have A4 MediaBox and contain no visible text operators',()=>{
  for(const lid of LIDS) {
    const model=createModel({lid:lid.id,window:true,windows:['front','right']});
    const pdf=createPDF(model),content=new TextDecoder().decode(pdf);
    assert.ok(content.startsWith('%PDF-1.4'));assert.ok(content.trimEnd().endsWith('%%EOF'));
    assert.equal((content.match(/\/Type \/Page /g)||[]).length,model.pages.length);
    assert.ok(content.includes('/PrintScaling /None'));
    assert.equal(/\b(?:BT|ET|Tf|Tj|TJ)\b/.test(content),false);
    assert.equal(content.includes('/Font'),false);
    for(const page of model.pages){const svg=pageSVG(page,model.config);assert.equal(svg.includes('<text'),false);assert.equal(/NaN|undefined/.test(svg),false);}
  }
});
test('fold switch removes the score dashes without removing cut lines',()=>{
  const on=createModel({folds:true}),off=createModel({folds:false});
  const a=new TextDecoder().decode(createPDF(on)),b=new TextDecoder().decode(createPDF(off));
  assert.ok(a.includes('[1.4 1.3] 0 d'));assert.ok(!b.includes('[1.4 1.3] 0 d'));assert.ok(b.includes('0.2 w'));
});
test('themes recognize descriptive input and preserve user palette',()=>{
  assert.equal(resolveTheme({...DEFAULTS,description:'Caixa para amigurumi Jesus'}).id,'jesus');
  assert.equal(resolveTheme({...DEFAULTS,description:'Coelhinho da Páscoa'}).id,'bosque');
  assert.equal(resolveTheme({...DEFAULTS,description:'Coelhinho'}).id,'bosque');
  assert.equal(resolveTheme({...DEFAULTS,description:'Festa da princesa'}).id,'festa');
  assert.equal(resolveTheme({...DEFAULTS,description:'Fé e amor'}).id,'jesus');
  assert.equal(resolveTheme({...DEFAULTS,detailColor:'#aabbcc'}).ink,'#aabbcc');
  for(const theme of THEMES){const model=createModel({theme:theme.id,mainColor:theme.bg,detailColor:theme.ink});const pdf=new TextDecoder().decode(createPDF(model));assert.equal(pdf.includes('NaN'),false);}
});
test('background and details are independent, including legacy colour migration',()=>{
  const a=createModel({mainColor:'#ddeeff',detailColor:'#334455'});
  const b=createModel({mainColor:'#ffeecc',detailColor:'#334455'});
  const c=createModel({mainColor:'#ddeeff',detailColor:'#aa4477'});
  const face=m=>flatten(m.pieces.find(p=>p.id==='front').nodes);
  assert.ok(face(a).some(n=>n.fill==='#ddeeff'));
  assert.ok(face(b).some(n=>n.fill==='#ffeecc'));
  assert.ok(face(a).some(n=>n.fill==='#334455'));
  assert.ok(face(c).some(n=>n.fill==='#aa4477'));
  assert.equal(c.theme.bg,a.theme.bg);assert.equal(b.theme.ink,a.theme.ink);
  const migrated=normalizeConfig({theme:'bosque',color:'#123456'});
  assert.equal(migrated.detailColor,'#123456');assert.equal(migrated.mainColor,THEMES.find(t=>t.id==='bosque').bg);
});
test('twenty theme collections have distinct motif families and recognize their names',()=>{
  assert.equal(THEMES.length,20);assert.equal(new Set(THEMES.map(t=>t.motif)).size,20);
  for(const [description,id] of [['Jardim de borboletas','borboletas'],['ursinho','ursinho'],['unicórnio','unicornio'],['Astronauta no espaço','astronauta'],['Sereia','sereia'],['Dinossauro','dinossauro'],['Fazendinha','fazendinha'],['Natal','natal']])assert.equal(resolveTheme({...DEFAULTS,description}).id,id);
});
test('four different uploads stay on their respective faces in scene graphs and PDF resources',async()=>{
  const images=JSON.parse(await readFile(new URL('./fixtures/images.json',import.meta.url),'utf8'));
  const m=createModel({},images);verifyPacking(m);
  for(const {id}of FACES){const rendered=flatten(m.pieces.find(p=>p.id===id).nodes).filter(n=>n.type==='image');assert.equal(rendered.length,1);assert.equal(rendered[0].image,images[id]);}
  const content=Buffer.from(createPDF(m)).toString('latin1');assert.equal((content.match(/\/Subtype \/Image/g)||[]).length,4);
  const partial={...images};delete partial.left;
  assert.equal(flatten(createModel({},partial).pieces.find(p=>p.id==='left').nodes).filter(n=>n.type==='image').length,0);
});
test('saving roundtrips both colours, four images and four texts; v1 projects remain usable',async()=>{
  const images=JSON.parse(await readFile(new URL('./fixtures/images.json',import.meta.url),'utf8'));
  const config={...DEFAULTS,mainColor:'#112233',detailColor:'#abcdef',textEnabled:true,textFont:'delicate',texts:{front:'Déborah',back:'João',left:'Liz',right:'Feito com amor'}};
  const parsed=parseProject(JSON.parse(JSON.stringify(projectData(config,images))));
  assert.deepEqual(parsed.images,images);assert.equal(parsed.config.mainColor,'#112233');assert.equal(parsed.config.detailColor,'#abcdef');assert.deepEqual(parsed.config.texts,config.texts);
  const old=parseProject({app:'dobra-atelie',version:1,config:{height:19,color:'#456789'},image:images.front});
  assert.equal(old.config.detailColor,'#456789');assert.equal(old.config.textEnabled,false);assert.equal(old.images.front,old.images.back);assert.equal(old.images.left,undefined);
});
test('optional text supports accents in every font and is absent from empty faces',()=>{
  assert.equal(TEXT_FONTS.length,4);
  for(const font of TEXT_FONTS){
    const m=createModel({textEnabled:true,textFont:font.id,texts:{front:'Déborah & João — 2026 ♥',right:'Liz'}});verifyPacking(m);
    const front=flatten(m.pieces.find(p=>p.id==='front').nodes),back=flatten(m.pieces.find(p=>p.id==='back').nodes);
    assert.ok(front.some(n=>n.textGlyph));assert.ok(!back.some(n=>n.textGlyph));
    assert.ok(createPDF(m).length>1000);
  }
  const disabled=createModel({textEnabled:false,texts:{front:'Não imprimir'}});
  assert.ok(!flatten(disabled.pieces.flatMap(p=>p.nodes)).some(n=>n.textGlyph));
});
test('text layout avoids acrylic apertures and blocks text that cannot fit',()=>{
  for(const textPosition of ['top','center','bottom']){
    const m=createModel({window:true,windows:['front'],textEnabled:true,textPosition,texts:{front:'Liz Abreu'}});verifyPacking(m);
    const t=layoutText(m.W,m.H,m.config,'front'),v=windowGeometry(m.W,m.H,m.config);
    assert.ok(t.area.y+t.area.h<=v.y||t.area.y>=v.y+v.h,'Printed text is confined to the frame');
  }
  assert.ok(createModel({textEnabled:true,texts:{front:'🙂'}}).errors.some(e=>e.includes('fonte')));
  assert.ok(createModel({height:3,width:3,depth:3,window:true,textEnabled:true,texts:{front:'W'.repeat(80)}}).errors.some(e=>e.includes('não cabe')));
});
test('art request uses the exact custom theme, both colours, style and four face proportions',()=>{
  const prompt=buildArtPrompt({...DEFAULTS,description:'Raposinha enfermeira',mainColor:'#ddeeff',detailColor:'#335577',artPromptStyle:'watercolor',texts:{front:'Nome privado'}});
  assert.ok(prompt.includes('TEMA: Raposinha enfermeira'));assert.ok(prompt.includes('#ddeeff'));assert.ok(prompt.includes('#335577'));assert.ok(prompt.includes('Aquarela suave'));
  assert.ok(prompt.includes('8,53 × 19,53 cm'));assert.ok(prompt.includes('7,53 × 19,53 cm'));
  for(const filename of ['frente.png','verso.png','lateral-esquerda.png','lateral-direita.png'])assert.ok(prompt.includes(filename));
  assert.ok(prompt.includes('fundo realmente transparente'));assert.ok(prompt.includes('Não inclua letras'));assert.ok(!prompt.includes('Nome privado'));
  const ink=buildArtPrompt({...DEFAULTS,mainColor:'#998866',ink:true});assert.ok(ink.includes('fundo da caixa #ffffff'));
});
test('one-face requests account for the selected visor and reject unusable measures',()=>{
  const prompt=buildArtPrompt({...DEFAULTS,window:true,windows:['right']},'right');
  assert.ok(prompt.includes('Somente um arquivo PNG'));assert.ok(prompt.includes('LATERAL DIREITA:'));assert.ok(!prompt.includes('FRENTE:'));assert.ok(prompt.includes('visor central de 5,13 × 17,13 cm'));
  assert.throws(()=>buildArtPrompt({height:NaN}));assert.throws(()=>buildArtPrompt({},'bottom'));
  assert.throws(()=>buildArtPrompt({width:3,window:true,windowBorder:3},'front'),/moldura/);
});
test('preparing art requests never changes the printed template or the project values',()=>{
  const input={...DEFAULTS,description:'Unicórnio'},snapshot=JSON.stringify(input),pdf=createPDF(createModel(input));
  for(const style of ART_STYLES){assert.ok(buildArtPrompt({...input,artPromptStyle:style.id}).length>500);assert.deepEqual(createPDF(createModel({...input,artPromptStyle:style.id})),pdf);}
  assert.equal(JSON.stringify(input),snapshot);
  const saved=parseProject(projectData({...input,artPromptStyle:'toy'}));assert.equal(saved.config.artPromptStyle,'toy');
});
