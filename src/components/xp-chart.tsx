"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface XpChartProps {
    data: { name: string; you: number; rival: number }[];
}

export function XpChart({ data }: XpChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} XP`} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))"
                    }}
                />
                <Legend />
                <Bar dataKey="you" fill="hsl(var(--primary))" name="Your XP" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rival" fill="hsl(var(--foreground))" name="Rival's XP" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
