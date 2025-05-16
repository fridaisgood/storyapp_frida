import { getStory, saveStory } from '../data/db.js';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

export async function getStories() {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Anda belum login');

  const res = await fetch(`${BASE_URL}/stories`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.listStory;
}

export async function addStory(formData, token) {
  const res = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.loginResult.token;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
}

export async function getStoryById(id) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Anda belum login');

  const url = `${BASE_URL}/stories/${id}`;
  console.log('Fetching detail story from:', url);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const json = await res.json();
  console.log(json);
  if (!res.ok) throw new Error(json.message);
  return json.story;
}

// ✅ Tambahan: Safe untuk offline
export async function getStoryByIdSafe(id) {
  const token = localStorage.getItem('accessToken');
  const url = `${BASE_URL}/stories/${id}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);

    await saveStory({ ...json.story, isCached: true }); // Simpan ke IndexedDB
    return json.story;
  } catch (error) {
    console.warn('Offline? Coba ambil dari IndexedDB...');
    const story = await getStory(id);
    if (story) return story;
    throw new Error('Gagal memuat cerita. Anda mungkin sedang offline.');
  }
}
