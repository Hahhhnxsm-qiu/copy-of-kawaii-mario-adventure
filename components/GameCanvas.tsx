
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Entity, Vector, GameEvent, GameStatus, PowerUpType } from '../types';
import { 
  GRAVITY, JUMP_FORCE, ACCELERATION, FRICTION, MAX_SPEED, 
  CANVAS_WIDTH, CANVAS_HEIGHT, THEME, EMOJI_MAP,
  POWERUP_SPEED_DURATION, POWERUP_SIZE_DURATION
} from '../constants';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (score: number) => void;
  onWin: (score: number) => void;
  onScoreChange: (score: number) => void;
}

const BLOCK_SIZE = 40;

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver, onWin, onScoreChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [events, setEvents] = useState<GameEvent[]>([]);
  
  const playerRef = useRef<Entity & { 
    grounded: boolean, 
    activePowerUps: { type: PowerUpType, timer: number }[] 
  }>({
    id: 'player',
    pos: { x: 100, y: 400 },
    vel: { x: 0, y: 0 },
    width: 44,
    height: 44,
    type: 'player',
    sprite: THEME.player,
    color: THEME.accent,
    grounded: false,
    activePowerUps: []
  });
  
  const scoreRef = useRef(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const cameraRef = useRef(0);
  const levelRef = useRef<Entity[]>([]);

  const initLevel = () => {
    const newLevel: Entity[] = [];
    
    // 1. Create solid ground layer
    for (let i = 0; i < 200; i++) {
      // Occasional pits for challenge
      if (i > 20 && i % 30 < 3) continue;

      newLevel.push({
        id: `floor-${i}`,
        pos: { x: i * BLOCK_SIZE, y: CANVAS_HEIGHT - BLOCK_SIZE * 2 },
        vel: { x: 0, y: 0 },
        width: BLOCK_SIZE,
        height: BLOCK_SIZE * 2,
        type: 'platform',
        sprite: '',
        color: THEME.ground
      });
    }

    // 2. Add structured obstacles and "Mario" block patterns
    const addStructure = (xStart: number, yLevel: number, type: 'bricks' | 'question' | 'stairs', length: number) => {
      for (let j = 0; j < length; j++) {
        const x = xStart + j * BLOCK_SIZE;
        const y = CANVAS_HEIGHT - BLOCK_SIZE * yLevel;

        if (type === 'question') {
          newLevel.push({
            id: `q-${x}-${y}`,
            pos: { x, y },
            vel: { x: 0, y: 0 },
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            type: 'block',
            sprite: THEME.block,
            color: 'gold',
            isHit: false
          });
        } else if (type === 'bricks') {
          newLevel.push({
            id: `b-${x}-${y}`,
            pos: { x, y },
            vel: { x: 0, y: 0 },
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            type: 'platform',
            sprite: '',
            color: '#2d1b4e'
          });
        }
      }
    };

    // Level design layout
    addStructure(400, 5, 'bricks', 3);
    addStructure(520, 5, 'question', 1);
    addStructure(640, 5, 'bricks', 3);
    
    addStructure(1000, 4, 'bricks', 5);
    addStructure(1080, 7, 'question', 1);
    
    addStructure(1500, 5, 'question', 3);
    addStructure(1800, 4, 'bricks', 2);
    addStructure(1900, 7, 'bricks', 2);
    addStructure(2000, 9, 'question', 1);

    // 3. Add enemies and traps
    for (let i = 1; i < 20; i++) {
      const xBase = i * 600;
      // Enemy
      newLevel.push({
        id: `e-${i}`,
        pos: { x: xBase + 200, y: CANVAS_HEIGHT - BLOCK_SIZE * 2 - 44 },
        vel: { x: -2, y: 0 },
        width: 44,
        height: 44,
        type: 'enemy',
        sprite: THEME.enemy,
        color: 'pink'
      });
      // Trap
      newLevel.push({
        id: `t-${i}`,
        pos: { x: xBase + 400, y: CANVAS_HEIGHT - BLOCK_SIZE * 2 - 20 },
        vel: { x: 0, y: 0 },
        width: 40,
        height: 20,
        type: 'trap',
        sprite: THEME.trap,
        color: 'red'
      });
    }

    // 4. End Goal
    newLevel.push({
      id: 'goal',
      pos: { x: 7500, y: CANVAS_HEIGHT - BLOCK_SIZE * 2 - 160 },
      vel: { x: 0, y: 0 },
      width: 120,
      height: 160,
      type: 'goal',
      sprite: THEME.goal,
      color: 'black'
    });

    levelRef.current = newLevel;
    playerRef.current.pos = { x: 100, y: 400 };
    playerRef.current.vel = { x: 0, y: 0 };
    playerRef.current.activePowerUps = [];
    cameraRef.current = 0;
    scoreRef.current = 0;
    onScoreChange(0);
  };

  useEffect(() => {
    if (status === GameStatus.PLAYING) initLevel();
  }, [status]);

  const addEvent = (type: GameEvent['type'], pos: Vector) => {
    const newEvent: GameEvent = {
      id: Math.random(),
      type,
      emoji: EMOJI_MAP[type],
      text: '',
      pos: { ...pos },
      lifetime: 45
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const applyPowerUp = (type: PowerUpType) => {
    const p = playerRef.current;
    const duration = type === 'SPEED' ? POWERUP_SPEED_DURATION : POWERUP_SIZE_DURATION;
    p.activePowerUps = p.activePowerUps.filter(pu => pu.type !== type);
    p.activePowerUps.push({ type, timer: duration });
    addEvent('powerup', p.pos);
  };

  const update = useCallback(() => {
    if (status !== GameStatus.PLAYING) return;

    const p = playerRef.current;
    p.activePowerUps = p.activePowerUps.map(pu => ({ ...pu, timer: pu.timer - 1 })).filter(pu => pu.timer > 0);
    
    const hasSpeed = p.activePowerUps.some(pu => pu.type === 'SPEED');
    const hasSize = p.activePowerUps.some(pu => pu.type === 'SIZE');
    
    const currentMaxSpeed = hasSpeed ? MAX_SPEED * 1.6 : MAX_SPEED;
    const currentAccel = hasSpeed ? ACCELERATION * 1.4 : ACCELERATION;
    const currentWidth = hasSize ? 80 : 44;
    const currentHeight = hasSize ? 80 : 44;
    
    if (hasSize && p.width !== 80) { p.pos.y -= 36; p.width = 80; p.height = 80; }
    else if (!hasSize && p.width !== 44) { p.width = 44; p.height = 44; }

    if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
      p.vel.x = Math.min(p.vel.x + currentAccel, currentMaxSpeed);
    } else if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
      p.vel.x = Math.max(p.vel.x - currentAccel, -currentMaxSpeed);
    } else {
      p.vel.x *= FRICTION;
    }

    p.vel.y += GRAVITY;
    if ((keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current[' ']) && p.grounded) {
      p.vel.y = JUMP_FORCE;
      p.grounded = false;
      addEvent('jump', { x: p.pos.x, y: p.pos.y });
    }

    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;

    const targetCamera = Math.max(0, p.pos.x - 300);
    cameraRef.current += (targetCamera - cameraRef.current) * 0.1;

    p.grounded = false;
    levelRef.current.forEach(e => {
      if (e.pos.y < -500) return;

      const overlapX = p.pos.x < e.pos.x + e.width && p.pos.x + p.width > e.pos.x;
      const overlapY = p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y;

      if (overlapX && overlapY) {
        if (e.type === 'platform' || e.type === 'block') {
          const fromTop = p.pos.y + p.height - p.vel.y <= e.pos.y;
          const fromBottom = p.pos.y - p.vel.y >= e.pos.y + e.height;

          if (fromTop && p.vel.y >= 0) {
            p.pos.y = e.pos.y - p.height;
            p.vel.y = 0;
            p.grounded = true;
          } else if (fromBottom && p.vel.y < 0) {
            if (e.type === 'block' && !e.isHit) {
              e.isHit = true;
              e.sprite = THEME.hitBlock;
              scoreRef.current += 100;
              applyPowerUp(Math.random() > 0.5 ? 'SPEED' : 'SIZE');
            }
            p.pos.y = e.pos.y + e.height;
            p.vel.y = 1;
          } else {
            if (p.vel.x > 0) p.pos.x = e.pos.x - p.width;
            else if (p.vel.x < 0) p.pos.x = e.pos.x + e.width;
            p.vel.x = 0;
          }
        } else if (e.type === 'coin') {
          e.pos.y = -1000;
          scoreRef.current += 10;
          onScoreChange(scoreRef.current);
          addEvent('coin', p.pos);
        } else if (e.type === 'trap') {
          onGameOver(scoreRef.current);
        } else if (e.type === 'enemy') {
          if (p.vel.y > 1 && p.pos.y + p.height - p.vel.y <= e.pos.y) {
            e.pos.y = -1000;
            p.vel.y = JUMP_FORCE * 0.5;
            scoreRef.current += 200;
            onScoreChange(scoreRef.current);
            addEvent('coin', e.pos);
          } else {
            onGameOver(scoreRef.current);
          }
        } else if (e.type === 'goal') {
          onWin(scoreRef.current);
        }
      }

      if (e.type === 'enemy') {
        e.pos.x += e.vel.x;
        if (Math.floor(e.pos.x / 5) % 150 === 0) e.vel.x *= -1;
      }
    });

    if (p.pos.y > CANVAS_HEIGHT + 100) onGameOver(scoreRef.current);
    if (p.pos.x < 0) p.pos.x = 0;

    setEvents(prev => prev.map(e => ({
      ...e,
      pos: { ...e.pos, y: e.pos.y - 1.5 },
      lifetime: e.lifetime - 1
    })).filter(e => e.lifetime > 0));

  }, [status, onGameOver, onWin, onScoreChange]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = THEME.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars & Moon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for(let i=0; i<40; i++) {
      const sx = (i * 123 + cameraRef.current * -0.1) % CANVAS_WIDTH;
      const sy = (i * 241) % (CANVAS_HEIGHT - 200);
      ctx.beginPath(); ctx.arc(sx < 0 ? sx + CANVAS_WIDTH : sx, sy, 1.2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.save();
    ctx.translate(-cameraRef.current, 0);

    levelRef.current.forEach(e => {
      if (e.pos.y < -500 || e.pos.x < cameraRef.current - 100 || e.pos.x > cameraRef.current + CANVAS_WIDTH + 100) return;

      if (e.type === 'platform' || (e.type === 'block' && e.isHit)) {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.roundRect(e.pos.x, e.pos.y, e.width, e.height, 4);
        ctx.fill();
        // Gothic Brick Details
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(e.pos.x + 2, e.pos.y + 2, e.width - 4, e.height - 4);
        if (e.width === BLOCK_SIZE) {
            ctx.beginPath();
            ctx.moveTo(e.pos.x + 5, e.pos.y + 5);
            ctx.lineTo(e.pos.x + 15, e.pos.y + 15);
            ctx.stroke();
        }
      } else {
        ctx.font = `${e.width}px Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(e.sprite, e.pos.x + e.width / 2, e.pos.y + e.height / 2);
      }
    });

    const p = playerRef.current;
    ctx.font = `${p.width + 10}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(p.pos.x + p.width/2, p.pos.y + p.height/2);
    ctx.rotate(p.vel.x * 0.05);
    ctx.fillText(p.sprite, 0, 0);
    ctx.restore();

    events.forEach(e => {
      ctx.font = '40px Arial';
      ctx.globalAlpha = e.lifetime / 45;
      ctx.fillText(e.emoji, e.pos.x + 20, e.pos.y);
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }, [events]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    update();
    draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [loop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
};

export default GameCanvas;
