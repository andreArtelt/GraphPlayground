"use strict";

var algo = algo || {};

algo.bellmanFord = function(graph, startNode) {
    var dist = {};
    var pred = {};

    // Convert an undirected graph into a directed graph
    var graphIn = utils.cloneGraphlibGraph(graph);
    if(graph.isDirected() == false) {
        var graphIn = new graphlib.Graph({directed: true, compound: false, multigraph: false});

        graph.nodes().forEach(node => {
            graphIn.setNode(node, graph.node(node));
        });

        graph.edges().forEach(edge => {
            var weight = graph.edge(edge.v, edge.w);

            graphIn.setEdge(edge.v, edge.w, weight);
            graphIn.setEdge(edge.w, edge.v, weight);
        });
    }

    graphIn.edges().forEach(edge => {
        var weight = graphIn.edge(edge.v, edge.w);
        if(weight == undefined || weight == "") {
            weight = "1";
        }

        graphIn.setEdge(edge.v, edge.w, weight);
    });

    // Initialize arrays
    graphIn.nodes().forEach(node => {
        dist[node] = Infinity;
        pred[node] = undefined;
    });
    dist[startNode] = 0.0;

    // Compute distances & predecessors
    for(var i=0; i != graphIn.nodes().length - 1; i++) {
        graphIn.edges().forEach(edge => {
            var weight = parseFloat(graphIn.edge(edge));
            if(dist[edge.v] + weight < dist[edge.w]) {
                dist[edge.w] = dist[edge.v] + weight;
                pred[edge.w] = edge.v;
            }
        });
    }

    return {dist: dist, pred: pred};
};