import { openDB } from 'idb';

const dbPromise = openDB('story-app', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('stories')) {
      db.createObjectStore('stories', { keyPath: 'id' });
    }
  }
});

export async function saveStory(story) {
  return (await dbPromise).put('stories', story);
}

export async function getStory(id) {
  return (await dbPromise).get('stories', id);
}

export async function deleteStory(id) {
  return (await dbPromise).delete('stories', id);
}

export async function getSavedStories() {
  const all = await (await dbPromise).getAll('stories');
  return all.filter(story => story.isCached !== true); // Hanya yang disimpan manual
}

export async function isStorySaved(id) {
  const story = await getStory(id);
  return story && story.isCached !== true; // Bukan cache saja
}
