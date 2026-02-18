import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/newsletter-db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(htmlPage('退訂失敗', '無效的退訂連結。'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const success = await unsubscribeByToken(token);

  if (!success) {
    return new NextResponse(htmlPage('退訂失敗', '無效或已過期的退訂連結。'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return new NextResponse(htmlPage('退訂成功', '您已成功退訂電子報。如有需要，歡迎隨時重新訂閱。'), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;">
<div style="background:#fff;border-radius:8px;padding:48px;text-align:center;max-width:400px;">
<h1 style="color:#222;font-size:24px;margin:0 0 16px;">${title}</h1>
<p style="color:#666;line-height:1.6;">${message}</p>
</div>
</body>
</html>`;
}
