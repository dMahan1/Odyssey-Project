#include <cmath>
#include <string>
#include "Location.hpp"

/**
 * @brief Construct a new Location object
 *
 * @param id The unique identifier for the location
 * @param name The name of the location
 * @param longitude The longitude of the location
 * @param latitude The latitude of the location
 *
 * @return A new Location object initialized with the provided parameters
 */
Location::Location(int id, std::string name, double latitude, double longitude) {
    this->id = id;
    this->name = name;
    this->latitude = latitude;
    this->longitude = longitude;
}

/**
 * @brief Get the unique identifier of the location
 *
 * @return The unique identifier of the location
 */
int Location::get_id() const {
    return id;
}

/**
 * @brief Get the name of the location
 *
 * @return The name of the location
 */
std::string Location::get_name() const {
    return name;
}

/**
 * @brief Get the longitude of the location
 *
 * @return The longitude of the location
 */
double Location::get_longitude() const {
    return longitude;
}

/**
 * @brief Set the unique identifier of the location
 *
 * @param id The new unique identifier for the location
 */
void Location::set_id(int id) {
    this->id = id;
}


/**
 * @brief Set the name of the location
 *
 * @param name The new name for the location
 */
void Location::set_name(std::string name) {
    this->name = name;
}

/**
 * @brief Get the latitude of the location
 *
 * @return The latitude of the location
 */
double Location::get_latitude() const {
    return latitude;
}

/**
 * @brief Set the longitude of the location
 *
 * @param longitude The new longitude for the location
 */
void Location::set_longitude(double longitude) {
    this->longitude = longitude;
}

/**
 * @brief Set the latitude of the location
 *
 * @param latitude The new latitude for the location
 */
void Location::set_latitude(double latitude) {
    this->latitude = latitude;
}

/**
 * @brief Calculate the distance in meters between this
 * location and another location using the Haversine formula
 *
 * @param other The other location to calculate the distance to
 * @return The distance in meters between the two locations
 */
double Location::distance_to(const Location& other) const {
    auto to_radians = [](double degree) {
        return degree * M_PI / 180.0;
    };
    double lat1 = to_radians(this->latitude);
    double lat2 = to_radians(other.latitude);
    double delta_lat = to_radians(other.latitude - this->latitude);
    double delta_lon = to_radians(other.longitude - this->longitude);

    double a = sin(delta_lat / 2) * sin(delta_lat / 2) +
               cos(lat1) * cos(lat2) *
               sin(delta_lon / 2) * sin(delta_lon / 2);
    double angular_dist = 2 * atan2(sqrt(a), sqrt(1 - a));
    const double EARTH_RADIUS_M = 6'371'000;
    return EARTH_RADIUS_M * angular_dist;
}
