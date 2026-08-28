import { NextResponse } from 'next/server';
import { getAttackSourceCountries } from '@/lib/cybersecurityData';

export async function GET() {
  try {
    const countries = getAttackSourceCountries();
    const totalAttacks = countries.reduce((acc, c) => acc + c.count, 0);

    return NextResponse.json({
      success: true,
      totalAttacks,
      countries,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve attack sources' },
      { status: 500 }
    );
  }
}
