#include "KdTree.hpp"
#include "Location.hpp"
#include <iostream>
#include <cmath>
#include <assert.h>

bool test_location_exact() {
    KdTree<double> tree;
    Location loc1("1", "Loc1", 1.0, 2.0);
    Location loc2("2", "Loc2", 3.0, 4.0);
    Location loc3("3", "Loc3", 5.0, 6.0);

    auto distance = [](void* a, void* b) {
        Location* locA = static_cast<Location*>(a);
        Location* locB = static_cast<Location*>(b);
        return locA->distance_to(*locB);
    };

    tree.insert({loc1.get_latitude(), loc1.get_longitude()}, &loc1);
    tree.insert({loc2.get_latitude(), loc2.get_longitude()}, &loc2);
    tree.insert({loc3.get_latitude(), loc3.get_longitude()}, &loc3);

    Location query("Query", "QueryLoc", 1.0, 2.0);
    void* nearest = tree.nearest_neighbor({query.get_latitude(), query.get_longitude()}, &query, distance);
    assert(nearest != nullptr);
    Location* nearestLoc = static_cast<Location*>(nearest);
    assert(nearestLoc->get_name() == "Loc1");
    std::cout << "Test passed: Nearest location to " << query.get_name() << " is " << nearestLoc->get_name() << std::endl;
    return true;
}

bool test_location_near() {
    KdTree<double> tree;
    Location loc1("1", "Loc1", 1.0, 2.0);
    Location loc2("2", "Loc2", 30.0, 40.0);
    Location loc3("3", "Loc3", 50.0, 60.0);

    auto distance = [](void* a, void* b) {
        Location* locA = static_cast<Location*>(a);
        Location* locB = static_cast<Location*>(b);
        return locA->distance_to(*locB);
    };

    tree.insert({loc1.get_latitude(), loc1.get_longitude()}, &loc1);
    tree.insert({loc2.get_latitude(), loc2.get_longitude()}, &loc2);
    tree.insert({loc3.get_latitude(), loc3.get_longitude()}, &loc3);

    Location query("Query", "QueryLoc", 0.99, 1.99);
    void* nearest = tree.nearest_neighbor({query.get_latitude(), query.get_longitude()}, &query, distance);
    assert(nearest != nullptr);
    Location* nearestLoc = static_cast<Location*>(nearest);
    assert(nearestLoc->get_name() == "Loc1");
    std::cout << "Test passed: Nearest location to " << query.get_name() << " is " << nearestLoc->get_name() << std::endl;
    return true;
}

int main() {
    test_location_exact();
    test_location_near();
    return 0;
}
