#include <cmath>
#include <string>
using namespace std;

class Location {
    private:
        int id;
        std::string name;
        float longitude;
        float latitude;
    public:
        Location(int id, std::string name, float longitude, float latitude);
        int get_id();
        std::string get_name();
        float get_longitude();
        float get_latitude();
        void set_id(int id);
        void set_name(std::string name);
        void set_longitude(float longitude);
        void set_latitude(float latitude);
        float distance_to(Location other);
};

Location::Location(int id, std::string name, float longitude, float latitude) {
    this->id = id;
    this->name = name;
    this->longitude = longitude;
    this->latitude = latitude;
}
int Location::get_id() {
    return id;
}
std::string Location::get_name() {
    return name;
}
float Location::get_longitude() {
    return longitude;
}
float Location::get_latitude() {
    return latitude;
}
void Location::set_id(int id) {
    this->id = id;
}
void Location::set_name(std::string name) {
    this->name = name;
}
void Location::set_longitude(float longitude) {
    this->longitude = longitude;
}
void Location::set_latitude(float latitude) {
    this->latitude = latitude;
}
float Location::distance_to(Location other) {
    auto to_radians = [](float degree) {
        return degree * M_PI / 180.0;
    };
    float lat1 = to_radians(this->latitude);
    float lat2 = to_radians(other.latitude);
    float delta_lat = lat1 - lat2;
    float delta_lon = to_radians(other.longitude - this->longitude);
    float a = sin(delta_lat / 2) * sin(delta_lat / 2) +
              cos(lat1) * cos(lat2) *
              sin(delta_lon / 2) * sin(delta_lon / 2);
    float c = 2 * atan2(sqrt(a), sqrt(1 - a));
    const float EARTH_RADIUS_M = 6371000.0;
    return EARTH_RADIUS_M * c;
}
