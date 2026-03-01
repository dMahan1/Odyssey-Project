#pragma once
#include <vector>
#include <limits>
#include <cmath>
#include <functional>
#include <iostream>
#include <iomanip>

template <typename T>
struct KdNode {
    std::vector<T> dimensions; // Dimensions for sorting a K-dimension point.
    void *data; // ptr to the actual data
    KdNode *left; // left child
    KdNode *right; // right child
};

template<typename T>
class KdTree {
    public:
        KdTree();
        void insert(const std::vector<T>& point, const void* data);
        const void *nearest_neighbor(const std::vector<T>& point,
                                     const void *data,
                                     std::function<double(const void*, const void*)> distance) const;
        void print() const;
    private:
        KdNode<T> *root;
        void print_recursive(KdNode<T>* node, int depth) const;
        void nn_search_rec(KdNode<T>* curr,
                           const std::vector<T>& point,
                           const void* data,
                           KdNode<T>*& best_node,
                           double& best_dist,
                           int depth,
                           std::function<double(const void*, const void*)> distance) const;

};



template<typename T>
KdTree<T>::KdTree() : root(nullptr) {}

template<typename T>
void KdTree<T>::insert(const std::vector<T>& point, const void* data) {
    KdNode<T>* newNode = new KdNode<T>{point, const_cast<void*>(data), nullptr, nullptr};
    if (!root) {
        root = newNode;
        return;
    }
    KdNode<T>* current = root;
    int depth = 0;
    while (true) {
        int axis = depth % point.size();
        if (point[axis] < current->dimensions[axis]) {
            if (!current->left) {
                current->left = newNode;
                return;
            }
            current = current->left;
        } else {
            if (!current->right) {
                current->right = newNode;
                return;
            }
            current = current->right;
        }
        depth++;
    }
}

template<typename T>
const void* KdTree<T>::nearest_neighbor(const std::vector<T>& point,
                                        const void* data,
                                        std::function<double(const void*, const void*)> distance) const {
    if (!root) return nullptr;
    KdNode<T>* best = nullptr;

    double best_dist = std::numeric_limits<double>::max();
    nn_search_rec(root, point, data, best, best_dist, 0, distance);

    return best ? best->data : nullptr;
}

template<typename T>
void KdTree<T>::print() const {
    print_recursive(root, 0);
}

template<typename T>
void KdTree<T>::print_recursive(KdNode<T>* node, int depth) const {
    if (!node) return;

    // Indentation for tree structure
    for (int i = 0; i < depth; ++i) std::cout << "  ";

    std::cout << "[ ";
    for (size_t i = 0; i < node->dimensions.size(); ++i) {
        std::cout << node->dimensions[i];
        if (i < node->dimensions.size() - 1)
            std::cout << std::fixed
                      << std::setprecision(std::numeric_limits<double>::max_digits10)
                      << ", ";
    }
    std::cout << " ]  data=" << node->data << "\n";

    for (int i = 0; i < depth; ++i) std::cout << "  ";
    std::cout << "Left:\n";
    print_recursive(node->left, depth + 1);
    for (int i = 0; i < depth; ++i ) std::cout << "  ";
    std::cout << "Right:\n";
    print_recursive(node->right, depth + 1);
}

template<typename T>
void KdTree<T>::nn_search_rec(KdNode<T>* curr,
                             const std::vector<T>& point,
                             const void* data,
                             KdNode<T>*& best_node,
                             double& best_dist,
                             int depth,
                             std::function<double(const void*, const void*)> distance) const {
    if (!curr) return;

    double dist = distance(curr->data, data);
    if (dist < best_dist) {
        best_dist = dist;
        best_node = curr;
    }

    int axis = depth % point.size();
    bool go_left = point[axis] < curr->dimensions[axis];
    nn_search_rec(go_left ? curr->left : curr->right,
                  point, data, best_node, best_dist,
                  depth + 1, distance);

    double diff = point[axis] - curr->dimensions[axis];
    double diff_sq = diff * diff;

    if (diff_sq <= best_dist * best_dist) {
        nn_search_rec(go_left ? curr->right : curr->left,
                      point, data, best_node, best_dist,
                      depth + 1, distance);
    }

}
