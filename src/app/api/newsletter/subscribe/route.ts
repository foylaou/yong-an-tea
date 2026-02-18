import { NextRequest, NextResponse } from 'next/server';
import { subscribeApiSchema } from '@/lib/validations/newsletter';
import { subscribeEmail } from '@/lib/newsletter-db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = subscribeApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '請輸入有效的 Email' },
      { status: 400 }
    );
  }

  const { success, error } = await subscribeEmail(result.data.email);

  if (!success) {
    return NextResponse.json(
      { error: error || '訂閱失敗，請稍後再試' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: '訂閱成功' });
}
