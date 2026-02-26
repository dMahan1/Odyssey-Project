#include <pybind11/embed.h>
#include <iostream>
#include <string>
#include <vector>
#include <utility>

#include "User.hpp"
#include "Location.hpp"
#include "Event.hpp"

namespace py = pybind11;

PYBIND11_MODULE(bindings, m) {
    py::class_<User>(m, "User")
        .def(py::init<std::string, std::string>())
        .def("get_id", &User::get_id)
        .def("get_username", &User::get_username)
        .def("get_email", &User::get_email)
        .def("get_friend_ids", &User::get_friend_ids)
        .def("get_curr_location", &User::get_curr_location)
        .def("get_dropped_pins", &User::get_dropped_pins)
        .def("get_toucoins", &User::get_toucoins)
        .def("get_owned_feature_ids", &User::get_owned_feature_ids)
        .def("get_icon_image_path", &User::get_icon_image_path)
        .def("get_location_public", &User::get_location_public)
        .def("get_is_admin", &User::get_is_admin)
        .def("add_friend_id", &User::add_friend_id)
        .def("remove_friend_id", &User::remove_friend_id)
        .def("set_curr_location", &User::set_curr_location)
        .def("drop_pin", &User::drop_pin)
        .def("remove_pin", &User::remove_pin)
        .def("add_toucoins", &User::add_toucoins)
        .def("add_owned_feature_id", &User::add_owned_feature_id)
        .def("remove_owned_feature_id", &User::remove_owned_feature_id);
}
