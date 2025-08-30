"use client";
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

type Catalog = {
  services: Array<{
    key: string;
    name: string;
    description: string;
    logo: string;
    compose: { containerPorts: number[] };
  }>;
};

type Selection = Record<string, { enabled: boolean; hostPort?: number }>;

export function ServiceSelector({ name = 'services', initial }: { name?: string; initial?: string[] }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [sel, setSel] = useState<Selection>({});

  useEffect(() => {
    fetch('/services/catalog.json').then(r => r.json()).then(setCatalog).catch(() => setCatalog({ services: [] }));
  }, []);

  // hydrate selection from initial (e.g., ["nginx:8080"]) once catalog is loaded
  useEffect(() => {
    if (!catalog) return;
    const map: Selection = {};
    for (const svc of catalog.services) {
      map[svc.key] = { enabled: false };
    }
    for (const v of initial || []) {
      const [k, port] = String(v).split(':');
      if (map[k] !== undefined) {
        map[k].enabled = true;
        map[k].hostPort = port ? parseInt(port, 10) : svcDefaultPort(catalog, k);
      }
    }
    setSel(map);
  }, [catalog, initial]);

  function svcDefaultPort(cat: Catalog, key: string) {
    const s = cat.services.find(x => x.key === key);
    return s?.compose.containerPorts?.[0] || 0;
  }

  function toggle(key: string) {
    setSel((prev) => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key]?.enabled } }));
  }
  function setPort(key: string, port: number) {
    setSel((prev) => ({ ...prev, [key]: { ...prev[key], hostPort: port } }));
  }

  const values = useMemo(() => {
    if (!catalog) return [] as string[];
    const out: string[] = [];
    for (const svc of catalog.services) {
      const s = sel[svc.key];
      if (s?.enabled) {
        const hp = s.hostPort ?? svcDefaultPort(catalog, svc.key);
        out.push(`${svc.key}:${hp}`);
      }
    }
    return out;
  }, [sel, catalog]);

  if (!catalog) return <div className="text-sm text-muted-foreground">Loading services...</div>;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {catalog.services.map((svc) => {
        const selected = sel[svc.key]?.enabled;
        const hostPort = sel[svc.key]?.hostPort ?? svc.compose.containerPorts[0] ?? 0;
        return (
          <div key={svc.key} className={`rounded-lg border p-3 ${selected ? 'bg-secondary/50 border-primary/40' : ''}`}>
            <div className="flex items-center gap-3">
              {svc.logo && (
                <Image src={svc.logo} alt="" width={24} height={24} className="rounded" />
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{svc.name}</div>
                <div className="text-xs text-muted-foreground truncate">{svc.description}</div>
              </div>
              <div className="ml-auto">
                <button type="button" onClick={() => toggle(svc.key)} className={`rounded-md px-2 py-1 text-xs ${selected ? 'bg-primary text-primary-foreground' : 'border'}`}>{selected ? 'Selected' : 'Select'}</button>
              </div>
            </div>
            {selected && (
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Port</label>
                <Input type="number" className="h-8 w-24" value={hostPort} onChange={(e) => setPort(svc.key, parseInt(e.target.value || '0', 10))} />
              </div>
            )}
            {/* Emit values as multiple hidden inputs */}
            {selected && <input type="hidden" name={name} value={`${svc.key}:${hostPort}`} />}
          </div>
        );
      })}
      {/* Fallback: also emit all values to handle unselect/select updates */}
      {values.length === 0 && <input type="hidden" name={name} value="" />}
    </div>
  );
}
