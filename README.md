# 3D Dungeon Maze Game

A simple first-person 3D maze game built with HTML, CSS, and JavaScript using the Three.js library for rendering. Navigate through a dynamically generated dungeon-themed maze from start to finish.

## Features

*   **Dynamic Maze Generation**: Each playthrough features a unique maze generated using a Recursive Backtracking algorithm.
*   **3D First-Person Perspective**: Navigate the maze from a first-person viewpoint.
*   **Three.js Rendering**: Utilizes the Three.js library for 3D graphics.
*   **Dungeon Theme**: Styled with simple colors and lighting to evoke a dungeon atmosphere.
*   **Dual Control Schemes**:
    *   **Desktop**: Keyboard (WASD/Arrows) for movement and Mouse for camera control.
    *   **Mobile**: On-screen virtual joystick for movement and touch-drag for camera control.
*   **Collision Detection**: Prevents movement through walls.
*   **Start & End Points**: Clearly defined start and goal markers within the maze.
*   **Win Condition**: Displays a success message upon reaching the end point.
*   **Responsive Design**: Touch controls appear only on touch-enabled devices.

## How to Play / Controls

The goal is to navigate from the green start marker to the red end marker in the maze.

### Desktop Controls

*   **Movement**:
    *   `W` or `ArrowUp`: Move forward
    *   `S` or `ArrowDown`: Move backward
    *   `A` or `ArrowLeft`: Strafe left
    *   `D` or `ArrowRight`: Strafe right
*   **Camera Look**:
    *   Use the **Mouse** to look around.
    *   **Click** on the game window to lock the mouse pointer for camera control. Press `Esc` to unlock.

### Mobile Controls

*   **Movement**:
    *   Use the **virtual joystick** located on the bottom-left of the screen. Drag the nub to move.
*   **Camera Look**:
    *   **Drag your finger** across the right half of the screen to look around.

## How to Run Locally

1.  **Download the Files**:
    *   Ensure you have `index.html`, `style.css`, and `script.js` in the same directory on your computer.
2.  **Open in Browser**:
    *   Open the `index.html` file directly in a modern web browser (e.g., Chrome, Firefox, Edge, Safari).

No special server setup is required as the game runs entirely in the client-side.

## Deployment

This game is built with client-side technologies only, making it suitable for deployment on any static web hosting service, such as GitHub Pages.

## Technologies Used

*   **HTML5**
*   **CSS3**
*   **JavaScript (ES6+)**
*   **Three.js (r128)** - For 3D rendering and utilities.

## Future Enhancements

Potential ideas for future development:

*   **Improved Textures**: Enhance the visual appeal with detailed textures for walls, floors, and ceiling.
*   **Sound Effects**: Add sounds for movement, collision, and winning the game.
*   **More Complex Mazes**: Implement different maze generation algorithms or add features like multiple levels or larger mazes.
*   **Interactive Elements**: Include keys, doors, or simple puzzles within the maze.
*   **Performance Optimization**: Further optimize for smoother rendering on less powerful devices.
