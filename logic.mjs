export function filterPostings(postings,{query='',category='all',skill='all',eligibility='all'}={}){
  const q=query.trim().toLowerCase();
  return postings.filter(p=>{
    const haystack=[p.company,p.title,p.location,p.category,...p.skills].join(' ').toLowerCase();
    return (!q||haystack.includes(q))&&(category==='all'||p.category===category)&&(skill==='all'||p.skills.includes(skill))&&(eligibility==='all'||p.eligibilityFilter===eligibility);
  });
}
export function compareRoles(roles,left,right){
  const a=roles.find(r=>r.id===left),b=roles.find(r=>r.id===right);
  if(!a||!b) throw new Error('Unknown role');
  return {a,b,fields:[['Daily work emphasis','focus'],['Customer interaction','customer'],['Programming','code'],['Data and databases','data'],['AI integration','ai'],['Architecture','architecture'],['Typical deliverable','deliverable'],['Internship availability in cited examples','entry']]};
}
export const actionStates=['Not started','In progress','Completed','Blocked'];
export function readActionStates(storage,key='career-research-actions-v1'){
  try{const value=JSON.parse(storage.getItem(key)||'{}');if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(Object.entries(value).filter(([,v])=>actionStates.includes(v)));}catch{return {};}
}
export function saveActionState(storage,id,state,key='career-research-actions-v1'){
  if(!actionStates.includes(state))throw new Error('Invalid action state');
  const next={...readActionStates(storage,key),[id]:state};storage.setItem(key,JSON.stringify(next));return next;
}
