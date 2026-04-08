export interface Game {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Map {
  id: string;
  gameId: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  isCompetitive: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  floors?: MapFloor[];
}

export interface MapFloor {
  id: string;
  mapId: string;
  name: string;
  floorNumber: number;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  id: string;
  gameId: string;
  name: string;
  icon: string | null;
  color: string;
  isAttacker: boolean;
  createdAt: string;
  updatedAt: string;
  gadgets?: Gadget[];
}

export type GadgetCategory = 'unique' | 'secondary' | 'general';

export interface Gadget {
  id: string;
  gameId: string;
  name: string;
  icon: string | null;
  category: GadgetCategory;
  createdAt: string;
  updatedAt: string;
}
