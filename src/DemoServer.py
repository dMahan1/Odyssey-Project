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

# FIXED: Matched event name to frontend ("approximate_location")
@socketio.on("approximate_location")
def handle_approximate(data):
    lat = float(data["lat"])
    lon = float(data["lon"])
    print(f"Approximation request: {lat}, {lon}")

    try:
        loc = pf.approximate_location(lat, lon)
        if loc:
            # FIXED: Changed "id" to "node_id" to match frontend expectations
            return {"node_id": loc.get_id()}
        else:
            return {"error": "No nearby location found."}
    except Exception as e:
        return {"error": str(e)}


# -------------------------
# Routing event
# -------------------------

@socketio.on("route")
def handle_route(data):
    src_id = data["src"].strip()
    dst_id = data["dst"].strip()
    
    # Safely get the weather boolean, defaulting to False if missing
    weather_condition = data.get("weather", False)
    
    print(f"Routing request received: src={src_id}, dst={dst_id}, bad_weather={weather_condition}")

    try:
        src = pf.get_location_by_id(src_id)
        dst = pf.get_location_by_id(dst_id)
    except RuntimeError as e:
        # FIXED: Returned dictionary directly to trigger frontend callback
        return {"error": f"Location not found: {str(e)}"}

    try:
        path = pf.route(src, dst, weather_condition, bindings.TraversalMode.WALKING)
        
        if len(path.location_ids) == 0:
            print("No path found.")
            return {"error": "No valid path found between these nodes."}
        else:
            print(f"Path found: {path.location_ids} with total distance {path.total_distance}")

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

        # Triggers frontend callback and draws the path!
        return {"distance": path.total_distance, "nodes": nodes}

    except Exception as e:
        print(f"Routing Error: {e}")
        return {"error": str(e)}


# -------------------------
# Send graph to frontend (Optional/Extra)
# -------------------------

@socketio.on("graph")
def send_graph():
    nodes = []

    # try a reasonable ID range for demo graphs
    for i in range(1000):
        # NOTE: Be careful catching Exceptions here if get_location_by_id throws on missing IDs
        try:
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
        except Exception:
            continue

    # Emit is fine here because the frontend doesn't use a callback for this event yet
    emit("graph_data", nodes)


# -------------------------
# Run server
# -------------------------

if __name__ == "__main__":
    print("Starting Flask-SocketIO server on http://127.0.0.1:8000 ...")
    socketio.run(app, port=8000, debug=True, use_reloader=False)