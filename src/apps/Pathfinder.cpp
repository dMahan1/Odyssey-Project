#include "Location.hpp"
#include "Edge.hpp"
#include "Pathfinder.hpp"
#include "KdTree.hpp"
#include "PathfinderBuilder.hpp"
#include <functional>
#include <queue>
#include <string_view>
#include <vector>
#include <limits>
#include <unordered_map>
#include <string>
#include <stdexcept>

void Pathfinder::init() {
    PathfinderBuilder builder(this->mode);
    this->locations = builder.get_locations();
    for (size_t i = 0; i < locations.size(); ++i) {
        id_indices[locations[i].get_id()] = i;
    }
    this->location_tree = KdTree<double>();
    for (const Location& loc : locations) {
        location_tree.insert({loc.get_latitude(), loc.get_longitude()}, &loc);
    }
    this->adj = std::vector<std::vector<Edge>>(locations.size());
    for (const Edge& edge : builder.get_edges()) {
        adj[id_indices[edge.get_vertex1()]].push_back(edge);
    }
}

const Location *Pathfinder::get_location_by_id(std::string id) const {
    for (const Location& loc : locations) {
        if (loc.get_id() == id) {
            return &loc;
        }
    }
    throw std::runtime_error("Location ID not found: " + id);
}

const Location *Pathfinder::approximate_location(double latitude, double longitude) const {
    auto dist = [](const void *a, const void *b) {
        const Location* locA = static_cast<const Location*>(a);
        const Location* locB = static_cast<const Location*>(b);
        return locA->distance_to(*locB);
    };
    Location query("Query", "QueryLoc", latitude, longitude);
    const Location *closest = static_cast<const Location*>(location_tree.nearest_neighbor({latitude, longitude}, &query, dist));
    return closest;
}

Path Pathfinder::reconstruct_path(Location src, Location dst, const std::vector<int>& prev, double total_distance) const {
    std::vector<std::string> location_ids;
    int current = id_indices.at(dst.get_id());
    while (current != -1) {
        location_ids.push_back(locations[current].get_id());
        current = prev[current];
    }
    std::reverse(location_ids.begin(), location_ids.end());
    return Path{location_ids, total_distance};
}

Path Pathfinder::route(Location src, Location dst, bool bad_weather, TraversalMode mode) const {
    size_t n = adj.size();
    std::vector<double> dist(n, std::numeric_limits<double>::infinity());
    std::vector<double> weighted_dist(n, std::numeric_limits<double>::infinity());
    std::vector<int> prev(n, -1);
    std::vector<double> est(n, std::numeric_limits<double>::infinity());
    std::priority_queue<std::pair<double, int>, std::vector<std::pair<double, int>>, std::greater<std::pair<double, int>>> pq;

    int src_index = id_indices.at(src.get_id());
    int dst_index = id_indices.at(dst.get_id());

    dist[src_index] = 0.0;
    weighted_dist[src_index] = 0.0;
    est[src_index] = src.distance_to(dst);
    pq.push({est[src_index], src_index});


    while (!pq.empty()) {
        auto [curr_est, curr] = pq.top();
        pq.pop();

        if (curr == dst_index) {
            return reconstruct_path(src, dst, prev, dist[dst_index]);
        }

        for (const Edge& e : adj[curr]) {
            if ((mode == DRIVING && !e.is_drivable_by_car()) ||
                (mode == BUS && !e.is_drivable_by_bus()) ||
                (mode == BIKING && !e.is_bikeable()) ||
                (mode == WALKING && !e.is_walkable())) {
                continue;
            }
            std::string to = e.get_vertex2();

            double cumulative_dist = weighted_dist[curr] +
                (e.get_weight() * (bad_weather && !e.is_indoor() ? 1.10 : 1.0));
            if (cumulative_dist < dist[id_indices.at(to)]) {
                weighted_dist[id_indices.at(to)] = cumulative_dist;
                dist[id_indices.at(to)] = dist[curr] + e.get_weight();
                prev[id_indices.at(to)] = curr;
                est[id_indices.at(to)] = cumulative_dist + locations[id_indices.at(to)].distance_to(dst);
                pq.push({est[id_indices.at(to)], id_indices.at(to)});
            }
        }
    }
    return Path();
}
