import async_hooks
async function run() {
  const baseUrl = 'http://localhost:4100';
  const email = 'test-' + Date.now() + '@example.com';
  let cookie, habitId, shareId;

  const r1 = await fetch(baseUrl + '/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  });
  console.log('1) Register:', r1.status);
  cookie = r1.headers.get('set-cookie');

  const r2 = await fetch(baseUrl + '/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ name: 'Test Habit' })
  });
  const h = await r2.json();
  habitId = h.id;
  console.log('2) Create Habit:', r2.status, 'ID:', habitId);

  const r3 = await fetch(baseUrl + '/api/habits/' + habitId + '/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ dateKey: new Date().toISOString().split('T')[0] })
  });
  const e1 = await r3.json();
  console.log('3) Mark Done:', r3.status, 'dateKey:', e1.dateKey);

  const r4 = await fetch(baseUrl + '/api/habits/' + habitId + '/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ dateKey: new Date().toISOString().split('T')[0] })
  });
  const e2 = await r4.json();
  console.log('4) Mark Duplicate:', r4.status, 'Body:', JSON.stringify(e2));

  const r5 = await fetch(baseUrl + '/api/habits', { headers: { 'Cookie': cookie } });
  const hs = await r5.json();
  const habit = hs[0];
  console.log('5) Fetch Habits:', r5.status, 'Streak:', habit.currentStreak, 'Fields:', Object.keys(habit).join(','));

  const r6 = await fetch(baseUrl + '/api/habits/' + habitId + '/share', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ isPublic: true })
  });
  const sh = await r6.json();
  shareId = sh.shareId;
  console.log('6) Enable Share:', r6.status, 'shareId:', shareId);

  const r7 = await fetch(baseUrl + '/api/public/habits/' + shareId);
  const ph = await r7.json();
  console.log('7) Public API:', r7.status, 'Fields:', Object.keys(ph).join(','));

  const r8 = await fetch(baseUrl + '/public/habits/' + shareId);
  const html = await r8.text();
  console.log('8) SPA Route:', r8.status, 'Is HTML:', html.toLowerCase().includes('<!doctype html>'));
}
run();
