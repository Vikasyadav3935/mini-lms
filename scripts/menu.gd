extends Control
## Main menu + lobby. UI is built in code so the scene file stays trivial.

const FONT := 28

var _name_edit: LineEdit
var _ip_edit: LineEdit
var _status: Label
var _main_box: VBoxContainer
var _lobby_box: VBoxContainer
var _server_list: VBoxContainer
var _lobby_info: Label
var _player_list: Label
var _start_btn: Button


func _ready() -> void:
	_build()
	Net.servers_changed.connect(_refresh_servers)
	Net.players_changed.connect(_refresh_lobby)
	Net.joined.connect(_show_lobby)
	Net.connection_failed.connect(func(): _show_main("Could not connect."))
	Net.server_closed.connect(func(): _show_main("Host closed the game."))
	_show_main("")


func _build() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.09, 0.1, 0.16)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(center)

	var root := VBoxContainer.new()
	root.custom_minimum_size = Vector2(760, 0)
	root.add_theme_constant_override("separation", 14)
	center.add_child(root)

	var title := _label("LAN ARENA", 56)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(title)

	_status = _label("", 24)
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_status.modulate = Color(1, 0.8, 0.4)
	root.add_child(_status)

	# main view
	_main_box = VBoxContainer.new()
	_main_box.add_theme_constant_override("separation", 12)
	root.add_child(_main_box)

	_name_edit = LineEdit.new()
	_name_edit.text = "Player%d" % (randi() % 100)
	_name_edit.placeholder_text = "Your name"
	_name_edit.max_length = 14
	_name_edit.add_theme_font_size_override("font_size", FONT)
	_name_edit.custom_minimum_size = Vector2(0, 64)
	_main_box.add_child(_name_edit)

	var host_btn := _button("Host a game")
	host_btn.pressed.connect(_on_host)
	_main_box.add_child(host_btn)

	_main_box.add_child(_label("Games on your Wi-Fi:", 24))
	_server_list = VBoxContainer.new()
	_server_list.add_theme_constant_override("separation", 8)
	_main_box.add_child(_server_list)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	_main_box.add_child(row)
	_ip_edit = LineEdit.new()
	_ip_edit.placeholder_text = "or type host IP (192.168.x.x)"
	_ip_edit.add_theme_font_size_override("font_size", FONT)
	_ip_edit.custom_minimum_size = Vector2(0, 64)
	_ip_edit.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(_ip_edit)
	var join_btn := _button("Join")
	join_btn.custom_minimum_size = Vector2(160, 64)
	join_btn.pressed.connect(func(): _on_join(_ip_edit.text.strip_edges()))
	row.add_child(join_btn)

	# lobby view
	_lobby_box = VBoxContainer.new()
	_lobby_box.add_theme_constant_override("separation", 14)
	root.add_child(_lobby_box)
	_lobby_info = _label("", 24)
	_lobby_box.add_child(_lobby_info)
	_player_list = _label("", 32)
	_lobby_box.add_child(_player_list)
	_start_btn = _button("Start game")
	_start_btn.pressed.connect(Net.start_game)
	_lobby_box.add_child(_start_btn)
	var leave_btn := _button("Leave")
	leave_btn.pressed.connect(func():
		Net.leave()
		_show_main(""))
	_lobby_box.add_child(leave_btn)


func _label(text: String, size: int) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	return l


func _button(text: String) -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(0, 76)
	b.add_theme_font_size_override("font_size", FONT)
	return b


func _show_main(msg: String) -> void:
	_status.text = msg
	_main_box.visible = true
	_lobby_box.visible = false
	Net.start_listening()
	_refresh_servers()


func _show_lobby() -> void:
	_status.text = ""
	_main_box.visible = false
	_lobby_box.visible = true
	_refresh_lobby()


func _on_host() -> void:
	Net.player_name = _clean_name()
	if Net.host_game():
		_show_lobby()
	else:
		_status.text = "Could not start server (port in use?)"


func _on_join(ip: String) -> void:
	if ip.is_empty():
		_status.text = "Enter the host IP or tap a game above."
		return
	Net.player_name = _clean_name()
	_status.text = "Connecting to %s..." % ip
	if not Net.join_game(ip):
		_status.text = "Invalid address."


func _clean_name() -> String:
	var n := _name_edit.text.strip_edges()
	return n if not n.is_empty() else "Player"


func _refresh_servers() -> void:
	for c in _server_list.get_children():
		c.queue_free()
	if Net.servers.is_empty():
		_server_list.add_child(_label("  searching...", 22))
		return
	for ip in Net.servers:
		var s: Dictionary = Net.servers[ip]
		var b := _button("%s's game  (%d players)  %s" % [s["name"], s["count"], ip])
		b.pressed.connect(_on_join.bind(ip))
		_server_list.add_child(b)


func _refresh_lobby() -> void:
	if not _lobby_box.visible:
		return
	_lobby_info.text = "Hosting - others join on this Wi-Fi.\nYour IP: %s" % Net.local_ip() if Net.is_host else "Connected. Waiting for host to start..."
	var lines := PackedStringArray()
	for id in Net.players:
		lines.append("• " + Net.players[id]["name"] + ("  (host)" if id == 1 else ""))
	_player_list.text = "\n".join(lines)
	_start_btn.visible = Net.is_host
