class Edge {
    private:
        int vertex1;
        int vertex2;
        double weight;
        uint8_t flags;
    public:
        Edge(int vertex1, int vertex2, double weight, uint8_t flags);
        Edge(int vertex1, int vertex2, double weight, bool indoor, bool walk, bool bike, bool car, bool bus);
        int get_vertex1();
        int get_vertex2();
        double get_weight();
        uint8_t get_flags();
        void set_vertex1(int vertex1);
        void set_vertex2(int vertex2);
        void set_weight(double weight);
        void set_flags(uint8_t flags);
        bool is_indoor();
        bool is_walkable();
        bool is_bikeable();
        bool is_drivable_by_car();
        bool is_drivable_by_bus();
        void set_indoor(bool indoor);
        void set_walkable(bool walk);
        void set_bikeable(bool bike);
        void set_drivable_by_car(bool car);
        void set_drivable_by_bus(bool bus);
}

/**
 * @brief Construct a new Edge object
 *
 * @param vertex1 The first vertex of the edge
 * @param vertex2 The second vertex of the edge
 * @param weight The weight of the edge
 * @param flags The flags associated with the edge
 *
 * @return A new Edge object initialized with the provided parameters
 */
Edge::Edge(int vertex1, int vertex2, double weight, uint8_t flags) {
    this->vertex1 = vertex1;
    this->vertex2 = vertex2;
    this->weight = weight;
    this->flags = flags;
}

/**
 * @brief Construct a new Edge object with individual flag parameters
 *
 * @param vertex1 The first vertex of the edge
 * @param vertex2 The second vertex of the edge
 * @param weight The weight of the edge
 * @param indoor Whether the edge is indoor
 * @param walk Whether the edge is walkable
 * @param bike Whether the edge is bikeable
 * @param car Whether the edge is drivable by car
 * @param bus Whether the edge is drivable by bus
 *
 * @return A new Edge object initialized with the provided parameters
 */
Edge::Edge(int vertex1, int vertex2, double weight, bool indoor, bool walk, bool bike, bool car, bool bus) {
    this->vertex1 = vertex1;
    this->vertex2 = vertex2;
    this->weight = weight;
    this->flags = (indoor ? 0b00000001 : 0) | (walk ? 0b00000010 : 0) | (bike ? 0b00000100 : 0) | (car ? 0b00001000 : 0) | (bus ? 0b00010000 : 0);
}

/**
 * @brief Get the first vertex of the edge
 *
 * @return The first vertex of the edge
 */
int Edge::get_vertex1() {
    return vertex1;
}

/**
 * @brief Get the second vertex of the edge
 *
 * @return The second vertex of the edge
 */
int Edge::get_vertex2() {
    return vertex2;
}

/**
 * @brief Get the weight of the edge
 *
 * @return The weight of the edge
 */
double Edge::get_weight() {
    return weight;
}

/**
 * @brief Get the flags associated with the edge
 *
 * @return The flags associated with the edge
 */
uint8_t Edge::get_flags() {
    return flags;
}

/**
 * @brief Set the first vertex of the edge
 *
 * @param vertex1 The new first vertex of the edge
 */
void Edge::set_vertex1(int vertex1) {
    this->vertex1 = vertex1;
}

/**
 * @brief Set the second vertex of the edge
 *
 * @param vertex2 The new second vertex of the edge
 */
void Edge::set_vertex2(int vertex2) {
    this->vertex2 = vertex2;
}

/**
 * @brief Set the weight of the edge
 *
 * @param weight The new weight of the edge
 */
void Edge::set_weight(double weight) {
    this->weight = weight;
}

/**
 * @brief Set the flags associated with the edge
 *
 * @param flags The new flags associated with the edge
 */
void Edge::set_flags(uint8_t flags) {
    this->flags = flags;
}

/**
 * @brief Check if the edge is indoor
 *
 * @return True if the edge is indoor, false otherwise
 */
bool Edge::is_indoor() {
    return (flags & 0b00000001) != 0;
}

/**
 * @brief Check if the edge is walkable
 *
 * @return True if the edge is walkable, false otherwise
 */
bool Edge::is_walkable() {
    return (flags & 0b00000010) != 0;
}

/**
 * @brief Check if the edge is bikeable
 *
 * @return True if the edge is bikeable, false otherwise
 */
bool Edge::is_bikeable() {
    return (flags & 0b00000100) != 0;
}

/**
 * @brief Check if the edge is drivable by car
 *
 * @return True if the edge is drivable by car, false otherwise
 */
bool Edge::is_drivable_by_car() {
    return (flags & 0b00001000) != 0;
}

/**
 * @brief Check if the edge is drivable by bus
 *
 * @return True if the edge is drivable by bus, false otherwise
 */
bool Edge::is_drivable_by_bus() {
    return (flags & 0b00010000) != 0;
}

/**
 * @brief Set whether the edge is indoor
 *
 * @param indoor True if the edge is indoor, false otherwise
 */
void Edge::set_indoor(bool indoor) {
    if (indoor) {
        flags |= 0b00000001;
    } else {
        flags &= ~0b00000001;
    }
}

/**
 * @brief Set whether the edge is walkable
 *
 * @param walk True if the edge is walkable, false otherwise
 */
void Edge::set_walkable(bool walk) {
    if (walk) {
        flags |= 0b00000010;
    } else {
        flags &= ~0b00000010;
    }
}

/**
 * @brief Set whether the edge is bikeable
 *
 * @param bike True if the edge is bikeable, false otherwise
 */
void Edge::set_bikeable(bool bike) {
    if (bike) {
        flags |= 0b00000100;
    } else {
        flags &= ~0b00000100;
    }
}

/**
 * @brief Set whether the edge is drivable by car
 *
 * @param car True if the edge is drivable by car, false otherwise
 */
void Edge::set_drivable_by_car(bool car) {
    if (car) {
        flags |= 0b00001000;
    } else {
        flags &= ~0b00001000;
    }
}

/**
 * @brief Set whether the edge is drivable by bus
 *
 * @param bus True if the edge is drivable by bus, false otherwise
 */
void Edge::set_drivable_by_bus(bool bus) {
    if (bus) {
        flags |= 0b00010000;
    } else {
        flags &= ~0b00010000;
    }
}
