/**
 * Background layer — renders the SVG map view for the current floor.
 */

import { lazy, Suspense } from 'react';

const SvgMapView = lazy(() => import('@/features/strat/components/SvgMapView'));

interface BackgroundLayerProps {
  mapSlug?: string;
  floorNumber?: number;
  onImageLoaded: (width: number, height: number) => void;
}

export function BackgroundLayer({
  mapSlug,
  floorNumber,
  onImageLoaded,
}: BackgroundLayerProps) {
  return (
    <>
      {mapSlug && floorNumber != null && (
        <Suspense fallback={null}>
          <SvgMapView mapSlug={mapSlug} floorNumber={floorNumber} onSizeKnown={onImageLoaded} />
        </Suspense>
      )}
    </>
  );
}
