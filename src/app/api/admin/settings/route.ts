import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { settingsUpdateApiSchema, settingsSchemaMap } from '@/lib/validations/settings';

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '未授權', status: 401 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: '權限不足', status: 403 };
  return null;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const authError = await verifyAdmin(supabase);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group');

  let query = supabase.from('site_settings').select('*');
  if (group) {
    query = query.eq('group', group);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to flat { [key]: value } object grouped by group
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const row of data) {
    if (!grouped[row.group]) {
      grouped[row.group] = {};
    }
    grouped[row.group][row.key] = row.value;
  }

  return NextResponse.json({ settings: grouped });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const authError = await verifyAdmin(supabase);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const body = await request.json();

  // Validate top-level structure
  const parsed = settingsUpdateApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '請求格式不正確', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { group, settings } = parsed.data;

  // Validate settings with group-specific schema
  const schema = settingsSchemaMap[group];
  if (!schema) {
    return NextResponse.json({ error: '無效的設定群組' }, { status: 400 });
  }

  const validated = schema.safeParse(settings);
  if (!validated.success) {
    return NextResponse.json(
      { error: '設定值驗證失敗', details: validated.error.flatten() },
      { status: 400 }
    );
  }

  // Upsert each setting
  const validatedData = validated.data as Record<string, unknown>;
  const upserts = Object.entries(validatedData).map(([key, value]) => ({
    key,
    value: value as never,
    group,
  }));

  const { error } = await supabase
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
