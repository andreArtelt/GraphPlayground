"use strict";

var utils = utils || {};

utils.isGraphlibGraphConnected = function(graphIn) {
    return graphlib.alg.components(graphIn).length == 1;
};

utils.cloneObj = function(obj) {
    if(obj == undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(obj)); // Quick & dirty!
};

utils.graphlibAddOriginalEdgeLabels = function(graph, oldGraph) {
    graph.edges().forEach(edge => {
        graph.setEdge(edge.v, edge.w, oldGraph.edge(edge.v, edge.w));
    });
};

utils.cloneVisGraph = function(graphIn) {
    var nodesOut = [];
    var edgesOut = [];

    graphIn.nodes.forEach(node => {
        nodesOut.push({id: node.id, label: node.label, color: utils.cloneObj(node.color)});
    });

    graphIn.edges.forEach(edge => {
        edgesOut.push({from: edge.from, to: edge.to, label: edge.label, dashes: edge.dashes, arrows: edge.arrows, color: utils.cloneObj(edge.color)});
    });

    return {nodes: new vis.DataSet(nodesOut), edges: new vis.DataSet(edgesOut)};
};

utils.cloneGraphlibGraph = function(graphIn, forceUndirected) {
    var graphOut = new graphlib.Graph({directed: forceUndirected == undefined ? graphIn.isDirected() : forceUndirected, compound: graphIn.isCompound(), multigraph: graphIn.isMultigraph()});

    graphIn.nodes().forEach(node => {
        graphOut.setNode(node, graphIn.node(node));
    });

    graphIn.edges().forEach(edge => {
        graphOut.setEdge(edge.v, edge.w, graphIn.edge(edge.v, edge.w));
    });

    return graphOut;
}

utils.writeFile = function(filename, data) {
    // Create invisible link and click on it
    var link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + data);
    link.setAttribute('download', filename);
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Remove link
    document.body.removeChild(link);
};

utils.readFileAsync = function(callback) {
    // Create invisible input field and click on it
    var fileInput = document.createElement("INPUT");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("accept", ".txt");
    fileInput.style.display = 'none';
    fileInput.addEventListener("change", () => {
        utils.readFileAsStringAsync(fileInput.files[0], callback);
    }, false);

    document.body.appendChild(fileInput);
    fileInput.click();

    // Remove input field
    document.body.removeChild(fileInput);
};

utils.readFileAsStringAsync = function(file, callback ) {
    var fileReader = new FileReader();
    fileReader.onload = evt => callback(evt.target.result);
    fileReader.readAsText(file);
};

utils.createRandomGraph = function(numNodes, probEdge) {
    var graphOut = new graphlib.Graph();
    
    for(var i=0; i < numNodes; i++) {
        graphOut.setNode(i, String(i));

        for(var j=0; j < i; j++) {
            if(Math.random() < probEdge) {
                graphOut.setEdge(i, j);
            }
        }
    }

    return graphOut;
};