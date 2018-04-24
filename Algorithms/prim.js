"use strict";

var algo = algo || {};

algo.prim = function(graph) {
    if(graph.isDirected()) {
        throw new Error(ui.languageMgr.translateId("FOR_UNDIRECTED_GRAPH_ONLY"));
    }

    var resultGraph = graphlib.alg.prim(graph, e => {
        var w = graph.edge(e.v, e.w);
        return w == undefined ? 1.0 : w;
    });

    utils.graphlibAddOriginalEdgeLabels(resultGraph, graph);

    return resultGraph;
};