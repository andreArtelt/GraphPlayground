"use strict";

var utils = utils || {};

utils.import = function(data) {
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