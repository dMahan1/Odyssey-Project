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
        
}