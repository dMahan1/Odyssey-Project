#include "PathfinderBuilder.hpp"

std::vector<Location> PathfinderBuilder::get_locations() const {
    return locations;
}
std::vector<Edge> PathfinderBuilder::get_edges() const {
    return edges;
}

void PathfinderBuilder::load_data_debug() {
    // Simulates area in front of PMU, with a tunnel to KRAN
    Location A("1", "A", 40.42443, -86.91180);
    Location B("2", "B", 40.42443, -86.91162);
    Location C("3", "C", 40.42444, -86.91162);
    Location D("4", "D", 40.42444, -86.91098);
    Location E("5", "E", 40.42443, -86.91090);
    Location F("6", "F", 40.42473, -86.91055);
    Location G("7", "G", 40.42443, -86.91052);
    Location H("8", "H", 40.42421, -86.91112);
    Location I("9", "I", 40.42418, -86.91111);
    Location J("10", "J", 40.42421, -86.91098);
    Location K("11", "K", 40.42432, -86.91075);
    Location L("12", "L", 40.42414, -86.91123);
    Location M("13", "M", 40.42413, -86.91111);
    Location N("14", "N", 40.42413, -86.91098);
    Location O("15", "O", 40.42409, -86.91050);
    Location P("16", "P", 40.42390, -86.91052);
    Location Q("17", "Q", 40.42378, -86.91049);

    locations.push_back(A);
    locations.push_back(B);
    locations.push_back(C);
    locations.push_back(D);
    locations.push_back(E);
    locations.push_back(F);
    locations.push_back(G);
    locations.push_back(H);
    locations.push_back(I);
    locations.push_back(J);
    locations.push_back(K);
    locations.push_back(L);
    locations.push_back(M);
    locations.push_back(N);
    locations.push_back(O);
    locations.push_back(P);
    locations.push_back(Q);

    auto create_sidewalk = [&] (const Location& loc1, const Location& loc2) {
        double weight = loc1.distance_to(loc2);
        edges.emplace_back(loc1.get_id(), loc2.get_id(), weight, false, true, true, false, false);
        edges.emplace_back(loc2.get_id(), loc1.get_id(), weight, false, true, true, false, false);
    };
    create_sidewalk(A, B);
    create_sidewalk(B, C);
    create_sidewalk(C, D);
    create_sidewalk(D, E);
    create_sidewalk(E, G);
    create_sidewalk(G, F);
    create_sidewalk(B, H);
    create_sidewalk(H, I);
    create_sidewalk(I, J);
    create_sidewalk(J, K);
    create_sidewalk(K, E);
    create_sidewalk(K, G);
    create_sidewalk(H, C);
    create_sidewalk(D, J);
    create_sidewalk(H, L);
    create_sidewalk(L, M);
    create_sidewalk(M, N);
    create_sidewalk(N, O);
    create_sidewalk(O, P);
    create_sidewalk(P, Q);
    create_sidewalk(I, M);
    create_sidewalk(J, N);
    create_sidewalk(K, O);
    create_sidewalk(G, O);
    double tunnel_dist = F.distance_to(G) + G.distance_to(O) + O.distance_to(P) + P.distance_to(Q) + 10.0;
    edges.emplace_back(F.get_id(), Q.get_id(), tunnel_dist, true, true, false, false, false);
    edges.emplace_back(Q.get_id(), F.get_id(), tunnel_dist, true, true, false, false, false);
}

void PathfinderBuilder::load_data_release() {
    // TODO: Implement data loading for release mode
}
