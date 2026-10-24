extends Node2D
## Arena. Every peer builds the same players from Net.players; each peer simulates only
## its own player (multiplayer authority) and streams its state to the others.

const ARENA := Rect2(0, 0, 1280, 720)
const OBSTACLES: Array[Rect2] = [
	Rect2(560, 300, 160, 120),
	Rect2(200, 140, 40, 160),
	Rect2(1040, 420, 40, 160),
	Rect2(200, 540, 160, 40),
	Rect2(920, 140, 160, 40),
]
const COLORS := [Color("ff5d5d"), Color("5db2ff"), Color("6bdc7a"), Color("ffd24d"), Color("c77dff"), Color("ff9a3c")]
const PlayerScript := preload("res://scripts/player.gd")
const BulletScript := preload("res://scripts/bullet.gd")
const HudScript := preload("res://scripts/hud.gd")

var move_vec := Vector2.ZERO
var aim_vec := Vector2.ZERO
var players := {}
var local_player
var _players_node := Node2D.new()
var _bullets := Node2D.new()
var _bullet_count := 0


func _ready() -> void:
	add_child(_players_node)
	add_child(_bullets)
	var ids: Array = Net.players.keys()
	ids.sort()
	for i in ids.size():
		var p = Node2D.new()
		p.set_script(PlayerScript)
		p.name = str(ids[i])
		p.game = self
		p.id = ids[i]
		p.pname = Net.players[ids[i]]["name"]
		p.color = COLORS[i % COLORS.size()]
		p.position = spawn_point(i)
		p.set_multiplayer_authority(ids[i])
		_players_node.add_child(p)
		players[ids[i]] = p
	local_player = players.get(multiplayer.get_unique_id())

	var hud = CanvasLayer.new()
	hud.set_script(HudScript)
	hud.game = self
	add_child(hud)

	Net.player_died.connect(_on_player_died)
	Net.players_changed.connect(_on_players_changed)
	Net.server_closed.connect(func(): get_tree().change_scene_to_file("res://scenes/menu.tscn"))
	Net.game_ready.rpc_id(1)


func spawn_point(i: int) -> Vector2:
	var pts := [Vector2(100, 100), Vector2(1180, 620), Vector2(1180, 100), Vector2(100, 620), Vector2(640, 90), Vector2(640, 630)]
	return pts[i % pts.size()]


func random_spawn() -> Vector2:
	for _try in 20:
		var p := Vector2(randf_range(60, 1220), randf_range(60, 660))
		if not in_obstacle(p, 40.0):
			return p
	return Vector2(100, 100)


func in_obstacle(pos: Vector2, margin := 0.0) -> bool:
	for r in OBSTACLES:
		if r.grow(margin).has_point(pos):
			return true
	return false


## Keeps a circle inside the arena and pushes it out of obstacles.
func resolve(pos: Vector2, radius: float) -> Vector2:
	pos.x = clampf(pos.x, radius, ARENA.size.x - radius)
	pos.y = clampf(pos.y, radius, ARENA.size.y - radius)
	for r in OBSTACLES:
		var closest := Vector2(clampf(pos.x, r.position.x, r.end.x), clampf(pos.y, r.position.y, r.end.y))
		var d := pos - closest
		if d.length() < radius:
			pos = closest + (d.normalized() if d != Vector2.ZERO else Vector2.UP) * radius
	return pos


func next_bullet_name(owner_id: int) -> String:
	_bullet_count += 1
	return "%d_%d" % [owner_id, _bullet_count]


@rpc("any_peer", "call_local", "reliable")
func spawn_bullet(owner_id: int, pos: Vector2, dir: Vector2, bname: String) -> void:
	var b = Node2D.new()
	b.set_script(BulletScript)
	b.name = bname
	b.owner_id = owner_id
	b.dir = dir
	b.game = self
	b.position = pos
	_bullets.add_child(b)


@rpc("any_peer", "call_local", "reliable")
func remove_bullet(bname: String) -> void:
	var b := _bullets.get_node_or_null(bname)
	if b:
		b.queue_free()


func _on_player_died(victim: int, _killer: int) -> void:
	if players.has(victim):
		players[victim].die()


func _on_players_changed() -> void:
	for id in players.keys():
		if not Net.players.has(id):
			players[id].queue_free()
			players.erase(id)


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	draw_rect(ARENA, Color(0.13, 0.15, 0.22))
	for x in range(0, 1281, 80):
		draw_line(Vector2(x, 0), Vector2(x, 720), Color(1, 1, 1, 0.05))
	for y in range(0, 721, 80):
		draw_line(Vector2(0, y), Vector2(1280, y), Color(1, 1, 1, 0.05))
	for r in OBSTACLES:
		draw_rect(r, Color(0.32, 0.36, 0.5))
		draw_rect(r, Color(0.5, 0.56, 0.75), false, 3.0)
	draw_rect(ARENA, Color(0.6, 0.7, 1.0), false, 6.0)
