import test from 'node:test';
import assert from 'node:assert/strict';
import { PRICING_FIELDS, newPricingDraft, normalizePricingDraft, pricingExample, parsePricingNumber, calculatePricing, pricingQuoteText, pricingMoney, pricingDuration } from '../src/pricing.js';
import { createPricingPDF, createPricingReportModel } from '../src/pricing-pdf.js';

test('pricing combines measured yarn, crochet, finishing, materials and margin for one piece',()=>{
  const r=calculatePricing(pricingExample());assert.equal(r.ok,true);
  assert.equal(r.crochetMinutes,100);assert.equal(r.totalMinutes,120);assert.equal(r.yarnMeters,80);assert.equal(r.yarnSkeins,.5);
  assert.equal(r.laborCents,3000);assert.equal(r.yarnCents,1000);assert.equal(r.materialsCents,1000);assert.equal(r.costCents,5000);
  assert.equal(r.priceCents,6250);assert.equal(r.profitCents,1250);assert.equal(r.effectiveMargin,20);
});
test('margin is measured on sales and zero margin covers exactly the included production costs',()=>{
  const c=pricingExample(),r=calculatePricing({...c,profitMargin:50});assert.equal(r.priceCents,10000);assert.equal(r.profitCents/r.priceCents,.5);
  const zero=calculatePricing({...c,profitMargin:0});assert.equal(zero.priceCents,zero.costCents);assert.equal(zero.profitCents,0);
  for(const profitMargin of [10,30,65,95,99.9]){
    const p=calculatePricing({...c,profitMargin});assert.equal(p.ok,true);assert.ok(p.effectiveMargin>=profitMargin-1e-9);assert.ok(p.priceCents-p.costCents/(1-profitMargin/100)<1+1e-7);
  }
});
test('Portuguese commas, grouped integer stitch counts and fractional working speeds are accepted',()=>{
  assert.equal(parsePricingNumber('2.000',true),2000);assert.equal(parsePricingNumber('1.234,56'),1234.56);assert.equal(parsePricingNumber(' 0,5 '),.5);assert.equal(parsePricingNumber('12.5'),12.5);
  for(const value of ['',null,{},'12 reais','1,2,3','1/2','Infinity','NaN'])assert.ok(Number.isNaN(parsePricingNumber(value)));
  const r=calculatePricing({...pricingExample(),stitches:'2.000',stitchesPerMinute:'12,5',hourlyRate:'15,50',yarnPrice:'20,00'});assert.equal(r.ok,true);assert.equal(r.totalMinutes,180);assert.equal(r.laborCents,4650);
});
test('ten-stitch thread consumption converts centimeters to meters and charges partial skeins only',()=>{
  const r=calculatePricing({...pricingExample(),stitches:30,cmPerTenStitches:25,yarnLength:100,yarnPrice:40,extraMinutes:0});
  assert.equal(r.yarnMeters,.75);assert.equal(r.yarnSkeins,.0075);assert.equal(r.yarnCents,30);
  const larger=calculatePricing({...pricingExample(),stitches:6000,cmPerTenStitches:50,yarnLength:100,yarnPrice:40});assert.equal(larger.yarnMeters,300);assert.equal(larger.yarnCents,12000);
});
test('all required data must be entered and invalid or overflowing estimates cannot be exported',()=>{
  const blank=calculatePricing(newPricingDraft());assert.equal(blank.ok,false);assert.equal(blank.errors.length,PRICING_FIELDS.filter(s=>!s.optional).length);assert.throws(()=>createPricingPDF(blank));
  for(const [field,values]of Object.entries({stitches:[0,-1,1.5,Infinity],stitchesPerMinute:[0,-1,'abc'],cmPerTenStitches:[0,-20],hourlyRate:[-1],yarnLength:[0,-1],yarnPrice:[-2],extraMinutes:[-1],profitMargin:[-1,100,120]}))for(const value of values){
    const r=calculatePricing({...pricingExample(),[field]:value});assert.equal(r.ok,false,field+' '+value);assert.ok(r.errors.some(e=>e.field===field));
  }
  const huge=calculatePricing({...pricingExample(),stitches:1e9,stitchesPerMinute:'0.00000001',hourlyRate:1e6});assert.equal(huge.ok,false);assert.ok(huge.errors.some(e=>e.field==='total'));
});
test('blank material amounts count as zero; zero-cost labor or yarn are explicit choices',()=>{
  const r=calculatePricing({...pricingExample(),hourlyRate:0,yarnPrice:0,extraMinutes:'',materials:[{name:'Embalagem',cost:5},{name:'Fita',cost:''}]});
  assert.equal(r.ok,true);assert.equal(r.laborCents,0);assert.equal(r.yarnCents,0);assert.equal(r.materialsCents,500);assert.equal(r.materials.length,1);assert.equal(r.priceCents,625);
  assert.equal(calculatePricing({...pricingExample(),hourlyRate:0,yarnPrice:0,materials:[]}).ok,false);
  assert.equal(calculatePricing({...pricingExample(),materials:[{name:'Inválido',cost:-1}]}).ok,false);
  assert.equal(calculatePricing({...pricingExample(),materials:Array.from({length:21},()=>({name:'Custo',cost:1}))}).ok,false);
});
test('line items round to cents and selling price rounds upward without lowering the requested margin',()=>{
  const r=calculatePricing({...pricingExample(),materials:[{name:'A',cost:'10,075'},{name:'B',cost:'1,005'}],profitMargin:30});
  assert.equal(r.materials[0].costCents,1008);assert.equal(r.materials[1].costCents,101);assert.equal(r.materialsCents,1109);
  assert.equal(r.costCents,5109);assert.equal(r.priceCents,7299);assert.equal(r.profitCents,2190);assert.ok(r.effectiveMargin>=30);
});
test('pricing drafts save independent copies and ignore unexpected object fields',()=>{
  const original=pricingExample(),saved=normalizePricingDraft(JSON.parse(JSON.stringify(original))),r=calculatePricing(saved);
  saved.materials[0].cost='99';assert.equal(original.materials[0].cost,'5');assert.equal(r.materials[0].costCents,500);
  assert.deepEqual(normalizePricingDraft(null),newPricingDraft());assert.deepEqual(normalizePricingDraft([]),newPricingDraft());
  assert.equal(normalizePricingDraft({...original,name:'Déborah\n& João',password:'ignored'}).name,'Déborah & João');assert.equal('password' in normalizePricingDraft({...original,password:'ignored'}),false);
});
test('copied budget contains the estimate, materials, profit and formula with Brazilian currency',()=>{
  const r=calculatePricing(pricingExample()),text=pricingQuoteText(r);
  for(const phrase of ['2.000 pontos','20 pontos/minuto','2 h','80 m','Embalagem: '+pricingMoney(2),'Preço sugerido: '+pricingMoney(62.5),'Lucro estimado: '+pricingMoney(12.5),'1 - margem / 100','Valor para 1 peça'])assert.ok(text.includes(phrase),phrase);
  assert.equal(pricingDuration(60), '1 h');assert.equal(pricingDuration(.2),'1 min');assert.equal(pricingDuration(120.01),'2 h 1 min');assert.throws(()=>pricingQuoteText({ok:false}));
});
test('budget PDFs are A4, paginate long material lists and keep vector lettering inside the page',()=>{
  const long={...pricingExample(),name:'Amigurumi com acessórios e embalagem personalizada para presente especial',materials:Array.from({length:20},(_,i)=>({name:(i+1)+'. Material de acabamento com descrição e acentuação à mão',cost:2.75}))};
  for(const input of [pricingExample(),long]){
    const r=calculatePricing(input),model=createPricingReportModel(r),pdf=Buffer.from(createPricingPDF(r)).toString('latin1');
    assert.equal(model.pages.length,input===long?2:1);assert.equal((pdf.match(/\/Type \/Page\b/g)||[]).length,model.pages.length);assert.equal((pdf.match(/\/MediaBox \[0 0 595\.275/g)||[]).length,model.pages.length);
    const texts=[];
    for(const page of model.pages){
      const nodes=page.placements[0].piece.nodes;for(const node of nodes){if(node.textContent)texts.push(node.textContent);if(!node.textContent)continue;
        for(const glyph of node.children){const [a,,c,d,e,f]=glyph.transform;for(const cmd of glyph.children[0].commands)for(let i=1;i<cmd.length;i+=2){const x=a*cmd[i]+c*cmd[i+1]+e,y=d*cmd[i+1]+f;assert.ok(x>=11&&x<=199.01,'horizontal text bounds');assert.ok(y>=15&&y<=287,'vertical text bounds');}}
      }
    }
    assert.ok(texts.includes(pricingMoney(r.priceCents/100)));assert.ok(texts.includes('Custo total de produção'));assert.ok(texts.includes('Lucro estimado'));assert.ok(!pdf.includes('NaN'));assert.ok(!pdf.includes('Infinity'));
  }
});
test('unsupported decorative characters are reported during PDF export without invalidating the calculation',()=>{
  const r=calculatePricing({...pricingExample(),name:'Coelhinho 🧸'});assert.equal(r.ok,true);assert.throws(()=>createPricingPDF(r),/não contém/);assert.ok(pricingQuoteText(r).includes('🧸'));
});
