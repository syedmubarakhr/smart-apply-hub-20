/**
 * Real browser-side face matching built on @vladmandic/face-api (TensorFlow.js).
 * Models are served locally from /models — no external or paid API is used.
 * Descriptors live in memory only; no raw verification frame is persisted.
 */

type FaceApi = typeof import("@vladmandic/face-api");

const MODEL_URL = (import.meta.env.VITE_FACE_MODEL_URL as string | undefined) ?? "/models";

/**
 * Maximum euclidean distance between two 128-d embeddings for a match.
 * 0.6 is the face-api reference value; 0.55 is slightly stricter.
 * Configurable via VITE_FACE_MATCH_DISTANCE without code changes.
 */
export const FACE_MATCH_MAX_DISTANCE = (() => {
  const raw = Number(import.meta.env.VITE_FACE_MATCH_DISTANCE);
  return Number.isFinite(raw) && raw > 0 && raw < 1.5 ? raw : 0.55;
})();


interface TfRuntime {
  setBackend: (name: string) => Promise<boolean>;
  getBackend: () => string;
  ready: () => Promise<void>;
}


let apiPromise: Promise<FaceApi> | null = null;


export async function loadFaceApi(): Promise<FaceApi> {
  if (!apiPromise) {
    apiPromise = (async () => {
      const faceapi = await import("@vladmandic/face-api");

      // Initialise a TFJS backend explicitly: WebGL when available, CPU otherwise.
      const tf = (faceapi as unknown as { tf: TfRuntime }).tf;
      for (const backend of ["webgl", "cpu"]) {
        try {
          if (await tf.setBackend(backend)) {
            await tf.ready();
            if (tf.getBackend() === backend) break;
          }
        } catch {
          /* try the next backend */
        }
      }




      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      return faceapi;
    })().catch((err) => {
      apiPromise = null;
      throw err;
    });
  }
  return apiPromise;
}

export type DetectFailure = "no_face" | "multiple_faces" | "model_error";

export type DetectResult =
  | { ok: true; descriptor: Float32Array }
  | { ok: false; reason: DetectFailure };

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to read captured frame."));
    img.src = dataUrl;
  });
}

/** Detects faces in a data URL and returns a 128-d embedding for exactly one face. */
export async function descriptorFromDataUrl(dataUrl: string): Promise<DetectResult> {
  try {
    const faceapi = await loadFaceApi();
    const img = await loadImage(dataUrl);
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
    const results = await faceapi
      .detectAllFaces(img, options)
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (results.length === 0) return { ok: false, reason: "no_face" };
    if (results.length > 1) return { ok: false, reason: "multiple_faces" };
    return { ok: true, descriptor: results[0]!.descriptor };
  } catch (err) {
    console.error("[face-match] detection failed", err);
    return { ok: false, reason: "model_error" };
  }
}

/** Cosine similarity of two embeddings, clamped to [0..1]. */
export function similarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return Math.min(1, Math.max(0, dot / (Math.sqrt(na) * Math.sqrt(nb))));
}

/** Best similarity of a live embedding against every enrolled pose embedding. */
export function bestSimilarity(live: Float32Array, enrolled: Float32Array[]): number {
  return enrolled.reduce((best, ref) => Math.max(best, similarity(live, ref)), 0);
}
