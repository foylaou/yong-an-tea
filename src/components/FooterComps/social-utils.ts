interface SocialItem {
  id: string;
  socialIcon: string;
  path: string;
  title?: string;
}

interface SettingsWithSocial {
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_pinterest: string;
  social_tumblr: string;
}

export function buildSocialList(settings: SettingsWithSocial): SocialItem[] {
  const list: SocialItem[] = [];
  if (settings.social_facebook) list.push({ id: 'fb', socialIcon: 'FaFacebookF', path: settings.social_facebook, title: 'Facebook' });
  if (settings.social_twitter) list.push({ id: 'tw', socialIcon: 'FaTwitter', path: settings.social_twitter, title: 'Twitter' });
  if (settings.social_instagram) list.push({ id: 'ig', socialIcon: 'FaInstagram', path: settings.social_instagram, title: 'Instagram' });
  if (settings.social_pinterest) list.push({ id: 'pi', socialIcon: 'FaPinterestP', path: settings.social_pinterest, title: 'Pinterest' });
  if (settings.social_tumblr) list.push({ id: 'tu', socialIcon: 'FaTumblr', path: settings.social_tumblr, title: 'Tumblr' });
  return list;
}
