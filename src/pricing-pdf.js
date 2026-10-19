import { FONT_LIBRARY } from './fonts.js';
import { createPDF } from './engine.js';
import { pricingMoney, pricingNumber, pricingDuration } from './pricing.js';

const pricingReportFont=FONT_LIBRARY.find(f=>f.id==='fredoka');
const pricingReportInk='#263f33',pricingReportMuted='#667466';
function pricingReportMetrics(text) {
  let advance=0,minX=0,maxX=0,ascent=0,descent=0;
  for(const char of text){
    const glyph=pricingReportFont.glyphs[char];
    if(!glyph)throw new Error('O PDF não contém “'+char+'”. Remova esse caractere do nome da peça ou do material.');
    const [xmin,ymin,xmax,ymax]=glyph.bounds;
    minX=Math.min(minX,advance+xmin);maxX=Math.max(maxX,advance+xmax);ascent=Math.max(ascent,ymax);descent=Math.max(descent,-ymin);advance+=glyph.advance;
  }
  return {width:Math.max(maxX,advance)-minX,minX,ascent,descent};
}
function pricingReportText(value,x,y,size=10,width=178,align='left',color=pricingReportInk) {
  const text=String(value),m=pricingReportMetrics(text),scale=Math.min(size*25.4/72/1000,width/Math.max(1,m.width));
  const start=x+(align==='right'?width-m.width*scale:0)-m.minX*scale,baseline=y+m.ascent*scale,children=[];
  let pen=start;
  for(const char of text){const g=pricingReportFont.glyphs[char];if(g.commands.length)children.push({type:'group',transform:[scale,0,0,-scale,pen,baseline],children:[{type:'path',commands:g.commands,fill:color}]});pen+=g.advance*scale;}
  return {type:'group',transform:[1,0,0,1,0,0],children,textContent:text};
}
function pricingReportWrap(text,width,size) {
  const max=width/(size*25.4/72/1000),lines=[];let current='';
  for(const word of String(text).trim().split(/\s+/)){
    const candidate=current?current+' '+word:word;
    if(pricingReportMetrics(candidate).width<=max){current=candidate;continue;}
    if(current){lines.push(current);current='';}
    for(const char of word){if(current&&pricingReportMetrics(current+char).width>max){lines.push(current);current='';}current+=char;}
  }
  if(current)lines.push(current);return lines;
}
export function createPricingReportModel(result) {
  if(!result?.ok)throw new Error('Complete os dados para gerar o orçamento.');
  const r=result,v=r.values,pages=[];let nodes=[],y=0;
  function addPage(first=false){
    nodes=[{type:'rect',x:0,y:0,w:210,h:297,fill:'#fffefa'}];
    pages.push({placements:[{x:0,y:0,rotated:false,piece:{id:'pricing-'+pages.length,w:210,h:297,nodes}}]});
    nodes.push(pricingReportText('DOBRA ATELIÊ / PRECIFICAÇÃO',16,16,9,178,'left',pricingReportMuted));
    if(first){
      nodes.push(pricingReportText('Orçamento do amigurumi',16,27,23));y=42;
      for(const line of pricingReportWrap(r.name,178,14)){nodes.push(pricingReportText(line,16,y,14));y+=6.8;}
      nodes.push(pricingReportText('Valor para 1 peça',16,y+2,9,178,'left',pricingReportMuted));y+=12;
      nodes.push({type:'rect',x:12,y,w:186,h:31,fill:'#e9eee5'},pricingReportText('PREÇO SUGERIDO',18,y+5,9,174,'left',pricingReportMuted),pricingReportText(pricingMoney(r.priceCents/100),18,y+13,26,174));y+=40;
    }else{nodes.push(pricingReportText('Composição do orçamento / continuação',16,29,15));y=43;}
  }
  function room(height){if(y+height>267)addPage();}
  function section(title){room(17);nodes.push(pricingReportText(title,16,y,13));y+=10;}
  function row(label,value,{total=false}={}){
    const lines=pricingReportWrap(label,123,total?11:10),height=Math.max(8,lines.length*4.8+3);room(height);
    if(total)nodes.push({type:'rect',x:12,y:y-2,w:186,h:height+1,fill:'#e9eee5'});
    lines.forEach((line,i)=>nodes.push(pricingReportText(line,16,y+i*4.8,total?11:10,123)));
    nodes.push(pricingReportText(value,143,y,total?12:10,51,'right'));y+=height;
  }
  function paragraph(text){for(const line of pricingReportWrap(text,178,9)){room(5);nodes.push(pricingReportText(line,16,y,9,178,'left',pricingReportMuted));y+=4.7;}}
  addPage(true);
  section('Tempo e consumo estimados');
  row('Receita / '+pricingNumber(v.stitchesPerMinute)+' pontos por minuto',pricingNumber(v.stitches,0)+' pontos');
  row('Crochê / montagem e acabamento',pricingDuration(r.crochetMinutes)+' / '+pricingDuration(v.extraMinutes));
  row('Tempo total / '+pricingMoney(v.hourlyRate)+' por hora',pricingDuration(r.totalMinutes));
  row('Fio / '+pricingNumber(v.cmPerTenStitches)+' cm para 10 pontos',pricingNumber(r.yarnMeters)+' m');
  row('Novelo de '+pricingNumber(v.yarnLength)+' m',pricingMoney(v.yarnPrice));y+=4;
  section('Composição do preço');
  row('Mão de obra',pricingMoney(r.laborCents/100));
  row('Fio consumido',pricingMoney(r.yarnCents/100));
  for(const material of r.materials)row(material.name,pricingMoney(material.costCents/100));
  row('Custo total de produção',pricingMoney(r.costCents/100),{total:true});
  row('Lucro estimado',pricingMoney(r.profitCents/100));
  row('Margem escolhida sobre o preço de venda',pricingNumber(v.profitMargin)+'%');y+=5;
  paragraph('Preço = custo total / (1 - margem / 100). O preço final é arredondado para cima ao centavo.');y+=2;
  paragraph('O custo do fio é proporcional ao consumo, não ao novelo inteiro. O tempo e o consumo variam conforme o ponto, o fio e o acabamento.');
  for(let i=0;i<pages.length;i++){
    const p=pages[i].placements[0].piece.nodes;
    p.push(pricingReportText('Dobra Ateliê / cálculo de custos e lucro',16,281,8,145,'left',pricingReportMuted),pricingReportText((i+1)+' / '+pages.length,165,281,8,29,'right',pricingReportMuted));
  }
  return {errors:[],config:{folds:false},pages};
}
export function createPricingPDF(result) {return createPDF(createPricingReportModel(result));}
