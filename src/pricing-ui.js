import { PRICING_FIELDS, MAX_PRICING_MATERIALS, newPricingDraft, normalizePricingDraft, pricingExample, calculatePricing, pricingMoney, pricingNumber, pricingDuration, pricingQuoteText } from './pricing.js';
import { createPricingPDF } from './pricing-pdf.js';

export function initPricing({toast,downloadBytes,onBoxShown=()=>{}}) {
  const p$=selector=>document.querySelector(selector),form=p$('#pricing-form'),storage='dobra-atelie-pricing-v1';
  const pEscape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let draft=newPricingDraft(),showErrors=false,result;
  try{const saved=JSON.parse(localStorage.getItem(storage));if(saved)draft=normalizePricingDraft(saved);}catch{}
  function activateTool(tool,changeURL=false){
    const pricing=tool==='pricing';p$('#box-tool').hidden=pricing;p$('#pricing-tool').hidden=!pricing;
    for(const button of document.querySelectorAll('[data-tool-target]')){
      const active=button.dataset.toolTarget===(pricing?'pricing':'box');
      if(button.getAttribute('role')==='tab'){button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
      else{button.classList.toggle('nav-active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
    }
    const skip=p$('.skip-link');skip.href=pricing?'#pricing-form':'#configurador';skip.textContent=pricing?'Ir para a precificação':'Ir para o criador de caixas';
    if(changeURL){const hash=pricing?'#precificacao':'#configurador';if(location.hash!==hash)history.pushState(null,'',hash);}
    if(!pricing)requestAnimationFrame(onBoxShown);
  }
  for(const control of document.querySelectorAll('[data-tool-target]'))control.addEventListener('click',event=>{event.preventDefault();activateTool(control.dataset.toolTarget,true);});
  p$('.tool-navigation').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const current=p$('#tool-pricing').getAttribute('aria-selected')==='true',tool=event.key==='Home'?'box':event.key==='End'?'pricing':current?'box':'pricing';activateTool(tool,true);p$('#tool-'+tool).focus();
  });
  const fromURL=()=>activateTool(location.hash==='#precificacao'||location.hash==='#pricing-form'?'pricing':'box');
  window.addEventListener('hashchange',fromURL);window.addEventListener('popstate',fromURL);

  function renderMaterials(){
    p$('#pricing-materials').innerHTML=draft.materials.map((m,i)=>`<div class="pricing-material-row"><label for="pricing-material-name-${i}"><span class="sr-only">Nome do material ${i+1}</span><input id="pricing-material-name-${i}" data-material-name="${i}" type="text" maxlength="60" value="${pEscape(m.name)}" placeholder="Ex.: fita, etiqueta, enchimento"></label><label for="pricing-material-cost-${i}"><span class="sr-only">Custo do material ${i+1} em reais</span><span class="pricing-input-unit"><span>R$</span><input id="pricing-material-cost-${i}" data-material-cost="${i}" type="text" inputmode="decimal" maxlength="20" value="${pEscape(m.cost)}" placeholder="0,00" aria-describedby="pricing-error-material-${i}"></span></label><button type="button" class="pricing-remove" data-remove-material="${i}" aria-label="Remover material ${i+1}">×</button><span class="pricing-field-error" id="pricing-error-material-${i}" hidden></span></div>`).join('');
    p$('#pricing-add-material').disabled=draft.materials.length>=MAX_PRICING_MATERIALS;
  }
  function fillForm(){
    p$('#pricing-name').value=draft.name;for(const {key}of PRICING_FIELDS)p$('#pricing-'+key).value=draft[key];renderMaterials();
  }
  function readPricingForm(){
    return normalizePricingDraft({name:p$('#pricing-name').value,...Object.fromEntries(PRICING_FIELDS.map(({key})=>[key,p$('#pricing-'+key).value])),materials:[...p$('#pricing-materials').querySelectorAll('.pricing-material-row')].map(row=>({name:row.querySelector('[data-material-name]').value,cost:row.querySelector('[data-material-cost]').value}))});
  }
  function renderPricing(){
    draft=readPricingForm();result=calculatePricing(draft);try{localStorage.setItem(storage,JSON.stringify(draft));}catch{}
    p$('#pricing-copy-fallback').hidden=true;p$('#pricing-copy-fallback').value='';
    for(const error of form.querySelectorAll('.pricing-field-error')){error.hidden=true;error.textContent='';}
    for(const input of form.querySelectorAll('[aria-invalid]'))input.removeAttribute('aria-invalid');
    const visibleErrors=result.errors.filter(e=>showErrors||e.field.startsWith('material-')&&draft.materials[Number(e.field.slice(9))]?.cost.trim()||PRICING_FIELDS.some(f=>f.key===e.field&&draft[f.key].trim()));
    const globalErrors=[];
    for(const error of visibleErrors){
      const id=error.field.startsWith('material-')?'pricing-material-cost-'+error.field.slice(9):'pricing-'+error.field;
      const field=p$('#'+id),note=p$('#pricing-error-'+error.field);
      if(field)field.setAttribute('aria-invalid','true');
      if(note){note.hidden=false;note.textContent=error.message;}else globalErrors.push(error.message);
    }
    p$('#pricing-errors').hidden=!globalErrors.length;p$('#pricing-errors').textContent=globalErrors.join(' ');
    p$('#pricing-empty').hidden=result.ok;p$('#pricing-results').hidden=!result.ok;
    p$('#pricing-download').disabled=!result.ok;p$('#pricing-copy').disabled=!result.ok;
    if(!result.ok){p$('#pricing-status').textContent=showErrors?'Confira os campos indicados para calcular o orçamento.':'Complete os dados para ver o orçamento.';return;}
    const r=result;
    p$('#pricing-piece-name').textContent=r.name;p$('#pricing-price').textContent=pricingMoney(r.priceCents/100);
    p$('#pricing-total-time').textContent=pricingDuration(r.totalMinutes);p$('#pricing-crochet-time').textContent=pricingDuration(r.crochetMinutes);p$('#pricing-finish-time').textContent=pricingDuration(r.values.extraMinutes);
    p$('#pricing-yarn-use').textContent=pricingNumber(r.yarnMeters)+' m';p$('#pricing-yarn-share').textContent=pricingNumber(r.yarnSkeins)+' novelo(s) equivalente(s) em fio consumido';
    p$('#pricing-labor-total').textContent=pricingMoney(r.laborCents/100);p$('#pricing-yarn-total').textContent=pricingMoney(r.yarnCents/100);p$('#pricing-materials-total').textContent=pricingMoney(r.materialsCents/100);p$('#pricing-cost-total').textContent=pricingMoney(r.costCents/100);p$('#pricing-profit-total').textContent=pricingMoney(r.profitCents/100);p$('#pricing-margin-total').textContent=pricingNumber(r.values.profitMargin)+'% sobre a venda';
    p$('#pricing-material-breakdown').innerHTML=r.materials.map(m=>'<li><span>'+pEscape(m.name)+'</span><strong>'+pricingMoney(m.costCents/100)+'</strong></li>').join('');
    p$('#pricing-material-detail').hidden=!r.materials.length;
    p$('#pricing-formula').textContent=pricingMoney(r.costCents/100)+' ÷ (1 − '+pricingNumber(r.values.profitMargin)+' / 100) = '+pricingMoney(r.priceCents/100);
    p$('#pricing-status').textContent='Orçamento atualizado. Preço sugerido para uma peça: '+pricingMoney(r.priceCents/100)+'.';
  }
  form.addEventListener('input',renderPricing);
  form.addEventListener('submit',event=>{event.preventDefault();showErrors=true;renderPricing();if(!result.ok){const first=form.querySelector('[aria-invalid="true"]');if(first)first.focus();else p$('#pricing-errors').focus();}else toast('Orçamento atualizado com os seus dados.');});
  p$('#pricing-add-material').addEventListener('click',()=>{draft=readPricingForm();if(draft.materials.length>=MAX_PRICING_MATERIALS)return;draft.materials.push({name:'',cost:''});renderMaterials();renderPricing();p$('#pricing-material-name-'+(draft.materials.length-1)).focus();});
  p$('#pricing-materials').addEventListener('click',event=>{const button=event.target.closest('[data-remove-material]');if(!button)return;draft=readPricingForm();const index=Number(button.dataset.removeMaterial);draft.materials.splice(index,1);renderMaterials();renderPricing();const next=p$('#pricing-material-name-'+Math.min(index,draft.materials.length-1));(next||p$('#pricing-add-material')).focus();});
  p$('#pricing-example').addEventListener('click',()=>{draft=pricingExample();showErrors=false;fillForm();renderPricing();toast('Exemplo preenchido. Substitua pelos seus dados antes de usar o orçamento.');});
  p$('#pricing-reset').addEventListener('click',()=>{draft=newPricingDraft();showErrors=false;fillForm();renderPricing();p$('#pricing-name').focus();toast('Precificação limpa. Vamos calcular outra peça.');});
  p$('#pricing-download').addEventListener('click',()=>{
    renderPricing();if(!result.ok)return;
    try{const name=result.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'amigurumi';downloadBytes(createPricingPDF(result),'orcamento-'+name+'.pdf','application/pdf');toast('Orçamento em PDF pronto, com custos e lucro detalhados.');}catch(error){toast(error.message);}
  });
  p$('#pricing-copy').addEventListener('click',async()=>{
    renderPricing();if(!result.ok)return;const text=pricingQuoteText(result);
    try{await navigator.clipboard.writeText(text);toast('Cálculo copiado com a composição do preço.');}
    catch{const field=p$('#pricing-copy-fallback');field.value=text;field.hidden=false;field.focus();field.select();field.setSelectionRange(0,text.length);let copied=false;try{copied=document.execCommand('copy');}catch{}if(copied){field.hidden=true;toast('Cálculo copiado.');}else toast('Cálculo selecionado. Use a opção Copiar do seu navegador.');}
  });
  fillForm();renderPricing();fromURL();
}
