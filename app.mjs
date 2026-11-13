import {postings,roles,roleEntryExpectations,skillEvidence,questions,roadmap,actions,checked} from './research-data.mjs';
import {filterPostings,compareRoles,actionStates,readActionStates,saveActionState} from './logic.mjs';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const source=id=>postings.find(p=>p.id===id);
const links=ids=>ids.length?ids.map(id=>{const p=source(id);return p?`<a href="${esc(p.url)}">${esc(p.company)} ${esc(p.level)} ↗</a>`:''}).join(' · '):'<span class="muted">Project evidence still being checked</span>';
const selectOptions=(items,first)=>`<option value="all">${first}</option>`+items.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
function renderPostings(){
  const result=filterPostings(postings,{query:$('job-search').value,category:$('job-category').value,skill:$('job-skill').value,eligibility:$('job-eligibility').value});
  $('job-count').textContent=`${result.length} of ${postings.length} employer descriptions`;
  $('job-results').innerHTML=result.length?result.map(p=>`<article class="job-result"><div class="job-head"><div><span class="pill">${esc(p.category)}</span><span class="pill subtle">${esc(p.level)}</span><h3>${esc(p.title)}</h3><p class="muted">${esc(p.company)} · ${esc(p.location)} · ${esc(p.arrangement)}</p></div><a href="${esc(p.url)}">Original posting ↗</a></div><p class="status-line"><strong>${esc(p.status)}</strong> · checked ${checked}</p><details><summary>Responsibilities, requirements, and dates</summary><div class="detail-grid"><div><h4>Responsibilities</h4><ul>${p.responsibilities.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>Required</h4><p>${esc(p.required.join(', '))}</p><h4>Preferred</h4><p>${esc(p.preferred.join(', '))}</p></div><div><h4>Graduation / eligibility</h4><p>${esc(p.graduation)}. ${esc(p.eligibility)}</p><h4>Skills noted</h4><p>${esc(p.skills.join(', '))}</p><h4>Dates</h4><p>Posted: ${esc(p.posted)}<br>Deadline: ${esc(p.deadline)}<br>Researched and last checked: ${checked}</p><p class="muted">${esc(p.source)}. Description verification does not confirm the application is open.</p></div></div></details></article>`).join(''):'<p class="empty-state">No records match. Clear a filter to see the full source set.</p>';
}
function renderComparison(){
  const {a,b,fields}=compareRoles(roles,$('compare-left').value,$('compare-right').value);
  const refs=r=>links(r.sources);
  $('comparison-output').innerHTML=`<div class="compare-header"><strong>Question</strong><strong>${esc(a.name)}</strong><strong>${esc(b.name)}</strong></div>${fields.map(([label,key])=>`<div class="compare-row"><span>${esc(label)}</span><p>${esc(a[key])}</p><p>${esc(b[key])}</p></div>`).join('')}<div class="compare-row"><span>Entry expectations</span><p>${esc(roleEntryExpectations[a.id])}</p><p>${esc(roleEntryExpectations[b.id])}</p></div><div class="compare-row"><span>Source examples</span><p>${refs(a)}</p><p>${refs(b)}</p></div><p class="comparison-caveat">These are summaries of selected employer examples, not universal role definitions. <a href="#method">Inspect method and limitations</a>.</p>`;
}
function renderSkills(){ $('skills-body').innerHTML=skillEvidence.map(s=>`<tr><th scope="row">${esc(s.skill)}</th><td>${links(s.employer)}</td><td>${esc(s.mine)}</td><td><span class="pill">${esc(s.status)}</span><br>${esc(s.gap)}</td></tr>`).join(''); }
function renderQuestions(){ $('question-list').innerHTML=questions.map(q=>`<details class="question"><summary>${esc(q.question)}</summary><div class="question-detail"><p><strong>Current finding:</strong> ${esc(q.finding)}</p><p><strong>Evidence quality:</strong> ${esc(q.quality)} · ${links(q.sources)}</p><p><strong>Uncertainty:</strong> ${esc(q.uncertainty)}</p><p><strong>Next check:</strong> ${esc(q.next)}</p></div></details>`).join(''); }
function renderRoadmap(){ $('roadmap-list').innerHTML=roadmap.map(r=>`<article class="roadmap-item"><span class="pill">${esc(r.stage)}</span><h3>${esc(r.skill)}</h3><p><strong>Why:</strong> ${esc(r.why)} <a href="${esc(source(r.source).url)}">Source ↗</a></p><p><strong>Current evidence:</strong> ${esc(r.known)}</p><p><strong>Exercise:</strong> ${esc(r.exercise)}</p><p><strong>Done when:</strong> ${esc(r.done)}</p></article>`).join(''); }
function renderActions(){const saved=readActionStates(localStorage);$('action-list').innerHTML=actions.map(a=>`<article class="action-item"><div><span class="pill">${esc(a.lane)}</span><span class="pill subtle">${esc(a.priority)} priority</span><h3>${esc(a.title)}</h3><p>${esc(a.reason)}</p><p class="muted">Evidence: ${links(a.sources)}</p><p><strong>Next step:</strong> ${esc(a.next)}</p></div><label>Status <select data-action="${esc(a.id)}">${actionStates.map(s=>`<option value="${esc(s)}" ${saved[a.id]===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label></article>`).join('');}
function init(){
  $('research-counts').innerHTML=`<div><strong>${postings.length}</strong><span>employer descriptions</span></div><div><strong>${roles.length}</strong><span>role categories</span></div><div><strong>${questions.length}</strong><span>research questions</span></div><div><strong>${skillEvidence.length}</strong><span>evidence gaps</span></div>`;
  $('job-category').innerHTML=selectOptions([...new Set(postings.map(p=>p.category))],'All career categories');
  $('job-skill').innerHTML=selectOptions([...new Set(postings.flatMap(p=>p.skills))].sort(),'All technical skills');
  for(const id of ['compare-left','compare-right']) $(id).innerHTML=roles.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
  $('compare-left').value='FDE';$('compare-right').value='Solutions Engineer';
  ['job-search','job-category','job-skill','job-eligibility'].forEach(id=>$(id).addEventListener(id==='job-search'?'input':'change',renderPostings));
  ['compare-left','compare-right'].forEach(id=>$(id).addEventListener('change',renderComparison));
  $('action-list').addEventListener('change',e=>{if(e.target.matches('select[data-action]'))saveActionState(localStorage,e.target.dataset.action,e.target.value)});
  renderPostings();renderComparison();renderSkills();renderQuestions();renderRoadmap();renderActions();
}
init();
