#pragma once

#define PY_SSIZE_T_CLEAN
#include <Python.h>
#include <vector>
#include <utilities>

#include "Location.hpp"
//#include "Event.h"

class User{

    private:
        int id;
        std::string username;
        std::string email;
        vector<int> friend_ids = {};
        std::pair<double,double> curr_location;
        vector<Location> dropped_pins = {};
        int toucoins = 0;
        vector<int> owned_feature_ids = {};
        std::string icon_image_path; // = defaultIconPath;
        bool location_public = true;
        bool is_admin = false;
        vector<std::string> new_messages = {};
        vector<int> attended_event_ids = {};
    public:
        User(std::string username, std::string email);

        int get_id();
        std::string get_username();
        std::string get_email();
        vector<int> get_friend_ids();
        std::pair<double,double> get_curr_location();
        vector<Location> get_dropped_pins();
        int get_toucoins();
        vector<int> get_owned_feature_ids();
        std::string get_icon_image_path();
        bool get_location_public();
        bool get_is_admin();
        vector<std::string> get_new_messages();
        vector<int> get_attended_event_ids();

        void set_id(int id);
        void set_username(std::string username);
        void set_email(std::string email);
        void add_friend_id(int friend_id);
        int remove_friend_id(int friend_id);
        void set_curr_location(std::pair<double,double> coordinates);
        void drop_pin(Location pin);
        Location remove_pin(int pin_id);
        void set_toucoins(int toucoins);
        void add_owned_feature_id(int id);
        int remove_owned_feature_id(int id);
        void set_icon_image_path(std::string path);
        void set_location_public(bool status);
        void add_new_message(std::string message);
        void remove_message(std::string message);
        void add_attended_event_id(int id);
        void remove_attended_event_id(int id);
}