import { createAdminClient } from './supabase/admin';

// --- Subscribe / Unsubscribe ---

export async function subscribeEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Upsert: reactivate if previously unsubscribed
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, status: 'active', updated_at: new Date().toISOString() },
      { onConflict: 'email' }
    );

  if (error) {
    console.error('subscribeEmail error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('id')
    .single();

  if (error || !data) {
    console.error('unsubscribeByToken error:', error);
    return false;
  }
  return true;
}

// --- Subscriber queries ---

export interface Subscriber {
  id: string;
  email: string;
  status: string;
  unsubscribe_token: string;
  created_at: string;
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status, unsubscribe_token, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getActiveSubscribers error:', error);
    return [];
  }
  return (data ?? []) as Subscriber[];
}

export async function getSubscribersPaginated(
  page: number,
  perPage: number,
  search?: string
): Promise<{ subscribers: Subscriber[]; total: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('newsletter_subscribers')
    .select('id, email, status, unsubscribe_token, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error('getSubscribersPaginated error:', error);
    return { subscribers: [], total: 0 };
  }
  return { subscribers: (data ?? []) as Subscriber[], total: count ?? 0 };
}

// --- Newsletter CRUD ---

export interface Newsletter {
  id: string;
  subject: string;
  content_html: string;
  status: string;
  sent_at: string | null;
  sent_count: number;
  created_at: string;
  updated_at: string;
}

export async function getNewsletters(
  page: number,
  perPage: number
): Promise<{ newsletters: Newsletter[]; total: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from('newsletters')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('getNewsletters error:', error);
    return { newsletters: [], total: 0 };
  }
  return { newsletters: (data ?? []) as Newsletter[], total: count ?? 0 };
}

export async function getNewsletterById(id: string): Promise<Newsletter | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Newsletter;
}

export async function createNewsletter(
  subject: string,
  contentHtml: string
): Promise<Newsletter | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('newsletters')
    .insert({ subject, content_html: contentHtml })
    .select()
    .single();

  if (error) {
    console.error('createNewsletter error:', error);
    return null;
  }
  return data as Newsletter;
}

export async function updateNewsletter(
  id: string,
  subject: string,
  contentHtml: string
): Promise<Newsletter | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('newsletters')
    .update({ subject, content_html: contentHtml, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'draft')
    .select()
    .single();

  if (error) {
    console.error('updateNewsletter error:', error);
    return null;
  }
  return data as Newsletter;
}

export async function deleteNewsletter(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', id)
    .eq('status', 'draft');

  if (error) {
    console.error('deleteNewsletter error:', error);
    return false;
  }
  return true;
}

export async function markNewsletterSent(id: string, count: number): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('newsletters')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_count: count,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('markNewsletterSent error:', error);
    return false;
  }
  return true;
}
