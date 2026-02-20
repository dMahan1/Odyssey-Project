#pragma once

#include <string>
#include <vector>
#include <ctime>

#include "Location.hpp"

class Event{
    private:
        std::string creator_id;
        std::string id;
        std::vector<std::string> attendee_ids;
        Location location_id;
        time_t start_time;
        time_t end_time;

    public:
        Event(std::string creator_id,
            std::vector<std::string> attendee_ids,
            Location location_id,
            time_t start_time,
            time_t end_time);

        std::string get_creator_id();
        std::string get_id();
        std::vector<std::string> get_attendee_ids();
        Location get_locations();
        time_t get_start_time();
        time_t get_end_time();

        void set_creator_id();
        void set_id();
        void set_attendee_ids();
        void set_location_id();
        void set_start_time();
        void set_end_time();
};       