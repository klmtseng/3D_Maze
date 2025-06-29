extends Area3D

# Signal to notify when the player has won
signal player_won

func _ready():
	body_entered.connect(_on_body_entered)

func _on_body_entered(body):
	# Check if the body that entered is the player
	# We'll assume the player's root node is named "PlayerInstance" in the main scene,
	# or better, check if the player is in the "player" group.
	if body.is_in_group("player"):
		print("Player has reached the exit! YOU WIN!")

		# Emit a signal that the game manager (or player) can connect to
		emit_signal("player_won")

		# Optionally, directly call a method on the player if accessible
		if body.has_method("freeze_player"):
			body.freeze_player()

		# For now, we can also just make the portal disappear or change state
		# queue_free() # Example: portal disappears
		var mesh_instance = $MeshInstance3D
		if mesh_instance:
			var mat = StandardMaterial3D.new()
			mat.albedo_color = Color.GREEN
			mat.emission_enabled = true
			mat.emission = Color.GREEN
			mat.emission_energy_multiplier = 2.0
			mesh_instance.material_override = mat

		# Disable further collision checks for this portal
		set_collision_mask_value(1, false) # Assuming player is on layer 1
		monitoring = false
