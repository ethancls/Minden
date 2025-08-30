"use client";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

function CodeBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="relative">
      <pre className="mt-1 overflow-auto rounded bg-secondary p-2 text-xs"><code>{value}</code></pre>
      <Button size="sm" variant="outline" onClick={copy} className="absolute right-2 top-2">
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

export function OnboardingPanel({
  locale,
  machineId,
  token,
  baseUrl,
}: {
  locale: string;
  machineId: string;
  token: string;
  baseUrl: string;
}) {
  const t = useTranslations('machines');
  type Method = 'docker' | 'linux' | 'systemd';
  const [method, setMethod] = useState<Method>('docker');
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  const [lastAt, setLastAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const res = await fetch(`/api/machines/${machineId}/status`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setStatus(data.status);
        setLastAt(data.lastHeartbeatAt ?? null);
      } catch {}
    }
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [machineId]);

  const commands = useMemo(() => {
    const serverUrl = baseUrl.replace(/\/$/, '');
    const env = `export SERVER_URL=\"${serverUrl}\"\nexport TOKEN=\"${token}\"`;
    const docker = `${env}\n# Docker run (example)\ndocker run -d --name minden-agent --restart unless-stopped \\\n+  -e SERVER_URL=\"${serverUrl}\" -e TOKEN=\"${token}\" \\\n+  ghcr.io/mindenhq/agent:latest`;
    const linux = `${env}\n# Download your architecture binary then run:\n./minden-agent`;
    const systemd = `[Unit]\nDescription=Minden Agent\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=simple\nEnvironment=SERVER_URL=${serverUrl}\nEnvironment=TOKEN=${token}\nExecStart=/opt/minden-agent/minden-agent\nRestart=always\nRestartSec=5\nUser=nobody\nGroup=nogroup\n\n[Install]\nWantedBy=multi-user.target`;
    return { docker, linux, systemd };
  }, [baseUrl, token]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-2 text-sm font-medium">{t('onboard.method')}</div>
        <div className="grid grid-cols-3 gap-2">
          {([
            ['docker', 'Docker'],
            ['linux', 'Linux'],
            ['systemd', 'systemd'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMethod(key as Method)}
              className={`rounded-md border px-3 py-2 text-sm ${method === key ? 'bg-secondary' : 'hover:bg-accent/10'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <div className="mb-1 text-sm text-muted-foreground">{t('onboard.token')}</div>
          <div className="flex items-center gap-2">
            <Input readOnly value={token} />
            {/* Copy token */}
            <Button type="button" variant="outline" onClick={async () => { await navigator.clipboard.writeText(token); }}>
              {t('onboard.copy')}
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 text-sm font-medium">{t('onboard.command')}</div>
          {method === 'docker' && <CodeBlock value={commands.docker} />}
          {method === 'linux' && <CodeBlock value={commands.linux} />}
          {method === 'systemd' && <CodeBlock value={commands.systemd} />}
          <div className="mt-2 text-xs text-muted-foreground">{t('onboard.tokenNote')}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${status === 'ONLINE' ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
          {status === 'ONLINE' ? t('onboard.connected') : t('onboard.waiting')}
        </div>
        {lastAt && (
          <div className="text-xs text-muted-foreground">{t('onboard.lastHeartbeat')}: {new Date(lastAt).toLocaleString()}</div>
        )}
        <div className="mt-4">
          <Button asChild disabled={status !== 'ONLINE'}>
            <a href={`/${locale}/machines/${machineId}?toast=machine_connected`}>{t('onboard.continue')}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
