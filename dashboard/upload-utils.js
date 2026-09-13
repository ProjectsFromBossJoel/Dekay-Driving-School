// upload-utils.js

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CLOUD_NAME = 'drs2xpwho';
const UPLOAD_PRESET = 'certificates_uploads';
const GLOBAL_CATEGORIES = ['lessons', 'quizzes'];

const _schoolSlugCache = {};

export async function getSchoolFolderSlug(db, schoolId) {
  if (!schoolId) return 'Unassigned';
  if (_schoolSlugCache[schoolId]) return _schoolSlugCache[schoolId];
  let slug = schoolId;
  try {
    const snap = await getDoc(doc(db, 'schools', schoolId));
    if (snap.exists()) {
      const data = snap.data();
      const raw = data.folderSlug || data.name || schoolId;
      slug = raw.replace(/\bDriving\s*School\b/gi, 'DrivingSch')
                .replace(/\bSchool\b/gi, 'Sch')
                .replace(/[^a-zA-Z0-9]/g, '');
    }
  } catch (e) { /* keep schoolId as fallback slug */ }
  _schoolSlugCache[schoolId] = slug;
  return slug;
}

export async function uploadToCloudinary(db, fileOrDataUrl, category, schoolId, resourceType = 'image') {
  const isGlobal = GLOBAL_CATEGORIES.includes(category);
  const folder = isGlobal
    ? category
    : `${category}/${await getSchoolFolderSlug(db, schoolId)}`;

  const formData = new FormData();
  formData.append('file', fileOrDataUrl);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `Upload failed (${res.status})`);
  }
  const json = await res.json();
  return json.secure_url;
}