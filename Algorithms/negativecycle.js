"use strict";

var algo = algo || {};

// Based on: Xiuzhen Huang, Negative-Weight Cycle Algorithms
algo.findNegativeWeightCycle = function(graph) {
    if(graph.isDirected() == false) {   // This implementation works on directed graphs only!
        throw new Error(ui.languageMgr.translateId("FOR_DIRECTED_GRAPH_ONLY"));
    }

    // Negative weight cycle (empty if there is no negative weight cycle)
    var result = [];

    var unreachableNodes = graph.nodes();
    while(unreachableNodes.length != 0) {
        // Select a start node which have not been visited before.
        var startNode = unreachableNodes[0];

        // Init distance map
        var dist = {};
        graph.nodes().forEach(n => {
            if(n == startNode) {
                dist[n] = 0;
            }
            else {
                dist[n] = Infinity;
            }
        });

        // Bellman-Ford relaxation
        var predecessors = {};
        for(var i=0; i != graph.nodes().length - 1; i++) {
            graph.edges().forEach(edge => {
                var weight = parseFloat(graph.edge(edge.v, edge.w));
                if(dist[edge.w] > dist[edge.v] + weight || dist[edge.w] == Infinity) {
                    dist[edge.w] = dist[edge.v] + weight;
                    predecessors[edge.w] = edge.v;
                }
            });
        }

        var backtracking = function(node) {
            var path = [node];

            var curNode = node;
            stop = false;
            while(stop == false) {
                curNode = predecessors[curNode];

                if(curNode == node) {
                    stop = true;
                }
                else if(path.indexOf(curNode) != -1) {
                    path = path.slice(path.indexOf(curNode));
                    
                    stop = true;
                }
                path.push(curNode);
            }

            return path.reverse();
        };

        // Check if we can improve the distances. If so, we know that there exists a negative weight cycle
        graph.edges().forEach(edge => {
            if(dist[edge.w] > dist[edge.v] + parseFloat(graph.edge(edge.v, edge.w))) {
                // We found a part of a negative weight cycle => backtracking to find the complete cycle
                result = backtracking(edge.w);
            }
        });

        // Did we miss some nodes because they are not reachable from the start node? If so, rerun the algorithm with one of these unreached nodes
        graph.nodes().forEach(node => {
            if(dist[node] != Infinity) {
                unreachableNodes.splice(unreachableNodes.indexOf(node), 1);
            }
        });

        if(result.length != 0) {
            // Create a list with all edges of the cycle
            var route = [];
            for(var i=0; i != result.length - 1; i++) {
                route.push({from: result[i], to: result[i+1]});
            }
            
            return {cycle: result, route: route};
        }
    }

    // We dod not find a negative weight cycle
    throw new Error(ui.languageMgr.translateId("GRAPH_NO_NEGATIVEWEIGHT_CYCLE"));
};