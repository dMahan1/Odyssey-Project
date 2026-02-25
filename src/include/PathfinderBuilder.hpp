#pragma once
#include "Location.hpp"
#include "Edge.hpp"
#include <string>
#include <vector>

enum Mode {
    DEBUG,
    RELEASE
};

class PathfinderBuilder {
public:
    PathfinderBuilder(Mode mode) : mode(mode) {
        load_data();
    };
    std::vector<Location> get_locations() const;
    std::vector<Edge> get_edges() const;
private:
    Mode mode;
    std::vector<Location> locations;
    std::vector<Edge> edges;
    void load_data() {
        if (mode == DEBUG) {
            load_data_debug();
        } else {
            load_data_release();
        }
    };
    void load_data_debug();
    void load_data_release();
};
