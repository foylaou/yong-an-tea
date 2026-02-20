import { create } from 'zustand';

type FlyTarget = 'cart' | 'wishlist';

interface FlyAnimationState {
  flying: boolean;
  target: FlyTarget;
  image: string;
  startX: number;
  startY: number;
  trigger: (target: FlyTarget, image: string, x: number, y: number) => void;
  done: () => void;
}

export const useFlyAnimationStore = create<FlyAnimationState>((set) => ({
  flying: false,
  target: 'cart',
  image: '',
  startX: 0,
  startY: 0,
  trigger: (target, image, x, y) =>
    set({ flying: true, target, image, startX: x, startY: y }),
  done: () => set({ flying: false }),
}));

/** @deprecated Use useFlyAnimationStore instead */
export const useFlyToCartStore = useFlyAnimationStore;
