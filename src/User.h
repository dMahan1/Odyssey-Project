#pragma once

#define PY_SSIZE_T_CLEAN
#include <Python.h>
#include <vector>
#include <utilities>

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
        std::string icon_image_path;
        bool location_public = false;
        bool is_admin = false;
        vector<std::string> new_messages = {};
        vector<int> attended_event_ids = {};
    public:

};