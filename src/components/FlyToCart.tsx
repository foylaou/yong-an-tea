import { useEffect, useState, useRef } from 'react';
import { useFlyAnimationStore } from '../store/cart/fly-to-cart';

const TARGET_SELECTOR = {
  cart: '.minicart-item button',
  wishlist: '.wishlist-item a',
};

export default function FlyToCart() {
  const { flying, target, image, startX, startY, done } = useFlyAnimationStore();
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!flying) return;

    const el = document.querySelector(TARGET_SELECTOR[target]);
    if (!el) {
      done();
      return;
    }

    const rect = el.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    // Set initial position
    setStyle({
      position: 'fixed',
      left: startX,
      top: startY,
      width: 60,
      height: 60,
      borderRadius: '50%',
      objectFit: 'cover',
      zIndex: 9999,
      opacity: 1,
      transform: 'scale(1)',
      transition: 'none',
      pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    });
    setVisible(true);

    // Trigger the fly animation on next frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setStyle({
          position: 'fixed',
          left: endX - 15,
          top: endY - 15,
          width: 30,
          height: 30,
          borderRadius: '50%',
          objectFit: 'cover',
          zIndex: 9999,
          opacity: 0.2,
          transform: 'scale(0.3)',
          transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          pointerEvents: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        });
      });
    });

    const timer = setTimeout(() => {
      setVisible(false);
      done();
    }, 650);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [flying, target, startX, startY, image, done]);

  if (!visible || !image) return null;

  return <img src={image} alt="" style={style} />;
}
