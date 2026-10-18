import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createModel, createPDF, DEFAULTS, LIDS, THEMES, FACES, PANORAMA_ORDER, TEXT_FONTS, ART_STYLES, buildArtPrompt, panoramaLayout, panoramaPlacement, movePanoramaCut, imagePlacement, layoutText, textNodes, normalizeConfig, projectData, parseProject, pageSVG, windowGeometry, placementMatrix, resolveTheme } from '../src/engine.js';

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
const panoramaConfig={height:9.97,width:9.97,depth:4.97,ease:0,thickness:.3};
test('panorama spans the full perimeter in assembly order with unequal contiguous face widths',()=>{
  for(const c of [DEFAULTS,panoramaConfig,{height:12,width:14,depth:3,ease:1,thickness:.6}]){
    const layout=panoramaLayout(c),model=createModel(c);verifyPacking(model);
    assert.deepEqual(layout.faces.map(f=>f.id),['front','right','back','left']);assert.equal(layout.width,2*(model.W+model.D));assert.equal(layout.height,model.H);
    let end=0;
    for(const f of layout.faces){assert.ok(Math.abs(f.x-end)<epsilon);assert.equal(f.width,['front','back'].includes(f.id)?model.W:model.D);assert.ok(Math.abs(f.start-f.x/layout.width)<epsilon);end=f.x+f.width;}
    assert.ok(Math.abs(end-layout.width)<epsilon);assert.ok(Math.abs(layout.faces.at(-1).end-1)<epsilon);
  }
  assert.deepEqual(panoramaLayout(panoramaConfig).faces.map(f=>f.x),[0,100,150,250]);
});
test('a single panoramic source paints the correct full-face slices in SVG and PDF without printed guides',async()=>{
  const asset=JSON.parse(await readFile(new URL('./fixtures/panorama.json',import.meta.url),'utf8'));
  const images=Object.fromEntries(PANORAMA_ORDER.map(id=>[id,asset])),m=createModel({...panoramaConfig,folds:false},images);verifyPacking(m);
  const layout=panoramaLayout(panoramaConfig);
  for(const face of layout.faces){
    const nodes=flatten(m.pieces.find(p=>p.id===face.id).nodes),image=nodes.find(n=>n.type==='image');
    assert.equal(image.image,asset);assert.ok(Math.abs(image.x+face.x)<epsilon);assert.equal(image.y,0);assert.equal(image.w,300);assert.equal(image.h,100);
    const clip=nodes.find(n=>n.clip);assert.deepEqual(clip.clip,{x:0,y:0,w:face.width,h:100});
    assert.equal(clip.children.length,2,'Only the selected background and panoramic image, without unrelated theme motifs');
    assert.ok(Math.abs((face.width-image.x)/image.w-face.end)<epsilon);
  }
  const pdf=Buffer.from(createPDF(m)).toString('latin1');assert.equal((pdf.match(/\/Subtype \/Image/g)||[]).length,1);assert.equal((pdf.match(/\/Im1 Do/g)||[]).length,4);
  assert.ok(!pdf.includes('[2 2]'));assert.ok(!/\b(?:BT|ET|Tf|Tj|TJ)\b/.test(pdf));
  const svgs=m.pages.map(p=>pageSVG(p,m.config)).join('');assert.ok(!svgs.includes('<text'));assert.ok(!svgs.includes('stroke-dasharray="2 2"'));assert.ok(svgs.includes('x="-250"'));assert.ok(svgs.includes('x="-100"'));
});
test('panorama keeps horizontal divisions for other image ratios and updates after dimensions change',async()=>{
  const asset=JSON.parse(await readFile(new URL('./fixtures/panorama.json',import.meta.url),'utf8'));
  const layout=panoramaLayout(panoramaConfig);
  for(const ratio of [1,3,6])for(const face of layout.faces){
    const p=panoramaPlacement(layout,ratio,face.id);assert.equal(p.x,-face.x);assert.equal(p.w,300);assert.equal(p.w/p.h,ratio);
    assert.ok(Math.abs(-p.x/p.w-face.start)<epsilon);assert.ok(Math.abs((face.width-p.x)/p.w-face.end)<epsilon);
  }
  assert.ok(panoramaPlacement(layout,1).y<0);assert.ok(panoramaPlacement(layout,6).y>0);
  assert.throws(()=>panoramaPlacement(layout,0));assert.throws(()=>panoramaPlacement(layout,NaN));assert.throws(()=>panoramaPlacement(layout,3,'lid'));
  const images=Object.fromEntries(PANORAMA_ORDER.map(id=>[id,asset]));
  const changed=createModel({...panoramaConfig,width:14.97},images),left=flatten(changed.pieces.find(p=>p.id==='left').nodes).find(n=>n.type==='image');
  assert.ok(Math.abs(left.x+350)<epsilon);assert.ok(Math.abs(left.w-400)<epsilon);assert.ok(Math.abs(left.h-400/3)<epsilon);
  assert.ok(createModel({height:NaN},images).errors.length);
  assert.equal(flatten(changed.pieces.flatMap(p=>p.nodes)).filter(n=>n.windowCut).length,0);
  const visor=createModel({...panoramaConfig,window:true,windows:['right']},images);assert.equal(flatten(visor.pieces.flatMap(p=>p.nodes)).filter(n=>n.windowCut).length,1);
});
test('shared panoramic projects store one source, preserve individual overrides and reopen older formats',async()=>{
  const asset=JSON.parse(await readFile(new URL('./fixtures/panorama.json',import.meta.url),'utf8'));
  const individual=JSON.parse(await readFile(new URL('./fixtures/images.json',import.meta.url),'utf8')).front;
  const images=Object.fromEntries(PANORAMA_ORDER.map(id=>[id,asset])),doc=projectData(panoramaConfig,images);
  assert.equal(doc.version,3);assert.equal(doc.artwork.length,1);assert.equal(Object.values(doc.faces).filter(i=>i===0).length,4);
  const parsed=parseProject(JSON.parse(JSON.stringify(doc)));assert.equal(parsed.images.front,parsed.images.left);assert.equal(parsed.images.front.mode,'panorama');
  images.back=individual;delete images.left;
  const changed=parseProject(JSON.parse(JSON.stringify(projectData(panoramaConfig,images))));assert.equal(changed.images.front,changed.images.right);assert.notEqual(changed.images.back,changed.images.front);assert.equal(changed.images.left,undefined);
  const older=parseProject({app:'dobra-atelie',version:2,config:panoramaConfig,images:{front:individual}});assert.deepEqual(older.images.front,individual);
  assert.throws(()=>parseProject({...doc,faces:{front:99}}));assert.throws(()=>parseProject({...doc,faces:{lid:0}}));assert.throws(()=>parseProject({...doc,artwork:[{...asset,ratio:0}]}));
});
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
test('one shared artwork fits four unequal faces without distortion and remains individually replaceable',async()=>{
  const fixtures=JSON.parse(await readFile(new URL('./fixtures/images.json',import.meta.url),'utf8'));
  const asset=fixtures.front,images=Object.fromEntries(FACES.map(f=>[f.id,asset]));
  const m=createModel({width:12,depth:4},images);verifyPacking(m);
  for(const {id}of FACES){
    const image=flatten(m.pieces.find(p=>p.id===id).nodes).find(n=>n.type==='image'),w=['front','back'].includes(id)?m.W:m.D;
    assert.equal(image.image,asset);assert.ok(Math.abs(image.w/image.h-asset.ratio)<epsilon);
    assert.ok(image.w<=w*.8+epsilon);assert.ok(image.h<=m.H*.55+epsilon);
    assert.ok(Math.abs(image.x-(w-image.w)/2)<epsilon);assert.ok(Math.abs(image.y-(m.H-image.h)/2)<epsilon);
  }
  assert.equal((Buffer.from(createPDF(m)).toString('latin1').match(/\/Subtype \/Image/g)||[]).length,1);
  images.left=fixtures.left;delete images.right;
  const changed=createModel({width:12,depth:4},images);
  for(const {id}of FACES){const rendered=flatten(changed.pieces.find(p=>p.id===id).nodes).filter(n=>n.type==='image');assert.equal(rendered.length,id==='right'?0:1);if(rendered.length)assert.equal(rendered[0].image,id==='left'?fixtures.left:asset);}
  const saved=parseProject(JSON.parse(JSON.stringify(projectData(DEFAULTS,images))));assert.deepEqual(saved.images,images);
});
test('saving roundtrips both colours, four images and four texts; v1 projects remain usable',async()=>{
  const images=JSON.parse(await readFile(new URL('./fixtures/images.json',import.meta.url),'utf8'));
  const config={...DEFAULTS,mainColor:'#112233',detailColor:'#abcdef',textEnabled:true,textFont:'delicate',texts:{front:'Déborah',back:'João',left:'Liz',right:'Feito com amor'}};
  const parsed=parseProject(JSON.parse(JSON.stringify(projectData(config,images))));
  assert.deepEqual(parsed.images,images);assert.equal(parsed.config.mainColor,'#112233');assert.equal(parsed.config.detailColor,'#abcdef');assert.deepEqual(parsed.config.texts,config.texts);
  const old=parseProject({app:'dobra-atelie',version:1,config:{height:19,color:'#456789'},image:images.front});
  assert.equal(old.config.detailColor,'#456789');assert.equal(old.config.textEnabled,false);assert.equal(old.images.front,old.images.back);assert.equal(old.images.left,undefined);
});
test('saved serif and typewriter selections migrate to creative fonts in every project format',()=>{
  const replacements={classic:'caveat',modern:'fredoka',delicate:'patrickhand',bold:'baloo2',elegant:'pacifico',serif_bold:'lilitaone',compact:'amaticsc',typewriter:'architectsdaughter',typewriter_italic:'indieflower',typewriter_bold:'kalam',smallcaps:'bangers',artistic:'chewy'};
  assert.equal(DEFAULTS.textFont,'caveat');
  assert.deepEqual(new Set(TEXT_FONTS.map(f=>f.id)),new Set(Object.values(replacements)));
  for(const [oldFont,newFont]of Object.entries(replacements)){
    const original={textFont:oldFont,textEnabled:true,textSize:72,texts:{front:'Déborah & João'}};
    assert.equal(normalizeConfig(original).textFont,newFont);assert.equal(original.textFont,oldFont);
    for(const version of [1,2,3]){
      const {config}=parseProject({app:'dobra-atelie',version,config:original,artwork:[],faces:{}});
      assert.equal(config.textFont,newFont);assert.equal(config.textSize,72);assert.equal(config.texts.front,original.texts.front);
      verifyPacking(createModel(config));
    }
  }
  assert.ok(createModel({textFont:'unknown-font'}).errors.some(e=>e.includes('fonte')));
});
test('optional text supports accents in every font and is absent from empty faces',()=>{
  assert.equal(TEXT_FONTS.length,12);assert.equal(new Set(TEXT_FONTS.map(f=>f.id)).size,12);assert.equal(new Set(TEXT_FONTS.map(f=>f.name)).size,12);
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
test('panoramic art request gives the total size, each width and exact assembly order in one image',()=>{
  const prompt=buildArtPrompt({...DEFAULTS,description:'Raposinha enfermeira',mainColor:'#ddeeff',detailColor:'#335577',artPromptStyle:'watercolor',texts:{front:'Nome privado'}});
  assert.ok(prompt.includes('TEMA: Raposinha enfermeira'));assert.ok(!prompt.includes('#ddeeff'));assert.ok(!prompt.includes('#335577'));assert.ok(prompt.includes('Aquarela suave'));
  assert.ok(prompt.includes('8,53 × 19,53 cm'));assert.ok(prompt.includes('7,53 × 19,53 cm'));
  assert.ok(prompt.startsWith('Crie uma única imagem panorâmica'));assert.ok(prompt.includes('32,12 × 19,53 cm'));assert.ok(prompt.includes('frente → lateral direita → verso → lateral esquerda'));
  assert.ok(prompt.includes('Somente um arquivo PNG, chamado panorama-caixa.png'));assert.ok(prompt.includes('x=8,53 até x=16,06 cm'));assert.ok(prompt.includes('x=24,59 até x=32,12 cm'));assert.ok(prompt.includes('As faixas não são necessariamente iguais'));
  const order=['FRENTE:','LATERAL DIREITA:','VERSO:','LATERAL ESQUERDA:'].map(s=>prompt.indexOf(s));assert.ok(order.every((x,i)=>x>=0&&(!i||x>order[i-1])));
  for(const unwanted of ['frente.png','verso.png','lateral-esquerda.png','lateral-direita.png','composição quadrada','repetirá exatamente esta mesma imagem'])assert.ok(!prompt.includes(unwanted));
  assert.ok(prompt.includes('escolha livremente uma paleta'));assert.ok(prompt.includes('seu próprio fundo'));assert.ok(prompt.includes('Não inclua letras'));assert.ok(!prompt.includes('Nome privado'));
  assert.ok(!/#[0-9a-f]{6}/i.test(prompt));
});
test('panoramic art request preserves visor guidance and sizes short boxes correctly',()=>{
  const prompt=buildArtPrompt({height:3,width:12,depth:8,ease:0});assert.ok(prompt.includes('40,12 × 3,03 cm'));
  const window=buildArtPrompt({...DEFAULTS,window:true,windows:['left']});assert.ok(window.includes('visor central de 5,13 × 17,13 cm'));assert.ok(window.includes('A abertura recortará a imagem'));assert.ok(window.includes('Não desenhe o visor'));
  assert.throws(()=>buildArtPrompt({depth:3,window:true,windows:['left'],windowBorder:3}),/moldura/);
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

test('manual panorama cuts select exact source fractions without changing physical faces',async()=>{
  const asset=JSON.parse(await readFile(new URL('./fixtures/panorama.json',import.meta.url),'utf8'));
  const config={...panoramaConfig,panoramaCuts:[.2,.6,.85]},layout=panoramaLayout(config),images=Object.fromEntries(FACES.map(f=>[f.id,asset]));
  assert.equal(layout.automatic,false);assert.deepEqual(layout.cuts,[.2,.6,.85]);
  const m=createModel(config,images);verifyPacking(m);
  for(const f of layout.faces){
    const p=panoramaPlacement(layout,asset.ratio,f.id);assert.ok(Math.abs(-p.x/p.w-f.start)<epsilon);assert.ok(Math.abs((f.width-p.x)/p.w-f.end)<epsilon);assert.ok(Math.abs(p.w/p.h-asset.ratio)<epsilon);
    const image=flatten(m.pieces.find(p=>p.id===f.id).nodes).find(n=>n.type==='image');assert.ok(Math.abs(image.x-p.x)<epsilon);assert.ok(Math.abs(image.w-p.w)<epsilon);
  }
  assert.ok(Math.abs(m.W-100)<epsilon);assert.ok(Math.abs(m.D-50)<epsilon);assert.ok(Math.abs(m.H-100)<epsilon);
  const changed=panoramaLayout({...config,width:14.97});assert.deepEqual(changed.cuts,layout.cuts);assert.ok(Math.abs(changed.faces[0].width-150)<epsilon);
  const moved=movePanoramaCut(config,0,.99);assert.ok(Math.abs(moved[0]-.59)<epsilon);assert.equal(moved[1],.6);assert.equal(moved[2],.85);
  assert.deepEqual(config.panoramaCuts,[.2,.6,.85]);assert.throws(()=>movePanoramaCut(config,4,.5));assert.throws(()=>movePanoramaCut(config,0,NaN));
});
test('individual artwork scales and moves independently while contain and cover preserve proportions',async()=>{
  const raw=JSON.parse(await readFile(new URL('./fixtures/panorama.json',import.meta.url),'utf8')),asset={...raw};delete asset.mode;
  const config=normalizeConfig({...panoramaConfig,imageTransforms:{front:{scale:2,x:10,y:-20}}});
  const a=imagePlacement(100,100,config,'front',asset).rect,b=imagePlacement(100,100,config,'back',asset).rect;
  assert.ok(Math.abs(a.w-110)<epsilon);assert.ok(Math.abs(a.x-5)<epsilon);assert.ok(Math.abs(a.y-11.6666666667)<epsilon);assert.equal(a.w/b.w,2);assert.ok(Math.abs(a.w/a.h-3)<epsilon);
  for(const fit of ['contain','cover']){
    const c=normalizeConfig({...panoramaConfig,imageTransforms:{front:{fit}}}),p=imagePlacement(100,100,c,'front',asset).rect;
    assert.ok(Math.abs(p.w/p.h-3)<epsilon);
    if(fit==='contain'){assert.equal(p.w,100);assert.ok(p.h<100);assert.equal(p.x,0);}else{assert.equal(p.h,100);assert.equal(p.w,300);assert.equal(p.x,-100);}
  }
  const images={front:asset,back:asset},model=createModel(config,images);verifyPacking(model);
  for(const face of ['front','back']){const image=flatten(model.pieces.find(p=>p.id===face).nodes).find(n=>n.type==='image');assert.equal(image.w,face==='front'?a.w:b.w);}
});
test('zoomed and moved panorama strips remain clipped to their selected source face',async()=>{
  const asset=JSON.parse(await readFile(new URL('./fixtures/panorama.json',import.meta.url),'utf8'));
  const config=normalizeConfig({...panoramaConfig,panoramaCuts:[1/3,.5,5/6],imageTransforms:{right:{scale:.5,x:20,y:0}}}),layout=panoramaLayout(config);
  const placement=imagePlacement(50,100,config,'right',asset);
  assert.ok(Math.abs(placement.clip.x-22.5)<epsilon);assert.ok(Math.abs(placement.clip.y-25)<epsilon);assert.ok(Math.abs(placement.clip.w-25)<epsilon);assert.ok(Math.abs(placement.clip.h-50)<epsilon);
  const section=layout.faces.find(f=>f.id==='right'),p=placement.rect;
  assert.ok(Math.abs((placement.clip.x-p.x)/p.w-section.start)<epsilon);assert.ok(Math.abs((placement.clip.x+placement.clip.w-p.x)/p.w-section.end)<epsilon);
  const model=createModel(config,Object.fromEntries(FACES.map(f=>[f.id,asset]))),nodes=flatten(model.pieces.find(p=>p.id==='right').nodes);
  assert.ok(nodes.some(n=>n.clip&&Math.abs(n.clip.w-25)<epsilon));
  const pdf=Buffer.from(createPDF(model)).toString('latin1');assert.ok(pdf.includes(' re W n'));assert.equal((pdf.match(/\/Subtype \/Image/g)||[]).length,1);
});
test('cut and image controls reject unusable values before generating PDF',()=>{
  for(const panoramaCuts of [[.5,.3,.8],[0,.5,.8],[.3,.5,1],[.3,.305,.8],[.3,.5],['.3',.5,.8],{}]){
    const m=createModel({panoramaCuts});assert.ok(m.errors.some(e=>e.includes('cortes')));assert.throws(()=>createPDF(m));
  }
  for(const change of [{scale:0},{scale:5.1},{x:101},{y:NaN},{fit:'stretch'}]){const m=createModel({imageTransforms:{front:change}});assert.ok(m.errors.length);assert.throws(()=>createPDF(m));}
});
test('project saving preserves custom cuts and independent image transforms with old-project defaults',async()=>{
  const asset=JSON.parse(await readFile(new URL('./fixtures/panorama.json',import.meta.url),'utf8'));
  const c=normalizeConfig({...panoramaConfig,panoramaCuts:[.2,.6,.85],imageTransforms:{front:{scale:1.7,x:-12,y:9,fit:'cover'},right:{scale:.5,x:20}}});
  const p=parseProject(JSON.parse(JSON.stringify(projectData(c,Object.fromEntries(FACES.map(f=>[f.id,asset]))))));
  assert.deepEqual(p.config.panoramaCuts,c.panoramaCuts);assert.deepEqual(p.config.imageTransforms,c.imageTransforms);assert.equal(p.images.front,p.images.left);
  const copy=normalizeConfig(c);copy.panoramaCuts[0]=.1;copy.imageTransforms.front.x=55;assert.equal(c.panoramaCuts[0],.2);assert.equal(c.imageTransforms.front.x,-12);assert.equal(c.imageTransforms.back.x,0);
  const old=parseProject({app:'dobra-atelie',version:2,config:{height:19},images:{}});assert.equal(old.config.panoramaCuts,null);assert.deepEqual(old.config.imageTransforms.front,{scale:1,x:0,y:0,fit:'original'});
});
test('art-generation prompts retain physical dimensions regardless of later crop and zoom choices',()=>{
  const c={...panoramaConfig,description:'Jesus'},adjusted={...c,panoramaCuts:[.2,.6,.85],imageTransforms:{front:{scale:2,x:20,y:-10}}};
  assert.equal(buildArtPrompt(c),buildArtPrompt(adjusted));
});

test('fractional cuts and zoom export valid decimal PDF coordinates without scientific notation',async()=>{
  const asset=JSON.parse(await readFile(new URL('./fixtures/panorama.json',import.meta.url),'utf8'));
  const images=Object.fromEntries(FACES.map(f=>[f.id,asset]));
  for(const imageTransforms of [{right:{scale:.5,x:20}},{front:{scale:.33,x:-99.9,y:31.7},back:{fit:'contain',scale:1.73}}]){
    const m=createModel({...panoramaConfig,panoramaCuts:[1/3,.5,5/6],imageTransforms},images),pdf=Buffer.from(createPDF(m)).toString('latin1');
    const streams=[...pdf.matchAll(/<< \/Length \d+ >>\nstream\n([\s\S]*?)endstream/g)].map(m=>m[1]);
    assert.equal(streams.length,m.pages.length);for(const s of streams)assert.equal(/\d(?:\.\d+)?[eE][-+]?\d|NaN|Infinity/.test(s),false);
  }
});

test('image prompts choose their own palette regardless of preset colours or ink-saving settings',()=>{
  const c={...DEFAULTS,description:'Jesus no jardim',artPromptStyle:'storybook'};
  for(const face of ['all',...FACES.map(f=>f.id)]){
    const base=buildArtPrompt(c,face);
    for(const palette of [{mainColor:'#ff0000',detailColor:'#0000ff'},{mainColor:'#123456',detailColor:'#fedcba',ink:true},{mainColor:'invalid',detailColor:'invalid'}])assert.equal(buildArtPrompt({...c,...palette},face),base);
    assert.ok(base.includes('paleta harmoniosa'));assert.ok(!/#[0-9a-f]{6}/i.test(base));assert.ok(!base.includes('fundo realmente transparente'));
  }
});
test('every font can reach 120 pt when the face is large enough and projects retain the selection',()=>{
  for(const {id}of TEXT_FONTS){
    const c={textEnabled:true,textFont:id,textSize:120,texts:{front:'Liz'},height:19,width:18,depth:7},m=createModel(c);verifyPacking(m);
    const layout=layoutText(m.W,m.H,m.config,'front');assert.ok(!layout.error);assert.ok(Math.abs(layout.size*72/25.4-120)<.01,id);
    const parsed=parseProject(JSON.parse(JSON.stringify(projectData(m.config))));assert.equal(parsed.config.textFont,id);assert.equal(parsed.config.textSize,120);
  }
  assert.ok(createModel({textSize:121}).errors.some(e=>e.includes('tamanho da fonte')));
  assert.ok(createModel({textSize:8}).errors.some(e=>e.includes('tamanho da fonte')));
});
test('large accented letters and italic overhangs remain inside each text area in every font',()=>{
  for(const {id}of TEXT_FONTS)for(const textSize of [16,72,120])for(const textPosition of ['top','center','bottom']){
    const config=normalizeConfig({textEnabled:true,textFont:id,textSize,textPosition,texts:{front:'ÁÉÍÓÚ Çãõ êg'},height:19,width:14,depth:7}),m=createModel(config);verifyPacking(m);
    const l=layoutText(m.W,m.H,m.config,'front'),nodes=textNodes(m.W,m.H,m.config,'front'),glyphs=flatten(nodes).filter(n=>n.type==='group'&&n.children?.[0]?.textGlyph);
    assert.ok(!l.error,id);let index=0;
    for(const line of l.lines)for(const ch of line){const glyph=l.font.glyphs[ch];if(!glyph.commands.length)continue;const n=glyphs[index++],[a,b,c,d,e,f]=n.transform,[xmin,ymin,xmax,ymax]=glyph.bounds;
      for(const [x,y]of [[xmin,ymin],[xmin,ymax],[xmax,ymin],[xmax,ymax]]){const px=a*x+c*y+e,py=b*x+d*y+f;assert.ok(px>=l.area.x-epsilon&&px<=l.area.x+l.area.w+epsilon,id+' width');assert.ok(py>=l.area.y-epsilon&&py<=l.area.y+l.area.h+epsilon,id+' height');}
    }
    assert.equal(index,glyphs.length);
  }
});
test('large requested sizes adapt to visor frames while keeping lettering outside the aperture',()=>{
  for(const {id}of TEXT_FONTS){
    const m=createModel({textEnabled:true,textFont:id,textSize:120,texts:{front:'Déborah'},window:true,windows:['front']});verifyPacking(m);
    const l=layoutText(m.W,m.H,m.config,'front'),v=windowGeometry(m.W,m.H,m.config);
    assert.ok(l.size*72/25.4<120);assert.ok(l.area.y+l.area.h<=v.y||l.area.y>=v.y+v.h);
    assert.ok(createPDF(m).length>1000);
  }
});
