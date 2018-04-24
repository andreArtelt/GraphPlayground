"use strict";

var algovis = algovis || {}

algovis.colorNodeBackground = "#D2E5FF";
algovis.colorNodeBorder = "#2B7CE9";

algovis.colorEdge = "#848484";

algovis.colorStartNodeBackground = "#7BE141";
algovis.colorEndNodeBackground = "#FB7E81";
algovis.colorPath = "#848484";

algovis.defaultNodeColor = {border: algovis.colorNodeBorder, background: algovis.colorNodeBackground,
                            highlight: {border: algovis.colorNodeBorder, background: algovis.colorNodeBackground},
                            hover: {border: algovis.colorNodeBorder, background: algovis.colorNodeBackground}};
algovis.defaultEdgeColor = algovis.colorEdge;

algovis.addRemovedEdgesAsDashedEdges = function(graph, oldGraph, directed) {
    oldGraph.edges.forEach(edge => {
        var found = false;
        graph.edges.forEach(e => {
            if(edge.from == e.from && edge.to == e.to) {
                found = true;
            }
            if(edge.from == e.to && edge.to == e.from && directed == false) {
                found = true;
            }
        });
    
        if(found == false) {
            graph.edges.add({from: edge.from, to: edge.to, label: edge.label, dashes: true, arrows: directed == false ? '' : 'to'});
        }
    });
};

algovis.showFlowOnEdges = function(graph, resultGraph) {
    graph.edges.forEach(edge => {
        resultGraph.edges.forEach(e => {
            if(edge.from == e.from && edge.to == e.to) {
                edge.label = e.label + "/" + edge.label;
                
                edge.dashes = e.label == 0 ? true : false;
                edge.width = 1.0;
                if(typeof(edge.color) == "string" || edge.color == undefined) {
                    edge.color = {color: algovis.colorEdge, highlight: algovis.colorEdge, inherit: false, opacity: 1.0};
                }
                else {
                    edge.color.inherit = false;
                }

                graph.edges.update(edge);
            }
        });
    });
};

algovis.highlightNodes = function(graph, nodes, colors) {
    graph.nodes.forEach(node => {
        if(nodes.indexOf(node.label) != -1) {
            var color = colors(node.label);
            node.color = color;
            
            graph.nodes.update(node);
        }
        else {
            node.color = algovis.defaultNodeColor;

            graph.nodes.update(node);
        }
    });
};

algovis.highlightEdges = function(graph, edges, color, directed, defaultDashes) {
    graph.edges.forEach(edge => {
        var found = false;

        edges.forEach(e => {
            if(edge.from == e.from && edge.to == e.to || (edge.from == e.to && edge.to == e.from && directed == false)) {
                edge.dashes = false;
                edge.width = 2.0;

                if(typeof(edge.color) == "string" || edge.color == undefined) {
                    edge.color = {color: color, highlight: color, inherit: false, opacity: 1.0};
                }
                edge.color.inherit = false;
                edge.color.color = color;
                edge.color.highlight = color;

                graph.edges.update(edge);

                found = true;
            }
        });

        if(found == false) {
            edge.dashes = defaultDashes == undefined ? true : defaultDashes;
            edge.width = 1.0;

            if(typeof(edge.color) == "string" || edge.color == undefined) {
                edge.color = {color: algovis.colorEdge, highlight: algovis.colorEdge, inherit: false, opacity: 1.0};
            }
            edge.color.inherit = false;
            edge.color.color = algovis.colorEdge;
            edge.color.highlight = algovis.colorEdge;
            
            graph.edges.update(edge);
        }
    });
};