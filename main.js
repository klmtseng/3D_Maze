const rows = 8;
const cols = 8;
const cellSize = 4;
const wallHeight = 3;
const wallThickness = 0.2;

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.visited = false;
    this.walls = { north: true, south: true, east: true, west: true };
  }
}

const grid = [];
for (let r = 0; r < rows; r++) {
  const line = [];
  for (let c = 0; c < cols; c++) {
    line.push(new Cell(r, c));
  }
  grid.push(line);
}

function neighbors(cell) {
  const { row, col } = cell;
  const n = [];
  if (row > 0) n.push(grid[row - 1][col]);
  if (row < rows - 1) n.push(grid[row + 1][col]);
  if (col > 0) n.push(grid[row][col - 1]);
  if (col < cols - 1) n.push(grid[row][col + 1]);
  return n.filter(c => !c.visited);
}

function removeWall(current, next) {
  if (next.row < current.row) {
    current.walls.north = false;
    next.walls.south = false;
  } else if (next.row > current.row) {
    current.walls.south = false;
    next.walls.north = false;
  } else if (next.col < current.col) {
    current.walls.west = false;
    next.walls.east = false;
  } else if (next.col > current.col) {
    current.walls.east = false;
    next.walls.west = false;
  }
}

function generate() {
  const stack = [];
  const start = grid[0][0];
  start.visited = true;
  stack.push(start);
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const unvisited = neighbors(current);
    if (unvisited.length === 0) {
      stack.pop();
    } else {
      const next = unvisited[Math.floor(Math.random() * unvisited.length)];
      removeWall(current, next);
      next.visited = true;
      stack.push(next);
    }
  }
}

function buildMaze() {
  const mazeEl = document.getElementById('maze');
  generate();
  for (const row of grid) {
    for (const cell of row) {
      const x = (cell.col - (cols - 1) / 2) * cellSize;
      const z = (cell.row - (rows - 1) / 2) * cellSize;
      const walls = [
        { dir: 'north', pos: `${x} ${wallHeight / 2} ${z - cellSize / 2}`, rot: '0 0 0' },
        { dir: 'south', pos: `${x} ${wallHeight / 2} ${z + cellSize / 2}`, rot: '0 0 0' },
        { dir: 'west', pos: `${x - cellSize / 2} ${wallHeight / 2} ${z}`, rot: '0 90 0' },
        { dir: 'east', pos: `${x + cellSize / 2} ${wallHeight / 2} ${z}`, rot: '0 90 0' }
      ];
      walls.forEach(data => {
        if (cell.walls[data.dir]) {
          const wall = document.createElement('a-box');
          wall.setAttribute('width', cellSize);
          wall.setAttribute('height', wallHeight);
          wall.setAttribute('depth', wallThickness);
          wall.setAttribute('position', data.pos);
          wall.setAttribute('rotation', data.rot);
          wall.setAttribute('color', '#8B4513');
          mazeEl.appendChild(wall);
        }
      });
    }
  }
}

let health = 100;
function updateHealth(delta) {
  health = Math.max(0, health + delta);
  document.getElementById('health').textContent = health;
}

document.addEventListener('keydown', e => {
  if (e.key === 'h') updateHealth(-10);
});

window.addEventListener('load', buildMaze);
