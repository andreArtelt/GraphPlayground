"use strict";

var ui = ui || {};

ui.DefaultGraphFileName = "myGraph";
ui.DefaultSvgFileName = "myGraph.svg";
ui.DefaultPdfFileName = "myGraph.pdf";
ui.svgData = undefined;

ui.Controller = function() {
  const Algorithms = {PREORDER_TRAVERSAL: 0, INORDER_TRAVERSAL: 1, LEVELORDER_TRAVERSAL: 2, POSTORDER_TRAVERSAL: 3,
                      PRIM: 4, DIJKSTRA: 5, EULERIAN_PATH: 6, FLOYDWARSHALL: 7, EDMONDSKARP: 8, NEGATIVEWEIGHT_CYCLE: 9,
                      ARBITRAGE: 10, BELLMANFORD: 11, TSPAPPROX: 12};

  this.viewContainer = document.getElementById("graphview");
  this.usePhysics = true;
  this.network = undefined;
  this.graph = undefined;
  this.curNodes = [];
  this.curEdge = undefined;
  this.curCursorPos = undefined;
  this.directedGraph = false;
  this.algoResult = {oldGraph: undefined, resultGraph: undefined, algo: undefined,
                     viewState: undefined, eventHooks: {}, data: {}, options: {}};

  this.enableSpecialEventHandler = function() {
    this.useSpecialEventHandler = true;
  };

  this.disableSpecialEventHandler = function() {
    this.useSpecialEventHandler = false;
  };

  this.registerSpecialEventHandler = function() {
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
  
    this.enableSpecialEventHandler();
  };

  this.triggerEventHooks = function(evtType, hookType, params) {
    try {
      if(this.algoResult.eventHooks[evtType] != undefined && this.algoResult.eventHooks[evtType][hookType] != undefined) {
        this.algoResult.eventHooks[evtType][hookType](params);
      }
    }
    catch(ex) {
      logger.exception(ex);
    }
  }

  this.setLanguage = function(lang) {
    try {
      ui.languageMgr.setLang(lang, () => {
        ui.languageMgr.translateDocument(document);
      });
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.init = function() {
      logger.level = logger_LEVELS.ALL;

      // Set language
      this.setLanguage("en");

      // Register event handler
      document.getElementById("MENU_RESET").addEventListener("click", this.onClickReset.bind(this), false);
      document.getElementById("MENU_CLEAR").addEventListener("click", this.onClickClear.bind(this), false);
      document.getElementById("MENU_RANDOM").addEventListener("click", this.onClickRandom.bind(this), false);
      document.getElementById("MENU_IMPORTFROMTEXT").addEventListener("click", this.onClickImportFromText.bind(this), false);
      document.getElementById("MENU_IMPORTFROMFILE").addEventListener("click", this.onClickImportFromFile.bind(this), false);
      document.getElementById("MENU_EXPORT2TEXT").addEventListener("click", this.onClickExportToText.bind(this), false);
      document.getElementById("MENU_EXPORT2JSON").addEventListener("click", this.onClickExportToFileJSON.bind(this), false);
      document.getElementById("MENU_EXPORT2XML").addEventListener("click", this.onClickExportToFileXML.bind(this), false);
      document.getElementById("MENU_EXPORT2TUPLEREADER").addEventListener("click", this.onClickExportToFileTupleReader.bind(this), false);
      document.getElementById("MENU_EXPORT2SVG").addEventListener("click", this.onExportSvg.bind(this), false);
      document.getElementById("MENU_EXPORT2PDF").addEventListener("click", this.onExportPdf.bind(this), false);
      document.getElementById("MENU_PREORDERTRAVERSAL").addEventListener("click", this.onClickPreoderTraversal.bind(this), false);
      document.getElementById("MENU_INORDERTRAVERSAL").addEventListener("click", this.onClickInorderTraversal.bind(this), false);
      document.getElementById("MENU_LEVELORDERTRAVERSAL").addEventListener("click", this.onClickLevelorderTraversal.bind(this), false);
      document.getElementById("MENU_POSTORDERTRAVERSAL").addEventListener("click", this.onClickPostorderTraversal.bind(this), false);
      document.getElementById("MENU_EULERIANPATH").addEventListener("click", this.onClickEulerianPath.bind(this), false);
      document.getElementById("MENU_DIJKSTRA").addEventListener("click", this.onClickDijkstra.bind(this), false);
      document.getElementById("MENU_PRIM").addEventListener("click", this.onClickPrim.bind(this), false);
      document.getElementById("MENU_BELLMANFORD").addEventListener("click", this.onClickBellmanFord.bind(this), false);
      document.getElementById("MENU_FLOYDWARSHALL").addEventListener("click", this.onClickFloydWarshall.bind(this), false);
      document.getElementById("MENU_EDMONDSKARP").addEventListener("click", this.onClickEdmondsKarp.bind(this), false);
      document.getElementById("MENU_NEGATIVEWEIGHTCYCLE").addEventListener("click", this.onClickNegativeWeightCycle.bind(this), false);
      document.getElementById("MENU_ARBITRAGE").addEventListener("click", this.onClickArbitrage.bind(this), false);
      document.getElementById("MENU_TSPAPPROX").addEventListener("click", this.onClickTspApprox.bind(this), false);

      this.registerSpecialEventHandler();

      // Create random graph
      this.onClickRandom();
  };

  this.canGraphBeManipulated = function() {
    return this.algoResult.viewState == undefined;  // Graph can not be manipulated if we are in the result view
  }

  this.redraw = function() {
    var selectionWidthEdges = 1.0;
    if(this.algoResult.viewState != undefined) {
      if(this.algoResult.options.edges != undefined && this.algoResult.options.edges.selectionWidth != undefined) {
        selectionWidthEdges = this.algoResult.options.edges.selectionWidth;
      }
    }

    var options = {
      physics: {
        enabled: this.usePhysics
      },
      layout: {
        randomSeed: 42
      },
      locale: ui.languageMgr.curLang,
      interaction: {
        multiselect: true
      },
      edges: {
        selectionWidth: selectionWidthEdges
      },
      manipulation: {
        addNode: function(data, callback) {
          this.onAddNode();
        }.bind(this),
        editNode: function(data, callback) {
          this.onEditNode();
        }.bind(this),
        editEdge: true,
        addEdge: function(data, callback) {
          if(this.directedGraph) {
            data.arrows = 'to';
          }

          if (data.from == data.to) {
            var r = confirm(ui.languageMgr.translateId("CONFIRM_CONNECT_NODE_ITSELF"));
            if (r == true) {
              callback(data);
            }
          }
          else {
            callback(data);
          }
        }.bind(this)
      }
    };

    if(this.canGraphBeManipulated() == false) {
      options.manipulation = false;
    }

    this.network = new vis.Network(this.viewContainer, this.graph, options);
    this.network.on("select", this.onSelect.bind(this));
    this.network.on("deselectNode", this.onDeselect.bind(this));
    this.network.on("deselectEdge", this.onDeselect.bind(this));
    this.network.on("click", this.onClick.bind(this));
  };

  this.redrawKeepView = function() {
    var viewPos = this.network.getViewPosition();
    var viewScale = this.network.getScale();

    this.redraw();

    this.network.once('stabilized', function() {
      this.network.moveTo({
        position: viewPos,
        scale: viewScale
      });
    }.bind(this));
  };

  this.onKeyUp = function(evt) {
    if(this.useSpecialEventHandler == false) {
      return;
    }

    try {
      this.triggerEventHooks("keyup", "pre", evt);

      if(evt.key == "e") {
        if(this.curNodes != undefined && this.curNodes.length > 0) {
          this.onEditNode();
        }
        else if(this.curEdge != undefined) {
          this.onEditEdge();
        }
      }
      else if(evt.key == "t") {
        this.onToggleResultView();
      }
      else if(evt.key == "d") {
        this.onToggleDirectedGraph();
      }
      else if(evt.key == "r") {
        this.onClickReset();
      }
      else if(evt.key == "v") {
        this.onExportSvg();
      }
      else if(evt.key == "q") {
        this.usePhysics = !this.usePhysics;
        this.redrawKeepView();
      }

      this.triggerEventHooks("keyup", "post", evt);
    }
    catch(ex) {
      logger.exception(ex);
    }
  }

  this.vis2Graphlib = function(graph) {
    return castings.vis2Graphlib(graph, this.directedGraph);
  };

  this.graphlib2Vis = function(graph) {
    return castings.graphlib2Vis(graph, this.directedGraph);
  };

  this.selectNodes = function(nodes, highlightEdges) {
    this.network.selectNodes(nodes, highlightEdges == undefined ? false : highlightEdges);
    this.curNodes = nodes;
  };

  this.onSelect = function(params) {
    this.triggerEventHooks("onselect", "pre", params);

    if(params.nodes.length > 0) {
      this.curNodes = this.curNodes.concat(params.nodes.filter(x => !this.curNodes.includes(x)));
      this.curEdge = undefined;
    }
    else {
      this.curEdge = params.edges[0];
      this.curNodes = [];
    }

    this.triggerEventHooks("onselect", "post", params);
  };

  this.onDeselect = function(params) {
    this.triggerEventHooks("ondeselect", "pre", params);

    this.curNodes = [];
    this.curEdge = undefined;

    this.triggerEventHooks("ondeselect", "post", params);
  };

  this.onClick = function(params) {
    this.triggerEventHooks("onclick", "pre", params);

    this.curCursorPos = {x: params.pointer.canvas.x, y: params.pointer.canvas.y};

    this.triggerEventHooks("onclick", "post", params);
  };

  this.onToggleDirectedGraph = function() {
    if(this.algoResult.viewState == undefined) {
      this.directedGraph = !this.directedGraph;

      this.graph.edges.forEach(edge => {
        this.graph.edges.update({id: edge.id, from: edge.from, to: edge.to, label: edge.label, color: edge.color, arrows: this.directedGraph == false ? '' : 'to', dashes: false});
      });
    }
  };

  this.onEditNode = function() {
    if(this.canGraphBeManipulated()) {
      if(this.curNodes.length > 1) {
        throw ui.languageMgr.translateId("CAN_NOT_EDIT_MULTIPLE_NODES");
      }

      this.disableSpecialEventHandler();

      new ui.EditNodeDlg(this.graph.nodes.get(this.curNodes[0]).label, data => {
        var node = this.graph.nodes.get(this.curNodes[0]);
        node.label = data;
        this.graph.nodes.update(node);
      }, () => {
        this.enableSpecialEventHandler();
      }).show();
    }
  };

  this.onAddNode = function() {
    this.disableSpecialEventHandler();

    new ui.AddNodeDlg(undefined, data => {
      try {
        var xPos = this.curCursorPos == undefined ? undefined : this.curCursorPos.x;
        var yPos = this.curCursorPos == undefined ? undefined : this.curCursorPos.y;

        // Check if label/id already exists
        if(this.graph.nodes.getIds().filter(n => n == data).length > 0) {
          logger.exception(ui.languageMgr.translateId("CAN_NOT_ADD_NODE_LABEL_AREADY_EXISTS"));
        }
        else {
          this.graph.nodes.add({id: data, label: data, color: algovis.defaultNodeColor, x: xPos, y: yPos});
          this.graph.nodes.update({id: data, label: data, color: algovis.defaultNodeColor, x: undefined, y: undefined}); // Remove inital position
        }
      }
      catch(ex) {
      }
    }, () => {
      this.enableSpecialEventHandler();
    }).show();
  };

  this.onEditEdge = function() {
    if(this.canGraphBeManipulated()) {
      this.disableSpecialEventHandler();

      new ui.EditEdgeDlg(this.graph.edges.get(this.curEdge).label, data => {
        var edge = this.graph.edges.get(this.curEdge);
        edge.label = data;
        this.graph.edges.update(edge);
      },() => {
        this.enableSpecialEventHandler();
      }).show();
    }
  };

  this.enableAlgoMenu = function() {
    document.getElementById("ALGORITHMS_MENU").removeAttribute("class");
    document.getElementById("TRAVERSAL_MENU").removeAttribute("class");
    document.getElementById("APPLICATIONS_MENU").removeAttribute("class");
    document.getElementById("MENU_PREORDERTRAVERSAL").removeAttribute("class");
    document.getElementById("MENU_INORDERTRAVERSAL").removeAttribute("class");
    document.getElementById("MENU_LEVELORDERTRAVERSAL").removeAttribute("class");
    document.getElementById("MENU_POSTORDERTRAVERSAL").removeAttribute("class");
    document.getElementById("MENU_EULERIANPATH").removeAttribute("class");
    document.getElementById("MENU_DIJKSTRA").removeAttribute("class");
    document.getElementById("MENU_PRIM").removeAttribute("class");
    document.getElementById("MENU_BELLMANFORD").removeAttribute("class");
    document.getElementById("MENU_FLOYDWARSHALL").removeAttribute("class");
    document.getElementById("MENU_EDMONDSKARP").removeAttribute("class");
    document.getElementById("MENU_NEGATIVEWEIGHTCYCLE").removeAttribute("class");
    document.getElementById("MENU_ARBITRAGE").removeAttribute("class");
    document.getElementById("MENU_TSPAPPROX").removeAttribute("class");
  };

  this.disableAlgoMenu = function() {
    document.getElementById("ALGORITHMS_MENU").setAttribute("class", "disabled");
    document.getElementById("TRAVERSAL_MENU").setAttribute("class", "disabled");
    document.getElementById("APPLICATIONS_MENU").setAttribute("class", "disabled");
    document.getElementById("MENU_PREORDERTRAVERSAL").setAttribute("class", "disabled");
    document.getElementById("MENU_INORDERTRAVERSAL").setAttribute("class", "disabled");
    document.getElementById("MENU_LEVELORDERTRAVERSAL").setAttribute("class", "disabled");
    document.getElementById("MENU_POSTORDERTRAVERSAL").setAttribute("class", "disabled");
    document.getElementById("MENU_EULERIANPATH").setAttribute("class", "disabled");
    document.getElementById("MENU_DIJKSTRA").setAttribute("class", "disabled");
    document.getElementById("MENU_PRIM").setAttribute("class", "disabled");
    document.getElementById("MENU_BELLMANFORD").setAttribute("class", "disabled");
    document.getElementById("MENU_FLOYDWARSHALL").setAttribute("class", "disabled");
    document.getElementById("MENU_EDMONDSKARP").setAttribute("class", "disabled");
    document.getElementById("MENU_NEGATIVEWEIGHTCYCLE").setAttribute("class", "disabled");
    document.getElementById("MENU_ARBITRAGE").setAttribute("class", "disabled");
    document.getElementById("MENU_TSPAPPROX").setAttribute("class", "disabled");
  };
    
  this.enableResultViewPopup = function() {
    document.getElementById("RESULT_VIEW_POPUP").removeAttribute("class");
  };

  this.disableResultViewPopup = function() {
    document.getElementById("RESULT_VIEW_POPUP").setAttribute("class", "invisible");
  };

  this.onResetAlgo = function() {
    this.stopAnimateNodeHighlighting();
    this.stopAnimatedEdgeHighlighting();

    this.algoResult.oldGraph = undefined;
    this.algoResult.algo = undefined;
    this.algoResult.viewState = undefined;
    this.algoResult.data = {};
    this.algoResult.eventHooks = {};
    this.algoResult.options = {};

    this.curNodes = [];

    this.enableAlgoMenu();
    this.disableResultViewPopup();
  };

  this.onClickReset = function() {
    if(this.algoResult.oldGraph != undefined) {
      this.graph = utils.cloneVisGraph(this.algoResult.oldGraph);
    }
    this.onResetAlgo();
    this.redraw();
  };

  this.onClickClear = function() {
    this.graph = this.graphlib2Vis(utils.createRandomGraph(1, 0.0));
    this.onResetAlgo();
    this.redraw();
  };

  this.onClickRandom = function() {
    this.graph = this.graphlib2Vis(utils.createRandomGraph(10, 0.5));
    this.onResetAlgo();
    this.redraw();
  };

  this.importGraph = function(data) {
    return this.graphlib2Vis(utils.import(data));
  };

  this.onClickImportFromText = function() {
    new ui.ImportDlg(data => {
      try {
        this.graph = this.importGraph(data);
        this.onResetAlgo();
        this.redraw();
      }
      catch(err) {
        logger.exception(err);
      }
    }).show();
  };

  this.onClickImportFromFile = function() {
    utils.readFileAsync(data => {
      try {
        this.graph = this.importGraph(data);
        this.onResetAlgo();
        this.redraw();
      }
      catch(err) {
        logger.exception(err);
      }
    });
  };

  this.exportGraph = function(format) {
    return utils.export(castings.vis2Graphlib(this.graph, true), format);
  };

  this.exportToSvg = function(callback) {
    // Credits: Slightly modified version from https://github.com/justinharrell/vis-svg/
    // Setup everything
    C2S.prototype.circle = CanvasRenderingContext2D.prototype.circle;
    C2S.prototype.square = CanvasRenderingContext2D.prototype.square;
    C2S.prototype.triangle = CanvasRenderingContext2D.prototype.triangle;
    C2S.prototype.triangleDown = CanvasRenderingContext2D.prototype.triangleDown;
    C2S.prototype.star = CanvasRenderingContext2D.prototype.star;
    C2S.prototype.diamond = CanvasRenderingContext2D.prototype.diamond;
    C2S.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect;
    C2S.prototype.ellipse_vis = CanvasRenderingContext2D.prototype.ellipse_vis;
    C2S.prototype.database = CanvasRenderingContext2D.prototype.database;
    C2S.prototype.arrowEndpoint = CanvasRenderingContext2D.prototype.arrowEndpoint;
    C2S.prototype.circleEndpoint = CanvasRenderingContext2D.prototype.circleEndpoint;
    C2S.prototype.dashedLine = CanvasRenderingContext2D.prototype.dashedLine;

    var networkContainer = this.network.body.container;
    var ctx = new C2S({width: networkContainer.clientWidth, height: networkContainer.clientHeight});
    var canvasProto = this.network.canvas.__proto__;
    var currentGetContext = canvasProto.getContext;
    canvasProto.getContext = function(){
        return ctx;
    }

    this.network.redraw();
    canvasProto.getContext = currentGetContext; // Restore old state

    // Export to .svg
    ctx.waitForComplete(function()
        {
            callback(ctx.getSerializedSvg());
        });
  };

  this.onExportPdf = function() {
    this.exportToSvg(function(svgData) {
      var doc = new PDFDocument({compress: true});
      SVGtoPDF(doc, svgData, 0, 0);

      var stream = doc.pipe(blobStream());
      stream.on('finish', function () {
        var blob = stream.toBlob('application/pdf');
        saveAs(blob, ui.DefaultPdfFileName, true);
      });
      doc.end();
    });
  };

  this.onExportSvg = function() {
    this.exportToSvg(function(svgData) {
      utils.writeFile(ui.DefaultSvgFileName, svgData, 'image/svg+xml');
    });
  };

  this.onClickExportToFileJSON = function() {
    this.onClickExportToFile('json');
  };

  this.onClickExportToFileXML = function() {
    this.onClickExportToFile('xml');
  };

  this.onClickExportToFileTupleReader = function() {
    this.onClickExportToFile('tuple_reader');
  };

  this.onClickExportToFile = function(format) {
    var content = this.exportGraph(format);
    switch(format) {
      case 'json':
        utils.writeFile(ui.DefaultGraphFileName + '.json', content);
        break;
      case 'xml':
        //utils.writeFile(ui.DefaultGraphFileName + '.xml', content);
        break;
      case 'tuple_reader':
        utils.writeFile(ui.DefaultGraphFileName + '.txt', content);
        break;
    }
  };

  this.onClickExportToText = function() {
    new ui.ExportDlg(this.exportGraph('tuple_reader')).show();
  };

  this.doAddRemovedEdgesAsDashedEdges = function() {
    algovis.addRemovedEdgesAsDashedEdges(this.graph, this.algoResult.oldGraph, this.directedGraph);
  };

  this.undoAddRemovedEdgesAsDashedEdges = function() {
    this.graph = utils.cloneVisGraph(this.algoResult.data.resultGraph);
  };

  this.onToggleResultView = function() {
    this.disableAlgoMenu();
    this.enableResultViewPopup();

    switch(this.algoResult.algo) {
      case Algorithms.PREORDER_TRAVERSAL: {
        this.onToggleResultViewPreorderTraversal();
      } break;
      case Algorithms.INORDER_TRAVERSAL: {
        this.onToggleResultViewInorderTraversal();
      } break;
      case Algorithms.LEVELORDER_TRAVERSAL: {
        this.onToggleResultViewLevelorderTraversal();
      } break;
      case Algorithms.POSTORDER_TRAVERSAL: {
        this.onToggleResultViewPostorderTraversal();
      } break;
      case Algorithms.PRIM: {
        this.onToggleResultViewPrim();
      } break;
      case Algorithms.EULERIAN_PATH: {
        this.onToggleResultViewEuleriaPath();
      } break;
      case Algorithms.DIJKSTRA: {
        this.onToggleResultViewDijkstra();
      } break;
      case Algorithms.BELLMANFORD: {
        this.onToggleResultViewBellmanFord();
      } break;
      case Algorithms.FLOYDWARSHALL: {
        this.onToggleResultViewFloydWarshall();
      } break;
      case Algorithms.EDMONDSKARP: {
        this.onToggleResultViewEdmondsKarp();
      } break;
      case Algorithms.NEGATIVEWEIGHT_CYCLE: {
        this.onToggleResultViewNegativeWeightCycle();
      } break;
      case Algorithms.ARBITRAGE: {
        this.onToggleResultViewArbitrage();
      } break;
      case Algorithms.TSPAPPROX: {
        this.onToggleResultViewTspApprox();
      } break;
    }
  };

  this.onToggleResultViewPreorderTraversal = function() {
    if(this.algoResult.viewState == true) {
      this.startAnimateNodeHighlighting();

      this.algoResult.viewState = false;
    }
  };

  this.onToggleResultViewPostorderTraversal = function() {
    if(this.algoResult.viewState == true) {
      this.startAnimateNodeHighlighting();

      this.algoResult.viewState = false;
    }
  };

  this.onToggleResultViewInorderTraversal = function() {
    if(this.algoResult.viewState == true) {
      this.startAnimateNodeHighlighting();

      this.algoResult.viewState = false;
    }
  };

  this.onToggleResultViewLevelorderTraversal = function() {
    if(this.algoResult.viewState == true) {
      this.startAnimateNodeHighlighting();

      this.algoResult.viewState = false;
    }
  };

  this.onToggleResultViewEuleriaPath = function() {
    if(this.algoResult.viewState == true) {
      algovis.highlightNodes(this.graph, [this.algoResult.data.start], _ => algovis.colorStartNodeBackground);
      algovis.highlightEdges(this.graph, [], algovis.defaultEdgeColor, this.directedGraph, false);

      this.startAnimateEdgeHighlighting();

      this.algoResult.viewState = false;
    }
  };

  this.onToggleResultViewPrim = function() {
    if(this.algoResult.viewState == true) {
      this.doAddRemovedEdgesAsDashedEdges();

      this.algoResult.viewState = false;
    }
    else {
      this.undoAddRemovedEdgesAsDashedEdges();

      this.algoResult.viewState = true;
    }

    this.redraw();
  };

  this.onToggleResultViewDijkstra = function() {
    // Get start and end node
    var startNode = this.algoResult.data.startNode;
    var endNode = this.curNodes[0];

    var nodes = [startNode];

    if(endNode != undefined && endNode != startNode) {
      nodes.push(endNode);
    }

    // Get edges of route between them
    var route = [];
    if(nodes.length == 2) {
      var curNode = endNode;
      while(curNode != startNode) {
        var nextNode = this.algoResult.data.distPredMap[curNode].predecessor;
        if(nextNode == undefined) {
          logger.exception(ui.languageMgr.translateId("NODE_CAN_NOT_BE_REACHED"));
          return;
        }

        route.push({from: nextNode, to: curNode});

        curNode = nextNode;
      }
    }

    // Highlight start and end node
    algovis.highlightNodes(this.graph, nodes, x => x == startNode ? algovis.colorStartNodeBackground : algovis.colorEndNodeBackground);

    // Highlight route between start and end node
    algovis.highlightEdges(this.graph, route, algovis.colorPath, this.directedGraph);
  };

  this.onToggleResultViewBellmanFord = function() {
    // Get start and end node
    var startNode = this.algoResult.data.startNode;
    var endNode = this.curNodes[0];

    var nodes = [startNode];

    if(endNode != undefined && endNode != startNode) {
      nodes.push(endNode);
    }

    // Get edges of route between them
    var route = [];
    var visitedNodes = [];
    if(nodes.length == 2) {
      var curNode = endNode;
      visitedNodes.push(curNode);

      while(curNode != startNode) {
        var nextNode = this.algoResult.data.pred[curNode];
        if(nextNode == undefined) {
          logger.exception(ui.languageMgr.translateId("NODE_CAN_NOT_BE_REACHED"));
          return;
        }

        if(visitedNodes.indexOf(nextNode) != -1) {
          logger.exception(ui.languageMgr.translateId("NEGATIVEWEIGHT_CYCLE_DETECTED"));
          return;
        }
        visitedNodes.push(nextNode);

        route.push({from: nextNode, to: curNode});

        curNode = nextNode;
      }
    }

    // Highlight start and end node
    algovis.highlightNodes(this.graph, nodes, x => x == startNode ? algovis.colorStartNodeBackground : algovis.colorEndNodeBackground);

    // Highlight route between start and end node
    algovis.highlightEdges(this.graph, route, algovis.colorPath, this.directedGraph);
  };

  this.onToggleResultViewFloydWarshall = function() {
    // Get start and end node
    var startNode = this.curNodes[0];
    var endNode = this.curNodes[1];

    var nodes = [];

    if(startNode != undefined) {
      nodes.push(startNode);
    }
    if(endNode != undefined) {
      nodes.push(endNode);
    }

    // Get edges of route between them
    var route = [];
    var visitedNodes = [];
    if(nodes.length == 2) {
      if(this.algoResult.data.next[startNode][endNode] == undefined) {
        logger.exception(ui.languageMgr.translateId("NODE_CAN_NOT_BE_REACHED"));
        return;
      }

      var curNode = startNode;
      visitedNodes.push(curNode);
      while(curNode != endNode) {
        var nextNode = this.algoResult.data.next[curNode][endNode];

        if(visitedNodes.indexOf(nextNode) != -1) {
          logger.exception(ui.languageMgr.translateId("NEGATIVEWEIGHT_CYCLE_DETECTED"));
          return;
        }
        visitedNodes.push(nextNode);

        route.push({from: curNode, to: nextNode});

        curNode = nextNode;
      }
    }
    
    // Highlight start and end node
    algovis.highlightNodes(this.graph, nodes, x => x == startNode ? algovis.colorStartNodeBackground : algovis.colorEndNodeBackground);

    // Highlight route between start and end node
    algovis.highlightEdges(this.graph, route, algovis.colorPath, this.directedGraph);
  };

  this.onToggleResultViewEdmondsKarp = function() {
    if(this.algoResult.viewState == true) {
      // Show flow on edges
      algovis.showFlowOnEdges(this.graph, this.algoResult.data.resultGraph);

      // Highlight start and end node
      var startNode = this.algoResult.data.startNode;
      var endNode = this.algoResult.data.endNode;
      algovis.highlightNodes(this.graph, [startNode, endNode], x => x == startNode ? algovis.colorStartNodeBackground : algovis.colorEndNodeBackground);

      this.algoResult.viewState = false;
    }
  };

  this.onToggleResultViewNegativeWeightCycle = function() {
    if(this.algoResult.viewState == true) {
      // Highlight nodes of cycle
      algovis.highlightNodes(this.graph, this.algoResult.data.cycle, x => algovis.colorStartNodeBackground);

      // Highlight edges of cycle
      algovis.highlightEdges(this.graph, this.algoResult.data.route, algovis.colorStartNodeBackground, this.directedGraph);

      this.algoResult.viewState = false;
    }
  };

  this.onToggleResultViewArbitrage = function() {
    if(this.algoResult.viewState == true) {
      this.graph = utils.cloneVisGraph(this.algoResult.data.resultGraph);
      this.graph.edges.forEach(edge => {
        edge.label = parseFloat(edge.label).toFixed(2);
        this.graph.edges.update(edge);
      });

      this.algoResult.viewState = false;
    }
    else {
      this.graph = utils.cloneVisGraph(this.algoResult.oldGraph);

      this.algoResult.viewState = true;
    }

    this.redraw();

    // Highlight nodes of cycle
    algovis.highlightNodes(this.graph, this.algoResult.data.cycle, x => algovis.colorStartNodeBackground);

    // Highlight edges of cycle
    algovis.highlightEdges(this.graph, this.algoResult.data.route, algovis.colorStartNodeBackground, this.directedGraph);
  };

  this.onToggleResultViewTspApprox = function() {
    if(this.algoResult.viewState == true) {
      this.graph = utils.cloneVisGraph(this.algoResult.data.resultGraph);

      this.algoResult.viewState = false;
    }
    else {
      this.graph = utils.cloneVisGraph(this.algoResult.oldGraph);

      this.algoResult.viewState = true;
    }

    this.redraw();
  };

  this.forceNodeSelection = function(n) {
    if(this.curNodes.length != (n == undefined ? 1 : n)) {
      alert(ui.languageMgr.translateId("SELECT_NODE_FIRST"));
      return false;
    }
    else {
      return true;
    }
  };

  this.startAnimateEdgeHighlighting = function() {
    this.algoResult.data["animation"] = {};
    this.algoResult.data.animation["edges"] = [];
    this.algoResult.data.animation["edgesQueue"] = utils.cloneObj(this.algoResult.data.path);
    
    this.algoResult.data.animation["timer"] = setInterval(this.animatedEdgeHighlighting.bind(this), 1000);
  };

  this.stopAnimatedEdgeHighlighting = function() {
    if(this.algoResult.data.animation != undefined && this.algoResult.data.animation.timer != undefined) {
      clearTimeout(this.algoResult.data.animation.timer);

      this.algoResult.data.animation.edges = [];
      this.algoResult.data.animation.edgesQueue = [];
    }
  };

  this.animatedEdgeHighlighting = function() {
    // Check if we are done (all edges are highlighted) => if so, restart the animation
    if(this.algoResult.data.animation.edges.length == this.algoResult.data.path.length) {
      this.algoResult.data.animation.edges = [];
      this.algoResult.data.animation.edgesQueue = utils.cloneObj(this.algoResult.data.path);
    }
    else {
      // Add next edge
      this.algoResult.data.animation.edges.push(this.algoResult.data.animation.edgesQueue.shift());
    }

    // Highlight current edges
    algovis.highlightEdges(this.graph, this.algoResult.data.animation.edges, algovis.colorStartNodeBackground, this.directedGraph, false);
  };

  this.startAnimateNodeHighlighting = function() {
    this.algoResult.data["animation"] = {};
    this.algoResult.data.animation["nodes"] = [];
    this.algoResult.data.animation["nodesQueue"] = utils.cloneObj(this.algoResult.data.path);
    
    this.algoResult.data.animation["timer"] = setInterval(this.animateNodeHighlighting.bind(this), 1000);
  };

  this.stopAnimateNodeHighlighting = function() {
    if(this.algoResult.data.animation != undefined && this.algoResult.data.animation.timer != undefined) {
      clearTimeout(this.algoResult.data.animation.timer);

      this.algoResult.data.animation.nodes = [];
      this.algoResult.data.animation.nodesQueue = [];
    }
  };

  this.animateNodeHighlighting = function() {
    // Check if we are done (all nodes are highlighted) => if so, restart the animation
    if(this.algoResult.data.animation.nodes.length == this.algoResult.data.path.length) {
      this.algoResult.data.animation.nodes = [];
      this.algoResult.data.animation.nodesQueue = utils.cloneObj(this.algoResult.data.path);
    }
    else {
      // Add next node
      this.algoResult.data.animation.nodes.push(this.algoResult.data.animation.nodesQueue.shift());
    }

    // Highlight current nodes
    algovis.highlightNodes(this.graph, this.algoResult.data.animation.nodes, x => algovis.colorStartNodeBackground, this.directedGraph);
  };

  this.onClickPreoderTraversal = function() {
    try {
      if(this.forceNodeSelection()) {
        var startNode = this.curNodes[0];

        var graphIn = this.vis2Graphlib(this.graph);
        var pathNodes = algo.preorderTraversal(graphIn, startNode);
        
        logger.info(pathNodes);

        this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
        this.algoResult.algo = Algorithms.PREORDER_TRAVERSAL;
        this.algoResult.data = {
          startNode: startNode,
          path: pathNodes
        };
        this.algoResult.viewState = true;

        this.onToggleResultView();
      }
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickInorderTraversal = function() {
    try {
      if(this.forceNodeSelection()) {
        var startNode = this.curNodes[0];

        var graphIn = this.vis2Graphlib(this.graph);
        var pathNodes = algo.inorderTraversal(graphIn, startNode);
        
        logger.info(pathNodes);

        this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
        this.algoResult.algo = Algorithms.INORDER_TRAVERSAL;
        this.algoResult.data = {
          startNode: startNode,
          path: pathNodes
        };
        this.algoResult.viewState = true;

        this.onToggleResultView();
      }
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickLevelorderTraversal = function() {
    try {
      if(this.forceNodeSelection()) {
        var startNode = this.curNodes[0];

        var graphIn = this.vis2Graphlib(this.graph);
        var pathNodes = algo.levelorderTraversal(graphIn, startNode);
        
        logger.info(pathNodes);

        this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
        this.algoResult.algo = Algorithms.LEVELORDER_TRAVERSAL;
        this.algoResult.data = {
          startNode: startNode,
          path: pathNodes
        };
        this.algoResult.viewState = true;

        this.onToggleResultView();
      }
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickPostorderTraversal = function() {
    try {
      if(this.forceNodeSelection()) {
        var startNode = this.curNodes[0];

        var graphIn = this.vis2Graphlib(this.graph);
        var pathNodes = algo.postorderTraversal(graphIn, startNode);
        
        logger.info(pathNodes);

        this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
        this.algoResult.algo = Algorithms.POSTORDER_TRAVERSAL;
        this.algoResult.data = {
          startNode: startNode,
          path: pathNodes
        };
        this.algoResult.viewState = true;

        this.onToggleResultView();
      }
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickEulerianPath = function() {
    try {
      var graphIn = this.vis2Graphlib(this.graph);

      var pathNodes = undefined;
      if(this.directedGraph) {
        pathNodes = algo.eulerianPathDirected(graphIn);
      }
      else {
        pathNodes = algo.eulerianPathUndirected(graphIn);
      }

      logger.info(pathNodes);

      var pathEdges = [];
      for(var i=1; i != pathNodes.length; i++) {  // nodes => edges
        pathEdges.push({
          from: pathNodes[i-1],
          to: pathNodes[i]
        });
      }

      this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
      this.algoResult.algo = Algorithms.EULERIAN_PATH;
      this.algoResult.data = {
        path: pathEdges,
        start: pathNodes[0]
      };
      this.algoResult.viewState = true;

      this.onToggleResultView();
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickDijkstra = function() {
    try {
      if(this.forceNodeSelection()) {
        var startNode = this.curNodes[0];

        var graphIn = this.vis2Graphlib(this.graph);
        var distPredMap = algo.dijkstra(graphIn, startNode);
      
        logger.info(distPredMap);

        this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
        this.algoResult.algo = Algorithms.DIJKSTRA;
        this.algoResult.data = {
          startNode: startNode,
          distPredMap: distPredMap
        };
        this.algoResult.eventHooks.onselect = {
          post: this.onToggleResultViewDijkstra.bind(this)
        };
        this.algoResult.options = {
          edges: {
            selectionWidth: 0.0
          }
        };
        this.algoResult.viewState = true;

        this.selectNodes([]);

        this.onToggleResultView();
      }
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickPrim = function() {
    try {
      var graphIn = this.vis2Graphlib(this.graph);
      var graphOut = algo.prim(graphIn);

      logger.info(graphOut);

      this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
      this.algoResult.algo = Algorithms.PRIM;
      this.algoResult.data = {
        resultGraph: this.graphlib2Vis(graphOut)
      };
      this.algoResult.viewState = false;

      this.onToggleResultView();
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickBellmanFord = function() {
    try {
        if(this.forceNodeSelection()) {
          var startNode = this.curNodes[0];
          var graphIn = this.vis2Graphlib(this.graph);
          
          var results = algo.bellmanFord(graphIn, startNode);

          logger.info(results);

          this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
          this.algoResult.algo = Algorithms.BELLMANFORD;
          this.algoResult.data = {
            startNode: startNode,
            dist: results.dist,
            pred: results.pred
          };
          this.algoResult.eventHooks.onselect = {
            post: this.onToggleResultViewBellmanFord.bind(this)
          };
          this.algoResult.options = {
            edges: {
              selectionWidth: 0.0
            }
          };
          this.algoResult.viewState = true;

          this.selectNodes([]);

          this.onToggleResultView();
      }
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickFloydWarshall = function() {
    try {
      var graphIn = this.vis2Graphlib(this.graph);
      var results = algo.floydWarshall(graphIn);

      logger.info(results);

      this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
      this.algoResult.algo = Algorithms.FLOYDWARSHALL;
      this.algoResult.data = {
        dist: results.dist,
        next: results.next
      };
      this.algoResult.eventHooks.onselect = {
        post: this.onToggleResultViewFloydWarshall.bind(this)
      };
      this.algoResult.options = {
        edges: {
          selectionWidth: 0.0
        }
      };
      this.algoResult.viewState = true;

      this.selectNodes([]);

      this.onToggleResultView();
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickEdmondsKarp = function() {
    try {
      if(this.forceNodeSelection(2)) {
        var startNode = this.curNodes[0];
        var endNode = this.curNodes[1];

        var graphIn = this.vis2Graphlib(this.graph);
        var graphOut = algo.edmondsKarps(graphIn, startNode, endNode);

        logger.info(graphOut);

        this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
        this.algoResult.algo = Algorithms.EDMONDSKARP;
        this.algoResult.data = {
          startNode: startNode,
          endNode: endNode,
          resultGraph: this.graphlib2Vis(graphOut)
        };
        this.algoResult.viewState = true;

        this.selectNodes([]);

        this.onToggleResultView();
      }
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickNegativeWeightCycle = function() {
    try {
      var graphIn = this.vis2Graphlib(this.graph);
      var result = algo.findNegativeWeightCycle(graphIn);

      logger.info(result);

      this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
      this.algoResult.algo = Algorithms.NEGATIVEWEIGHT_CYCLE;
      this.algoResult.data = {
        cycle: result.cycle,
        route: result.route
      };
      this.algoResult.options = {
        edges: {
          selectionWidth: 0.0
        }
      };
      this.algoResult.viewState = true;

      this.selectNodes([]);

      this.onToggleResultView();
    }
    catch(err) {
      logger.exception(err);
    }
  };
  
  this.onClickArbitrage = function() {
    try {
      var graphIn = this.vis2Graphlib(this.graph);
      var result = algo.arbitrage(graphIn);

      logger.info(result);

      this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
      this.algoResult.algo = Algorithms.ARBITRAGE;
      this.algoResult.data = {
        cycle: result.cycle,
        route: result.route,
        resultGraph: this.graphlib2Vis(result.logGraph)
      };
      this.algoResult.options = {
        edges: {
          selectionWidth: 0.0
        }
      };
      this.algoResult.viewState = true;

      this.selectNodes([]);

      this.onToggleResultView();
    }
    catch(err) {
      logger.exception(err);
    }
  };

  this.onClickTspApprox = function() {
    try {
      var graphIn = this.vis2Graphlib(this.graph);
      var result = algo.approxTsp(graphIn);

      logger.info(result);

      this.algoResult.oldGraph = utils.cloneVisGraph(this.graph);
      this.algoResult.algo = Algorithms.TSPAPPROX;
      this.algoResult.data = {
        resultGraph: this.graphlib2Vis(result.tourGraph)
      };
      this.algoResult.options = {
        edges: {
          selectionWidth: 0.0
        }
      };
      this.algoResult.viewState = true;

      this.selectNodes([]);

      this.onToggleResultView();
    }
    catch(err) {
      logger.exception(err);
    }
  };
};

// Main entry point
window.onload = function(){
  new ui.Controller().init();
};