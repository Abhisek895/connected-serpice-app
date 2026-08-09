"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function GrowthChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500 text-sm border border-slate-800 rounded-xl bg-[#111827]">
        No data available
      </div>
    );
  }

  return (
    <div className="h-80 w-full bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ color: '#818cf8' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            dataKey="users" 
            name="New Users" 
            stroke="#818cf8" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#818cf8', stroke: '#1e293b', strokeWidth: 2 }} 
          />
          <Line 
            type="monotone" 
            dataKey="messages" 
            name="Messages Sent" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#1e293b', strokeWidth: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
