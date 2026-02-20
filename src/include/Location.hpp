#pragma once

#include <string>

class Location {
private:
    std::string id;
    std::string name;
    double latitude;
    double longitude;

public:
    Location(std::string id, std::string name, double latitude, double longitude);

    std::string get_id() const;
    std::string get_name() const;
    double get_latitude() const;
    double get_longitude() const;

    void set_id(std::string id);
    void set_name(std::string name);
    void set_latitude(double latitude);
    void set_longitude(double longitude);

    double distance_to(const Location& other) const;
};
