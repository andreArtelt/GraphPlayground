"use strict";

var algo = algo || {};

algo.preorderTraversal = function(graph, startNode) {
    if(utils.isGraphlibGraphConnected(graph) == false) {
        throw new Error(ui.languageMgr.translateId("GRAPH_NOT_CONNECTED"));
    }

    return graphlib.alg.preorder(graph, startNode);
};

algo.postorderTraversal = function(graph, startNode) {
    if(utils.isGraphlibGraphConnected(graph) == false) {
        throw new Error(ui.languageMgr.translateId("GRAPH_NOT_CONNECTED"));
    }

    return graphlib.alg.postorder(graph, startNode);
};

algo.inorderTraversal = function(graph, startNode) {
    var nodes = [];
    var stack = [];

    var graphIn = graph;
    var successors = node => graphIn.successors(node);

    if(!graph.isDirected()) {
        graphIn = utils.cloneGraphlibGraph(graph);

        successors = node => {
            var r = graphIn.neighbors(node);
            if(r == undefined) {
                r = [];
            }

            graphIn.removeNode(node);

            return r;
        };
    }

    stack.push(startNode);
    while(stack.length > 0) {
        var curNode = stack.pop();

        var succ = successors(curNode).filter(x => nodes.indexOf(x) == -1 && stack.indexOf(x) == -1);
        
        if(succ.length == 0) {
            nodes.push(curNode);
        }
        else {
            // Third: Traverse all other children
            for(var i=1; i != succ.length; i++) {
                stack.push(succ[i]);
            }

            // Second: Output the current node
            stack.push(curNode);

            // First: Traverse the first child
            stack.push(succ[0])
        }
    }

    return nodes;
};

algo.levelorderTraversal = function(graph, startNode) {
    var nodes = [];
    var queue = [];

    var graphIn = graph;
    var successors = node => graphIn.successors(node);

    if(!graph.isDirected()) {
        graphIn = utils.cloneGraphlibGraph(graph);

        successors = node => {
            var r = graphIn.neighbors(node);
            if(r == undefined) {
                r = [];
            }
            r = r.filter(x => nodes.indexOf(x) == -1 && queue.indexOf(x) == -1);

            graphIn.removeNode(node);

            return r;
        };
    }

    queue.push(startNode);
    while(queue.length > 0) {
        var curNode = queue.shift();
        nodes.push(curNode);

        var succ = successors(curNode);
        succ.forEach(n => {
            queue.push(n);
        });
    }

    return nodes;
};