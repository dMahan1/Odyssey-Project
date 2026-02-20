#include <cstdint>
#include <string>

class Edge {
    private:
        std::string vertex1;
        std::string vertex2;
        double weight;
        uint8_t flags;
    public:
        Edge(const std::string& vertex1, const std::string& vertex2, double weight, uint8_t flags);
        Edge(const std::string& vertex1, const std::string& vertex2, double weight, bool indoor, bool walk, bool bike, bool car, bool bus);
        std::string get_vertex1() const;
        std::string get_vertex2() const;
        double get_weight() const;
        uint8_t get_flags() const;
        void set_vertex1(const std::string& vertex1);
        void set_vertex2(const std::string& vertex2);
        void set_weight(double weight);
        void set_flags(uint8_t flags);
        bool is_indoor() const;
        bool is_walkable() const;
        bool is_bikeable() const;
        bool is_drivable_by_car() const;
        bool is_drivable_by_bus() const;
        void set_indoor(bool indoor);
        void set_walkable(bool walk);
        void set_bikeable(bool bike);
        void set_drivable_by_car(bool car);
        void set_drivable_by_bus(bool bus);
};
