const DB_NAME = "musify-plus-db";
const DB_VERSION = 1;
const STORE_TRACKS = "tracks";

let dbPromise;

function initDB() {
  dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS);
      }
    }
  });
}

async function saveTrack(name, blob) {
  const db = await dbPromise;
  await db.put(STORE_TRACKS, blob, name);
}

async function getAllTracks() {
  const db = await dbPromise;
  return db.getAllKeys(STORE_TRACKS);
}

async function getTrack(name) {
  const db = await dbPromise;
  return db.get(STORE_TRACKS, name);
}

const zipInput = document.getElementById("zipInput");
const importBtn = document.getElementById("importBtn");
const trackList = document.getElementById("trackList");
const player = document.getElementById("player");

initDB();
renderTracks();

importBtn.addEventListener("click", async () => {
  const file = zipInput.files[0];
  if (!file) return;

  const zip = await JSZip.loadAsync(file);

  const entries = Object.keys(zip.files);
  for (const filename of entries) {
    const entry = zip.files[filename];
    if (entry.dir) continue;

    const blob = await entry.async("blob");
    await saveTrack(filename, blob);
  }

  await renderTracks();
});

async function renderTracks() {
  const tracks = await getAllTracks();
  trackList.innerHTML = "";

  tracks.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => playTrack(name));
    trackList.appendChild(li);
  });
}

async function playTrack(name) {
  const blob = await getTrack(name);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  player.src = url;
  player.play().catch(() => {});
}
