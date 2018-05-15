"use strict";

var algo = algo || {};

algo.floydWarshall = function(graph) {
    var graphIn = graph;
    var edgeFn = undefined;

    if(graph.isDirected() == false) {
        edgeFn = v => graphIn.nodeEdges(v);
    }
    else {
        edgeFn = v => graphIn.outEdges(v);
    }

    var t =  graphlib.alg.floydWarshall(graphIn, e => {
        var w = graphIn.edge(e.v, e.w);
        return w == undefined ? 1.0 : parseFloat(w);
    }, edgeFn);

    console.log(t);

    return t;
};