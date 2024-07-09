class Node {
    constructor(level, profit, weight, bound) {
        this.level = level;
        this.profit = profit;
        this.weight = weight;
        this.bound = bound;
    }
}

// Function to calculate the bound of a node
function calculateBound(node, n, capacity, items) {
    if (node.weight >= capacity) {
        return 0;
    }

    let profitBound = node.profit;
    let j = node.level + 1;
    let totalWeight = node.weight;

    while ((j < n) && (totalWeight + items[j].weight <= capacity)) {
        totalWeight += items[j].weight;
        profitBound += items[j].value;
        j++;
    }

    if (j < n) {
        profitBound += (capacity - totalWeight) * (items[j].value / items[j].weight);
    }

    return profitBound;
}

// Branch and Bound Knapsack solver
function knapsackBranchAndBound(items, capacity) {
    items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));

    let queue = [];
    let u = new Node(-1, 0, 0, 0);
    let v = new Node(0, 0, 0, 0);

    u.bound = calculateBound(u, items.length, capacity, items);
    queue.push(u);

    let maxProfit = 0;

    while (queue.length !== 0) {
        u = queue.shift();

        if (u.level === -1) {
            v.level = 0;
        }

        if (u.level === items.length - 1) {
            continue;
        }

        v.level = u.level + 1;

        v.weight = u.weight + items[v.level].weight;
        v.profit = u.profit + items[v.level].value;

        if (v.weight <= capacity && v.profit > maxProfit) {
            maxProfit = v.profit;
        }

        v.bound = calculateBound(v, items.length, capacity, items);

        if (v.bound > maxProfit) {
            queue.push(new Node(v.level, v.profit, v.weight, v.bound));
        }

        v.weight = u.weight;
        v.profit = u.profit;

        v.bound = calculateBound(v, items.length, capacity, items);

        if (v.bound > maxProfit) {
            queue.push(new Node(v.level, v.profit, v.weight, v.bound));
        }
    }

    return maxProfit;
}

const items = [
    { weight: 2, value: 3 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 8 },
    { weight: 9, value: 10 },
];
const capacity = 10;

console.log("Maximum value:", knapsackBranchAndBound(items, capacity));
