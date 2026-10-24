extends Node2D
## Simulated identically on every peer; only the victim's peer decides whether it hits.

const SPEED := 640.0

var game
var owner_id := 0
var dir := Vector2.RIGHT
var life := 1.5


func _physics_process(delta: float) -> void:
	position += dir * SPEED * delta
	life -= delta
	if life <= 0.0 or not game.ARENA.has_point(position) or game.in_obstacle(position):
		queue_free()
		return
	var lp = game.local_player
	if lp and lp.alive and lp.id != owner_id and lp.position.distance_to(position) < lp.RADIUS + 4.0:
		set_physics_process(false)
		lp.take_hit(owner_id, name)


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	draw_circle(Vector2.ZERO, 5.0, Color(1, 0.95, 0.5))
