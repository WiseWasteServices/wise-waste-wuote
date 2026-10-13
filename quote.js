
(function(){
const root=document.getElementById('ww-quote');
if(!root || root.dataset.ready) return;
root.dataset.ready='1';

const $=id=>root.querySelector('#'+id);
const money=n=>n.toLocaleString('en-US',{style:'currency',currency:'USD'});
const number=id=>Math.max(1,Math.min(20,parseInt($(id).value,10)||1));
const show=(id,yes)=>$(id).classList.toggle('ww-hidden',!yes);
const lines=$('ww-price-lines');

let previousDogFrequency=$('ww-dog-frequency').value;
let freshBeforeRecurring=false;

/* Tracks whether the initial cleanup was automatically selected by dog service. */
let initialAddedByDogFrequency=false;

/* Tracks the previous litter frequency for any future dependent behavior. */
let previousLitterFrequency=$('ww-litter-frequency').value;

function line(label,price){
return '<div class="ww-line"><span>'+label+'</span><strong>'+price+'</strong></div>';
}

function calculate(){
const dogFreq=$('ww-dog-frequency').value;
const recurringDog=dogFreq!=='none';

/* When dog service is first selected, remember the customer's Yard Fresh choice. */
if(recurringDog && previousDogFrequency==='none'){
freshBeforeRecurring=$('ww-fresh').checked;

/* Automatically add initial cleanup when dog waste service is selected. */
initialAddedByDogFrequency=!$('ww-initial').checked;
$('ww-initial').checked=true;
}

/* When dog service is removed, undo the automatic initial cleanup selection. */
if(!recurringDog && previousDogFrequency!=='none'){
if(initialAddedByDogFrequency){
$('ww-initial').checked=false;
}
initialAddedByDogFrequency=false;

/* Restore the Yard Fresh choice the customer had before dog service was selected. */
$('ww-fresh').checked=freshBeforeRecurring;
}

/* Keep initial cleanup locked while recurring dog service is active. */
$('ww-initial').disabled=recurringDog;

/* Yard Fresh Treatment is included free with recurring dog service. */
$('ww-fresh').disabled=recurringDog;
$('ww-fresh-choice').classList.toggle('ww-disabled',recurringDog);

if(recurringDog){
$('ww-fresh').checked=true;
$('ww-fresh-title').textContent='Yard Fresh Treatment — FREE';
$('ww-fresh-description').textContent='Included free with your recurring dog waste service. No additional charge.';
}else{
$('ww-fresh-title').textContent='Add Yard Fresh Treatment';
$('ww-fresh-description').textContent='$15 for the first yard section, plus $5 per additional section';
}

/* The litter-box deep clean remains an independent optional one-time add-on.
   Toggling it immediately updates the first-service price. */

const dogs=number('ww-dogs');
const litterFreq=$('ww-litter-frequency').value;
const boxes=number('ww-boxes');
const deepClean=$('ww-deep-clean').checked;
const deepBoxes=number('ww-deep-boxes');
const initial=$('ww-initial').checked;
const condition=$('ww-condition').value;
const fresh=$('ww-fresh').checked;
const sections=number('ww-sections');

show('ww-dog-count-wrap',recurringDog);
show('ww-box-count-wrap',litterFreq!=='none');
show('ww-initial-details',initial);
show('ww-deep-clean-details',deepClean);
show('ww-fresh-details',fresh && !recurringDog);

let dogPrice=0,catPrice=0,oneTime=0;
let items=[],notes=[],hasCustomOneTime=false;
let dogBilling='No dog waste service selected';
let catBilling='No litter-box service selected';

/* Dog recurring pricing */
if(dogFreq==='weekly'){
dogPrice=15+3*(dogs-1);
dogBilling='Billed weekly';
}else if(dogFreq==='twice'){
dogPrice=25+5*(dogs-1);
dogBilling='Billed weekly · service twice per week';
}else if(dogFreq==='biweekly'){
dogPrice=25+5*(dogs-1);
dogBilling='Billed every other week';
}

/* Cat litter recurring pricing */
if(litterFreq==='weekly'){
catPrice=15+5*(boxes-1);
catBilling='Billed weekly';
}else if(litterFreq==='twice'){
catPrice=25+10*(boxes-1);
catBilling='Billed weekly · service twice per week';
}

/* One-time litter box deep clean */
if(deepClean){
let p;
if(deepBoxes===1){
p=25;
}else if(deepBoxes===2){
p=40;
}else{
p=40+15*(deepBoxes-2);
}
oneTime+=p;
items.push(line('Litter-box deep clean · '+deepBoxes+' box'+(deepBoxes===1?'':'es'),money(p)));
}

/* Initial cleanup */
if(initial){
if(condition==='light'){
oneTime+=50;
items.push(line('Initial cleanup · light',money(50)));
}else if(condition==='moderate'){
oneTime+=60;
items.push(line('Initial cleanup · moderate estimate','$60–$75'));
notes.push('Moderate cleanup is estimated at $60–$75. The first-service total uses the $60 starting estimate.');
}else if(condition==='heavy'){
oneTime+=75;
items.push(line('Initial cleanup · heavy estimate','$75–$125+'));
notes.push('Heavy cleanup is estimated at $75–$125+. The first-service total uses the $75 starting estimate.');
}else{
hasCustomOneTime=true;
items.push(line('Initial cleanup','Custom quote'));
notes.push('Your first-service total does not include a dollar amount for the initial cleanup. Please confirm the price based on your yard condition.');
}
}

/* Paid Yard Fresh Treatment applies when recurring dog service is not selected. */
if(fresh && !recurringDog){
const p=15+5*(sections-1);
oneTime+=p;
items.push(line('Yard Fresh Treatment · '+sections+' section'+(sections===1?'':'s'),money(p)));
}else if(recurringDog){
items.push(line('Yard Fresh Treatment','FREE — included with recurring dog service'));
}

/* Cat litter-box service is included in the first-service total and ongoing pricing. */
if(litterFreq!=='none'){
items.push(line(
'Litter-box cleaning · '+boxes+' box'+(boxes===1?'':'es')+' · '+(litterFreq==='weekly'?'weekly':'twice weekly'),
money(catPrice)+'/week'
));
}

/* First-service total includes one-time services and the first cat litter service charge.
   Dog waste recurring charges remain separate. */
const firstTotal=oneTime+catPrice;

$('ww-first-total').textContent=money(firstTotal);
$('ww-first-total-note').textContent=hasCustomOneTime
?'Plus any custom-quoted services not yet priced.'
:'Includes one-time services and the first cat litter-box service charge. Dog waste recurring charges are shown separately.';

$('ww-dog-total').textContent=recurringDog
?money(dogPrice)+(dogFreq==='biweekly'?'/visit':'/week')
:'$0.00';
$('ww-dog-billing').textContent=dogBilling;

$('ww-cat-total').textContent=litterFreq==='none'?'$0.00':money(catPrice)+'/week';
$('ww-cat-billing').textContent=catBilling;

lines.innerHTML=items.length
?items.join('')
:'<p class="ww-muted" style="margin-top:12px">Select a service above to see your estimated price.</p>';

show('ww-estimate-note',notes.length>0);
$('ww-estimate-note').textContent=notes.join(' ');

previousDogFrequency=dogFreq;
previousLitterFrequency=litterFreq;
}

$('ww-res-tab').addEventListener('click',()=>{
show('ww-residential',true);
show('ww-commercial',false);
$('ww-res-tab').setAttribute('aria-pressed','true');
$('ww-com-tab').setAttribute('aria-pressed','false');
});

$('ww-com-tab').addEventListener('click',()=>{
show('ww-residential',false);
show('ww-commercial',true);
$('ww-res-tab').setAttribute('aria-pressed','false');
$('ww-com-tab').setAttribute('aria-pressed','true');
});

root.querySelectorAll('#ww-residential input,#ww-residential select').forEach(el=>el.addEventListener('input',calculate));

root.querySelectorAll('#ww-residential [data-step]').forEach(btn=>btn.addEventListener('click',()=>{
const field=$(btn.dataset.target);
const min=parseInt(field.min,10)||1;
const max=parseInt(field.max,10)||20;
field.value=Math.max(min,Math.min(max,(parseInt(field.value,10)||min)+parseInt(btn.dataset.step,10)));
calculate();
}));

calculate();
})();
