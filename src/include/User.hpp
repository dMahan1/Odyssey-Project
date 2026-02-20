#pragma once


#include <pybind11/embed.h>
#include <iostream>
#include <string>
#include <vector>
#include <utilities>

#include "Location.hpp"
//#include "Event.h"

class User{

    private:
        std::string id;
        std::string username;
        std::string email;
        std::vector<std::string> friend_ids = {};
        std::pair<double,double> curr_location;
        std::vector<Location> dropped_pins = {};
        int toucoins = 0;
        std::vector<std::string> owned_feature_ids = {};
        std::string icon_image_path; // = defaultIconPath;
        bool location_public = true;
        bool is_admin = false;
        std::vector<std::string> new_messages = {};
        std::vector<std::string> attended_event_ids = {};
    public:
        User(std::string username, std::string email);

        std::string get_id();
        std::string get_username();
        std::string get_email();
        std::vector<std::string> get_friend_ids();
        std::pair<double,double> get_curr_location();
        std::vector<Location> get_dropped_pins();
        int get_toucoins();
        std::vector<std::string> get_owned_feature_ids();
        std::string get_icon_image_path();
        bool get_location_public();
        bool get_is_admin();
        std::vector<std::string> get_new_messages();
        std::vector<std::string> get_attended_event_ids();

        void set_id(std::string id);
        void set_username(std::string username);
        void set_email(std::string email);
        void add_friend_id(std::string friend_id);
        int remove_friend_id(std::string friend_id);
        void set_curr_location(std::pair<double,double> coordinates);
        void drop_pin(Location pin);
        Location remove_pin(std::string pin_id);
        void add_toucoins(int amount);
        void add_owned_feature_id(std::string id);
        int remove_owned_feature_id(std::string id);
        void set_icon_image_path(std::string path);
        void set_location_public(bool status);
        void add_new_message(std::string message);
        void remove_message(std::string message);
        void add_attended_event_id(std::string id);
        void remove_attended_event_id(std::string id);
}