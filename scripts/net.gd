extends Node
## Networking autoload: ENet host/join, UDP LAN discovery, shared player/score state.

const GAME_PORT := 24680
const DISCOVERY_PORT := 24681
const MAX_PLAYERS := 6
const WIN_SCORE := 10
const MAGIC := "lanarena1"

signal servers_changed
signal players_changed
signal scores_changed
signal joined
signal connection_failed
signal server_closed
signal game_go_changed
signal player_died(victim: int, killer: int)
signal game_over(winner_name: String)

var player_name := "Player"
var players := {}  # peer id -> {"name": String, "score": int}
var servers := {}  # ip -> {"name": String, "count": int, "seen": float}
var is_host := false
var in_lobby := false
var in_game := false
var game_go := false
var finished := false

var _bcast := PacketPeerUDP.new()
var _listen := PacketPeerUDP.new()
var _listening := false
var _bcast_timer := 0.0
var _ready_ids := {}


func _ready() -> void:
	multiplayer.peer_connected.connect(_on_peer_connected)
	multiplayer.peer_disconnected.connect(_on_peer_disconnected)
	multiplayer.connected_to_server.connect(_on_connected)
	multiplayer.connection_failed.connect(_on_connection_failed)
	multiplayer.server_disconnected.connect(_on_server_disconnected)


func host_game() -> bool:
	var peer := ENetMultiplayerPeer.new()
	if peer.create_server(GAME_PORT, MAX_PLAYERS - 1) != OK:
		return false
	multiplayer.multiplayer_peer = peer
	is_host = true
	in_lobby = true
	players = {1: {"name": player_name, "score": 0}}
	stop_listening()
	_bcast.set_broadcast_enabled(true)
	players_changed.emit()
	return true


func join_game(ip: String) -> bool:
	var peer := ENetMultiplayerPeer.new()
	if peer.create_client(ip, GAME_PORT) != OK:
		return false
	multiplayer.multiplayer_peer = peer
	stop_listening()
	return true


func leave() -> void:
	if multiplayer.multiplayer_peer:
		multiplayer.multiplayer_peer.close()
	multiplayer.multiplayer_peer = null
	players.clear()
	servers.clear()
	_ready_ids.clear()
	is_host = false
	in_lobby = false
	in_game = false
	game_go = false
	finished = false


func start_listening() -> void:
	if _listening:
		return
	servers.clear()
	if _listen.bind(DISCOVERY_PORT) == OK:
		_listening = true


func stop_listening() -> void:
	if _listening:
		_listen.close()
		_listening = false


func start_game() -> void:
	if is_host and not in_game:
		_begin.rpc()


func local_ip() -> String:
	for a in IP.get_local_addresses():
		if a.begins_with("192.168.") or a.begins_with("10.") or a.begins_with("172."):
			return a
	return "?"


func _process(delta: float) -> void:
	if is_host and in_lobby and not in_game:
		_bcast_timer -= delta
		if _bcast_timer <= 0.0:
			_bcast_timer = 1.0
			_broadcast()
	if _listening:
		var changed := false
		while _listen.get_available_packet_count() > 0:
			var text := _listen.get_packet().get_string_from_utf8()
			var ip := _listen.get_packet_ip()
			var data = JSON.parse_string(text)
			if data is Dictionary and data.get("g") == MAGIC:
				servers[ip] = {
					"name": str(data.get("name", "?")),
					"count": int(data.get("n", 1)),
					"seen": Time.get_ticks_msec() / 1000.0,
				}
				changed = true
		var now := Time.get_ticks_msec() / 1000.0
		for ip in servers.keys():
			if now - servers[ip]["seen"] > 4.0:
				servers.erase(ip)
				changed = true
		if changed:
			servers_changed.emit()


func _broadcast() -> void:
	var msg := JSON.stringify({"g": MAGIC, "name": player_name, "n": players.size()}).to_utf8_buffer()
	var targets := ["255.255.255.255"]
	for a in IP.get_local_addresses():
		var p := a.split(".")
		if p.size() == 4 and (a.begins_with("192.168.") or a.begins_with("10.") or a.begins_with("172.")):
			targets.append("%s.%s.%s.255" % [p[0], p[1], p[2]])
	for t in targets:
		_bcast.set_dest_address(t, DISCOVERY_PORT)
		_bcast.put_packet(msg)


# --- connection events ---

func _on_peer_connected(id: int) -> void:
	if multiplayer.is_server() and in_game:
		multiplayer.multiplayer_peer.disconnect_peer(id)


func _on_peer_disconnected(id: int) -> void:
	if not multiplayer.is_server():
		return
	players.erase(id)
	_ready_ids.erase(id)
	_push_players()
	_check_ready()


func _on_connected() -> void:
	in_lobby = true
	_register.rpc_id(1, player_name)
	joined.emit()


func _on_connection_failed() -> void:
	leave()
	connection_failed.emit()


func _on_server_disconnected() -> void:
	leave()
	server_closed.emit()


# --- lobby ---

@rpc("any_peer", "reliable")
func _register(pname: String) -> void:
	if not multiplayer.is_server() or in_game:
		return
	players[multiplayer.get_remote_sender_id()] = {"name": pname.substr(0, 14), "score": 0}
	_push_players()


func _push_players() -> void:
	_set_players.rpc(players)
	players_changed.emit()


@rpc("authority", "call_remote", "reliable")
func _set_players(p: Dictionary) -> void:
	players = p
	players_changed.emit()


@rpc("authority", "call_local", "reliable")
func _begin() -> void:
	for id in players:
		players[id]["score"] = 0
	_ready_ids.clear()
	in_game = true
	game_go = false
	finished = false
	get_tree().change_scene_to_file("res://scenes/game.tscn")


# --- game start handshake: everyone loads the scene, then the host says go ---

@rpc("any_peer", "call_local", "reliable")
func game_ready() -> void:
	if not multiplayer.is_server():
		return
	var sender := multiplayer.get_remote_sender_id()
	_ready_ids[1 if sender == 0 else sender] = true
	_check_ready()


func _check_ready() -> void:
	if multiplayer.is_server() and in_game and not game_go and _ready_ids.size() >= players.size():
		_go.rpc()


@rpc("authority", "call_local", "reliable")
func _go() -> void:
	game_go = true
	game_go_changed.emit()


# --- scoring ---

@rpc("any_peer", "call_local", "reliable")
func report_death(victim: int, killer: int) -> void:
	if finished:
		return
	if killer != victim and players.has(killer):
		players[killer]["score"] += 1
		if players[killer]["score"] >= WIN_SCORE:
			finished = true
			game_go = false
			player_died.emit(victim, killer)
			scores_changed.emit()
			game_over.emit(players[killer]["name"])
			return
	player_died.emit(victim, killer)
	scores_changed.emit()
