import { useEffect, useRef, useState, useCallback } from 'react';
import { useStratStore } from '@/stores/strat.store';
import { getSvgMapUrl } from '@/data/svgMapIndex';
import { mapLayers } from '@/data/mainData';

interface SvgMapViewProps {
  mapSlug: string;
  floorNumber: number;
  onSizeKnown?: (width: number, height: number) => void;
}

// In-memory cache for fetched SVG strings
const svgCache = new Map<string, string>();

export default function SvgMapView({ mapSlug, floorNumber, onSizeKnown }: SvgMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgLayerVisibility = useStratStore(s => s.svgLayerVisibility);

  // Fetch and inject SVG
  useEffect(() => {
    const url = getSvgMapUrl(mapSlug);
    if (!url) {
      setError('No SVG map available');
      return;
    }

    let cancelled = false;

    async function loadSvg() {
      setLoading(true);
      setError(null);

      try {
        let svgText = svgCache.get(url!);
        if (!svgText) {
          const res = await fetch(url!);
          if (!res.ok) throw new Error(`Failed to load SVG (${res.status})`);
          svgText = await res.text();
          svgCache.set(url!, svgText);
        }

        if (cancelled) return;

        if (containerRef.current) {
          containerRef.current.innerHTML = svgText;
          // Remove width/height attributes so SVG scales to container
          const svg = containerRef.current.querySelector('svg');
          if (svg) {
            // Report natural SVG dimensions via viewBox
            const vb = svg.getAttribute('viewBox');
            if (vb && onSizeKnown) {
              const parts = vb.split(/[\s,]+/).map(Number);
              if (parts.length === 4 && parts[2]! > 0 && parts[3]! > 0) {
                onSizeKnown(parts[2]!, parts[3]!);
              }
            }
            svg.removeAttribute('width');
            svg.removeAttribute('height');
            svg.style.width = '100%';
            svg.style.height = '100%';
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load SVG');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSvg();
    return () => { cancelled = true; };
  }, [mapSlug]);

  // Toggle floor visibility
  const updateFloorVisibility = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find all floor groups and toggle
    const allGroups = container.querySelectorAll<SVGGElement>('g[id^="Floor "]');
    for (const group of allGroups) {
      const floorId = group.id; // e.g., "Floor 1", "Floor -1"
      const floorNum = parseInt(floorId.replace('Floor ', ''), 10);
      group.style.display = floorNum === floorNumber ? 'inline' : 'none';
    }

    // Background elements are always visible
    const bgGroups = container.querySelectorAll<SVGGElement>(
      'g[id="Background"], g[id^="bg-"]'
    );
    for (const group of bgGroups) {
      group.style.display = 'inline';
    }
  }, [floorNumber]);

  // Toggle layer visibility based on store state
  const updateLayerVisibility = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    for (const layer of mapLayers) {
      const visible = svgLayerVisibility[layer.short] ?? layer.default;

      // Floor-specific layer groups: "{floorNum}-{code}"
      const layerGroups = container.querySelectorAll<SVGGElement>(
        `g[id$="-${layer.short}"]`
      );
      for (const group of layerGroups) {
        // Verify it's actually a floor-layer group (matches "{number}-{code}" pattern)
        if (/^-?\d+-/.test(group.id)) {
          group.style.display = visible ? 'inline' : 'none';
        }
      }

      // Background layer groups: "bg-{code}"
      const bgLayer = container.querySelector<SVGGElement>(`g[id="bg-${layer.short}"]`);
      if (bgLayer) {
        bgLayer.style.display = visible ? 'inline' : 'none';
      }
    }
  }, [svgLayerVisibility]);

  // Apply floor + layer visibility whenever they change
  useEffect(() => {
    updateFloorVisibility();
    updateLayerVisibility();
  }, [updateFloorVisibility, updateLayerVisibility, loading]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
        {error}
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-sm text-muted-foreground animate-pulse">Loading SVG map...</div>
        </div>
      )}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
}
