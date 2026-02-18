#include <iostream>
#include <cassert>
#include "Location.h"

bool test_zero_dist() {
    Location loc1 = Location(0, "Location 1", 0, 0);
    Location loc2 = Location(1, "Location 2", 0, 0);
    double distance = loc1.distance_to(loc2);
    std::cout << "Distance between identical locations: " << distance << " meters" << std::endl;
    return distance == 0.0;
}

bool test_zero_dist_nontrivial() {
    Location loc1 = Location(0, "PU Belltower", 40.427278652426246, -86.91404456339225);
    Location loc2 = Location(1, "PU Belltower", 40.427278652426246, -86.91404456339225);
    double distance = loc1.distance_to(loc2);
    std::cout << "Distance between identical locations (non-trivial): " << distance << " meters" << std::endl;
    return distance == 0.0;
}

bool test_dist_short() {
    Location loc1 = Location(0, "WALC", 40.427289133926436, -86.91347677048536);
    Location loc2 = Location(1, "PU Belltower", 40.427278652426246, -86.91404456339225);
    double distance = loc1.distance_to(loc2);
    std::cout << "Distance from WALC to PU Belltower: " << distance << " meters" << std::endl;
    // The expected distance is approximately 50 meters
    return distance > 40.0 && distance < 60.0;
}

bool test_dist_nyc_to_la() {
    Location nyc = Location(0, "New York City", 40.712776, -74.005974);
    Location la = Location(1, "Los Angeles", 34.052235, -118.243683);
    double distance = nyc.distance_to(la);
    std::cout << "Distance from New York City to Los Angeles: " << distance << " meters" << std::endl;
    // The expected distance is approximately 3935746 meters
    return distance > 3'900'000.0 && distance < 4'000'000.0;
}

int main() {
    std::cout << "Running local tests..." << std::endl;

    assert(test_zero_dist());
    assert(test_zero_dist_nontrivial());
    assert(test_dist_short());
    assert(test_dist_nyc_to_la());

    std::cout << "All tests passed!" << std::endl;
    return 0;
}
