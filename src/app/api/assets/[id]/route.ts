import { NextRequest, NextResponse } from 'next/server';
import { getSecurityAssets } from '@/lib/cybersecurityData';
import { SecurityAsset } from '@/types/cybersecurity';

let assetsStore: SecurityAsset[] = getSecurityAssets();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = assetsStore.find(a => a.id.toLowerCase() === id.toLowerCase());

    if (!asset) {
      return NextResponse.json({ error: `Asset with ID '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve asset' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = assetsStore.findIndex(a => a.id.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return NextResponse.json({ error: `Asset with ID '${id}' not found` }, { status: 404 });
    }

    const updates = await request.json();
    const existing = assetsStore[index];

    const likelihood = updates.likelihood !== undefined ? Number(updates.likelihood) : existing.likelihood;
    const impact = updates.impact !== undefined ? Number(updates.impact) : existing.impact;
    const riskScore = Math.round(likelihood * 0.45 + impact * 0.55);

    const updated: SecurityAsset = {
      ...existing,
      ...updates,
      likelihood,
      impact,
      riskScore,
      status: riskScore >= 75 ? 'compromised' : riskScore >= 50 ? 'warning' : 'secure',
    };

    assetsStore[index] = updated;

    return NextResponse.json({ success: true, message: 'Asset updated successfully', data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = assetsStore.findIndex(a => a.id.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return NextResponse.json({ error: `Asset with ID '${id}' not found` }, { status: 404 });
    }

    const removed = assetsStore.splice(index, 1)[0];

    return NextResponse.json({ success: true, message: 'Asset decommissioned successfully', data: removed });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
