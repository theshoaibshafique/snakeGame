import React, { useState, useEffect, useRef } from 'react';
import { useInterval } from './useInterval';
import {
  canvas_size,
  apple_start,
  directions,
  scale,
  snake_start,
  initial_speed,
  direction_start,
  maxPoints,
} from './constants';
import './App.css';

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState(snake_start);
  const [apple, setApple] = useState(apple_start);
  const [speed, setSpeed] = useState(null);
  const [direction, setDirection] = useState(direction_start);
  // add wrapper ref and isPlaying flag for showing start button
  const wrapperRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState();
  const [points, setPoints] = useState(0);
  const [hasFinishedGame, setHasFinishedGame] = useState(false);
  const moveSnake = (event) => {
    const { key } = event;
    // Check if key is arrow key
    if (
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'ArrowRight' ||
      key === 'ArrowLeft'
    ) {
      // disable backwards key, this means no collision when going right, and then pressing ArrowLeft
      if (direction.x + directions[key].x && direction.y + directions[key].y) {
        setDirection(directions[key]);
      }
    }
  };
  const createRandomApple = () => {
    return {
      x: Math.floor((Math.random() * canvas_size.x - 10) / scale),
      y: Math.floor((Math.random() * canvas_size.y - 10) / scale),
    };
  };
  const startGame = () => {
    setHasFinishedGame(false);
    setPoints(0);
    setIsPlaying(true);
    setSnake(snake_start);
    setApple(apple_start);
    setDirection(direction_start);
    setSpeed(initial_speed);
    setGameOver(false);
    wrapperRef.current?.focus();
  };

  const checkCollision = (piece, snoko = snake) => {
    if (
      piece.x * scale >= canvas_size.x ||
      piece.x < 0 ||
      piece.y * scale >= canvas_size.y ||
      piece.y < 0
    ) {
      return true;
    }
    for (const segment of snoko) {
      if (piece.x === segment.x && piece.y === segment.y) return true;
    }

    return false;
  };
  const checkAppleCollision = (newSnake) => {
    if (newSnake[0].x === apple.x && newSnake[0].y === apple.y) {
      let newApple = createRandomApple();
      while (checkCollision(newApple, newSnake)) {
        newApple = createRandomApple();
      }
      setPoints(points + 1);
      if (points === maxPoints) {
        setHasFinishedGame(true);
        endGame();
      }
      setApple(newApple);
      return true;
    }
    return false;
  };

  const endGame = () => {
    setIsPlaying(false);
    setSpeed(null);
    setGameOver(true);
  };

  const gameLoop = () => {
    const snakeCopy = [...snake]; // Create shallow copy to avoid mutating array
    const newSnakeHead = {
      x: snakeCopy[0].x + direction.x,
      y: snakeCopy[0].y + direction.y,
    };
    snakeCopy.unshift(newSnakeHead);
    if (checkCollision(newSnakeHead)) endGame();
    if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
    setSnake(snakeCopy);
  };

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context == null) throw new Error('Could not get context');
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, canvas_size.x, canvas_size.y);
    // Draw Snake
    context.fillStyle = '#1C1B17';
    snake.forEach(({ x, y }) => context.fillRect(x, y, 1, 1));
    // Draw Apple
    context.fillStyle = 'red';
    context.fillRect(apple.x, apple.y, 1, 1);
  }, [snake, apple]);

  useInterval(() => gameLoop(), speed);

  return (
    <div className="wrapper">
      <div
        ref={wrapperRef}
        className="canvas"
        tabIndex={0}
        role="button"
        onKeyDown={(event) => moveSnake(event)}
      >
        <canvas
          style={
            gameOver
              ? { border: '1px solid black', opacity: 0.5 }
              : { border: '1px solid black' }
          }
          ref={canvasRef}
          width={canvas_size.x}
          height={canvas_size.y}
        />
        {gameOver && <div className="game-over">Game Over</div>}
        {!isPlaying && (
          <button className="start" onClick={startGame}>
            Start Game
          </button>
        )}
      </div>
      <p className="points">{points}</p>
      {hasFinishedGame && <p className="finished-game">Congratulations</p>}
    </div>
  );
};

export default SnakeGame;
