#include "Location.hpp"
#include "Edge.hpp"
#include "Pathfinder.hpp"
#include <functional>
#include <iostream>
#include <queue>
#include <string_view>
#include <vector>
#include <limits>
#include <unordered_map>
#include <string>

void Pathfinder::init() {
    // Placeholder for actual initialization logic
    // In the real implementation, this will read from files or the database
    // TODO: Implement actual data loading logic here.
    this->location_tree = KdTree<double>();
    this->locations = {
    };
    for (const Location& loc : locations) {
        location_tree.insert({loc.get_latitude(), loc.get_longitude()}, &loc);
    }
    this->adj = {
    };
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

Path Pathfinder::route(Location src, Location dst, bool bad_weather, TraversalMode mode) const {
    size_t n = adj.size();
    std::vector<double> dist(n, std::numeric_limits<double>::infinity());
    std::vector<int> prev(n, -1);
    std::vector<double> est(n, std::numeric_limits<double>::infinity());
    std::priority_queue<std::pair<double, int>, std::vector<std::pair<double, int>>, std::greater<std::pair<double, int>>> pq;

    dist[src.get_id()] = 0.0;
    est[src.get_id()] = src.distance_to(dst);
    pq.push({est[src.get_id()], src.get_id()});


    while (!pq.empty()) {
        auto [curr_est, curr] = pq.top();
        pq.pop();

        if (curr == dst.get_id()) {
            return reconstruct_path(src, dst, prev, dist[dst.get_id()]);
        }

        for (const Edge& e : adj[curr]) {
            if ((mode == DRIVING && !e.is_drivable_by_car()) ||
                (mode == BUS && !e.is_drivable_by_bus()) ||
                (mode == BIKING && !e.is_bikeable()) ||
                (mode == WALKING && !e.is_walkable())) {
                continue;
            }
            int to = e.get_vertex2();

            double cumulative_dist = dist[curr] + e.get_weight();
            if (cumulative_dist < dist[to]) {
                dist[to] = cumulative_dist;
                prev[to] = curr;
                est[to] = cumulative_dist + locations[to].distance_to(dst);
                pq.push({est[to], to});
            }
        }
    }
    return Path();
}
