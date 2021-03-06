"use strict";

var algo = algo || {};

algo.floydWarshall = function(graph) {
    var dist = {};
    var next = {};

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

    // Initalize arrays
    graphIn.nodes().forEach(node => {
        next[node] = {};
        dist[node] = {};
        
        graphIn.nodes().forEach(n => {
            next[node][n] = undefined;
            dist[node][n] = Infinity;
        });
    });

    graphIn.edges().forEach(edge => {
        dist[edge.v][edge.w] = parseFloat(graphIn.edge(edge.v, edge.w));
        next[edge.v][edge.w] = edge.w;
    });

    // Compute distance & predecessors
    graphIn.nodes().forEach(k => {
        graphIn.nodes().forEach(i => {
            graphIn.nodes().forEach(j => {
                if(dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            });
        });
    });

    return {dist: dist, next: next};
};