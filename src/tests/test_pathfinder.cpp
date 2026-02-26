#include <iostream>
#include "Pathfinder.hpp"
#include "PathfinderBuilder.hpp"
#include <cassert>

bool test_clear_weather_debug() {
    Pathfinder& pf = Pathfinder::get_instance();
    if (pf.get_mode() != DEBUG) {
        return true; // Skip this test if not in debug mode
    }

    const Location* src = pf.approximate_location(40.42522, -86.91052); // Past PMU
    const Location* dst = pf.approximate_location(40.42363, -86.91042); // Past KRAN

    Path path = pf.route(*src, *dst, false, WALKING);
    assert(!path.location_ids.empty());
    assert(path.total_distance > 0);
    for (const std::string& loc_id : path.location_ids) {
        std::cout << "Location ID in path: " << loc_id << std::endl;
    }
    return path.location_ids.size() == 5; // P -> G -> O -> P -> Q
}

bool test_bad_weather_debug() {
    Pathfinder& pf = Pathfinder::get_instance();
    if (pf.get_mode() != DEBUG) {
        return true; // Skip this test if not in debug mode
    }

    const Location* src = pf.approximate_location(40.42522, -86.91052); // Past PMU
    const Location* dst = pf.approximate_location(40.42363, -86.91042); // Past KRAN

    Path path = pf.route(*src, *dst, true, WALKING);
    assert(!path.location_ids.empty());
    assert(path.total_distance > 0);
    for (const std::string& loc_id : path.location_ids) {
        std::cout << "Location ID in bad weather path: " << loc_id << std::endl;
    }
    return path.location_ids.size() == 2; // P -> Q Tunnel
}

int main() {
    std::cout << "Running Pathfinder tests..." << std::endl;

    assert(test_clear_weather_debug());
    assert(test_bad_weather_debug());
    std::cout << "All Pathfinder tests passed!" << std::endl;
;
    return 0;

}
