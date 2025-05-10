import { NextResponse } from 'next/server';

const github_owner = 'moikas-code';
const github_repo = 'live_moikas';
const github_api_url = `https://api.github.com/repos/${github_owner}/${github_repo}/commits`;

export async function GET() {
  const response = await fetch(github_api_url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 });
  }

  const commits = await response.json();
  return NextResponse.json(commits);
} 