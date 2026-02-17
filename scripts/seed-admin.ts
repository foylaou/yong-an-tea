import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAIL = 'admin@helendo.com';
const ADMIN_PASSWORD = 'admin123456';
const ADMIN_NAME = 'Admin';

async function main() {
  console.log('Seeding admin user...\n');

  // 1. Create user via admin API (auto-confirms email)
  const { data: userData, error: createError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME },
    });

  if (createError) {
    // If user already exists, try to find them
    if (createError.message.includes('already been registered')) {
      console.log('User already exists, updating role to admin...');
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existing = usersData?.users?.find((u: any) => u.email === ADMIN_EMAIL);
      if (existing) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin', full_name: ADMIN_NAME })
          .eq('id', existing.id);
        if (updateError) {
          console.error('Failed to update profile:', updateError.message);
        } else {
          console.log(`Updated profile for ${ADMIN_EMAIL} to admin role.`);
        }
      }
      return;
    }
    console.error('Failed to create user:', createError.message);
    return;
  }

  console.log(`Created user: ${userData.user.email} (${userData.user.id})`);

  // 2. Update profile role to admin
  // Wait briefly for the trigger to create the profile
  await new Promise((r) => setTimeout(r, 1000));

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin', full_name: ADMIN_NAME })
    .eq('id', userData.user.id);

  if (updateError) {
    console.error('Failed to update profile:', updateError.message);
  } else {
    console.log(`Set role to admin for ${ADMIN_EMAIL}`);
  }

  console.log('\nAdmin seed complete!');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}

main().catch(console.error);
