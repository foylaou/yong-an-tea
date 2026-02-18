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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  let sentCount = 0;

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;
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
