// Musify+ offline DB
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

const trackList = document.getElementById("trackList");
const player = document.getElementById("player");
const dropzone = document.getElementById("dropzone");

initDB();
renderTracks();

// DRAG & DROP ZIP IMPORT

window.addEventListener("dragenter", e => {
  e.preventDefault();
  dropzone.classList.add("active");
});

window.addEventListener("dragover", e => {
  e.preventDefault();
});

window.addEventListener("dragleave", e => {
  if (!dropzone.contains(e.relatedTarget)) {
    dropzone.classList.remove("active");
  }
});

window.addEventListener("drop", async e => {
  e.preventDefault();
  dropzone.classList.remove("active");

  const file = e.dataTransfer.files[0];
  if (!file || !file.name.endsWith(".zip")) {
    alert("Please drop a ZIP file.");
    return;
  }

  try {
    const zip = await JSZip.loadAsync(file);
    const entries = Object.keys(zip.files);

    for (const filename of entries) {
      const entry = zip.files[filename];
      if (entry.dir) continue;

      const blob = await entry.async("blob");
      await saveTrack(filename, blob);
    }

    await renderTracks();
  } catch (err) {
    console.error("ZIP import error:", err);
  }
});

// RENDER + PLAY

async function renderTracks() {
  const tracks = await getAllTracks();
  trackList.innerHTML = "";

  if (!tracks.length) {
    const li = document.createElement("li");
    li.textContent = "No tracks yet. Drop a ZIP to import.";
    li.style.opacity = "0.7";
    trackList.appendChild(li);
    return;
  }

  tracks.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("click", () => playTrack(name));
    trackList.appendChild(li);
  });
}

async function playTrack(name) {
  const blob = await getTrack(name);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  player.src = url;
  player.play().catch(err => console.error("Play error:", err));
}
