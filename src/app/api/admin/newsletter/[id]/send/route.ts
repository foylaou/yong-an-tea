import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNewsletterById, getActiveSubscribers, markNewsletterSent } from '@/lib/newsletter-db';
import { sendEmail } from '@/lib/email';
import { newsletterWrapperEmail } from '@/lib/email-templates';

async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;
  return user;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const newsletter = await getNewsletterById(id);
  if (!newsletter) {
    return NextResponse.json({ error: '電子報不存在' }, { status: 404 });
  }

  if (newsletter.status === 'sent') {
    return NextResponse.json({ error: '此電子報已發送過' }, { status: 400 });
  }

  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) {
    return NextResponse.json({ error: '目前沒有活躍的訂閱者' }, { status: 400 });
  }

  const configuredBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredBaseUrl) {
    return NextResponse.json({ error: '站點網址未設定' }, { status: 500 });
  }

  let baseUrl: string;
  try {
    const parsedBaseUrl = new URL(configuredBaseUrl);
    if (parsedBaseUrl.protocol !== 'http:' && parsedBaseUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
    baseUrl = parsedBaseUrl.origin;
  } catch {
    return NextResponse.json({ error: '站點網址設定無效' }, { status: 500 });
  }

  let sentCount = 0;

  for (const subscriber of subscribers) {
    const unsubscribeLink = new URL('/api/newsletter/unsubscribe', baseUrl);
    unsubscribeLink.searchParams.set('token', subscriber.unsubscribe_token);
    const unsubscribeUrl = unsubscribeLink.toString();
    const html = newsletterWrapperEmail(newsletter.content_html, unsubscribeUrl);

    const result = await sendEmail({
      to: subscriber.email,
      subject: newsletter.subject,
      html,
    });

    if (result.success) {
      sentCount++;
    }

    // Throttle to avoid SMTP rate limits
    await sleep(50);
  }

  await markNewsletterSent(id, sentCount);

  return NextResponse.json({
    message: '發送完成',
    sentCount,
    totalSubscribers: subscribers.length,
  });
}
