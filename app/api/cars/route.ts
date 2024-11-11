// app/api/cars/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://www.carqueryapi.com/api/0.3/';

// La nouvelle façon de configurer les options de route dans Next.js 13+
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 3600; // revalidate every hour

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const cmd = searchParams.get('cmd');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');

    // Construire l'URL de l'API
    let apiUrl = `${BASE_URL}?format=json`;
    if (cmd) apiUrl += `&cmd=${cmd}`;
    if (make) apiUrl += `&make=${make}`;
    if (model) apiUrl += `&model=${model}`;
    if (year) apiUrl += `&year=${year}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Car API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car data' },
      { status: 500 }
    );
  }
}

// Gestionnaire des requêtes OPTIONS pour CORS
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}