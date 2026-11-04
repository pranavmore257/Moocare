import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const audioDir = path.join(uploadDir, 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
const datasetsDir = path.join(uploadDir, 'datasets');
if (!fs.existsSync(datasetsDir)) {
  fs.mkdirSync(datasetsDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || ['.wav', '.mp3', '.m4a', '.ogg'].includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, audioDir);
    } else {
      cb(null, datasetsDir);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

// Audio upload filter
export const uploadAudio = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.wav', '.mp3', '.m4a', '.ogg', '.aac', '.webm', '.flac'];
    if (allowed.includes(ext) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error(`Only audio files (${allowed.join(', ')}) are supported.`));
    }
  },
});

// Dataset upload filter
export const uploadDataset = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.csv', '.json', '.txt'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only dataset files (.csv, .json) are allowed.`));
    }
  },
});
