import { jsPDF } from 'jspdf';
import { renderDraw } from '../rendering/renderDraw';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function compositeFloor(
  bgImage: HTMLImageElement,
  draws: any[],
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = bgImage.width;
  canvas.height = bgImage.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bgImage, 0, 0);
  for (const draw of draws) {
    if (draw.isDeleted) continue;
    renderDraw(ctx, draw);
  }
  return canvas;
}

interface FloorData {
  id: string;
  mapFloor?: { name: string; imagePath: string };
  draws?: any[];
}

/**
 * Export the current floor as a PNG image download.
 */
export async function exportFloorAsPng(
  floor: FloorData,
  localDraws: any[],
  activeImagePath?: string,
) {
  const imgPath = activeImagePath ?? floor.mapFloor?.imagePath;
  if (!imgPath) return;

  const bgImage = await loadImage(`/uploads${imgPath}`);
  const allDraws = [...(floor.draws || []), ...localDraws];
  const canvas = compositeFloor(bgImage, allDraws);

  const link = document.createElement('a');
  link.download = `${floor.mapFloor?.name || 'floor'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Export all floors as a multi-page landscape PDF.
 */
export async function exportAllFloorsAsPdf(
  floors: FloorData[],
  localDraws: Record<string, any[]>,
  fileName: string,
) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt' });

  for (let i = 0; i < floors.length; i++) {
    const floor = floors[i]!;
    const imgPath = floor.mapFloor?.imagePath;
    if (!imgPath) continue;

    const bgImage = await loadImage(`/uploads${imgPath}`);
    const allDraws = [...(floor.draws || []), ...(localDraws[floor.id] || [])];
    const canvas = compositeFloor(bgImage, allDraws);

    if (i > 0) pdf.addPage();

    const dataUrl = canvas.toDataURL('image/png');
    const ratio = bgImage.width / bgImage.height;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;
    const fitW = Math.min(availW, availH * ratio);
    const fitH = fitW / ratio;

    pdf.setFontSize(12);
    pdf.text(floor.mapFloor?.name || `Floor ${i + 1}`, margin, margin - 4);

    pdf.addImage(
      dataUrl, 'PNG',
      (pageW - fitW) / 2,
      margin + 10 + (availH - fitH - 10) / 2,
      fitW, fitH,
    );
  }

  pdf.save(`${fileName}.pdf`);
}
