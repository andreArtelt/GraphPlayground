"use strict";

var algo = algo || {};

algo.approxTsp = function(graph) {
    // Check input
    if(graph.isDirected()) {
        throw new Error(ui.languageMgr.translateId("FOR_UNDIRECTED_GRAPH_ONLY"));
    }

    var numNodes = graph._nodeCount;
    graph.nodes().forEach(node => {
        if(graph.neighbors(node).length != numNodes - 1) {
            throw new Error(ui.languageMgr.translateId("GRAPH_NOT_FULLY_CONNECTED"));
        }
    });

    // Compute minimum spanning tree (MST)
    var graphMinimumSpanningTree = algo.prim(graph);

    // Convert MST graph into directed graph
    var directedGraph = new graphlib.Graph({directed: true, compound: false, multigraph: false});
    graphMinimumSpanningTree.nodes().forEach(node => {
        directedGraph.setNode(node, graphMinimumSpanningTree.node(node))
    });
    graphMinimumSpanningTree.edges().forEach(edge => {
        var label = graph.edge(edge.v, edge.w);
        directedGraph.setEdge(edge.v, edge.w, label);
        directedGraph.setEdge(edge.w, edge.v, label);
    });

    // Find eulerian cycle
    var eulerianCycle = algo.eulerianPathDirected(directedGraph);

    // Construct 2-approx. solution of TSP
    var resultGraph = new graphlib.Graph({directed: false, compound: false, multigraph: false});
    graph.nodes().forEach(node => {
        resultGraph.setNode(node, graph.node(node));
    });

    var curNode = eulerianCycle[0];
    var visitedNode = [curNode];
    for(var i=1; i != eulerianCycle.length; i++) {
        var nextNode = eulerianCycle[i];
        if(visitedNode.indexOf(nextNode) != -1 && i != eulerianCycle.length - 1) {
            continue;
        }

        visitedNode.push(nextNode)
        resultGraph.setEdge(curNode, nextNode, graph.edge(curNode, nextNode));
        curNode = nextNode;
    }

    return {tourGraph: resultGraph};
};