# DemoServer.py

import bindings
from flask import Flask
from flask_socketio import SocketIO, emit

# -------------------------

# Flask + SocketIO setup

# -------------------------

app = Flask(__name__)
app.config["SECRET_KEY"] = "demo"
socketio = SocketIO(app, cors_allowed_origins="*")

# -------------------------

# Pathfinder instance

# -------------------------

pf = bindings.Pathfinder.get_instance()

# -------------------------

# Routing event

# -------------------------


@socketio.on("route")
def handle_route(data):
    src_id = data["src"]
    dst_id = data["dst"]

    src = pf.get_location_by_id(src_id)
    dst = pf.get_location_by_id(dst_id)

    if src is None or dst is None:
        emit("route_result", {"error": "Invalid node"})
        return

    path = pf.route(src, dst, False, bindings.TraversalMode.WALKING)

    nodes = []

    for nid in path.location_ids:
        loc = pf.get_location_by_id(nid)
        nodes.append(
            {
                "id": loc.get_id(),
                "lat": loc.get_latitude(),
                "lon": loc.get_longitude(),
                "name": loc.get_name(),
            }
        )

    emit("route_result", {"distance": path.total_distance, "nodes": nodes})


# -------------------------

# Send graph to frontend

# -------------------------


@socketio.on("graph")
def send_graph():
    nodes = []

    # try a reasonable ID range for demo graphs
    for i in range(1000):
        loc = pf.get_location_by_id(str(i))
        if loc is None:
            continue
        nodes.append(
            {
                "id": loc.get_id(),
                "lat": loc.get_latitude(),
                "lon": loc.get_longitude(),
                "name": loc.get_name(),
            }
        )

    emit("graph_data", nodes)


# -------------------------

# Run server

# -------------------------

if __name__ == "__main":
    socketio.run(app, port=9000, debug=True, threaded=False)
