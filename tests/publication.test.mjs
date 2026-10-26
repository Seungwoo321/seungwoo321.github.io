import test from 'node:test';
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { validatePlan, cronDates, releaseDecision, calendarWorkflow, calendarFile, main } from '../scripts/publication.mjs';
const revision='a'.repeat(40);

test('calendar converts Korean publication times to UTC and rounds seconds upward across years',()=>{
  assert.deepEqual(cronDates(['2026-11-03T09:30:00+09:00','2026-11-03T00:30:00Z']),['30 0 3 11 *']);
  assert.deepEqual(cronDates(['2026-12-31T23:59:30Z']),['0 0 1 1 *']);
  assert.throws(()=>cronDates(['invalid']));
});
test('only due posts from the approved deployment can release; cron never releases early',()=>{
  const plan={revision,futureDates:['2026-11-03T00:30:00Z']};
  assert.deepEqual(releaseDecision(plan,revision,Date.parse('2026-11-03T00:29:59Z')),{publish:false,finished:false});
  assert.deepEqual(releaseDecision(plan,revision,Date.parse('2026-11-03T00:30:00Z')),{publish:true,finished:false});
  assert.deepEqual(releaseDecision(plan,'b'.repeat(40),Date.parse('2026-11-04')),{publish:false,finished:false});
  assert.deepEqual(releaseDecision({revision,futureDates:[]},revision),{publish:false,finished:true});
});
test('published metadata is validated and the generated calendar pins its source and self-disables',()=>{
  assert.throws(()=>validatePlan({revision:'main',futureDates:[]}));
  assert.throws(()=>validatePlan({revision,futureDates:['not-a-date']}));
  assert.throws(()=>calendarWorkflow({revision,futureDates:[]}));
  const plan=validatePlan({revision,futureDates:['2026-12-01T09:00:00+09:00','2026-11-03T09:30:00+09:00']});
  const yaml=calendarWorkflow(plan);
  assert.match(yaml,/cron: '30 0 3 11 \*'/);
  assert.match(yaml,/cron: '0 0 1 12 \*'/);
  assert.ok(yaml.includes(`revision: '${revision}'`));
  assert.ok(yaml.includes(`uses: Seungwoo321/seungwoo321.github.io/.github/workflows/astro-pages.yml@${revision}`));
  assert.ok(yaml.includes(`ref: '${revision}'`));
  assert.ok(yaml.includes('node scripts/publication.mjs finish'));
  assert.ok(!yaml.includes('*/5'));
});

test('an old finish cannot disable the new calendar before or during registration',async t=>{
  const next='b'.repeat(40);
  assert.notEqual(calendarFile(revision),calendarFile(next));
  assert.throws(()=>calendarFile('main'));
  const originalRevision=process.env.PUBLICATION_REVISION;
  try {
    process.env.PUBLICATION_REVISION=revision;
    for(const order of ['before','during','after']) {
      const active=new Set(order==='before' ? [revision,next] : [revision]);
      const calls=[];
      const mock=t.mock.method(childProcess,'execFileSync',(bin,args)=>{
        assert.equal(bin,'gh');
        calls.push(args);
        if(args.at(-1).endsWith('/disable')) {
          assert.ok(args.at(-1).endsWith(`publish-scheduled-${revision}.yml/disable`));
          active.delete(revision);
          return '';
        }
        assert.ok(args.at(-1).endsWith(`publish-scheduled-${revision}.yml`));
        if(order==='during')active.add(next);
        return '{}';
      });
      syncBuiltinESMExports();
      await main('finish');
      if(order==='after')active.add(next);
      assert.equal(calls.length,2);
      assert.deepEqual([...active],[next]);
      mock.mock.restore();
      syncBuiltinESMExports();
    }
  } finally {
    t.mock.restoreAll();
    syncBuiltinESMExports();
    if(originalRevision===undefined)delete process.env.PUBLICATION_REVISION;
    else process.env.PUBLICATION_REVISION=originalRevision;
  }
});
