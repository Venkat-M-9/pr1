import { NextRequest, NextResponse } from 'next/server';
import { getMitreTechniques } from '@/lib/cybersecurityData';
import { MitreTechniqueItem } from '@/types/cybersecurity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tactic = searchParams.get('tactic')?.toLowerCase() || '';
    const severity = searchParams.get('severity')?.toLowerCase() || '';
    const search = searchParams.get('search')?.toLowerCase() || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let techniques: MitreTechniqueItem[] = getMitreTechniques();

    if (tactic) {
      techniques = techniques.filter(t => t.tactic.toLowerCase() === tactic);
    }

    if (severity) {
      techniques = techniques.filter(t => t.severity.toLowerCase() === severity);
    }

    if (search) {
      techniques = techniques.filter(
        t =>
          t.id.toLowerCase().includes(search) ||
          t.name.toLowerCase().includes(search) ||
          t.tactic.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }

    const totalDetections = techniques.reduce((acc, t) => acc + t.count, 0);

    // Tactic aggregation breakdown
    const tacticSummaryMap: Record<string, { count: number; detections: number; critical: number }> = {};
    getMitreTechniques().forEach(t => {
      if (!tacticSummaryMap[t.tactic]) {
        tacticSummaryMap[t.tactic] = { count: 0, detections: 0, critical: 0 };
      }
      tacticSummaryMap[t.tactic].count += 1;
      tacticSummaryMap[t.tactic].detections += t.count;
      if (t.severity === 'critical') tacticSummaryMap[t.tactic].critical += 1;
    });

    const tactics = Object.entries(tacticSummaryMap).map(([name, data]) => ({
      tactic: name,
      techniquesCount: data.count,
      totalDetections: data.detections,
      criticalCount: data.critical,
    }));

    return NextResponse.json({
      success: true,
      totalDetections,
      totalTechniques: techniques.length,
      tactics,
      data: techniques.slice(0, limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve MITRE ATT&CK techniques telemetry' },
      { status: 500 }
    );
  }
}
