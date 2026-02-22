#include <pybind11/embed.h>
#include <iostream>
#include <string>
#include <vector>
#include <utility>

#include "User.hpp"

#include "Location.hpp"
#include "Event.hpp"

namespace py = pybind11;

/**
 * @brief Construct a new User object
 *
 * @param username The username of the user
 * @param email The email of the user
 *
 * @return A new User object initialized with the provided parameters
 */
User::User(std::string username, std::string email) {
    this->username = username;
    this->email = email;
}

// Getters

/**
 * @brief Get the unique identifier of the user
 *
 * @return The unique identifier of the user
 */
std::string User::get_id() {
    return this->id;
}

/**
 * @brief Get the username of the user
 *
 * @return The username of the user
 */
std::string User::get_username() {
    return this->username;
}

/**
 * @brief Get the email of the user
 *
 * @return The email of the user
 */
std::string User::get_email() {
    return this->email;
}

/**
 * @brief Get a vector of friend IDs of the user
 *
 * @return The a vector of friend IDs of the user
 */
std::vector<std::string> User::get_friend_ids() {
    return this->friend_ids;
}

/**
 * @brief Get the current location of the user
 *
 * @return The current location of the user
 */
std::pair<double,double> User::get_curr_location() {
    return this->curr_location;
}

/**
 * @brief Get a vector of dropped pins of the user
 *
 * @return The vector of dropped pins of the user
 */
std::vector<Location> User::get_dropped_pins() {
    return this->dropped_pins;
}

/**
 * @brief Get the amount of toucoins of the user
 *
 * @return The amount of toucoins of the user
 */
int User::get_toucoins() {
    return this->toucoins;
}

/**
 * @brief Get a vector of the unique identifiers of the features owned by the user
 *
 * @return The vector of unique identifiers of the features owned by the user
 */
std::vector<std::string> User::get_owned_feature_ids() {
    return this->owned_feature_ids;
}

/**
 * @brief Get the icon image path of the user
 *
 * @return The icon image path of the user
 */
std::string User::get_icon_image_path() {
    return this->icon_image_path;
}

/**
 * @brief Get the public location permission of the user
 *
 * @return The public location permission of the user
 */
bool User::get_location_public() {
    return this->location_public;
}

/**
 * @brief Get the admin status of the user
 *
 * @return The admin status of the user
 */
bool User::get_is_admin() {
    return this->is_admin;
}

/**
 * @brief Get a vector of the new messages for the user
 *
 * @return The vector of the new messages for the user
 */
std::vector<std::string> User::get_new_messages() {
    return this->new_messages;
}

/**
 * @brief Get a vector of the unique identifiers of the attended events for the user
 *
 * @return The vector of unique identifiers of the attended events for the user
 */
std::vector<std::string> User::get_attended_event_ids() {
    return this->attended_event_ids;
}

// Setters

/**
 * @brief Set the unique identifier of the user
 *
 * @param id The new unique identifier for the user
 */
void User::set_id(std::string id) {
    this->id = id;
}

/**
 * @brief Set the username of the user
 *
 * @param username The new username for the user
 */
void User::set_username(std::string username) {
    this->username = username;
}

/**
 * @brief Set the email of the user
 *
 * @param email The new email for the user
 */
void User::set_email(std::string email) {
    this->email = email;
}

/**
 * @brief Add a friend ID to the user's friend list
 *
 * @param friend_id The new friend ID to add
 */
void User::add_friend_id(std::string friend_id) {
    this->friend_ids.push_back(friend_id);
}

/**
 * @brief Remove a friend ID from the user's friend list
 *
 * @param friend_id The friend ID to remove
 * @return the friend ID if it was successfully removed, otherwise returns an empty string
 */
std::string User::remove_friend_id(std::string friend_id) {
    for (size_t i = 0; i < this->friend_ids.size(); ++i) {
        if (this->friend_ids[i] == friend_id) {
            std::string removed_friend_id = this->friend_ids[i];
            this->friend_ids.erase(this->friend_ids.begin() + i);
            return removed_friend_id;
        }
    }
    return "";
}

/**
 * @brief Set the current location of the user
 *
 * @param coordinates The new coordinates for the user's current location
 */
void User::set_curr_location(std::pair<double,double> coordinates) {
    this->curr_location = coordinates;
}

/**
 * @brief Add a dropped pin to the user's list of dropped pins
 *
 * @param pin The new dropped pin to add
 */
void User::drop_pin(Location pin) {
    this->dropped_pins.push_back(pin);
}

/**
 * @brief Remove a dropped pin from the user's list of dropped pins
 *
 * @param pin_id The unique identifier of the pin to remove
 * @return The removed pin if it exists, otherwise throws an error
 */
Location User::remove_pin(std::string pin_id) {
    for (size_t i = 0; i < this->dropped_pins.size(); ++i) {
        if (this->dropped_pins[i].get_id() == pin_id) {
            Location removed_pin = this->dropped_pins[i];
            this->dropped_pins.erase(this->dropped_pins.begin() + i);
            return removed_pin;
        }
    }
    throw std::runtime_error("Pin not found");
}

/**
 * @brief Add a specified amount of toucoins to the user's total toucoins
 *
 * @param amount The amount of toucoins to add
 */
void User::add_toucoins(int amount) {
    this->toucoins += amount;
}

/**
 * @brief Add a feature ID to the user's list of owned features
 *
 * @param id The new unique identifier for the feature
 */
void User::add_owned_feature_id(std::string id) {
    this->owned_feature_ids.push_back(id);
}

/**
 * @brief Remove a feature ID from the user's list of owned features
 *
 * @param id The unique identifier of the feature to remove
 * @return The removed feature ID if it was successfully removed, otherwise returns an empty string
 */
std::string User::remove_owned_feature_id(std::string id) {
    for (size_t i = 0; i < this->owned_feature_ids.size(); ++i) {
        if (this->owned_feature_ids[i] == id) {
            std::string removed_feature_id = this->owned_feature_ids[i];
            this->owned_feature_ids.erase(this->owned_feature_ids.begin() + i);
            return removed_feature_id;
        }
    }
    return "";
}

/**
 * @brief Set the icon image path for the user
 *
 * @param path The new icon image path for the user
 */
void User::set_icon_image_path(std::string path) {
    this->icon_image_path = path;
}

/**
 * @brief Set the public location permission for the user
 *
 * @param status The new public location permission status for the user
 */
void User::set_location_public(bool status) {
    this->location_public = status;
}

/**
 * @brief Add a new message to the user's list of new messages
 *
 * @param message The new message to add
 */
void User::add_new_message(std::string message) {
    this->new_messages.push_back(message);
}

/**
 * @brief Remove a message from the user's list of new messages
 *
 * @param message The message to remove
 */
void User::remove_message(std::string message) {
    for (size_t i = 0; i < this->new_messages.size(); ++i) {
        if (this->new_messages[i] == message) {
            this->new_messages.erase(this->new_messages.begin() + i);
            return;
        }
    }
}

/**
 * @brief Add an attended event ID to the user's list of attended events
 *
 * @param id The new unique identifier for the event
 */
void User::add_attended_event_id(std::string id) {
        this->attended_event_ids.push_back(id);
}

/**
 * @brief Remove an attended event ID from the user's list of attended events
 *
 * @param id The unique identifier of the event to remove
 */
void User::remove_attended_event_id(std::string id) {
    for (size_t i = 0; i < this->attended_event_ids.size(); ++i) {
        if (this->attended_event_ids[i] == id) {
            this->attended_event_ids.erase(this->attended_event_ids.begin() + i);
            return;
        }
    }
}
