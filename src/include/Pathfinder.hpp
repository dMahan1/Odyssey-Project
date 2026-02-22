#pragma once
#include "Location.hpp"
#include "Edge.hpp"
#include "KdTree.hpp"
#include <vector>
#include <unordered_map>
#include <string>


enum TraversalMode {
    WALKING,
    BIKING,
    DRIVING,
    BUS
};
struct Path {
    std::vector<int> location_ids;
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
    private:
        void init();
        Pathfinder() {
            init();
        }
        std::unordered_map<std::string, std::vector<Edge>> adj;
        std::vector<Location> locations;
        KdTree<double> location_tree;
        Path reconstruct_path(Location src, Location dst, const std::vector<int>& prev, double total_distance) const;
};
