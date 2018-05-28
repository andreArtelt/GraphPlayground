"use strict";

var algo = algo || {};

algo.arbitrage = function(graph) {
    if(graph.isDirected() == false) {   // This implementation works on directed graphs only!
        throw new Error(ui.languageMgr.translateId("FOR_DIRECTED_GRAPH_ONLY"));
    }

    // Clone graph and apply log to all edge weights
    var graphClone = utils.cloneGraphlibGraph(graph);
    graph.edges().forEach(edge => {
        graphClone.setEdge(edge.v, edge.w, -1.0 * Math.log(parseFloat(graph.edge(edge.v, edge.w))));
    });

    // Try to find a negative weight cycle
    var nwCycle = algo.findNegativeWeightCycle(graphClone);
    if(nwCycle.length == 0) {
        throw new Error(ui.languageMgr.translateId("GRAPH_NO_ARBITRAGE"));
    }
    else {
        return {cycle: nwCycle.cycle, route: nwCycle.route, logGraph: graphClone};
    }
};