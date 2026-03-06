# DemoServer.py

import bindings
from flask import Flask, abort, render_template
from flask_socketio import SocketIO, emit
from jinja2 import TemplateNotFound

# -------------------------

# Flask + SocketIO setup

# -------------------------

app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def index():
    # Flask looks in the 'templates' folder for this file
    return render_template("Map_Demo.html")


# -------------------------

# Pathfinder instance

# -------------------------

pf = bindings.Pathfinder.get_instance()

# -------------------------
# Approximate Location Event
# -------------------------


@socketio.on("approximate")
def handle_approximate(data):
    lat = float(data["lat"])
    lon = float(data["lon"])
    print(f"Approximation request: {lat}, {lon}")

    try:
        # Assuming pf.approximate_location returns a Location object
        # or an object with a get_id() method
        loc = pf.approximate_location(lat, lon)
        if loc:
            return {"id": loc.get_id()}
        else:
            return {"error": "No nearby location found."}
    except Exception as e:
        return {"error": str(e)}


# -------------------------

# Routing event

# -------------------------


@socketio.on("route")
def handle_route(data):
    src_id = data["src"]
    dst_id = data["dst"]
    print(f"Routing request received: src={src_id}, dst={dst_id}")

    try:
        src = pf.get_location_by_id(src_id)
        dst = pf.get_location_by_id(dst_id)
    except RuntimeError as e:
        emit("route_result", {"error": f"Location not found: {str(e)}"})
        return

    path = pf.route(src, dst, data["weather"], bindings.TraversalMode.PRINT_ALL)
    if len(path.location_ids) == 0:
        print("No path found.")
        return
    else:
        print(
            f"Path found: {path.location_ids} with total distance {path.total_distance}"
        )
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

    return {"distance": path.total_distance, "nodes": nodes}


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

if __name__ == "__main__":
    socketio.run(app, port=8000, debug=True, use_reloader=False)
