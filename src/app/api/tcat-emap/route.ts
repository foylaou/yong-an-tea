import { NextRequest, NextResponse } from 'next/server';
import { getEMapFormData } from '@/lib/tcat';

/**
 * GET — 取得 7-11 電子地圖 POST 表單參數
 * Query: returnUrl (回傳結果的網址)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get('returnUrl');

  if (!returnUrl) {
    return NextResponse.json({ error: '缺少 returnUrl' }, { status: 400 });
  }

  try {
    const formData = await getEMapFormData({ returnUrl });
    return NextResponse.json(formData);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '取得電子地圖資料失敗' },
      { status: 500 },
    );
  }
}
