#pragma once
#include <vector>
#include <limits>
#include <cmath>

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
        void insert(const std::vector<double>& point, void* data);
        void *nearest_neighbor(const std::vector<double>& point, void *data, T (*distance)(void*, void*));
    private:
        KdNode<T> *root;
};





template<typename T>
KdTree<T>::KdTree() : root(nullptr) {}

template<typename T>
void KdTree<T>::insert(const std::vector<double>& point, void* data) {
    KdNode<T>* newNode = new KdNode<T>{point, data, nullptr, nullptr};
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
void* KdTree<T>::nearest_neighbor(const std::vector<double>& point, void* data, T (*distance)(void *, void *)) {
    if (!root) return nullptr;
    KdNode<T>* best = nullptr;
    double best_dist = std::numeric_limits<double>::max();
    std::vector<KdNode<T>*> stack;
    stack.push_back(root);
    while (!stack.empty()) {
        KdNode<T>* current = stack.back();
        stack.pop_back();
        double dist = distance(current->data, data);
        if (dist < best_dist) {
            best_dist = dist;
            best = current;
        }
        int axis = stack.size() % point.size();
        if (point[axis] < current->dimensions[axis]) {
            if (current->left) stack.push_back(current->left);
            if (current->right && std::abs(point[axis] - current->dimensions[axis]) < best_dist) {
                stack.push_back(current->right);
            }
        } else {
            if (current->right) stack.push_back(current->right);
            if (current->left && std::abs(point[axis] - current->dimensions[axis]) < best_dist) {
                stack.push_back(current->left);
            }
        }
    }
    return best ? best->data : nullptr;
}
