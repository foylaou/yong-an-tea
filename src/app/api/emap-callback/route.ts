import { NextRequest, NextResponse } from 'next/server';

/**
 * 7-11 電子地圖回傳 API
 * EMap 選完門市後會 POST form data 到此 URL
 * 此 route 將 POST body 轉為 query params 並 redirect 到前台 callback 頁面
 */

// Handle POST (EMap form submission)
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params = new URLSearchParams();

  // Extract all form fields and forward as query params
  for (const [key, value] of formData.entries()) {
    params.set(key, String(value));
  }

  const redirectUrl = new URL('/emap-callback', request.url);
  redirectUrl.search = params.toString();

  return NextResponse.redirect(redirectUrl.toString(), 303);
}

// Handle GET (in case EMap redirects via GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = new URL('/emap-callback', request.url);
  redirectUrl.search = searchParams.toString();

  return NextResponse.redirect(redirectUrl.toString(), 303);
}
