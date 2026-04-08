import { create } from 'zustand';
import { Tool, DEFAULT_COLOR, DEFAULT_LINE_WIDTH, DEFAULT_FONT_SIZE, ZOOM_MIN, ZOOM_MAX } from '@nd-battleplanner/shared';

export interface DrawHistoryEntry {
  id: string;
  floorId: string;
  payload: any;
  action: 'create' | 'update';
  previousState?: any;
}

interface CanvasStoreState {
  tool: Tool;
  color: string;
  lineWidth: number;
  fontSize: number;
  selectedIcon: { type: 'operator' | 'gadget'; id: string; url: string; name?: string; color?: string; operatorIcon?: string } | null;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setSelectedIcon: (icon: { type: 'operator' | 'gadget'; id: string; url: string; name?: string; color?: string; operatorIcon?: string } | null) => void;

  offsetX: number;
  offsetY: number;
  scale: number;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  zoomTo: (newScale: number, pivotX: number, pivotY: number) => void;
  panBy: (dx: number, dy: number) => void;
  setDimensions: (imgW: number, imgH: number, contW: number, contH: number) => void;
  resetViewport: () => void;

  selectedDrawId: string | null;
  setSelectedDrawId: (id: string | null) => void;
  interactionMode: 'none' | 'move' | 'resize' | 'rotate';
  activeResizeHandle: string | null;
  setInteractionMode: (mode: 'none' | 'move' | 'resize' | 'rotate') => void;
  setActiveResizeHandle: (handle: string | null) => void;

  myDrawHistory: DrawHistoryEntry[];
  undoStack: DrawHistoryEntry[];
  pushMyDraw: (entry: Omit<DrawHistoryEntry, 'action'>) => void;
  pushMyUpdate: (entry: { id: string; floorId: string; payload: any; previousState: any }) => void;
  popUndo: () => DrawHistoryEntry | null;
  popRedo: () => DrawHistoryEntry | null;
  updateDrawId: (oldId: string, newId: string) => void;
  clearHistory: () => void;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  tool: Tool.Pen,
  color: DEFAULT_COLOR,
  lineWidth: DEFAULT_LINE_WIDTH,
  fontSize: DEFAULT_FONT_SIZE,
  selectedIcon: null,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setLineWidth: (lineWidth) => set({ lineWidth }),
  setFontSize: (fontSize) => set({ fontSize }),
  setSelectedIcon: (selectedIcon) => set({ selectedIcon }),

  offsetX: 0,
  offsetY: 0,
  scale: 1,
  imageWidth: 0,
  imageHeight: 0,
  containerWidth: 0,
  containerHeight: 0,

  zoomTo: (newScale, pivotX, pivotY) => {
    const s = get();
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale));
    const ratio = clamped / s.scale;
    set({
      scale: clamped,
      offsetX: pivotX - (pivotX - s.offsetX) * ratio,
      offsetY: pivotY - (pivotY - s.offsetY) * ratio,
    });
  },

  panBy: (dx, dy) => set((s) => ({ offsetX: s.offsetX + dx, offsetY: s.offsetY + dy })),

  setDimensions: (imgW, imgH, contW, contH) => set({
    imageWidth: imgW,
    imageHeight: imgH,
    containerWidth: contW,
    containerHeight: contH,
  }),

  resetViewport: () => {
    const { imageWidth, imageHeight, containerWidth, containerHeight } = get();
    if (!imageWidth || !imageHeight || !containerWidth || !containerHeight) {
      set({ offsetX: 0, offsetY: 0, scale: 1 });
      return;
    }
    const fitScale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight, 1);
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitScale));
    set({
      scale: clamped,
      offsetX: (containerWidth - imageWidth * clamped) / 2,
      offsetY: (containerHeight - imageHeight * clamped) / 2,
    });
  },

  selectedDrawId: null,
  setSelectedDrawId: (id) => set({ selectedDrawId: id }),
  interactionMode: 'none' as const,
  activeResizeHandle: null,
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  setActiveResizeHandle: (handle) => set({ activeResizeHandle: handle }),

  myDrawHistory: [],
  undoStack: [],

  pushMyDraw: (entry) => set((s) => ({
    myDrawHistory: [...s.myDrawHistory, { ...entry, action: 'create' as const }],
    undoStack: [],
  })),

  pushMyUpdate: (entry) => set((s) => ({
    myDrawHistory: [...s.myDrawHistory, { ...entry, action: 'update' as const }],
    undoStack: [],
  })),

  popUndo: () => {
    const s = get();
    if (s.myDrawHistory.length === 0) return null;
    const entry = s.myDrawHistory[s.myDrawHistory.length - 1]!;
    set({
      myDrawHistory: s.myDrawHistory.slice(0, -1),
      undoStack: [...s.undoStack, entry],
    });
    return entry;
  },

  popRedo: () => {
    const s = get();
    if (s.undoStack.length === 0) return null;
    const entry = s.undoStack[s.undoStack.length - 1]!;
    set({
      undoStack: s.undoStack.slice(0, -1),
      myDrawHistory: [...s.myDrawHistory, entry],
    });
    return entry;
  },

  updateDrawId: (oldId, newId) => set((s) => ({
    myDrawHistory: s.myDrawHistory.map(e => e.id === oldId ? { ...e, id: newId } : e),
    undoStack: s.undoStack.map(e => e.id === oldId ? { ...e, id: newId } : e),
  })),

  clearHistory: () => set({ myDrawHistory: [], undoStack: [] }),
}));
