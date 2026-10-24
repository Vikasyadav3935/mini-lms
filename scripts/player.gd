extends Node2D

const RADIUS := 20.0
const SPEED := 260.0
const FIRE_DELAY := 0.28
const MAX_HP := 100
const DAMAGE := 25
const RESPAWN_TIME := 2.0

var game
var id := 0
var pname := ""
var color := Color.WHITE
var hp := MAX_HP
var alive := true
var aim := Vector2.RIGHT
var target_pos := Vector2.ZERO

var _cooldown := 0.0
var _respawn_left := 0.0


func _ready() -> void:
	target_pos = position


func _physics_process(delta: float) -> void:
	if not Net.game_go:
		return
	if not is_multiplayer_authority():
		position = position.lerp(target_pos, minf(1.0, delta * 15.0))
		return

	if not alive:
		_respawn_left -= delta
		if _respawn_left <= 0.0:
			_respawn.rpc(game.random_spawn())
		return

	var mv: Vector2 = game.move_vec + _keyboard_vector()
	mv = mv.limit_length(1.0)
	position = game.resolve(position + mv * SPEED * delta, RADIUS)

	var a: Vector2 = game.aim_vec
	var wants_fire := false
	if a.length() > 0.25:
		aim = a.normalized()
		wants_fire = a.length() > 0.5
	elif mv.length() > 0.3:
		aim = mv.normalized()
	if Input.is_key_pressed(KEY_SPACE):
		wants_fire = true

	_cooldown -= delta
	if wants_fire and _cooldown <= 0.0:
		_cooldown = FIRE_DELAY
		game.spawn_bullet.rpc(id, position + aim * (RADIUS + 6.0), aim, game.next_bullet_name(id))

	_sync.rpc(position, aim, hp)


func _keyboard_vector() -> Vector2:
	var v := Vector2.ZERO
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT): v.x -= 1
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT): v.x += 1
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP): v.y -= 1
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN): v.y += 1
	return v


@rpc("authority", "call_remote", "unreliable_ordered")
func _sync(pos: Vector2, a: Vector2, h: int) -> void:
	target_pos = pos
	aim = a
	hp = h


@rpc("authority", "call_local", "reliable")
func _respawn(pos: Vector2) -> void:
	position = pos
	target_pos = pos
	hp = MAX_HP
	alive = true


## Called on the victim's own peer when a bullet reaches it.
func take_hit(by: int, bullet_name: String) -> void:
	if not alive:
		return
	game.remove_bullet.rpc(bullet_name)
	hp -= DAMAGE
	if hp <= 0:
		hp = 0
		alive = false
		Net.report_death.rpc(id, by)


func die() -> void:
	alive = false
	hp = 0
	_respawn_left = RESPAWN_TIME


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	if not alive:
		return
	var font := ThemeDB.fallback_font
	draw_line(Vector2.ZERO, aim * (RADIUS + 14.0), Color.WHITE, 6.0)
	draw_circle(Vector2.ZERO, RADIUS, color)
	draw_arc(Vector2.ZERO, RADIUS, 0, TAU, 32, Color(0, 0, 0, 0.5), 3.0)
	if is_multiplayer_authority():
		draw_arc(Vector2.ZERO, RADIUS + 6.0, 0, TAU, 32, Color(1, 1, 1, 0.8), 2.0)
	var w := 44.0
	draw_rect(Rect2(-w / 2, -RADIUS - 16, w, 6), Color(0, 0, 0, 0.6))
	draw_rect(Rect2(-w / 2, -RADIUS - 16, w * hp / MAX_HP, 6), Color(0.4, 1, 0.4))
	draw_string(font, Vector2(-w, -RADIUS - 24), pname, HORIZONTAL_ALIGNMENT_CENTER, w * 2, 16)
