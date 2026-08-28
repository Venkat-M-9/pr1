import { NextRequest, NextResponse } from 'next/server';
import { getThreatTrends } from '@/lib/cybersecurityData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '24h') as '24h' | '7d' | '30d';

    if (!['24h', '7d', '30d'].includes(range)) {
      return NextResponse.json(
        { error: 'Invalid range parameter. Expected 24h, 7d, or 30d.' },
        { status: 400 }
      );
    }

    const data = getThreatTrends(range);
    const totalThreats = data.reduce((acc, p) => acc + p.total, 0);
    const criticalThreats = data.reduce((acc, p) => acc + p.critical, 0);

    return NextResponse.json({
      success: true,
      timeRange: range,
      totalThreats,
      criticalThreats,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve threat trends telemetry' },
      { status: 500 }
    );
  }
}
