#pragma once

#include <string>
#include <cmath>

class Location {
private:
    std::string id;
    std::string name;
    double latitude;
    double longitude;
    double compute_cartesian_coordinates(int axis = 0) const {
        auto to_radians = [](double degree) {
            return degree * M_PI / 180.0;
        };
        const double EARTH_RADIUS_M = 6'371'000.0;
        switch (axis) {
            case 0: // x-axis
                return EARTH_RADIUS_M * cos(to_radians(latitude)) * cos(to_radians(longitude));
            case 1: // y-axis
                return EARTH_RADIUS_M * cos(to_radians(latitude)) * sin(to_radians(longitude));
            case 2: // z-axis
                return EARTH_RADIUS_M * sin(to_radians(latitude));
            default: // Should never happen
                return -1;
        }
    }

public:
    Location();
    Location(std::string id, std::string name, double latitude, double longitude);

    std::string get_id() const;
    std::string get_name() const;
    double get_latitude() const;
    double get_longitude() const;

    void set_id(std::string id);
    void set_name(std::string name);
    void set_latitude(double latitude);
    void set_longitude(double longitude);

    double get_x() const {
        return compute_cartesian_coordinates(0);
    };
    double get_y() const {
        return compute_cartesian_coordinates(1);
    };
    double get_z() const {
        return compute_cartesian_coordinates(2);
    };

    double distance_to(const Location& other) const;
    double euclidean_distance_to(const Location& other) const;
};
