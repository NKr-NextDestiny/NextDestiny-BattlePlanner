/**
 * Coordinate conversion between screen space and canvas space.
 *
 * The canvas uses a CSS transform: translate(offsetX, offsetY) scale(scale)
 * with transformOrigin '0 0'. To convert a mouse position (clientX/Y) into
 * the coordinate system of the underlying canvas, we subtract the container
 * position and the viewport offset, then divide by the scale factor.
 */

export function screenToCanvas(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  offsetX: number,
  offsetY: number,
  scale: number,
): { x: number; y: number } {
  const canvasX = (clientX - containerRect.left - offsetX) / scale;
  const canvasY = (clientY - containerRect.top - offsetY) / scale;
  return { x: canvasX, y: canvasY };
}
