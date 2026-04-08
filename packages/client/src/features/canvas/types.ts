export interface MapFloor {
  id: string;
  name: string;
  floorNumber: number;
  imagePath?: string | null;
}

export interface Floor {
  id: string;
  mapFloorId: string;
  mapFloor?: MapFloor;
  draws?: any[];
}

export interface LaserLineData {
  id: string;
  userId: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  fadeStart?: number;
}

export interface CursorData {
  x: number;
  y: number;
  color: string;
  userId: string;
  isLaser?: boolean;
}
