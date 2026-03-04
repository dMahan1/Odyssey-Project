#pragma once
#include "Location.hpp"
#include "Edge.hpp"
#include <string>
#include <vector>

enum Mode {
    DEBUG,
    DEMO,
    RELEASE
};

class PathfinderBuilder {
public:
    PathfinderBuilder(Mode mode) : mode(mode) {
        this->locations = std::vector<Location>();
        this->edges = std::vector<Edge>();
        load_data();
    };
    std::vector<Location> get_locations() const;
    std::vector<Edge> get_edges() const;
private:
    Mode mode;
    std::vector<Location> locations;
    std::vector<Edge> edges;
    void load_data() {
        switch (mode) {
            case DEBUG:
                load_data_debug();
                break;
            case DEMO:
                load_data_demo();
                break;
            case RELEASE:
                load_data_release();
                break;
            default:
                break;
        }
    };
    void load_data_debug();
    void load_data_demo();
    void load_data_release();
};
