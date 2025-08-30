"use client";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function MachinesChart({ data }: { data: Array<{ date: string; value: number }> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-full w-full" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
        <YAxis tick={{ fontSize: 12 }} width={30} />
        <Tooltip cursor={{ stroke: 'hsl(var(--border))' }} />
        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function UsersChart({ data }: { data: Array<{ date: string; value: number }> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-full w-full" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="date" hide />
        <YAxis width={24} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
