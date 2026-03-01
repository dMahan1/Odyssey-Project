#pragma once
#include "Location.hpp"
#include "Edge.hpp"
#include "KdTree.hpp"
#include <vector>
#include <mutex>
#include <memory>
#include <shared_mutex>
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
            std::unique_lock<std::shared_mutex> lock(mtx); // static init should be thread-safe,
                                                   // but it's better to exercise caution.
            static Pathfinder instance = Pathfinder();
            return instance;
        }
        const Location *get_location_by_id(std::string id) const;
        const Location *approximate_location(double latitude, double longitude) const;
        const Location *approximate_location_via(double latitude, double longitude, TraversalMode mode) const;
        Mode get_mode() const {
            return mode;
        }
        void print_tree() {
            if (mode == DEBUG) {
                location_tree.print();
            }
            else {
                std::cout << "Location tree is only printable in DEBUG mode." << std::endl;
            }
        }
        void insert_location(const Location& new_loc);
        void insert_edge(const Edge& new_edge);
    private:
        void init();
        Pathfinder() {
            init();
        }
        // TODO: switch to release mode.
        Mode mode = DEBUG;
        std::unordered_map<std::string, int> id_indices;
        std::vector<std::vector<Edge>> adj;
        std::vector<std::shared_ptr<Location>> locations;
        static std::shared_mutex mtx;
        KdTree<double> location_tree;
        Path reconstruct_path(Location src, Location dst, const std::vector<int>& prev, double total_distance) const;
        Path route_impl(const Location *src, const Location *dst, bool bad_weather, TraversalMode mode) const;

};
