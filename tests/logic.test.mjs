import test from 'node:test';
import assert from 'node:assert/strict';
import {postings,roles,skillEvidence,questions,roadmap,actions} from '../research-data.mjs';
import {filterPostings,compareRoles,readActionStates,saveActionState} from '../logic.mjs';
test('search and filters intersect without changing source records',()=>{
  assert.deepEqual(filterPostings(postings,{query:'palantir',eligibility:'grad-match'}).map(p=>p.id),['palantir-intern','palantir-swe-intern']);
  assert.deepEqual(filterPostings(postings,{category:'Data Engineer',skill:'SQL'}).map(p=>p.id),['amazon-data']);
  assert.equal(filterPostings(postings,{query:'no such employer'}).length,0);
});
test('comparison selects distinct source-backed role records',()=>{
  const result=compareRoles(roles,'FDE','Solutions Engineer');
  assert.equal(result.a.name,'Forward Deployed Engineer');
  assert.equal(result.b.name,'Solutions Engineer');
  assert.ok(result.fields.some(([label])=>label==='Customer interaction'));
  assert.throws(()=>compareRoles(roles,'unknown','FDE'));
});
test('action state survives a fresh read and rejects invalid values',()=>{
  const values=new Map();const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  saveActionState(storage,'sql-artifact','In progress');
  assert.equal(readActionStates(storage)['sql-artifact'],'In progress');
  assert.throws(()=>saveActionState(storage,'sql-artifact','Almost done'));
  values.set('career-research-actions-v1','broken JSON');assert.deepEqual(readActionStates(storage),{});
});
test('every displayed research citation resolves to a source record',()=>{
  const ids=new Set(postings.map(p=>p.id));
  const referenced=[...roles.flatMap(r=>r.sources),...skillEvidence.flatMap(s=>s.employer),...questions.flatMap(q=>q.sources),...roadmap.map(r=>r.source),...actions.flatMap(a=>a.sources)];
  assert.ok(referenced.length>0);
  assert.deepEqual(referenced.filter(id=>!ids.has(id)),[]);
  assert.equal(ids.size,postings.length);
});
