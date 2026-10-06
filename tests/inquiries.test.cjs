const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function loadTs(path, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('exports', 'require', code)(exports, (name) => dependencies[name] ?? require(name));
  return exports;
}
const auth = loadTs('src/types/auth.ts');
const { createLocalInquiryRepository, INQUIRY_STORAGE_KEY } = loadTs(
  'src/lib/inquiry-repository.ts',
);
const { useSessionStore } = loadTs('src/stores/use-session-store.ts', { '@/types/auth': auth });

function fixture() {
  const data = new Map();
  let session = { userId: 1, accessToken: 'user-1', name: '보호자', role: 'USER' };
  const storage = {
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      data.set(key, value);
    },
  };
  return {
    data,
    storage,
    repo: createLocalInquiryRepository(storage, () => session),
    signIn(userId, role = 'USER') {
      session = { userId, accessToken: `user-${userId}`, name: `사용자${userId}`, role };
    },
    signOut() {
      session = { userId: null, accessToken: null, name: null, role: null };
    },
  };
}
const body = { title: '문의 제목', content: '문의 내용' };

test('missing/unknown role defaults to USER; session switch and logout cannot retain ADMIN', () => {
  for (const role of [undefined, null, 'admin', 'ROLE_ADMIN', 'anything'])
    assert.equal(auth.normalizeRole(role), 'USER');
  useSessionStore
    .getState()
    .setSession({ userId: 1, accessToken: 'a', email: 'a', name: 'a', role: 'ADMIN' });
  assert.equal(useSessionStore.getState().role, 'ADMIN');
  useSessionStore.getState().setSession({ userId: 2, accessToken: 'b', email: 'b', name: 'b' });
  assert.equal(useSessionStore.getState().role, 'USER');
  useSessionStore.getState().clearSession();
  assert.equal(useSessionStore.getState().role, null);
});
test('user create -> admin answer -> owner sees completed answer after reload', async () => {
  const f = fixture();
  const item = await f.repo.create(body);
  assert.equal(item.status, 'PENDING');
  f.signIn(2);
  assert.deepEqual(await f.repo.list(), []);
  await assert.rejects(f.repo.get(item.id), /찾을 수/);
  f.signIn(99, 'ADMIN');
  assert.equal((await f.repo.adminList()).length, 1);
  await f.repo.answer(item.id, '  관리자 답변  ');
  f.signIn(1);
  const fresh = createLocalInquiryRepository(f.storage, () => ({
    userId: 1,
    accessToken: 'user-1',
    name: '보호자',
    role: 'USER',
  }));
  const saved = await fresh.get(item.id);
  assert.equal(saved.status, 'ANSWERED');
  assert.equal(saved.answer, '관리자 답변');
  assert.ok(saved.answeredAt);
});
test('USER and anonymous sessions cannot use admin methods', async () => {
  const f = fixture();
  await assert.rejects(f.repo.adminList(), /관리자/);
  await assert.rejects(f.repo.adminGet('x'), /관리자/);
  await assert.rejects(f.repo.answer('x', '답변'), /관리자/);
  f.signOut();
  await assert.rejects(f.repo.create(body), /로그인/);
  await assert.rejects(f.repo.list(), /로그인/);
});
test('invalid input, missing inquiries and duplicate answers are rejected', async () => {
  const f = fixture();
  await assert.rejects(f.repo.create({ ...body, title: ' ' }));
  await assert.rejects(f.repo.create({ ...body, title: 'a'.repeat(101) }));
  await assert.rejects(f.repo.create({ ...body, content: 'a'.repeat(5001) }));
  const item = await f.repo.create(body);
  f.signIn(99, 'ADMIN');
  await assert.rejects(f.repo.answer(item.id, ' '));
  await assert.rejects(f.repo.answer('missing', '답변'));
  await f.repo.answer(item.id, '답변');
  await assert.rejects(f.repo.answer(item.id, '두 번째'), /이미/);
});
test('concurrent writes do not drop inquiries or overwrite answers', async () => {
  const f = fixture();
  const items = await Promise.all(
    Array.from({ length: 8 }, (_, i) => f.repo.create({ ...body, title: `문의 ${i}` })),
  );
  assert.equal((await f.repo.list()).length, 8);
  f.signIn(99, 'ADMIN');
  const results = await Promise.allSettled([
    f.repo.answer(items[0].id, 'A'),
    f.repo.answer(items[0].id, 'B'),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
});
test('legacy unowned data is retained but not exposed to a different account', async () => {
  const f = fixture();
  f.data.set('customer-center-inquiries', JSON.stringify([{ id: 'old', ...body }]));
  assert.deepEqual(await f.repo.list(), []);
  await f.repo.create(body);
  assert.ok(f.data.has('customer-center-inquiries'));
});
test('corrupt storage and failed writes do not silently lose data or report success', async () => {
  const f = fixture();
  f.data.set(INQUIRY_STORAGE_KEY, 'broken');
  await assert.rejects(f.repo.create(body));
  assert.equal(f.data.get(INQUIRY_STORAGE_KEY), 'broken');
  f.data.delete(INQUIRY_STORAGE_KEY);
  const original = f.storage.setItem;
  f.storage.setItem = async () => {
    throw new Error('disk full');
  };
  await assert.rejects(f.repo.create(body), /disk full/);
  f.storage.setItem = original;
  assert.equal((await f.repo.create(body)).status, 'PENDING');
});
test('account switch during a queued mutation prevents writing under the wrong session', async () => {
  const f = fixture();
  const pending = f.repo.create(body);
  f.signIn(2);
  await assert.rejects(pending, /로그인 정보가 변경/);
  assert.deepEqual(await f.repo.list(), []);
});
