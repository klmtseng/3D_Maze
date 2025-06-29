extends CharacterBody3D

@export var move_speed: float = 5.0
@export var jump_velocity: float = 4.5
@export var gravity: float = 9.8
@export var mouse_sensitivity: float = 0.002

@export var sword_damage: int = 25

@onready var camera: Camera3D = $Head/Camera3D
@onready var sword_visual: Node3D = $Head/Camera3D/SwordVisual
@onready var attack_raycast: RayCast3D = $Head/Camera3D/AttackRayCast

var is_attacking: bool = false
var can_move: bool = true # Control player movement state

func _ready():
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	if sword_visual == null:
		print_error("PlayerController: SwordVisual node not found.")
	if attack_raycast == null:
		print_error("PlayerController: AttackRayCast node not found.")
	else:
		attack_raycast.enabled = true

func _unhandled_input(event: InputEvent):
	if not can_move: # If frozen, only allow un-capturing mouse
		if event.is_action_pressed("ui_cancel"):
			if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
				Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		return

	if event is InputEventMouseMotion:
		rotate_y(-event.relative.x * mouse_sensitivity)
		camera.rotate_x(-event.relative.y * mouse_sensitivity)
		var camera_rotation_degrees = rad_to_deg(camera.rotation.x)
		camera.rotation.x = deg_to_rad(clamp(camera_rotation_degrees, -85.0, 85.0))

	if event.is_action_pressed("ui_cancel"):
		if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
			Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		else:
			Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

	if event.is_action_pressed("attack") and not is_attacking:
		_perform_attack()

func _physics_process(delta: float):
	if not can_move:
		# Optional: apply gravity even if frozen, or set velocity to zero
		var frozen_velocity = Vector3.ZERO
		if not is_on_floor():
			frozen_velocity.y -= gravity * delta
		set_velocity(frozen_velocity)
		move_and_slide()
		return

	var velocity = Vector3.ZERO
	var input_direction = Vector3.ZERO

	if Input.is_action_pressed("move_forward"): input_direction.z -= 1
	if Input.is_action_pressed("move_backward"): input_direction.z += 1
	if Input.is_action_pressed("strafe_left"): input_direction.x -= 1
	if Input.is_action_pressed("strafe_right"): input_direction.x += 1

	if input_direction != Vector3.ZERO:
		input_direction = input_direction.normalized().rotated(Vector3.UP, self.global_transform.basis.get_rotation_quaternion().get_euler().y)

	velocity.x = input_direction.x * move_speed
	velocity.z = input_direction.z * move_speed

	if not is_on_floor():
		velocity.y -= gravity * delta

	set_velocity(velocity)
	move_and_slide()

func _perform_attack():
	if is_attacking or sword_visual == null or attack_raycast == null: return
	is_attacking = true

	var tween = create_tween()
	var original_sword_pos = sword_visual.position
	var attack_sword_pos = original_sword_pos + Vector3(0, 0, -0.3)
	tween.tween_property(sword_visual, "position", attack_sword_pos, 0.1).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(sword_visual, "position", original_sword_pos, 0.15).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN).set_delay(0.1)
	tween.finished.connect(func(): is_attacking = false)

	attack_raycast.force_raycast_update()
	if attack_raycast.is_colliding():
		var collider = attack_raycast.get_collider()
		if collider != null and collider.has_method("take_damage"):
			print("Hit: ", collider.name) # Added print for hit confirmation
			collider.take_damage(sword_damage)
		else: # Added for clarity on what was hit if not damageable
			print("Hit something else: ", collider.name if collider else "null")
	else: # Added for clarity on miss
		print("Attack missed.")


# New function to freeze player
func freeze_player():
	can_move = false
	# Release mouse cursor
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	print("Player frozen. Game won (or some other event).")
