#pragma once
#include "Location.hpp"
#include "Edge.hpp"
#include "KdTree.hpp"
#include <vector>
#include <unordered_map>
#include <string>
#include "PathfinderBuilder.hpp"


enum TraversalMode {
    WALKING,
    BIKING,
    DRIVING,
    BUS
};
struct Path {
    std::vector<std::string> location_ids;
    double total_distance;
};


class Pathfinder {
    public:
        Path route(Location src, Location dst, bool bad_weather, TraversalMode mode) const;
        static Pathfinder& get_instance() {
            static Pathfinder instance = Pathfinder();
            return instance;
        }
        const Location *get_location_by_id(std::string id) const;
        const Location *approximate_location(double latitude, double longitude) const;
        Mode get_mode() const {
            return mode;
        }
    private:
        void init();
        Pathfinder() {
            init();
        }
        Mode mode = DEBUG;
        std::unordered_map<std::string, int> id_indices;
        std::vector<std::vector<Edge>> adj;
        std::vector<Location> locations;
        KdTree<double> location_tree;
        Path reconstruct_path(Location src, Location dst, const std::vector<int>& prev, double total_distance) const;
};
