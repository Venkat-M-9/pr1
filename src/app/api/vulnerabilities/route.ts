import { NextRequest, NextResponse } from 'next/server';
import { getVulnerabilities, getSecurityAssets } from '@/lib/cybersecurityData';
import { parseCVSSVector } from '@/lib/cvssParser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity')?.toLowerCase();
    const cveId = searchParams.get('cve');

    const assets = getSecurityAssets();
    const vulnerabilities = getVulnerabilities(assets);

    let list = vulnerabilities.map(v => ({
      ...v,
      cvssDetails: parseCVSSVector(v.cvssVector, v.cvssScore),
    }));

    if (cveId) {
      const single = list.find(v => v.id.toLowerCase() === cveId.toLowerCase());
      if (!single) {
        return NextResponse.json({ error: `CVE '${cveId}' not found` }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: single });
    }

    if (severity) {
      list = list.filter(v => v.severity === severity);
    }

    const avgScore =
      list.length > 0
        ? Number((list.reduce((acc, v) => acc + v.cvssScore, 0) / list.length).toFixed(1))
        : 0;

    return NextResponse.json({
      success: true,
      totalVulnerabilities: list.length,
      meanCvssScore: avgScore,
      data: list,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve vulnerabilities' },
      { status: 500 }
    );
  }
}
