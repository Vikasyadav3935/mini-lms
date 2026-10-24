extends CanvasLayer
## Touch HUD: left half = move stick, right half = aim stick (fires when pushed far).

const STICK_R := 90.0

var game
var _canvas: Control
var _score: Label
var _hp: ProgressBar
var _leave: Button
var _over: CenterContainer
var _over_label: Label
var _move_idx := -1
var _aim_idx := -1
var _move_origin := Vector2.ZERO
var _move_pos := Vector2.ZERO
var _aim_origin := Vector2.ZERO
var _aim_pos := Vector2.ZERO


func _ready() -> void:
	_canvas = Control.new()
	_canvas.set_anchors_preset(Control.PRESET_FULL_RECT)
	_canvas.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_canvas.draw.connect(_draw_sticks)
	add_child(_canvas)

	_score = Label.new()
	_score.position = Vector2(16, 10)
	_score.add_theme_font_size_override("font_size", 22)
	_score.add_theme_color_override("font_outline_color", Color.BLACK)
	_score.add_theme_constant_override("outline_size", 6)
	add_child(_score)

	_hp = ProgressBar.new()
	_hp.position = Vector2(540, 14)
	_hp.size = Vector2(200, 18)
	_hp.max_value = 100
	_hp.show_percentage = false
	add_child(_hp)

	_leave = Button.new()
	_leave.text = "Leave"
	_leave.add_theme_font_size_override("font_size", 22)
	_leave.position = Vector2(1130, 10)
	_leave.size = Vector2(130, 52)
	_leave.pressed.connect(_back_to_menu)
	add_child(_leave)

	_over = CenterContainer.new()
	_over.set_anchors_preset(Control.PRESET_FULL_RECT)
	_over.visible = false
	add_child(_over)
	var panel := PanelContainer.new()
	_over.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 20)
	panel.add_child(box)
	_over_label = Label.new()
	_over_label.add_theme_font_size_override("font_size", 44)
	_over_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(_over_label)
	var back := Button.new()
	back.text = "Back to menu"
	back.custom_minimum_size = Vector2(320, 76)
	back.add_theme_font_size_override("font_size", 28)
	back.pressed.connect(_back_to_menu)
	box.add_child(back)

	Net.scores_changed.connect(_update_score)
	Net.game_over.connect(func(winner: String):
		_over_label.text = "%s wins!" % winner
		_over.visible = true)
	_update_score()


func _back_to_menu() -> void:
	Net.leave()
	get_tree().change_scene_to_file("res://scenes/menu.tscn")


func _update_score() -> void:
	var ids: Array = Net.players.keys()
	ids.sort_custom(func(a, b): return Net.players[a]["score"] > Net.players[b]["score"])
	var lines := PackedStringArray(["First to %d kills" % Net.WIN_SCORE])
	for id in ids:
		lines.append("%s: %d" % [Net.players[id]["name"], Net.players[id]["score"]])
	_score.text = "\n".join(lines)


func _process(_delta: float) -> void:
	if game.local_player:
		_hp.value = game.local_player.hp


func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		if event.pressed:
			if _over.visible or _leave.get_global_rect().has_point(event.position):
				return
			var half := get_viewport().get_visible_rect().size.x * 0.5
			if event.position.x < half and _move_idx == -1:
				_move_idx = event.index
				_move_origin = event.position
				_move_pos = event.position
			elif event.position.x >= half and _aim_idx == -1:
				_aim_idx = event.index
				_aim_origin = event.position
				_aim_pos = event.position
		elif event.index == _move_idx:
			_move_idx = -1
			game.move_vec = Vector2.ZERO
		elif event.index == _aim_idx:
			_aim_idx = -1
			game.aim_vec = Vector2.ZERO
	elif event is InputEventScreenDrag:
		if event.index == _move_idx:
			_move_pos = event.position
			game.move_vec = (_move_pos - _move_origin).limit_length(STICK_R) / STICK_R
		elif event.index == _aim_idx:
			_aim_pos = event.position
			game.aim_vec = (_aim_pos - _aim_origin).limit_length(STICK_R) / STICK_R
	_canvas.queue_redraw()


func _draw_sticks() -> void:
	if _move_idx != -1:
		_stick(_move_origin, _move_pos, Color(1, 1, 1, 0.35))
	if _aim_idx != -1:
		_stick(_aim_origin, _aim_pos, Color(1, 0.5, 0.4, 0.45))


func _stick(origin: Vector2, pos: Vector2, c: Color) -> void:
	_canvas.draw_arc(origin, STICK_R, 0, TAU, 48, c, 4.0)
	_canvas.draw_circle(origin + (pos - origin).limit_length(STICK_R), 34.0, c)
