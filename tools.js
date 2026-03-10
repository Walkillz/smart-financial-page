var D=document.getElementById.bind(document);
var V=function(id){return parseFloat(D(id).value)||0};
var fmt=function(n){return n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0})};
var fmt2=function(n){return n.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2})};
var fmtPct=function(n){return n.toFixed(1)+"%"};
function pmt(rate,nper,pv){if(rate===0)return pv/nper;return pv*rate*Math.pow(1+rate,nper)/(Math.pow(1+rate,nper)-1)}
function monthName(offset){var d=new Date();d.setMonth(d.getMonth()+offset);return d.toLocaleDateString("en-US",{month:"short",year:"numeric"})}

try{var lead=JSON.parse(sessionStorage.getItem("tsf_lead"));if(lead&&lead.firstName){D("userName").textContent=lead.firstName;D("welcomeTitle").textContent=lead.firstName+", Your Financial Toolkit"}}catch(e){}

function calcLoan(){
  var P=V("lp-amount"),r=V("lp-rate")/100/12,n=V("lp-term")*12;
  if(P<=0||n<=0)return;var m=pmt(r,n,P);var total=m*n;
  D("lp-monthly").textContent=fmt2(m);D("lp-total").textContent=fmt(total);
  D("lp-interest").textContent=fmt(total-P);D("lp-ratio").textContent=fmtPct((total-P)/P*100);
  var tbody=D("lp-amort-body");tbody.innerHTML="";
  var bal=P,yP=0,yI=0;
  for(var i=1;i<=n;i++){var ip=bal*r;var pp=m-ip;bal-=pp;yP+=pp;yI+=ip;
    if(i%12===0||i===n){var row=tbody.insertRow();row.innerHTML="<td>"+Math.ceil(i/12)+"</td><td>"+fmt(yP)+"</td><td>"+fmt(yI)+"</td><td>"+fmt(Math.max(bal,0))+"</td>";yP=0;yI=0}}
}
function toggleAmort(){var w=D("lp-amort-wrap");w.style.display=w.style.display==="none"?"block":"none"}

function calcCC(){
  var bal=V("cc-balance"),apr=V("cc-apr")/100,payment=V("cc-payment");
  var mr=apr/12,months=0,totalInt=0;
  if(payment<=bal*mr){D("cc-months").textContent="Never";D("cc-date").textContent="Payment too low!";D("cc-total-interest").textContent="Infinite";D("cc-total-paid").textContent="Infinite";return}
  var b=bal;while(b>0.01&&months<600){var interest=b*mr;totalInt+=interest;b=b+interest-Math.min(payment,b+interest);months++}
  D("cc-months").textContent=months;D("cc-date").textContent=monthName(months);
  D("cc-total-interest").textContent=fmt2(totalInt);D("cc-total-paid").textContent=fmt2(bal+totalInt);
  var bMin=bal,mMin=0,intMin=0;
  while(bMin>0.01&&mMin<600){var i2=bMin*mr;intMin+=i2;var mp=Math.max(25,bMin*0.02);bMin=bMin+i2-Math.min(mp,bMin+i2);mMin++}
  var saved=intMin-totalInt;
  if(saved>0){D("cc-savings").style.display="block";D("cc-savings-amount").textContent=fmt(saved)}else{D("cc-savings").style.display="none"}
}

function calcAPR(){
  var aA=V("apr-a-amt"),aR=V("apr-a-rate")/100/12,aT=V("apr-a-term"),aF=V("apr-a-fees");
  var bA=V("apr-b-amt"),bR=V("apr-b-rate")/100/12,bT=V("apr-b-term"),bF=V("apr-b-fees");
  var aP=pmt(aR,aT,aA),bP=pmt(bR,bT,bA);var aTot=aP*aT+aF,bTot=bP*bT+bF;
  D("apr-a-total").textContent=fmt(aTot);D("apr-b-total").textContent=fmt(bTot);
  D("apr-a-monthly").textContent=fmt2(aP);D("apr-b-monthly").textContent=fmt2(bP);
  var diff=Math.abs(aTot-bTot);
  if(aTot<bTot){D("apr-winner").textContent="Offer A saves "+fmt(diff);D("apr-winner").style.color="var(--green)"}
  else if(bTot<aTot){D("apr-winner").textContent="Offer B saves "+fmt(diff);D("apr-winner").style.color="var(--green)"}
  else{D("apr-winner").textContent="Both offers cost the same"}
}

function calcCashAdv(){
  var amt=V("ca-amount"),apr=V("ca-apr")/100,feePct=V("ca-fee")/100,days=V("ca-days");
  var upfront=amt*feePct;var interest=amt*(apr/365)*days;var total=upfront+interest;
  var effAPR=(total/amt)*(365/days)*100;
  D("ca-total").textContent=fmt2(total);D("ca-upfront").textContent=fmt2(upfront);
  D("ca-interest").textContent=fmt2(interest);D("ca-repay").textContent=fmt2(amt+total);
  var badge=effAPR>50?"badge-bad":effAPR>25?"badge-warn":"badge-good";
  D("ca-effective").innerHTML='<span class="'+badge+'">'+fmtPct(effAPR)+'</span>';
}

function calcPayAdv(){
  var amt=V("pa-amount"),fee=V("pa-fee"),days=V("pa-days"),sub=V("pa-sub");
  var totalCost=fee+sub;var pct=(totalCost/amt)*100;
  var annAPR=(totalCost/amt)*(365/days)*100;var yearly=totalCost*(365/days);
  D("pa-total").textContent=fmt2(totalCost);D("pa-pct").textContent=fmtPct(pct);
  var badge=annAPR>100?"badge-bad":annAPR>36?"badge-warn":"badge-good";
  D("pa-apr").innerHTML='<span class="'+badge+'">'+fmtPct(annAPR)+'</span>';
  D("pa-yearly").textContent=fmt2(yearly);D("pa-warning").textContent=fmt2(yearly)+"/yr";
}

function addDebt(){var list=D("debt-list");var entry=document.createElement("div");entry.className="debt-entry";entry.innerHTML='<div class="fg"><label>Name</label><input type="text" value="New Debt"/></div><div class="fg"><label>Balance</label><input type="number" value="1000" min="0"/></div><div class="fg"><label>APR %</label><input type="number" value="15" min="0" step="0.01"/></div><div class="fg"><label>Min Pay</label><input type="number" value="50" min="0"/></div><div><button class="btn-sm btn-remove" onclick="removeDebt(this)">X</button></div>';list.appendChild(entry)}
function removeDebt(btn){btn.closest(".debt-entry").remove()}
function getDebts(){var entries=document.querySelectorAll(".debt-entry");return Array.from(entries).map(function(e){var inp=e.querySelectorAll("input");return{balance:parseFloat(inp[1].value)||0,apr:parseFloat(inp[2].value)||0,minPay:parseFloat(inp[3].value)||0}})}
function simulatePayoff(debts,extra,sortFn){
  var list=debts.map(function(d){return{apr:d.apr,minPay:d.minPay,bal:d.balance}});
  var months=0,totalInterest=0;
  while(list.some(function(d){return d.bal>0.01})&&months<600){
    list.sort(sortFn);
    for(var i=0;i<list.length;i++){if(list[i].bal<=0)continue;var interest=list[i].bal*(list[i].apr/100/12);totalInterest+=interest;list[i].bal+=interest;var pay=Math.min(list[i].minPay,list[i].bal);list[i].bal-=pay}
    var extraLeft=extra;for(var j=0;j<list.length;j++){if(list[j].bal<=0||extraLeft<=0)continue;var p=Math.min(extraLeft,list[j].bal);list[j].bal-=p;extraLeft-=p}
    months++}
  var totalPaid=debts.reduce(function(s,d){return s+d.balance},0)+totalInterest;
  return{months:months,totalInterest:totalInterest,totalPaid:totalPaid}}
function calcDebtStrategy(){
  var debts=getDebts();var extra=V("debt-extra");
  var av=simulatePayoff(debts,extra,function(a,b){return b.apr-a.apr});
  var sb=simulatePayoff(debts,extra,function(a,b){return a.bal-b.bal});
  D("ds-av-months").textContent=av.months+" months";D("ds-av-interest").textContent=fmt(av.totalInterest);D("ds-av-total").textContent=fmt(av.totalPaid);
  D("ds-sb-months").textContent=sb.months+" months";D("ds-sb-interest").textContent=fmt(sb.totalInterest);D("ds-sb-total").textContent=fmt(sb.totalPaid);
  var diff=sb.totalInterest-av.totalInterest;var mDiff=sb.months-av.months;
  if(diff>0){D("ds-diff").innerHTML='<div class="amount">Avalanche saves '+fmt(diff)+'</div><div class="label">and pays off '+Math.abs(mDiff)+' month'+(Math.abs(mDiff)!==1?'s':'')+' sooner</div>'}
  else{D("ds-diff").innerHTML='<div class="amount">Both strategies cost about the same</div><div class="label">Snowball gives faster psychological wins</div>'}}

function calcRefi(){
  var bal=V("refi-balance");var oldR=V("refi-old-rate")/100/12,oldN=V("refi-old-term")*12;
  var newR=V("refi-new-rate")/100/12,newN=V("refi-new-term")*12;var costs=V("refi-costs");
  var oldPmt=pmt(oldR,oldN,bal);var newPmt=pmt(newR,newN,bal);
  var monthlySave=oldPmt-newPmt;var breakeven=monthlySave>0?Math.ceil(costs/monthlySave):0;
  var netSave=oldPmt*oldN-(newPmt*newN+costs);
  D("refi-monthly-save").textContent=fmt(monthlySave)+"/mo";D("refi-monthly-save").style.color=monthlySave>0?"var(--green)":"var(--red)";
  D("refi-old-pmt").textContent=fmt2(oldPmt);D("refi-new-pmt").textContent=fmt2(newPmt);
  D("refi-breakeven").textContent=breakeven+" months";D("refi-net-save").textContent=fmt(netSave)}

function calcDTI(){
  var income=V("dti-income");var debt=V("dti-housing")+V("dti-car")+V("dti-cc")+V("dti-student")+V("dti-other");
  var ratio=income>0?(debt/income)*100:0;
  D("dti-result").textContent=fmtPct(ratio);D("dti-total-debt").textContent=fmt(debt);D("dti-remaining").textContent=fmt(income-debt);
  var bar=D("dti-bar");bar.style.width=Math.min(ratio,100)+"%";
  if(ratio<=36){D("dti-badge").innerHTML='<span class="badge-good">Excellent - you qualify for most loans</span>';bar.style.background="var(--green)"}
  else if(ratio<=43){D("dti-badge").innerHTML='<span class="badge-warn">Moderate - some lenders may hesitate</span>';bar.style.background="var(--orange)"}
  else{D("dti-badge").innerHTML='<span class="badge-bad">High - most lenders will decline</span>';bar.style.background="var(--red)"}}

function calcEmergency(){
  var expenses=V("ef-expenses"),months=V("ef-months"),current=V("ef-current"),contrib=V("ef-contrib");
  var goal=expenses*months;var needed=Math.max(goal-current,0);
  var time=contrib>0?Math.ceil(needed/contrib):0;var pct=goal>0?(current/goal*100):0;
  D("ef-goal").textContent=fmt(goal);D("ef-needed").textContent=fmt(needed);
  D("ef-time").textContent=time+" months";D("ef-date").textContent=monthName(time);
  D("ef-bar").style.width=Math.min(pct,100)+"%";D("ef-pct").textContent=fmtPct(pct)+" funded"}

function calcLoanCompare(){
  var aA=V("lc-a-amt"),aR=V("lc-a-rate")/100/12,aN=V("lc-a-term");
  var bA=V("lc-b-amt"),bR=V("lc-b-rate")/100/12,bN=V("lc-b-term");
  var aP=pmt(aR,aN,aA),bP=pmt(bR,bN,bA);var aT=aP*aN,bT=bP*bN;
  D("lc-a-pmt").textContent=fmt2(aP);D("lc-b-pmt").textContent=fmt2(bP);
  D("lc-a-total").textContent=fmt(aT);D("lc-b-total").textContent=fmt(bT);
  D("lc-a-int").textContent=fmt(aT-aA);D("lc-b-int").textContent=fmt(bT-bA);
  var diff=Math.abs(aT-bT);
  if(aT<bT){D("lc-winner").textContent="Loan A saves "+fmt(diff);D("lc-winner").style.color="var(--green)"}
  else if(bT<aT){D("lc-winner").textContent="Loan B saves "+fmt(diff);D("lc-winner").style.color="var(--green)"}
  else{D("lc-winner").textContent="Both loans cost the same"}}

function calcBiweekly(){
  var P=V("bw-balance"),rate=V("bw-rate")/100,years=V("bw-term");
  var r=rate/12,n=years*12;var monthlyPmt=pmt(r,n,P);var biweeklyPmt=monthlyPmt/2;
  var totalMonthly=monthlyPmt*n;
  var biweeklyRate=rate/26;var bal=P,totalBW=0,periods=0;
  while(bal>0.01&&periods<26*40){var interest=bal*biweeklyRate;var pay=Math.min(biweeklyPmt,bal+interest);bal=bal+interest-pay;totalBW+=pay;periods++}
  var yearsNew=periods/26;var saved=totalMonthly-totalBW;
  D("bw-monthly").textContent=fmt2(monthlyPmt);D("bw-biweekly").textContent=fmt2(biweeklyPmt);
  D("bw-orig-payoff").textContent=years+" years";D("bw-new-payoff").textContent=yearsNew.toFixed(1)+" years";
  D("bw-time-saved").innerHTML='<span class="badge-good">'+(years-yearsNew).toFixed(1)+' years early</span>';
  D("bw-saved").textContent=fmt(Math.max(saved,0))}

function calcMinPay(){
  var bal=V("mp-balance"),apr=V("mp-apr")/100,pctMin=V("mp-pct")/100,floor=V("mp-floor");
  var mr=apr/12,months=0,totalInt=0,b=bal;
  while(b>0.01&&months<600){var interest=b*mr;totalInt+=interest;var minPay=Math.max(b*pctMin,floor);b=b+interest-Math.min(minPay,b+interest);months++}
  var totalPaid=bal+totalInt;
  D("mp-months").textContent=months>=600?"600+":months;
  D("mp-years").textContent=months>=600?"50+ years!":(months/12).toFixed(1)+" years!";
  D("mp-interest").textContent=fmt(totalInt);D("mp-total-paid").textContent=fmt(totalPaid);
  D("mp-multiplier").innerHTML='<span class="badge-bad">'+(totalPaid/bal).toFixed(1)+'x your balance</span>';
  var b2=bal,m2=0,int2=0,altPay=300;
  if(altPay>bal*mr){while(b2>0.01&&m2<600){var i2=b2*mr;int2+=i2;b2=b2+i2-Math.min(altPay,b2+i2);m2++}
  D("mp-alt-months").textContent=m2+" months | Save "+fmt(totalInt-int2)}
  else{D("mp-alt-months").textContent="Need higher payment"}}

function trackCalc(name){try{_scq.push(["track",{addTags:["used-"+name]}])}catch(e){}}

var calcSectionMap={"loan-calc":"loan_payment","cc-payoff":"credit_card_payoff","apr-reveal":"apr_revealer","cash-advance":"cash_advance","pay-advance":"pay_advance","debt-strategy":"debt_strategy","refinance":"refinance","dti":"dti","emergency":"emergency_fund","loan-compare":"loan_compare","biweekly":"biweekly","cc-minimum":"min_payment_trap"};

var calcResultFields={
  "loan_payment":[["calc_monthly_payment","lp-monthly"],["calc_total_of_payments","lp-total"],["calc_total_interest","lp-interest"],["calc_interest_to_loan_ratio","lp-ratio"]],
  "credit_card_payoff":[["calc_months_to_payoff","cc-months"],["calc_payoff_date","cc-date"],["calc_total_interest_paid","cc-total-interest"],["calc_total_amount_paid","cc-total-paid"],["calc_saved_vs_minimum","cc-savings-amount"]],
  "apr_revealer":[["calc_offer_a_total","apr-a-total"],["calc_offer_b_total","apr-b-total"],["calc_offer_a_monthly","apr-a-monthly"],["calc_offer_b_monthly","apr-b-monthly"],["calc_apr_total_difference","apr-winner"]],
  "cash_advance":[["calc_cash_advance_total_cost","ca-total"],["calc_cash_advance_upfront_fee","ca-upfront"],["calc_cash_advance_interest","ca-interest"],["calc_cash_advance_total_repay","ca-repay"],["calc_cash_advance_effective_apr","ca-effective"]],
  "pay_advance":[["calc_pay_advance_total_cost","pa-total"],["calc_pay_advance_cost_pct","pa-pct"],["calc_pay_advance_annualized_apr","pa-apr"],["calc_pay_advance_yearly_cost","pa-yearly"]],
  "debt_strategy":[["calc_avalanche_payoff_time","ds-av-months"],["calc_avalanche_total_interest","ds-av-interest"],["calc_avalanche_total_paid","ds-av-total"],["calc_snowball_payoff_time","ds-sb-months"],["calc_snowball_total_interest","ds-sb-interest"],["calc_snowball_total_paid","ds-sb-total"]],
  "refinance":[["calc_refi_monthly_savings","refi-monthly-save"],["calc_refi_current_payment","refi-old-pmt"],["calc_refi_new_payment","refi-new-pmt"],["calc_refi_break_even","refi-breakeven"],["calc_refi_net_savings","refi-net-save"]],
  "dti":[["calc_dti_ratio","dti-result"],["calc_dti_total_monthly_debt","dti-total-debt"],["calc_dti_remaining_after_debt","dti-remaining"]],
  "emergency_fund":[["calc_emergency_goal","ef-goal"],["calc_emergency_still_needed","ef-needed"],["calc_emergency_months_to_goal","ef-time"],["calc_emergency_target_date","ef-date"]],
  "loan_compare":[["calc_loan_a_monthly","lc-a-pmt"],["calc_loan_b_monthly","lc-b-pmt"],["calc_loan_a_total","lc-a-total"],["calc_loan_b_total","lc-b-total"],["calc_loan_a_interest","lc-a-int"],["calc_loan_b_interest","lc-b-int"],["calc_loan_total_difference","lc-winner"]],
  "biweekly":[["calc_biweekly_interest_saved","bw-saved"],["calc_biweekly_monthly_payment","bw-monthly"],["calc_biweekly_payment","bw-biweekly"],["calc_biweekly_original_payoff","bw-orig-payoff"],["calc_biweekly_new_payoff","bw-new-payoff"],["calc_biweekly_time_saved","bw-time-saved"]],
  "min_payment_trap":[["calc_min_trap_payoff_time","mp-months"],["calc_min_trap_total_interest","mp-interest"],["calc_min_trap_total_paid","mp-total-paid"],["calc_min_trap_interest_multiplier","mp-multiplier"]]
};

function stripVal(s){return s.replace(/[\$%,]/g,"").trim()}

function captureCalcResults(calcName){
  var fields=calcResultFields[calcName];
  if(!fields)return{};
  var result={};
  for(var i=0;i<fields.length;i++){
    var el=document.getElementById(fields[i][1]);
    if(el){var t=el.textContent.trim();if(t&&t!=="--")result[fields[i][0]]=stripVal(t)}
  }
  return result;
}

function sectionHasResults(section){
  var els=section.querySelectorAll(".result-big, .rv");
  return Array.from(els).some(function(el){var t=el.textContent.trim();return t&&t!=="--"});
}

document.querySelectorAll(".btn-calc").forEach(function(btn){
  if(btn.closest(".email-inline-form"))return;
  btn.addEventListener("click",function(){
    var section=btn.closest(".tool-section");
    if(!section)return;
    trackCalc(section.id);
    var calcName=calcSectionMap[section.id];
    if(!calcName)return;
    setTimeout(function(){
      if(sectionHasResults(section)){
        var reportBtn=section.querySelector('.btn-email-report[data-calc="'+calcName+'"]');
        if(reportBtn)reportBtn.style.display="block";
      }
    },0);
  });
});
calcLoan();calcCC();calcAPR();calcCashAdv();calcPayAdv();calcDebtStrategy();calcRefi();calcDTI();calcEmergency();calcLoanCompare();calcBiweekly();calcMinPay();

function getLeadEmail(){
  try{var lead=JSON.parse(sessionStorage.getItem("tsf_lead"));return lead&&lead.email?lead.email:null}catch(e){return null}
}
function validEmailAddr(e){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}

function sendEmailReport(email,calcName,btn){
  btn.disabled=true;btn.textContent="Sending...";
  var customFields={calculator_used:calcName};
  var results=captureCalcResults(calcName);
  for(var k in results){if(results.hasOwnProperty(k))customFields[k]=results[k]}
  function onSuccess(){btn.textContent="\u2705 Report sent!";btn.className="btn-email-report success"}
  function onFailure(){
    btn.textContent="Something went wrong \u2014 try again";btn.className="btn-email-report error";
    setTimeout(function(){btn.disabled=false;btn.textContent="\uD83D\uDCE7 Email my report";btn.className="btn-email-report"},3000);
  }
  function doIdentify(){
    if(typeof _scq==="object"&&typeof _scq.push==="function"&&_scq.push!==Array.prototype.push){
      _scq.push(["identify",{email:email,tags:["calculator:"+calcName],customFields:customFields,success:onSuccess,failure:onFailure}]);
    } else {
      var attempts=0;
      var check=setInterval(function(){
        attempts++;
        if(typeof _scq==="object"&&typeof _scq.push==="function"&&_scq.push!==Array.prototype.push){
          clearInterval(check);
          _scq.push(["identify",{email:email,tags:["calculator:"+calcName],customFields:customFields,success:onSuccess,failure:onFailure}]);
        } else if(attempts>=20){clearInterval(check);onFailure()}
      },250);
    }
  }
  doIdentify();
}

document.querySelectorAll(".btn-email-report").forEach(function(btn){
  btn.addEventListener("click",function(){
    var calcName=btn.getAttribute("data-calc");
    var email=getLeadEmail();
    if(email){
      sendEmailReport(email,calcName,btn);
    } else {
      var form=btn.parentElement.querySelector('.email-inline-form[data-calc="'+calcName+'"]');
      if(form){btn.style.display="none";form.style.display="block";var inp=form.querySelector('input[type="email"]');if(inp)inp.focus()}
    }
  });
});

function submitEmailReport(submitBtn){
  var form=submitBtn.closest(".email-inline-form");
  var calcName=form.getAttribute("data-calc");
  var inp=form.querySelector('input[type="email"]');
  var email=inp.value.trim();
  if(!validEmailAddr(email)){inp.style.borderColor="var(--red)";inp.focus();return}
  inp.style.borderColor="";
  form.style.display="none";
  var reportBtn=form.parentElement.querySelector('.btn-email-report[data-calc="'+calcName+'"]');
  if(reportBtn){reportBtn.style.display="block";sendEmailReport(email,calcName,reportBtn)}
}

var tocLinks=document.querySelectorAll(".toc a");var sections=document.querySelectorAll(".tool-section");
var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){tocLinks.forEach(function(a){a.classList.remove("active")});var link=document.querySelector('.toc a[href="#'+entry.target.id+'"]');if(link)link.classList.add("active")}})},{rootMargin:"-160px 0px -60% 0px"});
sections.forEach(function(s){observer.observe(s)});
