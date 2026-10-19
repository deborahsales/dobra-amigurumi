/* Local estimates for one finished amigurumi. Money is calculated in cents. */
export const PRICING_FIELDS = Object.freeze([
  {key:'stitches',label:'Quantidade de pontos',min:1,max:1e9,integer:true},
  {key:'stitchesPerMinute',label:'Pontos por minuto',min:0,max:1e6,positive:true},
  {key:'cmPerTenStitches',label:'Fio usado em 10 pontos',min:0,max:1e6,positive:true},
  {key:'hourlyRate',label:'Valor da hora',min:0,max:1e6},
  {key:'yarnLength',label:'Metragem do novelo',min:0,max:1e6,positive:true},
  {key:'yarnPrice',label:'Preço do novelo',min:0,max:1e6},
  {key:'extraMinutes',label:'Tempo de montagem e acabamento',min:0,max:1e6,optional:true},
  {key:'profitMargin',label:'Margem de lucro',min:0,max:100,exclusiveMax:true},
]);
export const MAX_PRICING_MATERIALS = 20;
const pricingString = value => typeof value==='string'||typeof value==='number'?String(value):'';

export function newPricingDraft() {
  return {name:'',stitches:'',stitchesPerMinute:'',cmPerTenStitches:'',hourlyRate:'',yarnLength:'',yarnPrice:'',extraMinutes:'0',profitMargin:'',materials:[
    {name:'Enchimento',cost:''},{name:'Olhos e acessórios',cost:''},{name:'Embalagem',cost:''},{name:'Outros custos',cost:''},
  ]};
}
export function normalizePricingDraft(input={}) {
  if(!input||typeof input!=='object'||Array.isArray(input))return newPricingDraft();
  const draft=newPricingDraft();
  draft.name=pricingString(input.name).normalize('NFC').replace(/[\r\n\t]/g,' ').slice(0,80);
  for(const {key}of PRICING_FIELDS)if(Object.hasOwn(input,key))draft[key]=pricingString(input[key]).slice(0,40);
  if(Array.isArray(input.materials))draft.materials=input.materials.slice(0,MAX_PRICING_MATERIALS+1).map(m=>({name:pricingString(m?.name).normalize('NFC').replace(/[\r\n\t]/g,' ').slice(0,60),cost:pricingString(m?.cost).slice(0,40)}));
  return draft;
}
export function pricingExample() {
  return normalizePricingDraft({name:'Coelhinho - exemplo',stitches:2000,stitchesPerMinute:20,cmPerTenStitches:40,hourlyRate:15,yarnLength:160,yarnPrice:20,extraMinutes:20,profitMargin:20,materials:[{name:'Enchimento',cost:5},{name:'Olhos e acessórios',cost:3},{name:'Embalagem',cost:2}]});
}
export function parsePricingNumber(value,integer=false) {
  if(typeof value==='number')return Number.isFinite(value)?value:NaN;
  if(typeof value!=='string'||!value.trim())return NaN;
  let s=value.trim().replace(/\s/g,'');
  if(s.includes(',')){
    if(!/^[+-]?(?:\d+|\d{1,3}(?:\.\d{3})+),\d*$/.test(s))return NaN;
    s=s.replace(/\./g,'').replace(',','.');
  }else if(integer&&/^[+-]?\d{1,3}(?:\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
  else if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return NaN;
  const n=Number(s);return Number.isFinite(n)?n:NaN;
}
export function pricingMoney(value) {
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
}
export function pricingNumber(value,maximumFractionDigits=2) {
  return new Intl.NumberFormat('pt-BR',{maximumFractionDigits}).format(value);
}
export function pricingDuration(minutes) {
  const rounded=Math.ceil(minutes-1e-9),hours=Math.floor(rounded/60),rest=rounded%60;
  return hours?(hours+' h'+(rest?' '+rest+' min':'')):rounded+' min';
}
const pricingCents = value => {const [base,exponent='0']=String(value).split('e');return Math.round(Number(base+'e'+(Number(exponent)+2)));};

export function calculatePricing(input={}) {
  const draft=normalizePricingDraft(input),values={},errors=[];
  for(const spec of PRICING_FIELDS){
    const raw=draft[spec.key].trim(),n=spec.optional&&!raw?0:parsePricingNumber(raw,spec.integer);
    values[spec.key]=n;
    let message='';
    if(!raw&&!spec.optional)message='Informe '+spec.label.toLowerCase()+'.';
    else if(!Number.isFinite(n))message='Use um número válido, como 12 ou 12,5.';
    else if(spec.integer&&!Number.isSafeInteger(n))message='Informe uma quantidade inteira de pontos.';
    else if(n<spec.min||spec.positive&&n===0)message=spec.positive||spec.min>0?'O valor precisa ser maior que zero.':'O valor não pode ser negativo.';
    else if(n>spec.max||spec.exclusiveMax&&n===spec.max)message=spec.key==='profitMargin'?'A margem precisa ser de 0% até menos de 100%.':'O valor informado está acima do limite de cálculo.';
    if(message)errors.push({field:spec.key,message});
  }
  if(draft.materials.length>MAX_PRICING_MATERIALS)errors.push({field:'materials',message:'Use até '+MAX_PRICING_MATERIALS+' materiais e custos.'});
  const materials=draft.materials.map((m,i)=>{
    const amount=m.cost.trim()?parsePricingNumber(m.cost):0;
    if(!Number.isFinite(amount)||amount<0||amount>1e6)errors.push({field:'material-'+i,message:'Informe um custo de R$ 0 até R$ 1.000.000.'});
    return {name:m.name.trim()||'Material '+(i+1),costCents:pricingCents(amount)};
  });
  if(errors.length)return {ok:false,draft,errors};
  const crochetMinutes=values.stitches/values.stitchesPerMinute,totalMinutes=crochetMinutes+values.extraMinutes;
  const yarnMeters=values.stitches*values.cmPerTenStitches/1000;
  const laborCents=pricingCents(totalMinutes/60*values.hourlyRate),yarnCents=pricingCents(yarnMeters/values.yarnLength*values.yarnPrice);
  const materialsCents=materials.reduce((sum,m)=>sum+m.costCents,0),costCents=laborCents+yarnCents+materialsCents;
  // This is margin on the selling price, not an addition to production cost.
  const priceCents=Math.ceil(costCents/(1-values.profitMargin/100)-1e-8),profitCents=priceCents-costCents;
  if(![costCents,priceCents].every(Number.isSafeInteger)||!Number.isFinite(totalMinutes)||!Number.isFinite(yarnMeters))return {ok:false,draft,errors:[{field:'total',message:'Esses valores ultrapassam o limite de cálculo. Confira os números informados.'}]};
  if(costCents===0)return {ok:false,draft,errors:[{field:'total',message:'Informe ao menos um custo maior que zero para calcular o preço da peça.'}]};
  return {ok:true,draft,errors:[],values,name:draft.name.trim()||'Meu amigurumi',materials:materials.filter(m=>m.costCents>0),crochetMinutes,totalMinutes,yarnMeters,yarnSkeins:yarnMeters/values.yarnLength,laborCents,yarnCents,materialsCents,costCents,priceCents,profitCents,effectiveMargin:profitCents/priceCents*100};
}
export function pricingQuoteText(result) {
  if(!result?.ok)throw new Error('Complete os dados para gerar o orçamento.');
  const r=result,v=r.values,lines=[
    'Dobra Ateliê | Orçamento de amigurumi',r.name,'Valor para 1 peça','',
    'Preço sugerido: '+pricingMoney(r.priceCents/100),'',
    'Receita: '+pricingNumber(v.stitches,0)+' pontos',
    'Ritmo: '+pricingNumber(v.stitchesPerMinute)+' pontos/minuto',
    'Crochê: '+pricingDuration(r.crochetMinutes),
    'Montagem e acabamento: '+pricingDuration(v.extraMinutes),
    'Tempo total estimado: '+pricingDuration(r.totalMinutes),
    'Fio estimado: '+pricingNumber(r.yarnMeters)+' m ('+pricingNumber(v.cmPerTenStitches)+' cm para 10 pontos)',
    'Novelo: '+pricingNumber(v.yarnLength)+' m por '+pricingMoney(v.yarnPrice),
    'Hora de trabalho: '+pricingMoney(v.hourlyRate),'',
    'Mão de obra: '+pricingMoney(r.laborCents/100),
    'Fio consumido: '+pricingMoney(r.yarnCents/100),
    ...r.materials.map(m=>m.name+': '+pricingMoney(m.costCents/100)),
    'Custo total: '+pricingMoney(r.costCents/100),
    'Lucro estimado: '+pricingMoney(r.profitCents/100),
    'Margem escolhida sobre a venda: '+pricingNumber(v.profitMargin)+'%','',
    'Preço = custo total / (1 - margem / 100). Arredondado para cima ao centavo.',
    'Estimativa com base no ritmo e no consumo informados. O fio é cobrado pelo consumo proporcional.',
  ];
  return lines.join('\n');
}
