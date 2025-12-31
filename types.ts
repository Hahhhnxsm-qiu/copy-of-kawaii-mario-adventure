
export interface Vector {
  x: number;
  y: number;
}

export type PowerUpType = 'SPEED' | 'SIZE' | 'NONE';

export interface Entity {
  id: string;
  pos: Vector;
  vel: Vector;
  width: number;
  height: number;
  type: 'player' | 'platform' | 'enemy' | 'coin' | 'goal' | 'trap' | 'block';
  sprite: string;
  color: string;
  isHit?: boolean;
}

export interface GameEvent {
  id: number;
  type: 'jump' | 'hit' | 'coin' | 'win' | 'start' | 'powerup';
  emoji: string;
  text: string;
  pos: Vector;
  lifetime: number;
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  WON = 'WON'
}
