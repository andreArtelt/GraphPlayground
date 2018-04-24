"use strict";

var castings = castings || {};

castings.graphlib2Vis = function(graphIn, directed) {
    var nodesOut = [];
    var edgesOut = [];

    graphIn.nodes().forEach(node => {
        nodesOut.push({id: node, label: graphIn.node(node) == undefined ? node : graphIn.node(node), color: algovis.defaultNodeColor});
    });

    graphIn.edges().forEach(edge => {
        edgesOut.push({from: edge.v, to: edge.w, label: graphIn.edge(edge.v, edge.w), color: algovis.defaultEdgeColor, arrows: directed == false ? '' : 'to', dashes: false});
    });

    return {nodes: new vis.DataSet(nodesOut), edges: new vis.DataSet(edgesOut)};
};

castings.vis2Graphlib = function(graphIn, directed) {
    var graphOut = new graphlib.Graph({directed: directed == undefined ? true : directed, compound: false, multigraph: false});
    
    var id2label = {}
    graphIn.nodes.forEach(node => {
        graphOut.setNode(node.id, node.label);
        id2label[node.id] = node.label;
    });

    graphIn.edges.forEach(edge => {
        graphOut.setEdge(id2label[edge.from], id2label[edge.to], edge.label)
    });

    return graphOut;
};