import { prisma } from '@/lib/prisma';
import { decryptSecret, encryptSecret } from '@/lib/secrets';

type Cached = { value: string; isSecret: boolean };
const cache = new Map<string, Cached>();

export async function getSetting(key: string): Promise<string | undefined> {
  const cached = cache.get(key);
  if (cached) return cached.value;
  const rec = await prisma.setting.findUnique({ where: { key } });
  if (!rec) return undefined;
  const value = rec.isSecret ? safeDecrypt(rec.value) : rec.value;
  cache.set(key, { value, isSecret: rec.isSecret });
  return value;
}

export async function setSetting(key: string, value: string, isSecret = false) {
  const stored = isSecret ? encryptSecret(value) : value;
  cache.set(key, { value, isSecret });
  await prisma.setting.upsert({ where: { key }, update: { value: stored, isSecret }, create: { key, value: stored, isSecret } });
}

export async function getMany(keys: string[]): Promise<Record<string, string | undefined>> {
  const result: Record<string, string | undefined> = {};
  const missing: string[] = [];
  for (const k of keys) {
    const c = cache.get(k);
    if (c) result[k] = c.value;
    else missing.push(k);
  }
  if (missing.length) {
    const rows = await prisma.setting.findMany({ where: { key: { in: missing } } });
    for (const row of rows) {
      const val = row.isSecret ? safeDecrypt(row.value) : row.value;
      cache.set(row.key, { value: val, isSecret: row.isSecret });
      result[row.key] = val;
    }
    for (const k of missing) if (!(k in result)) result[k] = undefined;
  }
  return result;
}

function safeDecrypt(v: string): string {
  try {
    return decryptSecret(v);
  } catch {
    return '';
  }
}
