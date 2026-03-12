import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { productApiSchema } from '@/lib/validations/product';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = productApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: '驗證失敗', details: result.error.flatten() }, { status: 400 });
  }

  const { category_ids, ...productData } = result.data;
  const variants = body.variants as any[] | undefined;

  // Update product
  const { data: product, error: updateError } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Rebuild product_categories: delete all then re-insert
  await supabase
    .from('product_categories')
    .delete()
    .eq('product_id', id);

  if (category_ids.length > 0) {
    const { error: catError } = await supabase
      .from('product_categories')
      .insert(category_ids.map((cid) => ({
        product_id: id,
        category_id: cid,
      })));
    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 500 });
    }
  }

  // Rebuild variants: delete all then re-insert
  if (variants !== undefined) {
    await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);

    if (variants.length > 0) {
      const { error: varError } = await supabase
        .from('product_variants')
        .insert(variants.map((v: any, idx: number) => ({
          product_id: id,
          name: v.name,
          price: v.price,
          discount_price: v.discount_price || null,
          stock_qty: v.stock_qty ?? 0,
          sku: v.sku || null,
          sort_order: idx,
          is_active: v.is_active ?? true,
        })));
      if (varError) {
        return NextResponse.json({ error: varError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ product });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const isActive = body.is_active;

  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: '缺少 is_active 參數' }, { status: 400 });
  }

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const hard = searchParams.get('hard') === 'true';

  if (hard) {
    // Hard delete: permanently remove product and its category links
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Soft delete: set is_active = false
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
