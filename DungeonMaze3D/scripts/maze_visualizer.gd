extends Node3D

@export var maze_width: int = 10
@export var maze_height: int = 10
@export var cell_size: float = 4.0
@export var wall_height: float = 3.0
@export var wall_thickness: float = 0.2

@export var wall_material: StandardMaterial3D = preload("res://materials/wall_material.tres")
@export var floor_material: StandardMaterial3D = preload("res://materials/floor_material.tres")
@export var ceiling_material: StandardMaterial3D = preload("res://materials/ceiling_material.tres")

@export var exit_portal_scene: PackedScene = preload("res://scenes/exit_portal.tscn")

@onready var maze_generator_node: Node # Will be assigned in _ready

var maze_data: Array = []

func _ready():
	# Get the maze generator node - assuming it's a sibling in main_scene.tscn
	maze_generator_node = get_node_or_null("../MazeGeneratorNode")
	# The prompt had a fallback, but given main_scene.tscn structure, "../MazeGeneratorNode" is correct.

	if not maze_generator_node:
		print_error("MazeVisualizer: MazeGeneratorNode not found at path '../MazeGeneratorNode'. Cannot generate maze visual.")
		return

	if not maze_generator_node.has_method("generate_maze_data"):
		print_error("MazeVisualizer: MazeGeneratorNode does not have 'generate_maze_data' method.")
		return

	maze_data = maze_generator_node.generate_maze_data(maze_width, maze_height)

	if maze_data.is_empty():
		print_error("MazeVisualizer: Failed to generate maze data.")
		return

	if maze_generator_node.has_method("print_maze_to_console"):
		maze_generator_node.print_maze_to_console(maze_data)

	build_maze_geometry()
	_place_exit_portal()


func build_maze_geometry():
	# Clear previous maze geometry
	for child in get_children():
		# Check types carefully before queue_free
		if child is StaticBody3D or child is MeshInstance3D or child.is_in_group("exit_portal_group"): # Assuming portal might be in a group
			child.queue_free()
		elif child is Area3D and child.get_script() == preload("res://scripts/exit_portal.gd"): # More specific check for Area3D
			child.queue_free()


	# Floor
	var floor_mesh_instance = MeshInstance3D.new()
	var floor_plane_mesh = PlaneMesh.new()
	floor_plane_mesh.size = Vector2(maze_width * cell_size, maze_height * cell_size)
	floor_mesh_instance.mesh = floor_plane_mesh
	floor_mesh_instance.material_override = floor_material
	floor_mesh_instance.transform.origin = Vector3((maze_width * cell_size) / 2.0, 0, (maze_height * cell_size) / 2.0)
	floor_mesh_instance.rotate_x(deg_to_rad(-90))
	var floor_static_body = StaticBody3D.new()
	var floor_collision_shape = CollisionShape3D.new()
	var floor_box_shape = BoxShape3D.new()
	floor_box_shape.size = Vector3(maze_width * cell_size, wall_thickness, maze_height * cell_size)
	floor_collision_shape.shape = floor_box_shape
	floor_static_body.add_child(floor_mesh_instance)
	floor_static_body.add_child(floor_collision_shape)
	floor_static_body.transform.origin = Vector3((maze_width * cell_size) / 2.0, -wall_thickness / 2.0, (maze_height * cell_size) / 2.0)
	add_child(floor_static_body)

	# Ceiling
	var ceiling_mesh_instance = MeshInstance3D.new()
	var ceiling_plane_mesh = PlaneMesh.new()
	ceiling_plane_mesh.size = Vector2(maze_width * cell_size, maze_height * cell_size)
	ceiling_mesh_instance.mesh = ceiling_plane_mesh
	ceiling_mesh_instance.material_override = ceiling_material
	ceiling_mesh_instance.transform.origin = Vector3((maze_width * cell_size) / 2.0, wall_height, (maze_height * cell_size) / 2.0)
	ceiling_mesh_instance.rotate_x(deg_to_rad(90))
	var ceiling_static_body = StaticBody3D.new()
	var ceiling_collision_shape = CollisionShape3D.new()
	var ceiling_box_shape = BoxShape3D.new()
	ceiling_box_shape.size = Vector3(maze_width * cell_size, wall_thickness, maze_height * cell_size)
	ceiling_collision_shape.shape = ceiling_box_shape
	ceiling_static_body.add_child(ceiling_mesh_instance)
	ceiling_static_body.add_child(ceiling_collision_shape)
	ceiling_static_body.transform.origin = Vector3((maze_width * cell_size) / 2.0, wall_height + wall_thickness / 2.0, (maze_height * cell_size) / 2.0)
	add_child(ceiling_static_body)

	# Walls
	var wall_mesh_ns = BoxMesh.new()
	wall_mesh_ns.size = Vector3(cell_size, wall_height, wall_thickness)
	var wall_mesh_ew = BoxMesh.new()
	wall_mesh_ew.size = Vector3(wall_thickness, wall_height, cell_size)

	var N_WALL = maze_generator_node.get("N_WALL")
	var S_WALL = maze_generator_node.get("S_WALL")
	var E_WALL = maze_generator_node.get("E_WALL")
	var W_WALL = maze_generator_node.get("W_WALL")

	if N_WALL == null or S_WALL == null or E_WALL == null or W_WALL == null:
		print_error("MazeVisualizer: Wall constants not found on MazeGeneratorNode.")
		return # Critical error, cannot build walls

	for y in range(maze_height):
		for x in range(maze_width):
			var cell_data = maze_data[y][x]
			var cell_pos_x = x * cell_size
			var cell_pos_z = y * cell_size

			if cell_data & N_WALL:
				var wall_n = _create_wall_segment(wall_mesh_ns, wall_material)
				wall_n.transform.origin = Vector3(cell_pos_x + cell_size / 2.0, wall_height / 2.0, cell_pos_z)
				add_child(wall_n)
			if cell_data & S_WALL:
				var wall_s = _create_wall_segment(wall_mesh_ns, wall_material)
				wall_s.transform.origin = Vector3(cell_pos_x + cell_size / 2.0, wall_height / 2.0, cell_pos_z + cell_size)
				add_child(wall_s)
			if cell_data & W_WALL:
				var wall_w = _create_wall_segment(wall_mesh_ew, wall_material)
				wall_w.transform.origin = Vector3(cell_pos_x, wall_height / 2.0, cell_pos_z + cell_size / 2.0)
				add_child(wall_w)
			if cell_data & E_WALL:
				var wall_e = _create_wall_segment(wall_mesh_ew, wall_material)
				wall_e.transform.origin = Vector3(cell_pos_x + cell_size, wall_height / 2.0, cell_pos_z + cell_size / 2.0)
				add_child(wall_e)

func _create_wall_segment(mesh: BoxMesh, material: StandardMaterial3D) -> StaticBody3D:
	var wall_static_body = StaticBody3D.new()
	var mesh_instance = MeshInstance3D.new()
	var collision_shape = CollisionShape3D.new()
	var box_shape = BoxShape3D.new() # Ensure new BoxShape for each wall
	mesh_instance.mesh = mesh
	mesh_instance.material_override = material
	box_shape.size = mesh.size # Assign size to the new BoxShape
	collision_shape.shape = box_shape
	wall_static_body.add_child(mesh_instance)
	wall_static_body.add_child(collision_shape)
	return wall_static_body

func _place_exit_portal():
	if exit_portal_scene == null:
		print_error("MazeVisualizer: Exit Portal Scene not loaded.")
		return

	var portal_instance = exit_portal_scene.instantiate()

	# Place at the center of the last cell (e.g., maze_width-1, maze_height-1)
	var exit_x = (maze_width - 0.5) * cell_size
	var exit_z = (maze_height - 0.5) * cell_size
	var exit_y = wall_height / 2.0 # Or some other appropriate height, like 1.0 or character height

	portal_instance.transform.origin = Vector3(exit_x, exit_y, exit_z)
	add_child(portal_instance)
	print("Exit portal placed at: ", portal_instance.transform.origin)
