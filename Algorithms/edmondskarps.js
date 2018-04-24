"use strict";

var algo = algo || {};

algo.edmondsKarps = function(graph, startNode, endNode) {
    // Check if the given graph is a valid flow network
    graph.edges().forEach(e => {
        var label = graph.edge(e.v, e.w);

        if(label == undefined || isNaN(label) || !isFinite(label)) {
            throw new Error(ui.languageMgr.translateId("INVALID_FLOW_NETWORK"));
        }
    });

    if(!graph.isDirected()) {
        throw new Error(ui.languageMgr.translateId("FOR_DIRECTED_GRAPH_ONLY"));
    }

    if(!utils.isGraphlibGraphConnected(graph)) {
        throw new Error(ui.languageMgr.translateId("GRAPH_NOT_CONNECTED"));
    }

    // Clone graph and initalize reversed flow with 0
    var graphFlow = utils.cloneGraphlibGraph(graph);

    graphFlow.edges().forEach(edge => {
        graphFlow.setEdge(edge.w, edge.v, 0);
    });

    while(true) {
        // Try to find an augmenting path by using breath first search
        var queue = [];
        var pred = {};

        queue.push(startNode);
        while(queue.length > 0) {
            var curNode = queue.shift();

            graphFlow.successors(curNode).forEach(node => {
                if(pred[node] == undefined && node != startNode && graphFlow.edge(curNode, node) > 0) {
                    pred[node] = curNode;
                    queue.push(node);
                }
            });
        }

        // If we found a path: Increase flow
        if(pred[endNode] != undefined) {
            var flowUpdate = Infinity;

            var backtracking = callback => {
                var curNode = endNode;
                
                while(curNode != undefined) {
                    var predNode = pred[curNode];
                    if(predNode != undefined) {
                        callback(predNode, curNode);
                    }
    
                    curNode = predNode;
                }
            };

            backtracking((predNode, curNode) => {
                flowUpdate = Math.min(flowUpdate, graphFlow.edge(predNode, curNode));
            });

            backtracking((predNode, curNode) => {
                graphFlow.setEdge(predNode, curNode, graphFlow.edge(predNode, curNode) - flowUpdate);
                graphFlow.setEdge(curNode, predNode, graphFlow.edge(curNode, predNode) + flowUpdate);
            });
        }
        else {
            break;
        }
    }

    // Create result graph (do not return graphFlow because it contains reversed edges!)
    var graphResult = utils.cloneGraphlibGraph(graph);

    graphResult.edges().forEach(edge => {
        graphResult.setEdge(edge.v, edge.w, graphFlow.edge(edge.w, edge.v));
    });

    return graphResult;
};