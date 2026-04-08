/**
 * Viewport management hook.
 *
 * Handles:
 * - ResizeObserver: recenter viewport when container size changes
 * - Floor change: reset viewport when switching floors
 * - WASD / Arrow key panning: smooth RAF-based continuous pan
 */

import { useEffect } from 'react';
import { useCanvasStore } from '@/stores/canvas.store';

const PAN_SPEED = 8;
const PAN_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);

export function useViewport(
  containerRef: React.RefObject<HTMLDivElement | null>,
  floorIndex: number,
) {
  // ResizeObserver — recenter when container resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let debounceId: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver(() => {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        const { width, height } = container.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;

        const store = useCanvasStore.getState();
        if (store.imageWidth > 0 && store.imageHeight > 0) {
          store.setDimensions(store.imageWidth, store.imageHeight, width, height);
          store.resetViewport();
        }
      }, 100);
    });

    observer.observe(container);
    return () => {
      if (debounceId) clearTimeout(debounceId);
      observer.disconnect();
    };
  }, [containerRef]);

  // Reset viewport when switching floors
  useEffect(() => {
    useCanvasStore.getState().resetViewport();
  }, [floorIndex]);

  // WASD + Arrow key panning (RAF loop)
  useEffect(() => {
    const pressed = new Set<string>();
    let animId: number | null = null;

    function loop() {
      let dx = 0;
      let dy = 0;

      if (pressed.has('w') || pressed.has('arrowup')) dy += PAN_SPEED;
      if (pressed.has('s') || pressed.has('arrowdown')) dy -= PAN_SPEED;
      if (pressed.has('a') || pressed.has('arrowleft')) dx += PAN_SPEED;
      if (pressed.has('d') || pressed.has('arrowright')) dx -= PAN_SPEED;

      if (dx !== 0 || dy !== 0) {
        useCanvasStore.getState().panBy(dx, dy);
        animId = requestAnimationFrame(loop);
      } else {
        animId = null;
      }
    }

    function startLoop() {
      if (animId === null) {
        animId = requestAnimationFrame(loop);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (PAN_KEYS.has(key)) {
        e.preventDefault();
        pressed.add(key);
        startLoop();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      pressed.delete(e.key.toLowerCase());
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
}
