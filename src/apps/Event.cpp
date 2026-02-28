#include "Event.hpp"
#include "Location.hpp"

/**
 * @brief Creates a new Event object
 * 
 * @param creator_id the id for the event creator
 * @param attendee_ids the ids for the event attendees
 * @param location_id the location of the event
 * @param start_time the start time of the event 
 * @param end_time the end time of the event 
 * 
 * @return An event initialized with the provided params
 */
Event::Event(std::string creator_id,
            std::vector<std::string> attendee_ids,
            Location location_id,
            time_t start_time,
            time_t end_time) {
    this->creator_id = creator_id;
    this->attendee_ids = attendee_ids;
    this->location_id = location_id;
    this->start_time = start_time;
    this->end_time = end_time;
}


/**
 * @brief getter for creator id
 * 
 * @return creator id
 */
std::string Event::get_creator_id() {
    return creator_id;
}

/**
 * @brief getter for id
 *
 * @return id
 */
std::string Event::get_id() {
    return id;
}

/**
 * @brief getter for attendee ids
 *
 * @return attendee ids
 */
std::vector<std::string> Event::get_attendee_ids() {
    return attendee_ids;
}

/**
 * @brief getter for locations
 *
 * @return locations
 */
Location Event::get_locations() {
    return location_id;
}

/**
 * @brief getter for start time
 *
 * @return start time
 */
time_t Event::get_start_time() {
    return start_time;
}

/**
 * @brief getter for end time
 *
 * @return end time
 */
time_t Event::get_end_time() {
    return end_time;
}



/**
 * @brief setter for creator id
 * 
 * @param creator_id the new creator id value
 */
void Event::set_creator_id(std::string creator_id) {
    this->creator_id = creator_id;
}

/**
 * @brief setter for id
 *
 * @param id the new id value
 */
void Event::set_id(std::string id) {
    this->id = id;
}

/**
 * @brief setter for attendee ids
 *
 * @param attendee_ids the new attendee ids value
 */
void Event::set_attendee_ids(std::vector<std::string> attendee_ids) {
    this->attendee_ids = attendee_ids;
}

/**
 * @brief setter for location_id
 *
 * @param location_id the new location_id value
 */
void Event::set_location_id(Location location_id) {
    this->location_id = location_id;
}

/**
 * @brief setter for start time
 *
 * @param start_time the new start time value
 */
void Event::set_start_time(time_t start_time) {
    this->start_time = start_time;
}

/**
 * @brief setter for end time
 *
 * @param end_time the new end time value
 */
void Event::set_end_time(time_t end_time) {
    this->end_time = end_time;
}