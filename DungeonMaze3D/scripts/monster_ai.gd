extends CharacterBody3D

@export var health: int = 100
@export var move_speed: float = 2.0
@export var detection_radius: float = 10.0 # For future player detection

# Basic state machine
enum State { IDLE, WANDER, CHASE, ATTACK }
var current_state: State = State.IDLE

var gravity = ProjectSettings.get_setting("physics/3d/default_gravity") # Use project gravity
var wander_direction: Vector3 = Vector3.ZERO
var wander_timer: float = 0.0
const WANDER_TIME_MIN: float = 2.0
const WANDER_TIME_MAX: float = 5.0

@onready var navigation_agent: NavigationAgent3D = $NavigationAgent3D # For future pathfinding

func _ready():
	# For now, monster will just stand still or wander simply.
	# More complex AI (like chasing using NavigationAgent3D) will be added later.
	current_state = State.WANDER # Start with wandering
	_set_new_wander_target()

func _physics_process(delta):
	var velocity = Vector3.ZERO

	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	match current_state:
		State.IDLE:
			# Do nothing or play an idle animation
			pass
		State.WANDER:
			velocity = wander_direction * move_speed
			wander_timer -= delta
			if wander_timer <= 0:
				_set_new_wander_target()
		State.CHASE:
			# Placeholder for chase logic using navigation_agent
			# var player = get_tree().get_first_node_in_group("player") # Example of getting player
			# if player:
			#    navigation_agent.target_position = player.global_position
			#    var next_path_position = navigation_agent.get_next_path_position()
			#    var direction_to_next = global_position.direction_to(next_path_position)
			#    velocity = direction_to_next * move_speed
			pass
		State.ATTACK:
			# Placeholder for attack logic
			pass

	set_velocity(velocity)
	move_and_slide()

	# If monster collides while wandering, pick a new direction
	if current_state == State.WANDER and get_slide_collision_count() > 0:
		# A simple reaction: reverse direction or pick a new random one
		# For true wandering in a maze, pathfinding or more sophisticated logic is needed.
		# This simple wander might get stuck.
		# Let's make it pick a new target immediately if it collides.
		_set_new_wander_target()


func _set_new_wander_target():
	# Simple wander: pick a random direction on the XZ plane
	var random_x = randf_range(-1.0, 1.0)
	var random_z = randf_range(-1.0, 1.0)
	wander_direction = Vector3(random_x, 0, random_z).normalized()
	wander_timer = randf_range(WANDER_TIME_MIN, WANDER_TIME_MAX)
	# print("Monster new wander direction: ", wander_direction, " for ", wander_timer, "s")

# Public function to be called when monster takes damage
func take_damage(amount: int):
	health -= amount
	print("Monster took %d damage, health is now %d" % [amount, health])
	if health <= 0:
		_die()

func _die():
	print("Monster has died.")
	# Placeholder for death animation, sound, item drops etc.
	queue_free() # Remove the monster from the scene
