'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatKoboPlain } from '@/lib/currency';
import type { CollectionOverview } from '@/types/entities';

const COLORS = {
  expected: '#C7CCD6', // navy-200 — the backdrop bar
  collected: '#172033', // navy-900 — the headline figure
  outstanding: '#B4232C', // danger
};

export function CollectionChart({ overview }: { overview: CollectionOverview }) {
  const data = [
    {
      name: 'This term',
      Expected: overview.expectedKobo / 100,
      Collected: overview.collectedKobo / 100,
      Outstanding: overview.outstandingKobo / 100,
    },
  ];

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barCategoryGap={28} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            tickFormatter={(v) => `₦${formatKoboPlain(v * 100)}`}
            tick={{ fontSize: 12, fill: '#5F6B7A' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            formatter={(value: number) => [`₦${formatKoboPlain(value * 100)}`, '']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}
          />
          <Bar dataKey="Expected" fill={COLORS.expected} radius={[4, 4, 4, 4]} barSize={28} />
          <Bar dataKey="Collected" fill={COLORS.collected} radius={[4, 4, 4, 4]} barSize={28} />
          <Bar dataKey="Outstanding" fill={COLORS.outstanding} radius={[4, 4, 4, 4]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-5 text-[12.5px]">
        <LegendDot color={COLORS.expected} label="Expected" />
        <LegendDot color={COLORS.collected} label="Collected" />
        <LegendDot color={COLORS.outstanding} label="Outstanding" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-navy-500">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
