#include "PathfinderBuilder.hpp"

std::vector<Location> PathfinderBuilder::get_locations() const {
    return locations;
}
std::vector<Edge> PathfinderBuilder::get_edges() const {
    return edges;
}

void PathfinderBuilder::load_data_debug() {
    // TODO: Build sample graph for testing
}

void PathfinderBuilder::load_data_release() {
    // TODO: Implement data loading for release mode
}
