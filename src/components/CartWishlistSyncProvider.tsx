'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/store/cart/cart-slice';
import { useWishlistStore } from '@/store/wishlist/wishlist-slice';
import type { CartItem, WishlistItem } from '@/types';

// --------------- merge helpers ---------------

function mergeCartItems(
  local: CartItem[],
  server: CartItem[]
): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of server) {
    map.set(item.id, { ...item });
  }
  for (const item of local) {
    const existing = map.get(item.id);
    if (existing) {
      // Same product in both: take max quantity
      const qty = Math.max(existing.quantity, item.quantity);
      map.set(item.id, {
        ...item,
        quantity: qty,
        totalPrice: item.price * qty,
      });
    } else {
      map.set(item.id, { ...item });
    }
  }
  return Array.from(map.values());
}

function mergeWishlistItems(
  local: WishlistItem[],
  server: WishlistItem[]
): WishlistItem[] {
  const map = new Map<string, WishlistItem>();
  for (const item of server) {
    map.set(item.id, { ...item });
  }
  for (const item of local) {
    if (!map.has(item.id)) {
      map.set(item.id, { ...item });
    }
  }
  return Array.from(map.values());
}

// --------------- server push / pull ---------------

async function pushCartToServer(items: CartItem[]) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    }),
  });
}

async function pushWishlistToServer(items: WishlistItem[]) {
  await fetch('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map((i) => ({ product_id: i.id })),
    }),
  });
}

async function pullFromServer(): Promise<{
  cart: CartItem[];
  wishlist: WishlistItem[];
}> {
  const [cartRes, wishlistRes] = await Promise.all([
    fetch('/api/cart'),
    fetch('/api/wishlist'),
  ]);

  const cart: CartItem[] = cartRes.ok
    ? (await cartRes.json()).items ?? []
    : [];
  const wishlist: WishlistItem[] = wishlistRes.ok
    ? (await wishlistRes.json()).items ?? []
    : [];

  return { cart, wishlist };
}

// --------------- component ---------------

function CartWishlistSyncProvider() {
  const isLoggedIn = useRef(false);
  // Guard to skip the first store subscription fire that happens right after
  // we call replaceCart / replaceWishlist during the merge phase.
  const isMerging = useRef(false);

  const replaceCart = useCartStore((s) => s.replaceCart);
  const replaceWishlist = useWishlistStore((s) => s.replaceWishlist);

  // ---- Sync on auth change ----
  const handleSignIn = useCallback(async () => {
    isLoggedIn.current = true;
    isMerging.current = true;

    try {
      const { cart: serverCart, wishlist: serverWishlist } =
        await pullFromServer();

      const localCart = useCartStore.getState().items;
      const localWishlist = useWishlistStore.getState().items;

      const mergedCart = mergeCartItems(localCart, serverCart);
      const mergedWishlist = mergeWishlistItems(localWishlist, serverWishlist);

      // Update local stores
      replaceCart({
        totalQuantity: mergedCart.reduce((a, b) => a + b.quantity, 0),
        items: mergedCart,
      });
      replaceWishlist({
        totalQuantity: mergedWishlist.length,
        items: mergedWishlist,
      });

      // Push merged result to server
      await Promise.all([
        pushCartToServer(mergedCart),
        pushWishlistToServer(mergedWishlist),
      ]);
    } catch {
      // Silently fail — local data is still intact
    } finally {
      // Small delay so the subscribe callback skips the merge-triggered change
      setTimeout(() => {
        isMerging.current = false;
      }, 100);
    }
  }, [replaceCart, replaceWishlist]);

  // ---- Auth listener ----
  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        handleSignIn();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        handleSignIn();
      } else if (event === 'SIGNED_OUT') {
        isLoggedIn.current = false;
        // Don't clear local data — keep localStorage experience
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSignIn]);

  // ---- Background sync: debounced push on store change ----
  useEffect(() => {
    let cartTimer: ReturnType<typeof setTimeout>;
    let wishlistTimer: ReturnType<typeof setTimeout>;

    const unsubCart = useCartStore.subscribe((state) => {
      if (!isLoggedIn.current || isMerging.current) return;
      clearTimeout(cartTimer);
      cartTimer = setTimeout(() => {
        pushCartToServer(state.items).catch(() => {});
      }, 1000);
    });

    const unsubWishlist = useWishlistStore.subscribe((state) => {
      if (!isLoggedIn.current || isMerging.current) return;
      clearTimeout(wishlistTimer);
      wishlistTimer = setTimeout(() => {
        pushWishlistToServer(state.items).catch(() => {});
      }, 1000);
    });

    return () => {
      unsubCart();
      unsubWishlist();
      clearTimeout(cartTimer);
      clearTimeout(wishlistTimer);
    };
  }, []);

  return null;
}

export default CartWishlistSyncProvider;
