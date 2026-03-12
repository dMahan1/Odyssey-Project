#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <iostream>
#include <string>
#include <vector>
#include <utility>

#include "User.hpp"
#include "Location.hpp"
#include "Event.hpp"
#include "Pathfinder.hpp"
#include "PathfinderBuilder.hpp"
#include "Edge.hpp"

namespace py = pybind11;

PYBIND11_MODULE(bindings, m) {
    // Binding for User
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

    // Binding for Location
    py::class_<Location, std::shared_ptr<Location>>(m, "Location")
        .def(py::init<>())
        .def(py::init<std::string, std::string, double, double>(),
             py::arg("id"), py::arg("name"), py::arg("latitude"), py::arg("longitude"))
        .def("get_id", &Location::get_id)
        .def("get_name", &Location::get_name)
        .def("get_latitude", &Location::get_latitude)
        .def("get_longitude", &Location::get_longitude)
        .def("set_id", &Location::set_id)
        .def("set_name", &Location::set_name)
        .def("set_latitude", &Location::set_latitude)
        .def("set_longitude", &Location::set_longitude)
        .def("distance_to", &Location::distance_to)
        .def("euclidean_distance_to", &Location::euclidean_distance_to)
        .def("__repr__", [](const Location &loc) {
            return "<Location " + loc.get_id() + " \"" + loc.get_name() + "\">";
        });

    // Binding for Edge
    py::class_<Edge>(m, "Edge")
        .def(py::init<const std::string&, const std::string&, double, uint8_t>(),
             py::arg("vertex1"), py::arg("vertex2"), py::arg("weight"), py::arg("flags"))
        .def(py::init<const std::string&, const std::string&, double,
                      bool, bool, bool, bool, bool>(),
             py::arg("vertex1"), py::arg("vertex2"), py::arg("weight"),
             py::arg("indoor"), py::arg("walk"), py::arg("bike"),
             py::arg("car"), py::arg("bus"))
        .def("get_vertex1", &Edge::get_vertex1)
        .def("get_vertex2", &Edge::get_vertex2)
        .def("get_weight", &Edge::get_weight)
        .def("get_flags", &Edge::get_flags)
        .def("is_indoor", &Edge::is_indoor)
        .def("is_walkable", &Edge::is_walkable)
        .def("is_bikeable", &Edge::is_bikeable)
        .def("is_drivable_by_car", &Edge::is_drivable_by_car)
        .def("is_drivable_by_bus", &Edge::is_drivable_by_bus)
        .def("set_indoor", &Edge::set_indoor)
        .def("set_walkable", &Edge::set_walkable)
        .def("set_bikeable", &Edge::set_bikeable)
        .def("set_drivable_by_car", &Edge::set_drivable_by_car)
        .def("set_drivable_by_bus", &Edge::set_drivable_by_bus)
        .def("__repr__", [](const Edge &e){
            return "<Edge " + e.get_vertex1() + "->" + e.get_vertex2() +
                   " weight=" + std::to_string(e.get_weight()) + ">";
        });

    // Binding for Paths returned by Pathfinder
    py::class_<Path>(m, "Path")
        .def(py::init<>())
        .def_property_readonly("location_ids", [](const Path &p) {
            return p.location_ids; // Returning by value triggers a safe copy to a Python list
        })
        .def_readonly("total_distance", &Path::total_distance); // Numbers are safe to keep as readonly

    // Binding for Pathfinder traversals
    py::enum_<TraversalMode>(m, "TraversalMode")
        .value("WALKING", TraversalMode::WALKING)
        .value("BIKING", TraversalMode::BIKING)
        .value("DRIVING", TraversalMode::DRIVING)
        .value("BUS", TraversalMode::BUS)
        .value("PRINT_ALL", TraversalMode::PRINT_ALL)
        .export_values();

    // Binding for Pathfinder itself
    py::class_<Pathfinder, std::shared_ptr<Pathfinder>>(m, "Pathfinder")
        .def_static("get_instance", &Pathfinder::get_instance)
        .def("route", &Pathfinder::route, py::return_value_policy::copy)
        .def("get_location_by_id", &Pathfinder::get_location_by_id)
        .def("approximate_location", &Pathfinder::approximate_location)
        .def("approximate_location_via", &Pathfinder::approximate_location_via)
        .def("get_mode", &Pathfinder::get_mode)
        .def("print_tree", &Pathfinder::print_tree)
        .def("insert_location", &Pathfinder::insert_location)
        .def("insert_edge", &Pathfinder::insert_edge);
}
