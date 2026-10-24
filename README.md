# LAN Arena

Offline LAN multiplayer top-down shooter for mobile, built with **Godot 4.3+**
(GL Compatibility renderer, landscape). No internet or server needed — one phone
hosts, the others on the same Wi-Fi join.

## How to play
- Everyone connects to the same Wi-Fi (or one phone's hotspot).
- One player taps **Host a game**; others see it under *Games on your Wi-Fi* and tap it
  (or type the host IP shown in the lobby). Host taps **Start game**. Up to 6 players.
- **Left half** of the screen: drag to move. **Right half**: drag to aim; push far to shoot.
- First to 10 kills wins.
- Desktop testing: WASD/arrows to move, Space to fire, mouse drag on the right half to aim.

## Run / export
1. Open the folder in Godot 4.3+ and press Play (run two instances via *Debug → Run Multiple Instances*;
   LAN discovery needs separate machines, so on one PC join with `127.0.0.1`).
2. Android: install the export templates, set up the Android SDK/JDK/keystore in Editor Settings,
   then *Project → Export → Android* (preset included; INTERNET and Wi-Fi permissions enabled).

## Networking
- ENet on UDP port 24680 for gameplay; each peer simulates its own player and streams state.
- Host broadcasts a UDP beacon on port 24681 every second for discovery (`scripts/net.gd`).
- Some routers/hotspots block client-to-client traffic ("AP isolation"); use the manual IP field or a phone hotspot.
