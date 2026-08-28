import { NextRequest, NextResponse } from 'next/server';
import { getSecurityIncidents, getIncidentTrends } from '@/lib/cybersecurityData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.toLowerCase();

    const incidents = getSecurityIncidents();
    const timeline = getIncidentTrends();

    let filtered = incidents;
    if (status) {
      filtered = incidents.filter(i => i.status === status);
    }

    const openCount = incidents.filter(i => i.status === 'open').length;
    const investigatingCount = incidents.filter(i => i.status === 'investigating').length;
    const containedCount = incidents.filter(i => i.status === 'contained').length;
    const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

    return NextResponse.json({
      success: true,
      summary: {
        total: incidents.length,
        open: openCount,
        investigating: investigatingCount,
        contained: containedCount,
        resolved: resolvedCount,
      },
      timeline,
      incidents: filtered,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve security incidents telemetry' },
      { status: 500 }
    );
  }
}
