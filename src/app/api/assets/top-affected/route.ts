import { NextRequest, NextResponse } from 'next/server';
import { getSecurityAssets } from '@/lib/cybersecurityData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const assets = getSecurityAssets();

    // Map security event volume dynamically derived from asset likelihood, impact, and critical CVEs
    const affectedAssets = assets.map((asset, idx) => {
      const securityEvents = Math.round(
        asset.likelihood * 14 + asset.impact * 8 + asset.criticalVulnerabilities * 120 + (12 - idx) * 45
      );

      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        ip: asset.ip,
        department: asset.department,
        securityEvents,
        vulnerabilityCount: asset.vulnerabilityCount,
        criticalVulnerabilities: asset.criticalVulnerabilities,
        riskScore: asset.riskScore,
        status: asset.status,
      };
    });

    // Sort descending by security events count and take top N
    const topAffected = affectedAssets
      .sort((a, b) => b.securityEvents - a.securityEvents)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      totalAssetsAnalyzed: assets.length,
      data: topAffected,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve top affected assets' },
      { status: 500 }
    );
  }
}
