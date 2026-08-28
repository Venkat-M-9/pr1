import { NextRequest, NextResponse } from 'next/server';
import { getSecurityAssets } from '@/lib/cybersecurityData';
import { SecurityAsset } from '@/types/cybersecurity';

// In-memory persistent server store initialized from assets definition
let assetsStore: SecurityAsset[] = getSecurityAssets();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const severity = searchParams.get('severity')?.toLowerCase() || '';
    const status = searchParams.get('status')?.toLowerCase() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let filtered = [...assetsStore];

    if (search) {
      filtered = filtered.filter(
        a =>
          a.name.toLowerCase().includes(search) ||
          a.type.toLowerCase().includes(search) ||
          a.department.toLowerCase().includes(search) ||
          a.ip.includes(search)
      );
    }

    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    if (severity) {
      if (severity === 'critical') filtered = filtered.filter(a => a.criticalVulnerabilities >= 2 || a.riskScore >= 75);
      else if (severity === 'high') filtered = filtered.filter(a => a.criticalVulnerabilities >= 1 || (a.riskScore >= 50 && a.riskScore < 75));
      else if (severity === 'medium') filtered = filtered.filter(a => a.riskScore >= 25 && a.riskScore < 50);
      else if (severity === 'low') filtered = filtered.filter(a => a.riskScore < 25);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: paginated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve security assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Missing required asset fields: name and type are mandatory.' },
        { status: 400 }
      );
    }

    const likelihood = Number(body.likelihood || 50);
    const impact = Number(body.impact || 50);
    const riskScore = Math.round(likelihood * 0.45 + impact * 0.55);

    const newAsset: SecurityAsset = {
      id: body.id || `AST-${1000 + assetsStore.length + 1}`,
      name: body.name,
      type: body.type,
      ip: body.ip || '10.0.1.50',
      department: body.department || 'Security Operations',
      likelihood,
      impact,
      vulnerabilityCount: Number(body.vulnerabilityCount || 0),
      criticalVulnerabilities: Number(body.criticalVulnerabilities || 0),
      riskScore,
      status: riskScore >= 75 ? 'compromised' : riskScore >= 50 ? 'warning' : 'secure',
    };

    assetsStore = [newAsset, ...assetsStore];

    return NextResponse.json(
      { success: true, message: 'Asset registered successfully', data: newAsset },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to register security asset' },
      { status: 500 }
    );
  }
}
