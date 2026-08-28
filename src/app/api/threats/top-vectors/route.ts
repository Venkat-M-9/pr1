import { NextRequest, NextResponse } from 'next/server';
import { THREAT_TYPES } from '@/lib/cybersecurityData';
import { ThreatSeverity } from '@/types/cybersecurity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const severity = searchParams.get('severity') as ThreatSeverity | null;
    const search = searchParams.get('search')?.toLowerCase() || '';

    let list = THREAT_TYPES.map((t, idx) => ({
      type: t.type,
      count: Math.round(1850 / (idx * 0.38 + 1)),
      tactic: t.tactic,
      techniqueId: t.techniqueId,
      severity: t.defaultSev,
    }));

    if (severity) {
      list = list.filter(item => item.severity === severity);
    }

    if (search) {
      list = list.filter(
        item =>
          item.type.toLowerCase().includes(search) ||
          item.tactic.toLowerCase().includes(search) ||
          item.techniqueId.toLowerCase().includes(search)
      );
    }

    // Sort descending by count and apply limit
    const sorted = list.sort((a, b) => b.count - a.count).slice(0, limit);

    return NextResponse.json({
      success: true,
      totalCount: sorted.length,
      data: sorted,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve top threat vectors' },
      { status: 500 }
    );
  }
}
