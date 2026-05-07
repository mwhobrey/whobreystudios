import "server-only";

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

export type StorageProvider = "local" | "r2";

type ObjectStorageConfig = {
  provider: StorageProvider;
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function getStorageProvider(): StorageProvider {
  const raw = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
  return raw === "r2" ? "r2" : "local";
}

function getObjectStorageConfig(): ObjectStorageConfig {
  const bucket = process.env.STORAGE_BUCKET?.trim();
  const rawEndpoint = process.env.STORAGE_ENDPOINT?.trim();
  const region = process.env.STORAGE_REGION?.trim() || "auto";
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY?.trim();

  if (!bucket || !rawEndpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 storage is enabled but one or more storage env vars are missing: STORAGE_BUCKET, STORAGE_ENDPOINT, STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY.",
    );
  }

  let endpoint = rawEndpoint;
  try {
    const parsed = new URL(rawEndpoint);
    endpoint = parsed.origin;
  } catch {
    endpoint = rawEndpoint.replace(/\/+$/, "");
  }

  return { provider: "r2", bucket, endpoint, region, accessKeyId, secretAccessKey };
}

function createS3Client(config: ObjectStorageConfig): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

async function readBodyToBuffer(body: unknown): Promise<Buffer> {
  if (body && typeof body === "object" && "transformToByteArray" in body) {
    const maybe = body as { transformToByteArray: () => Promise<Uint8Array> };
    return Buffer.from(await maybe.transformToByteArray());
  }
  throw new Error("Unsupported object response body type.");
}

/** Directory under `process.cwd()` (the `web/` app root when running Next). */
export function getUploadRootDir(): string {
  const sub = process.env.LOCAL_FILES_DIR?.trim() || "storage/uploads";
  return resolve(
    // turbopack: scope FS root for bundle tracing (see next.config NFT warning)
    /* turbopackIgnore: true */ process.cwd(),
    sub,
  );
}

/** Join root + storage key; rejects keys that escape the root. */
export function absolutePathForStorageKey(storageKey: string): string {
  if (!storageKey || storageKey.includes("..")) {
    throw new Error("Invalid storage key");
  }
  const root = resolve(getUploadRootDir());
  const full = resolve(root, storageKey);
  const rel = relative(root, full);
  if (rel.startsWith("..") || rel === "") {
    throw new Error("Invalid storage key");
  }
  return full;
}

export async function saveUploadedBytes(storageKey: string, data: Buffer): Promise<void> {
  if (getStorageProvider() === "r2") {
    const config = getObjectStorageConfig();
    const client = createS3Client(config);
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: storageKey,
        Body: data,
      }),
    );
    return;
  }

  const diskPath = absolutePathForStorageKey(storageKey);
  await mkdir(resolve(diskPath, ".."), { recursive: true });
  await writeFile(diskPath, data);
}

export async function removeStoredFile(storageKey: string): Promise<void> {
  if (getStorageProvider() === "r2") {
    const config = getObjectStorageConfig();
    const client = createS3Client(config);
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: storageKey,
      }),
    );
    return;
  }

  try {
    await unlink(absolutePathForStorageKey(storageKey));
  } catch {
    // ignore missing file
  }
}

export async function readStoredFileBytes(storageKey: string): Promise<Buffer> {
  if (getStorageProvider() === "r2") {
    const config = getObjectStorageConfig();
    const client = createS3Client(config);
    const out = await client.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: storageKey,
      }),
    );
    if (!out.Body) {
      throw new Error("Object not found");
    }
    return readBodyToBuffer(out.Body);
  }

  return readFile(absolutePathForStorageKey(storageKey));
}
