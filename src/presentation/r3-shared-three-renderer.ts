import { WebGLRenderer } from 'three';

type SharedRenderer = { renderer: WebGLRenderer; owners: Set<string> };

const renderers = new WeakMap<WebGL2RenderingContext, SharedRenderer>();

declare global {
  interface Window { __r3ThreeRenderer?: { active: number; owners: string[] } }
}

function publish(entry?: SharedRenderer) {
  window.__r3ThreeRenderer = entry
    ? { active: 1, owners: [...entry.owners].sort() }
    : { active: 0, owners: [] };
}

/**
 * MapLibre custom layers share its canvas and WebGL context. Creating a Three
 * renderer per layer duplicates GPU caches and disposal can invalidate the
 * other layer's state, so all miniature layers lease this single renderer.
 */
export function acquireR3ThreeRenderer(canvas: HTMLCanvasElement, context: WebGL2RenderingContext, owner: string) {
  let entry = renderers.get(context);
  if (!entry) {
    const renderer = new WebGLRenderer({ canvas, context, antialias: false });
    renderer.autoClear = false;
    entry = { renderer, owners: new Set() };
    renderers.set(context, entry);
  }
  entry.owners.add(owner);
  publish(entry);
  return entry.renderer;
}

export function releaseR3ThreeRenderer(context: WebGL2RenderingContext | undefined, owner: string) {
  if (!context) return;
  const entry = renderers.get(context);
  if (!entry) return;
  entry.owners.delete(owner);
  if (entry.owners.size === 0) {
    entry.renderer.dispose();
    renderers.delete(context);
    publish();
  } else {
    publish(entry);
  }
}
