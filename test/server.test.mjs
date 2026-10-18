import { test } from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../server.mjs';
test('serves the audit workspace and assets; rejects unknown paths', async () => {
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 try {
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base); assert.equal(page.status, 200); assert.match(await page.text(), /audit-form/);
  for (const path of ['/app.js', '/style.css']) { const response=await fetch(base+path); assert.equal(response.status,200); assert.ok((await response.text()).length>100); }
  assert.equal((await fetch(base+'/missing')).status,404);
  assert.equal((await fetch(base+'/.git/config')).status,404);
 } finally { await new Promise(resolve=>server.close(resolve)); }
});
