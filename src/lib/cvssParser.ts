import { CVSSBreakdown, ThreatSeverity } from '@/types/cybersecurity';

export function parseCVSSVector(vectorString: string, baseScore: number = 7.5): CVSSBreakdown {
  const cleanVector = vectorString.trim();
  const parts = cleanVector.split('/');
  
  const metricMap: Record<string, string> = {};
  parts.forEach(part => {
    const [key, val] = part.split(':');
    if (key && val) {
      metricMap[key] = val;
    }
  });

  // Attack Vector (AV): Network (N), Adjacent (A), Local (L), Physical (P)
  const avCode = metricMap['AV'] || 'N';
  const avMap: Record<string, { label: string; desc: string }> = {
    N: { label: 'Network', desc: 'Remotely exploitable over the internet without physical or local access.' },
    A: { label: 'Adjacent', desc: 'Exploitable only from the same physical or logical network (e.g. subnet/Bluetooth).' },
    L: { label: 'Local', desc: 'Requires local access or command execution on the target machine.' },
    P: { label: 'Physical', desc: 'Requires physical interaction with the vulnerable device.' },
  };

  // Attack Complexity (AC): Low (L), High (H)
  const acCode = metricMap['AC'] || 'L';
  const acMap: Record<string, { label: string; desc: string }> = {
    L: { label: 'Low', desc: 'Specialized conditions do not exist. Attacker can reliably repeat exploit.' },
    H: { label: 'High', desc: 'Successful attack depends on conditions beyond the attacker’s control.' },
  };

  // Privileges Required (PR): None (N), Low (L), High (H)
  const prCode = metricMap['PR'] || 'N';
  const prMap: Record<string, { label: string; desc: string }> = {
    N: { label: 'None', desc: 'Attacker is unauthorized prior to attack, requiring no access to settings/files.' },
    L: { label: 'Low', desc: 'Attacker requires basic user privileges to execute attack.' },
    H: { label: 'High', desc: 'Attacker requires administrative or elevated privileges.' },
  };

  // User Interaction (UI): None (N), Required (R)
  const uiCode = metricMap['UI'] || 'N';
  const uiMap: Record<string, { label: string; desc: string }> = {
    N: { label: 'None', desc: 'Vulnerability can be exploited without any user interaction.' },
    R: { label: 'Required', desc: 'Victim must take some action (e.g. click a link, open an attachment).' },
  };

  // Scope (S): Unchanged (U), Changed (C)
  const sCode = metricMap['S'] || 'U';
  const sMap: Record<string, { label: string; desc: string }> = {
    U: { label: 'Unchanged', desc: 'Vulnerability only affects resources managed by the same security authority.' },
    C: { label: 'Changed', desc: 'Exploited vulnerability impacts resources beyond its security scope (e.g. sandbox escape).' },
  };

  // Confidentiality (C): High (H), Low (L), None (N)
  const cCode = metricMap['C'] || 'H';
  const cMap: Record<string, { label: string; desc: string }> = {
    H: { label: 'High', desc: 'Total loss of confidentiality; all system data is exposed to attacker.' },
    L: { label: 'Low', desc: 'Partial disclosure; access to restricted information is limited.' },
    N: { label: 'None', desc: 'No loss of confidentiality within the impacted component.' },
  };

  // Integrity (I): High (H), Low (L), None (N)
  const iCode = metricMap['I'] || 'H';
  const iMap: Record<string, { label: string; desc: string }> = {
    H: { label: 'High', desc: 'Total compromise of integrity; attacker can modify any data or system files.' },
    L: { label: 'Low', desc: 'Modification of data is possible, but attacker has limited control.' },
    N: { label: 'None', desc: 'No loss of integrity within the impacted component.' },
  };

  // Availability (A): High (H), Low (L), None (N)
  const aCode = metricMap['A'] || 'H';
  const aMap: Record<string, { label: string; desc: string }> = {
    H: { label: 'High', desc: 'Total shutdown or denial of service; attacker can render component completely unavailable.' },
    L: { label: 'Low', desc: 'Performance is reduced or availability is intermittently interrupted.' },
    N: { label: 'None', desc: 'No impact on availability of the system.' },
  };

  return {
    version: '3.1',
    vectorString: cleanVector,
    baseScore,
    attackVector: { code: avCode, label: avMap[avCode]?.label || avCode, desc: avMap[avCode]?.desc || '' },
    attackComplexity: { code: acCode, label: acMap[acCode]?.label || acCode, desc: acMap[acCode]?.desc || '' },
    privilegesRequired: { code: prCode, label: prMap[prCode]?.label || prCode, desc: prMap[prCode]?.desc || '' },
    userInteraction: { code: uiCode, label: uiMap[uiCode]?.label || uiCode, desc: uiMap[uiCode]?.desc || '' },
    scope: { code: sCode, label: sMap[sCode]?.label || sCode, desc: sMap[sCode]?.desc || '' },
    confidentialityImpact: { code: cCode, label: cMap[cCode]?.label || cCode, desc: cMap[cCode]?.desc || '' },
    integrityImpact: { code: iCode, label: iMap[iCode]?.label || iCode, desc: iMap[iCode]?.desc || '' },
    availabilityImpact: { code: aCode, label: aMap[aCode]?.label || aCode, desc: aMap[aCode]?.desc || '' },
  };
}

export function getSeverityFromCVSS(score: number): ThreatSeverity {
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  return 'low';
}

export function getCVSSColor(score: number): string {
  if (score >= 9.0) return 'var(--danger, #dc3545)';
  if (score >= 7.0) return '#ea580c';
  if (score >= 4.0) return '#d97706';
  return 'var(--success, #28a745)';
}
