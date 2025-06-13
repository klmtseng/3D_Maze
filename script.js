// Represents the maze structure
// 0: path
// 1: wall
let maze = [];

// Generates a maze using the Recursive Backtracking algorithm
function generateMaze(rows, cols) {
  // Initialize the maze with all walls
  maze = Array(rows).fill(null).map(() => Array(cols).fill(1));

  const stack = [];
  let currentCell = [0, 0]; // Starting cell

  maze[currentCell[0]][currentCell[1]] = 0; // Mark start as path
  stack.push(currentCell);

  while (stack.length > 0) {
    currentCell = stack[stack.length - 1];
    const [r, c] = currentCell;

    // Find unvisited neighbors
    const neighbors = [];

    // Check top neighbor
    if (r - 2 >= 0 && maze[r - 2][c] === 1) {
      neighbors.push([r - 2, c, 'top']);
    }
    // Check right neighbor
    if (c + 2 < cols && maze[r][c + 2] === 1) {
      neighbors.push([r, c + 2, 'right']);
    }
    // Check bottom neighbor
    if (r + 2 < rows && maze[r + 2][c] === 1) {
      neighbors.push([r + 2, c, 'bottom']);
    }
    // Check left neighbor
    if (c - 2 >= 0 && maze[r][c - 2] === 1) {
      neighbors.push([r, c - 2, 'left']);
    }

    if (neighbors.length > 0) {
      // Choose a random unvisited neighbor
      const [nextR, nextC, direction] = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Carve path to the chosen neighbor
      maze[nextR][nextC] = 0;
      if (direction === 'top') {
        maze[r - 1][c] = 0;
      } else if (direction === 'right') {
        maze[r][c + 1] = 0;
      } else if (direction === 'bottom') {
        maze[r + 1][c] = 0;
      } else if (direction === 'left') {
        maze[r][c - 1] = 0;
      }

      stack.push([nextR, nextC]);
    } else {
      // No unvisited neighbors, backtrack
      stack.pop();
    }
  }
}

// Generate a 15x21 maze
generateMaze(15, 21);

// Define End Point (ensure this is a path, may need adjustment based on maze generation)
// For a 15x21 maze, rows are 0-14, cols are 0-20.
// Let's try to make it maze.length -1 and maze[0].length -1, then verify if it's a path.
// If generateMaze makes [0,0] a path, it might not always make the opposite corner a path.
// A common strategy is to pick a corner. Let's use one that's typically open.
// For now, we are using row: maze.length - 2, col: maze[0].length - 2 (e.g. [13,19] for 15x21)
// We should ideally verify maze[endPoint.row][endPoint.col] === 0 after generation.
// For simplicity, let's use a point often open with recursive backtracker from [0,0]
const endPoint = { row: maze.length - 1, col: maze[0].length - 2 };
if (maze[endPoint.row][endPoint.col] === 1) {
    // Fallback if the chosen end point is a wall, try another common spot
    endPoint.row = maze.length - 2;
    endPoint.col = maze[0].length - 1;
    if (maze[endPoint.row][endPoint.col] === 1) { // If still a wall, log and use a default
        console.warn("Default end point is a wall, choosing a fallback. Consider a more robust end point selection.");
        endPoint.row = maze.length - (maze.length % 2 === 0 ? 2:1) // try to get an odd index if length is even for path
        endPoint.col = maze[0].length - (maze[0].length % 2 === 0 ? 2:1)
        // Ensure it's actually path, if not, this needs a search. For now, we proceed.
    }
}

let gameWon = false; // Game state flag

// Three.js Setup
let scene, camera, renderer;
const gameContainer = document.getElementById('game-container'); // Get reference to the container

const wallSize = 1;
const wallHeight = 1;
const playerHeight = wallHeight / 2; // Player/camera height

// Keyboard state
const keysPressed = {};

document.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});


function initThreeJS() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Set starting position for the player
  // Maze generation starts at [0,0] and marks it as path.
  const startR = 0; // Player starts at maze cell (0,0)
  const startC = 0;

  // Position player centered in the start cell
  camera.position.set(startC * wallSize + wallSize / 2, playerHeight, startR * wallSize + wallSize / 2);

  // Look towards the next cell in Z or X, assuming a path exists there
  // e.g., towards (startC * wallSize + wallSize/2, playerHeight, (startR + 1) * wallSize + wallSize/2)
  // This sets initial orientation, mouse will take over.
  camera.lookAt(new THREE.Vector3(startC * wallSize + wallSize / 2, playerHeight, (startR + 1) * wallSize + wallSize / 2));


  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  gameContainer.appendChild(renderer.domElement);

  // --- Lighting Adjustments ---

  // Adjusted Ambient Light
  const ambientLight = new THREE.AmbientLight(0x454545); // Slightly brighter ambient light
  scene.add(ambientLight);

  // Adjusted Directional Light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Reduced intensity
  directionalLight.position.set(1, 1.5, 1).normalize();
  scene.add(directionalLight);

  // Player Torch Light
  const torchLight = new THREE.PointLight(0xffaa33, 1.0, 10 * wallSize, 2); // Color, Intensity, Distance, Decay
  // torchLight.position.set(0, 0, 0.1); // Optional: position slightly in front of camera's local origin
  camera.add(torchLight); // Attach torch to camera

  // --- End Lighting Adjustments ---
}

// Create Maze Geometry
function renderMaze() {
  const textureLoader = new THREE.TextureLoader();

  // Placeholder URLs - these will need to be replaced with actual texture URLs
  const wallTextureUrl = 'https://threejs.org/examples/textures/brick_diffuse.jpg'; // Example brick texture
  const floorTextureUrl = 'https://threejs.org/examples/textures/hardwood2_diffuse.jpg'; // Example wood floor texture

  const wallTexture = textureLoader.load(wallTextureUrl);
  // wallTexture.wrapS = THREE.RepeatWrapping; // Example: enable texture wrapping
  // wallTexture.wrapT = THREE.RepeatWrapping;
  // wallTexture.repeat.set(1, 1); // Example: how many times texture repeats

  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallTexture,
    // color: 0x808080, // Color can be removed or set to white (0xffffff) to not tint the texture
  });

  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === 1) { // If it's a wall
        const wallGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallSize);
        // Each wall segment gets its own material instance if we want different UVs or repeats per wall,
        // but for a uniform look, one material is fine.
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(c * wallSize, wallHeight / 2, r * wallSize);
        scene.add(wallMesh);
      }
    }
  }

  const floorTexture = textureLoader.load(floorTextureUrl);
  // floorTexture.wrapS = THREE.RepeatWrapping;
  // floorTexture.wrapT = THREE.RepeatWrapping;
  // floorTexture.repeat.set(maze[0].length / 4, maze.length / 4); // Example: repeat based on maze size

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    // color: 0x333333, // Color can be removed or set to white (0xffffff)
    side: THREE.DoubleSide
  });
  const floorGeometry = new THREE.PlaneGeometry(maze[0].length * wallSize, maze.length * wallSize);
  const floorPlane = new THREE.Mesh(floorGeometry, floorMaterial);
  floorPlane.rotation.x = -Math.PI / 2;
  floorPlane.position.set((maze[0].length * wallSize) / 2 - wallSize/2, 0, (maze.length * wallSize) / 2 - wallSize/2);
  scene.add(floorPlane);

  // Add Start Marker
  const startMarkerGeo = new THREE.CircleGeometry(wallSize * 0.3, 32);
  const startMarkerMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }); // Green
  const startMarkerMesh = new THREE.Mesh(startMarkerGeo, startMarkerMat);
  // Position centered in cell (0,0)
  startMarkerMesh.position.set(0 * wallSize + wallSize / 2, 0.01, 0 * wallSize + wallSize / 2);
  startMarkerMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
  scene.add(startMarkerMesh);

  // Add End Marker
  if (maze[endPoint.row][endPoint.col] === 0) { // Only add marker if endpoint is a path
    const endMarkerGeo = new THREE.CircleGeometry(wallSize * 0.3, 32);
    const endMarkerMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }); // Red
    const endMarkerMesh = new THREE.Mesh(endMarkerGeo, endMarkerMat);
    endMarkerMesh.position.set(endPoint.col * wallSize + wallSize / 2, 0.01, endPoint.row * wallSize + wallSize / 2);
    endMarkerMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
    scene.add(endMarkerMesh);
  } else {
    console.warn(`End point maze[${endPoint.row}][${endPoint.col}] is a wall. Not placing end marker.`);
  }
}

// Animation Loop
const moveSpeed = 0.05;
const playerRadius = 0.25 * wallSize; // Player's half-width for collision

// Collision detection helper function
// potentialNextPlayerX, potentialNextPlayerZ: center of player *after* this specific axial movement
// movementComponentX, movementComponentZ: the delta of movement FOR THIS AXIAL CHECK (one will be 0)
function isWall(potentialNextPlayerX, potentialNextPlayerZ, movementComponentX, movementComponentZ) {
  const pointsToCheck = [];
  // playerRadius and wallSize are global variables assumed to be accessible

  if (movementComponentX !== 0) { // Moving along X-axis
    // Determine the X coordinate of the leading edge based on direction
    const leadingX = potentialNextPlayerX + Math.sign(movementComponentX) * playerRadius;
    // Points are at the 'front' corners in the direction of X movement, using playerRadius for width
    pointsToCheck.push({ x: leadingX, z: potentialNextPlayerZ - playerRadius });
    pointsToCheck.push({ x: leadingX, z: potentialNextPlayerZ + playerRadius });
  } else if (movementComponentZ !== 0) { // Moving along Z-axis
    // Determine the Z coordinate of the leading edge based on direction
    const leadingZ = potentialNextPlayerZ + Math.sign(movementComponentZ) * playerRadius;
    // Points are at the 'front' corners in the direction of Z movement, using playerRadius for width
    pointsToCheck.push({ x: potentialNextPlayerX - playerRadius, z: leadingZ });
    pointsToCheck.push({ x: potentialNextPlayerX + playerRadius, z: leadingZ });
  }

  for (const point of pointsToCheck) {
    const mapCol = Math.floor(point.x / wallSize);
    const mapRow = Math.floor(point.z / wallSize);

    // Check bounds
    if (mapRow < 0 || mapRow >= maze.length || mapCol < 0 || mapCol >= maze[0].length) {
      return true; // Treat out of bounds as a wall
    }
    // Check if the cell in the maze is a wall
    if (maze[mapRow][mapCol] === 1) {
      return true; // Collision detected
    }
  }
  return false; // No collision
}


function animate() {
  requestAnimationFrame(animate);

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(camera.up, forward).normalize();

  const currentX = camera.position.x;
  const currentZ = camera.position.z;

  // Accumulate successful movement components
  let finalDeltaX = 0;
  let finalDeltaZ = 0;

  // Temporary variables to hold axis components for current key press
  let moveComponentX = 0;
  let moveComponentZ = 0;

  if (keysPressed['w']) {
    moveComponentX = forward.x * moveSpeed;
    moveComponentZ = forward.z * moveSpeed;
  }
  if (keysPressed['s']) {
    moveComponentX = -forward.x * moveSpeed;
    moveComponentZ = -forward.z * moveSpeed;
  }
  if (keysPressed['a']) { // Strafe Left
    moveComponentX = right.x * moveSpeed;
    moveComponentZ = right.z * moveSpeed;
  }
  if (keysPressed['d']) { // Strafe Right
    moveComponentX = -right.x * moveSpeed;
    moveComponentZ = -right.z * moveSpeed;
  }

  // If there's an X component to test
  if (moveComponentX !== 0) {
    if (!isWall(currentX + moveComponentX, currentZ, moveComponentX, 0)) {
      finalDeltaX += moveComponentX;
    }
  }

  // If there's a Z component to test
  // Use currentX + finalDeltaX for the "other axis" coordinate when checking Z movement.
  // This ensures that if X movement was successful, Z collision is tested from that new X position.
  if (moveComponentZ !== 0) {
    if (!isWall(currentX + finalDeltaX, currentZ + moveComponentZ, 0, moveComponentZ)) {
      finalDeltaZ += moveComponentZ;
    }
  }

  // Apply the final accumulated movements
  camera.position.x += finalDeltaX;
  camera.position.z += finalDeltaZ;

  // Check for Win Condition
  if (!gameWon) {
    // Get current player cell, slightly offset towards center of player model for more reliable cell detection
    const playerCol = Math.floor(camera.position.x / wallSize);
    const playerRow = Math.floor(camera.position.z / wallSize);

    if (playerRow === endPoint.row && playerCol === endPoint.col) {
      gameWon = true;
      if (document.pointerLockElement === gameContainer) {
        document.exitPointerLock();
      }

      const winMessageDiv = document.createElement('div');
      winMessageDiv.id = 'win-message';
      winMessageDiv.textContent = 'Congratulations! You reached the end!';
      document.body.appendChild(winMessageDiv);

      // No need to call renderer.render(scene, camera) if we stop everything.
      // But if we want the last frame to be visible, it should be called once more after this,
      // or simply let it run if other visual elements might still animate.
      // For now, rendering continues but interaction is effectively stopped.
    }
  }

  // Only render if the game isn't "hard paused" by not calling requestAnimationFrame
  renderer.render(scene, camera);
  // If gameWon is true and we want to stop the loop:
  // if (!gameWon) { requestAnimationFrame(animate); } else { renderer.render(scene, camera); // final render }
}


// Pointer Lock and Mouse Controls
if (gameContainer) { // Ensure gameContainer is available
  gameContainer.addEventListener('click', () => {
    gameContainer.requestPointerLock();
  });
}

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === gameContainer) {
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    camera.rotation.y -= movementX * 0.002;
    camera.rotation.x -= movementY * 0.002;

    // Clamp vertical rotation
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
  }
});


// Initialize Three.js, render the maze, and start animation
initThreeJS();
renderMaze();
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
