"use strict";

var utils = utils || {};

utils.import = function(data, setDirectedCb) {

    try {
        // Try to parse JSON
        var jsonData = JSON.parse(data);
        setDirectedCb(jsonData.Directed);
        var graphOut = new graphlib.Graph();
        for(var i = 0; i < jsonData.NumNodes; i++) {
            graphOut.setNode('' + i, '' + i);
        }

        jsonData.Edges.forEach(edge => {
            var NodeA = '' + edge.NodeA;
            var NodeB = '' + edge.NodeB;
            if(jsonData.Weighted) {
                var Weight =  '' + edge.Weight;
                graphOut.setEdge(NodeA, NodeB, Weight);
            } else {
                graphOut.setEdge(NodeA, NodeB);
            }
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

            var graphOut = new graphlib.Graph();
            setDirectedCb(jsonData.Directed);

            for(var i = 0; i < numNodes; i++) {
                graphOut.setNode('' + i, '' + i);
            }

            for(i in edges) {
                try {
                    var nodeA = edges[i].getAttribute('nodeA');
                    var nodeB = edges[i].getAttribute('nodeB');
                    if(weighted) {
                        var weight = edges[i].getAttribute('weight');
                        graphOut.setEdge(nodeA, nodeB, weight);
                    } else {
                        graphOut.setEdge(nodeA, nodeB);
                    }
                } catch(e) {} // Not an XML node of type edge
            }

            return graphOut;
                
        } catch(e) {
            // Parse TupleReader
            var graphOut = new graphlib.Graph();
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

utils.export = function(graph, format, directed) {
    switch(format) {
        case 'json':
            var exportEdges = [];
            var weighted = true;
            var edges = graph._edgeObjs;
            var edgeLabels = graph._edgeLabels;

            for(var k in edges) {
                var Weight = parseFloat(edgeLabels[k]);
                var NodeA = parseInt(edges[k].v);
                var NodeB = parseInt(edges[k].w);
                if(isNaN(Weight)) {
                    weighted = false;
                    exportEdges.push({NodeA, NodeB});
                } else {
                    exportEdges.push({NodeA, NodeB, Weight});
                }
            }

            var exportGraph = {
                Directed: directed,
                NumNodes: graph._nodeCount,
                Weighted: weighted,
                Edges: exportEdges
            }
            return JSON.stringify(exportGraph);
        case 'xml':
            var weighted = true;
            var edges = graph._edgeObjs;
            var edgeLabels = graph._edgeLabels;

            // Create XML Document
            var xmlDoc = document.implementation.createDocument("", "", null);
            var xmlMyGraph = xmlDoc.createElement('mygraph');

            var xmlEdges = xmlDoc.createElement('edges');
            for(var k in edges) {
                var xmlEdge = xmlDoc.createElement('edge');
                var weight = parseFloat(edgeLabels[k]);
                var nodeA = parseInt(edges[k].v);
                var nodeB = parseInt(edges[k].w);
                if(isNaN(weight)) {
                    xmlEdge.setAttribute('nodeA', '' + nodeA);
                    xmlEdge.setAttribute('nodeB', '' + nodeB);
                    weighted = false;
                } else {
                    xmlEdge.setAttribute('nodeA', '' + nodeA);
                    xmlEdge.setAttribute('nodeB', '' + nodeB);
                    xmlEdge.setAttribute('weight', '' + weight);
                }
                xmlEdges.appendChild(xmlEdge);
            }

            var xmlInfo = xmlDoc.createElement('info');
            xmlInfo.setAttribute('numNodes', '' + graph._nodeCount);
            xmlInfo.setAttribute('directed', '' + directed);
            xmlInfo.setAttribute('weighted', '' + weighted);
            xmlMyGraph.appendChild(xmlInfo);

            xmlMyGraph.appendChild(xmlEdges);
            xmlDoc.appendChild(xmlMyGraph);

            var serializer = new XMLSerializer();
            return serializer.serializeToString(xmlDoc);
            
        case 'tuple_reader':
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
    }
};