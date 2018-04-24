"use strict";

var algo = algo || {};

algo.eulerianPathDirected = function(graph) {   // Hierholzer's algorithm
    // Check if eulerian path exisits
    var numNodes = graph.nodes().length;
    var countEqualInOut = 0;
    var countOutGIn = 0;
    var countInGOut = 0;
    var countInvalid = 0;
    var curStartNode = undefined;
    var curEndNode = undefined;

    for(var i=0; i != numNodes; i++) {
        var curNode = graph.nodes()[i];
        
        var fan_in = graph.predecessors(curNode).length;
        var fan_out = graph.successors(curNode).length;

        if(fan_in == fan_out) {
            countEqualInOut += 1;
            if(countOutGIn == 0) {
                curStartNode = curNode;
            }
        }
        else if(fan_out == fan_in + 1) {
            countOutGIn += 1;
            curStartNode = curNode;
        }
        else if(fan_in == fan_out + 1) {
            countInGOut += 1;
            curEndNode = curNode;
        }
        else {
            countInvalid += 1;
            break;
        }
    }

    if(!(((countInGOut == 1 && countOutGIn == 1) || countEqualInOut == numNodes) && countInvalid == 0 && utils.isGraphlibGraphConnected(graph))) {
        throw new Error(ui.languageMgr.translateId("GRAPH_NO_EULERIAN_PATH"));
    }

    // Compute eulerian path
    var tour = [];
    var stack = [];
    var graphIn = utils.cloneGraphlibGraph(graph);

    stack.push(curStartNode);
    while(stack.length > 0) {
        var curNode = stack.pop();
        var successors = graphIn.successors(curNode);

        if(successors.length == 0) {
            tour.push(curNode);
        }
        else {
            stack.push(curNode);

            var neighbor = successors[0];
            stack.push(neighbor);
            graphIn.removeEdge(curNode, neighbor);
        }
    }

    return tour.reverse();
};

algo.eulerianPathUndirected = function(graph) {     // Hierholzer's algorithm (undirected version)
    // Check if eulerian path exisits
    var numNodes = graph.nodes().length;
    var countEven = 0;
    var countOdd = 0;
    var curStartNode = undefined;

    for(var i=0; i != numNodes; i++) {
        var curNode = graph.nodes()[i];
        
        if(graph.neighbors(curNode).length % 2 == 0) {
            countEven += 1;
            if(countOdd == 0) {
                curStartNode = curNode;
            }
        }
        else {
            countOdd += 1;
            curStartNode = curNode;
        }
    }

    if(!((countOdd == 2 || countEven == numNodes) && utils.isGraphlibGraphConnected(graph))) {
        throw new Error(ui.languageMgr.translateId("GRAPH_NO_EULERIAN_PATH"));
    }

    // Compute eulerian path
    var tour = [];
    var stack = [];
    var graphIn = utils.cloneGraphlibGraph(graph);

    stack.push(curStartNode);

    while(stack.length > 0) {
        var curNode = stack.pop();

        if(graphIn.neighbors(curNode).length == 0) {
            tour.push(curNode);
        }
        else {
            while(graphIn.nodeEdges(curNode).length > 0) {  // TODO: Remove this loop and use the outer loop instead of it
                stack.push(curNode);
                
                var u = graphIn.neighbors(curNode)[0];
                graphIn.removeEdge(curNode, u);

                curNode = u;
            }

            if(graphIn.neighbors(curNode).length == 0) {    // TODO: Always true
                tour.push(curNode);
            }
        }
    }

    return tour.reverse();
};