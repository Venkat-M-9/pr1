import { NextResponse } from 'next/server';
import { getSecurityPostureMetrics } from '@/lib/cybersecurityData';

export async function GET() {
  try {
    const metrics = getSecurityPostureMetrics();

    const overallCurrent = Math.round(
      metrics.reduce((acc, m) => acc + m.current, 0) / metrics.length
    );
    const overallBenchmark = Math.round(
      metrics.reduce((acc, m) => acc + m.benchmark, 0) / metrics.length
    );

    return NextResponse.json({
      success: true,
      overallScore: overallCurrent,
      overallBenchmark,
      delta: overallCurrent - overallBenchmark,
      dimensions: metrics,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve security posture metrics' },
      { status: 500 }
    );
  }
}
