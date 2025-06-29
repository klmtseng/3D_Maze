extends Node

# --- Maze Configuration ---
var width: int = 10  # Maze width in cells
var height: int = 10 # Maze height in cells

# --- Wall Constants (Bitmasks) ---
# Used to define which walls are present for a cell.
# e.g., if a cell has a North and West wall, its value would be N_WALL | W_WALL
const N_WALL: int = 1  # North wall
const S_WALL: int = 2  # South wall
const E_WALL: int = 4  # East wall
const W_WALL: int = 8  # West wall
const ALL_WALLS: int = N_WALL | S_WALL | E_WALL | W_WALL

# --- Cell State ---
const VISITED: int = 16 # Flag to mark if a cell has been visited during generation

# --- Maze Grid ---
# Stores the state of each cell (walls and visited status)
# Each element will be an integer.
var grid: Array = []

# --- Random Number Generator ---
var rng = RandomNumberGenerator.new()

# --- Public Method to Generate Maze ---
func generate_maze_data(maze_width: int = 10, maze_height: int = 10) -> Array:
	width = maze_width
	height = maze_height
	rng.randomize()

	# Initialize grid: all cells have all walls and are not visited
	grid.clear() # Clear previous grid if any
	grid.resize(height)
	for y in range(height):
		grid[y] = []
		grid[y].resize(width)
		for x in range(width):
			grid[y][x] = ALL_WALLS # All walls initially present, not visited

	# Stack for DFS
	var stack: Array = []

	# Start DFS from a random cell
	var start_x: int = rng.randi_range(0, width - 1)
	var start_y: int = rng.randi_range(0, height - 1)

	grid[start_y][start_x] = grid[start_y][start_x] | VISITED # Mark as visited
	stack.push({"x": start_x, "y": start_y})

	while not stack.is_empty():
		var current_cell: Dictionary = stack.back()
		var cx: int = current_cell.x
		var cy: int = current_cell.y

		var neighbors: Array = _get_unvisited_neighbors(cx, cy)

		if not neighbors.is_empty():
			var next_neighbor: Dictionary = neighbors[rng.randi_range(0, neighbors.size() - 1)]
			var nx: int = next_neighbor.x
			var ny: int = next_neighbor.y

			# Carve path between current_cell and next_neighbor
			if ny < cy: # Neighbor is North
				grid[cy][cx] &= ~N_WALL # Remove North wall from current
				grid[ny][nx] &= ~S_WALL # Remove South wall from neighbor
			elif ny > cy: # Neighbor is South
				grid[cy][cx] &= ~S_WALL # Remove South wall from current
				grid[ny][nx] &= ~N_WALL # Remove North wall from neighbor
			elif nx < cx: # Neighbor is West
				grid[cy][cx] &= ~W_WALL # Remove West wall from current
				grid[ny][nx] &= ~E_WALL # Remove East wall from neighbor
			elif nx > cx: # Neighbor is East
				grid[cy][cx] &= ~E_WALL # Remove East wall from current
				grid[ny][nx] &= ~W_WALL # Remove West wall from neighbor

			grid[ny][nx] = grid[ny][nx] | VISITED # Mark neighbor as visited
			stack.push({"x": nx, "y": ny})
		else:
			stack.pop_back() # Backtrack

	# Remove the VISITED flag from the grid data as it's no longer needed
	# and only wall information should be returned.
	var maze_data: Array = []
	maze_data.resize(height)
	for y in range(height):
		maze_data[y] = []
		maze_data[y].resize(width)
		for x in range(width):
			maze_data[y][x] = grid[y][x] & ALL_WALLS # Keep only wall data

	return maze_data

# --- Helper Function to Get Unvisited Neighbors ---
func _get_unvisited_neighbors(x: int, y: int) -> Array:
	var neighbors: Array = []

	# Check North
	if y > 0 and not (grid[y - 1][x] & VISITED):
		neighbors.push({"x": x, "y": y - 1, "dir": "N"})
	# Check South
	if y < height - 1 and not (grid[y + 1][x] & VISITED):
		neighbors.push({"x": x, "y": y + 1, "dir": "S"})
	# Check East
	if x < width - 1 and not (grid[y][x + 1] & VISITED):
		neighbors.push({"x": x + 1, "y": y, "dir": "E"})
	# Check West
	if x > 0 and not (grid[y][x - 1] & VISITED):
		neighbors.push({"x": x - 1, "y": y, "dir": "W"})

	return neighbors

# --- Helper to print maze (for debugging) ---
func print_maze_to_console(maze_to_print: Array):
	if maze_to_print.is_empty():
		print("Maze data is empty.")
		return

	var local_height = maze_to_print.size()
	var local_width = 0
	if local_height > 0:
		local_width = maze_to_print[0].size()

	for y in range(local_height):
		var row_str_top = ""
		var row_str_mid = ""
		for x in range(local_width):
			var cell = maze_to_print[y][x]
			# Top part of the cell
			row_str_top += "+"
			row_str_top += "---" if (cell & N_WALL) else "   "

			# Middle part of the cell
			row_str_mid += "|" if (cell & W_WALL) else " "
			row_str_mid += "   " # Cell content area

			if x == local_width - 1: # Rightmost wall of the row
				row_str_top += "+"
				row_str_mid += "|" if (cell & E_WALL) else " "

		print(row_str_top)
		print(row_str_mid)

	# Print bottom border of the maze
	var bottom_border = ""
	for x in range(local_width):
		bottom_border += "+---"
	bottom_border += "+"
	print(bottom_border)

# --- Example Usage (can be called from another script or for testing) ---
#func _ready():
#	var generated_maze = generate_maze_data(10, 10)
#	print_maze_to_console(generated_maze)
#	print("Maze generation complete. See console output for text representation.")
