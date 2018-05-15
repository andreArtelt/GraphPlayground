"use strict";

var algo = algo || {};

algo.dijkstra = function(graph, startNode) {
    var graphIn = graph;
    var edgeFn = undefined;

    if(graph.isDirected() == false) {
        edgeFn = v => graphIn.nodeEdges(v);
    }
    else {
        edgeFn = v => graphIn.outEdges(v);
    }

    return graphlib.alg.dijkstra(graphIn, startNode, e => {
        var w = graphIn.edge(e);
        return w == undefined ? 1.0 : parseFloat(w);
    }, edgeFn);
};