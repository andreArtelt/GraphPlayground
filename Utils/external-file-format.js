"use strict";

var utils = utils || {};

utils.import = function(data) {
    var graphOut = new graphlib.Graph();

    try {
        // Try to parse JSON
        var jsonData = JSON.parse(data);
        for(var i = 0; i < jsonData.NumNodes; i++) {
            graphOut.setNode(i, '' + i);
        }

        jsonData.Edges.forEach(edge => {
            var NodeA = '' + edge.NodeA;
            var NodeB = '' + edge.NodeB;
            var Weight = jsonData.Weighted ? '' + edge.Weight : '';
            graphOut.setEdge(NodeA, NodeB, Weight);
        });

        return graphOut;

    } catch(e) {
        // Try to parse XML
        try {
            var parser = new DOMParser();
            var xmlData = parser.parseFromString(data,"text/xml"); 
            var info = xmlData.children[0].children[0];
            var edges = xmlData.children[0].children[1].children;
            var numNodes = info.getAttribute('numNodes');
            var directed = info.getAttribute('directed');
            var weighted = info.getAttribute('weighted');

            for(var i = 0; i < numNodes; i++) {
                graphOut.setNode(i, '' + i);
            }

            for(i in edges) {
                try {
                    var nodeA = edges[i].getAttribute('nodeA');
                    var nodeB = edges[i].getAttribute('nodeB');
                    var weight = edges[i].getAttribute('weight');
                    graphOut.setEdge(nodeA, nodeB, weight);
                } catch(e) {} // Not an edge node
            }

            return graphOut;
                
        } catch(e) {
            // Parse TupleReader
            var curSubStr = "";
            for(var i=0; i < data.length; i++) {
                if(data[i] == '{') {
                    curSubStr = "";
                }
                else if(data[i] == '}') {
                    var d = curSubStr.trim().replace(/(\r\n|\n|\r)/gm, "").split(',').map(x => x.trim());

                    if(d.length >= 2) {
                        var v = d[0]; var w = d[1]; var l = d[2];

                        if(graphOut.node(v) == undefined) {
                            graphOut.setNode(v, v);
                        }
                        if(graphOut.node(w) == undefined) {
                            graphOut.setNode(w, w);
                        }

                        graphOut.setEdge(v, w, l);
                    }
                }
                else {
                    curSubStr += data[i];
                }
            }

            return graphOut;
        }
    }

    
};

utils.export = function(graph) {
    var r = "";

    for(var i=0; i < graph.edgeCount(); i++) {
        var e = graph.edges()[i];

        r += "{" + String(e.v) + "," + String(e.w);
        if(graph.edge(e.v, e.w) != undefined) {
            r += "," + String(graph.edge(e.v, e.w));
        }
        r += "}";
    }

    return r;
};