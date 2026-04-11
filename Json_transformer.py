import json
import os
from dotenv import load_dotenv
from pathlib import Path
import empyrebase
import sys

# Get the user's home directory path
#home_dir = Path.home()

# Server Requires firebase key downloaded and stored seperately
# Not included in code but shared with server computer manually
# Change path for change in server, currently accesses OdysseyFirebase folder in a user's home directory.
#home_dir = Path.home()
#path = home_dir/"OdysseyFirebase"
load_dotenv()
config = {
  "apiKey": os.getenv("API_KEY"),
  "authDomain": os.getenv("AUTH_DOMAIN"),
  "projectId": os.getenv("PROJECT_ID"),
  "databaseURL": os.getenv("DATABASE_URL"),
  "storageBucket": os.getenv("STORAGE_BUCKET")
  #"serviceAccount": path/"odyssey-cd6c7-firebase-adminsdk-fbsvc-33704d2399.json"
}

firebase = empyrebase.initialize_app(config)
auth = firebase.auth()
admin = auth.sign_in_with_email_and_password(os.getenv("ADMIN_EMAIL"), os.getenv("ADMIN_PASSWORD"))

def transform_graph_data(input_filepath):
    # 1. Read the exported JSON from the Graph Builder
    try:
        with open(input_filepath, 'r') as file:
            original_data = json.load(file)
    except FileNotFoundError:
        print(f"Error: Could not find the file {input_filepath}")
        return
    except json.JSONDecodeError:
        print(f"Error: {input_filepath} is not a valid JSON file")
        return

    # 2. Transform the nodes into the new "locations" format
    locations = []
    for node in original_data.get("nodes", []):
        location_entry = {
            "id": node["id"],
            "data": {
                "name": node["name"],
                "coordinates": {
                    "latitude": node["lat"],
                    "longitude": node["lon"]
                },
                # Defaulting these since they aren't in the web app yet
                "permanent": True, 
                "usedInEvent": False 
            }
        }
        locations.append(location_entry)

    # 3. Transform the edges (Your requested format matches the export exactly, 
    # but we rebuild it here to ensure it's clean and exact)
    edges = []
    for edge in original_data.get("edges", []):
        edge_entry = {
            "from": edge["from"],
            "to": edge["to"],
            "weight": edge["weight"],
            "flags": edge["flags"]
        }
        edges.append(edge_entry)

    # 4. Combine into the final dictionary
    transformed_data = {
        "locations": locations,
        "edges": edges
    }
    return transformed_data

def save_transformed_data(input_filepath):
    data = transform_graph_data(input_filepath)
    db = firebase.database()
    for location in data["locations"]:
        db.child("Locations").child(location["id"]).set(location["data"], token=admin['idToken'])
    for edge in data["edges"]:
        db.child("Edges").push(edge, token=admin['idToken'])

def get_transformed_data():
    db = firebase.database()
    locations = db.child("Locations").order_by_child("permanent").equal_to(True).get(token=admin['idToken']).val()
    edges = db.child("Edges").get(token=admin['idToken']).val()
    print(f"Edges retrieved from database: {edges}")  # Debugging line to check edge data
    print(f"Locations retrieved from database: {locations}")  # Debugging line to check location data
    
    # Convert locations back to the "nodes" format
    nodes = []
    for loc_id, loc_data in locations.items():
        try:
            node_entry = {
                "id": loc_id,
                "name": loc_data.get("name", "Unknown Node"),
                "lat": loc_data.get("coordinates", {}).get("latitude"),
                "lon": loc_data.get("coordinates", {}).get("longitude")
            }
        except Exception as e:
            print(f"Error processing location {loc_id}: {e}")
            continue
        nodes.append(node_entry)

    # Convert edges back to the original format
    edge_list = []
    for edge_id, edge_data in edges.items():
        try:
            edge_entry = {
                "from": edge_data.get("from"),
                "to": edge_data.get("to"),
                "weight": edge_data.get("weight"),
                "flags": edge_data.get("flags", 0) # Default to 0 if flags are missing
            }
        except Exception as e:
            print(f"Error processing edge {edge_id}: {e}")
            continue
        edge_list.append(edge_entry)

    transformed_data = {"nodes": nodes, "edges": edge_list}
    print(f"Transformed data ready for export: {transformed_data}")  # Debugging line to check final transformed data
    return transformed_data

def revert_transformed_data(output_filepath):
    formatted_data = get_transformed_data()

    # 5. Write the flattened data to the output file
    with open(output_filepath, 'w') as file:
        # Using indent=2 to match our JavaScript export exactly
        json.dump(formatted_data, file, indent=2)
    
    print(f"Success! Reverted data saved to {output_filepath}")

save_transformed_data(sys.argv[1])