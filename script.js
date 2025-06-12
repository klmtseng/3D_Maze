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

// Global Variables for Touch Input
let joystickData = { x: 0, y: 0, active: false };
let lookData = { deltaX: 0, deltaY: 0, touchId: null, lastX: 0, lastY: 0, active: false };

// Three.js Setup
let scene, camera, renderer;
const gameContainer = document.getElementById('game-container'); // Get reference to the container

// Function to set up touch controls based on device capabilities
function setupTouchControls() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const touchControlsDiv = document.getElementById('touch-controls');
    // gameContainer is global and should be defined before this is called.

    if (isTouchDevice) {
        if (touchControlsDiv) touchControlsDiv.style.display = 'block';
        // Remove pointer lock capability for touch devices
        if (gameContainer) gameContainer.removeEventListener('click', requestPointerLock);
        // Hide any desktop-specific instructions if they existed (example)
        // document.getElementById('desktop-instructions')?.style.display = 'none';
    } else {
        if (touchControlsDiv) touchControlsDiv.style.display = 'none';
        // Add pointer lock capability for non-touch devices
        if (gameContainer) gameContainer.addEventListener('click', requestPointerLock);
        // Show any desktop-specific instructions if they existed (example)
        // document.getElementById('desktop-instructions')?.style.display = 'block';
    }
}

// Call setupTouchControls when the script loads.
// This is already after gameContainer is defined.
setupTouchControls();


// Joystick Elements and Event Handling
const joystickArea = document.getElementById('joystick-area');
const joystickBase = document.getElementById('joystick-base');
const joystickNub = document.getElementById('joystick-nub');

if (joystickArea && joystickBase && joystickNub) { // Ensure elements exist
    const baseRect = joystickBase.getBoundingClientRect(); // Get dimensions once, assuming fixed size/pos
    const nubRadius = joystickNub.offsetWidth / 2;
    const baseRadius = joystickBase.offsetWidth / 2;
    const maxDistance = baseRadius - nubRadius;

    function handleJoystickTouch(event) {
        event.preventDefault();
        const touch = event.changedTouches[0];
        let dx = touch.clientX - (baseRect.left + baseRadius);
        let dy = touch.clientY - (baseRect.top + baseRadius);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxDistance) {
            dx = (dx / distance) * maxDistance;
            dy = (dy / distance) * maxDistance;
        }
        joystickNub.style.transform = `translate(${dx}px, ${dy}px)`;
        joystickData.x = dx / maxDistance;
        joystickData.y = -(dy / maxDistance); // Invert Y for typical game controls (up is positive)
    }

    joystickArea.addEventListener('touchstart', function(event) {
        joystickData.active = true;
        handleJoystickTouch(event);
    });

    joystickArea.addEventListener('touchmove', function(event) {
        if (!joystickData.active) return;
        handleJoystickTouch(event);
    });

    function resetJoystick() {
        joystickData.active = false;
        joystickNub.style.transform = 'translate(0px, 0px)';
        joystickData.x = 0;
        joystickData.y = 0;
    }

    joystickArea.addEventListener('touchend', function(event) {
        event.preventDefault();
        resetJoystick();
    });
    joystickArea.addEventListener('touchcancel', function(event) {
        event.preventDefault();
        resetJoystick();
    });
}


// Look Area Event Handling
const lookArea = document.getElementById('look-area');
if (lookArea) { // Ensure element exists
    lookArea.addEventListener('touchstart', function(event) {
        event.preventDefault();
        if (lookData.active && lookData.touchId !== null) return; // Already a touch active

        const touch = event.changedTouches[0];
        lookData.touchId = touch.identifier;
        lookData.lastX = touch.clientX;
        lookData.lastY = touch.clientY;
        lookData.active = true;
        lookData.deltaX = 0; // Reset deltas
        lookData.deltaY = 0;
    });

    lookArea.addEventListener('touchmove', function(event) {
        event.preventDefault();
        if (!lookData.active) return;

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === lookData.touchId) {
                lookData.deltaX = touch.clientX - lookData.lastX;
                lookData.deltaY = touch.clientY - lookData.lastY;
                lookData.lastX = touch.clientX;
                lookData.lastY = touch.clientY;
                break;
            }
        }
    });

    function resetLookData(event) {
         event.preventDefault();
        if (!lookData.active) return;

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === lookData.touchId) {
                lookData.deltaX = 0;
                lookData.deltaY = 0;
                lookData.active = false;
                lookData.touchId = null;
                break;
            }
        }
    }
    lookArea.addEventListener('touchend', resetLookData);
    lookArea.addEventListener('touchcancel', resetLookData);
}

const wallSize = 1;
const wallHeight = 1;
const playerHeight = wallHeight / 2; // Player/camera height

// Keyboard state (remains for non-touch devices)
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
  gameContainer.appendChild(renderer.domElement); // Use the variable

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(1, 1.5, 1).normalize();
  scene.add(directionalLight);
}

// Create Maze Geometry
function renderMaze() {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Grey, responds to light

  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === 1) { // If it's a wall
        const wallGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallSize);
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(c * wallSize, wallHeight / 2, r * wallSize);
        scene.add(wallMesh);
      }
    }
  }

  // Add a floor plane
  const floorGeometry = new THREE.PlaneGeometry(maze[0].length * wallSize, maze.length * wallSize);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide });
  const floorPlane = new THREE.Mesh(floorGeometry, floorMaterial);
  floorPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  // Adjust floor position to be centered under the maze
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
const touchMoveFactor = 0.8; // To make joystick movement slightly less sensitive than keyboard
const playerRadius = 0.25 * wallSize; // Player's half-width for collision

// Collision detection helper function
// x, z are potential future center coordinates of the player
// dirX, dirZ represent the direction of movement for this check (e.g., for x-check, dirX is sign of dx, dirZ is 0)
function isWall(x, z, dirX, dirZ) {
  // Calculate the point to check based on player radius and direction
  const checkX = x + dirX * playerRadius;
  const checkZ = z + dirZ * playerRadius;

  const mapCol = Math.floor(checkX / wallSize);
  const mapRow = Math.floor(checkZ / wallSize);

  // Check bounds
  if (mapRow < 0 || mapRow >= maze.length || mapCol < 0 || mapCol >= maze[0].length) {
    return true; // Treat out of bounds as a wall
  }
  // Check if the cell in the maze is a wall
  return maze[mapRow][mapCol] === 1;
}


function animate() {
  requestAnimationFrame(animate);

  // Movement Logic
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; // Keep movement horizontal
  forward.normalize();

  // Calculate right vector based on current camera view (yaw)
  // camera.up is (0,1,0)
  // right = forward x camera.up (if using right-handed coordinate system for view)
  // However, three.js uses a camera that looks down its local -Z axis.
  // So, to get a vector to the camera's right, we can cross camera.up with the forward vector.
  const right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize(); // Now points to camera's actual right

  let finalMoveX = 0;
  let finalMoveZ = 0;

  // Keyboard Input Contribution
  if (keysPressed['w']) {
    finalMoveZ += forward.z * moveSpeed;
    finalMoveX += forward.x * moveSpeed;
  }
  if (keysPressed['s']) {
    finalMoveZ -= forward.z * moveSpeed;
    finalMoveX -= forward.x * moveSpeed;
  }
  if (keysPressed['a']) { // Strafe Left
    finalMoveZ -= right.z * moveSpeed;
    finalMoveX -= right.x * moveSpeed;
  }
  if (keysPressed['d']) { // Strafe Right
    finalMoveZ += right.z * moveSpeed;
    finalMoveX += right.x * moveSpeed;
  }

  // Joystick Input Contribution
  if (joystickData.active) {
    // joystickData.y is negative for up (forward), positive for down (backward)
    // Forward movement (joystick Y is negative)
    finalMoveZ += joystickData.y * -1 * forward.z * moveSpeed * touchMoveFactor;
    finalMoveX += joystickData.y * -1 * forward.x * moveSpeed * touchMoveFactor;

    // Strafe movement (joystick X)
    finalMoveZ += joystickData.x * right.z * moveSpeed * touchMoveFactor;
    finalMoveX += joystickData.x * right.x * moveSpeed * touchMoveFactor;
  }

  // Apply Combined Movement with Collision Detection
  const currentX = camera.position.x;
  const currentZ = camera.position.z;

  if (finalMoveX !== 0 && !isWall(currentX + finalMoveX, currentZ, Math.sign(finalMoveX), 0)) {
    camera.position.x += finalMoveX;
  }
  if (finalMoveZ !== 0 && !isWall(camera.position.x, currentZ + finalMoveZ, 0, Math.sign(finalMoveZ))) {
    camera.position.z += finalMoveZ;
  }

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
function requestPointerLock() {
  // Only request if not already locked and game not won
  if (document.pointerLockElement !== gameContainer && !gameWon) {
    gameContainer.requestPointerLock();
  }
}
// The event listener will be added/removed by setupTouchControls

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === gameContainer) { // Mouse look
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    const mouseSensitivity = 0.002;

    camera.rotation.y -= movementX * mouseSensitivity;
    camera.rotation.x -= movementY * mouseSensitivity;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

  } else if (lookData.active && (lookData.deltaX !== 0 || lookData.deltaY !== 0)) { // Touch look
    const touchLookSensitivity = 0.003; // Adjusted sensitivity for touch
    camera.rotation.y -= lookData.deltaX * touchLookSensitivity;
    camera.rotation.x -= lookData.deltaY * touchLookSensitivity;
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

    // Reset deltas after applying them for this frame to prevent continuous rotation from one touch drag
    lookData.deltaX = 0;
    lookData.deltaY = 0;
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
