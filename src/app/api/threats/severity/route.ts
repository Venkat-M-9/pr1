import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const severityData = [
      { name: 'Critical', severity: 'critical', count: 1840, color: '#dc2626' },
      { name: 'High', severity: 'high', count: 2950, color: '#ea580c' },
      { name: 'Medium', severity: 'medium', count: 2410, color: '#d97706' },
      { name: 'Low', severity: 'low', count: 1250, color: '#2563eb' },
    ];

    const total = severityData.reduce((acc, s) => acc + s.count, 0);
    const withPercentages = severityData.map(s => ({
      ...s,
      percentage: Number(((s.count / total) * 100).toFixed(1)),
    }));

    return NextResponse.json({
      success: true,
      totalEvents: total,
      data: withPercentages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve threat severity metrics' },
      { status: 500 }
    );
  }
}
