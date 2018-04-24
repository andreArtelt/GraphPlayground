"use strict";

var ui = ui || {};

ui.EditEdgeDlg = function(curEdgeValue, callback, callbackFinally) {
    this.container = document.getElementById("editEdgeDlg");
    this.data = document.getElementById("edgeData");
    this.data.value = curEdgeValue == undefined ? "" : curEdgeValue;

    this.finally = function() {
        callbackFinally();
    };

    this.onClickOk = function() {
        callback(this.data.value);
        this.finally();
    };

    this.onClose = function() {
        this.finally();
    };

    this.show = function() {
        this.container.showModal();
    };

    document.getElementById("editedgeOkBtn").onclick = this.onClickOk.bind(this);
    document.getElementById("editedgeCloseBtn").onclick = this.onClose.bind(this);
    dialogPolyfill.registerDialog(this.container);
};

ui.EditNodeDlg = function(curNodeValue, callback, callbackFinally) {
    this.container = document.getElementById("editNodeDlg");
    this.data = document.getElementById("nodeData");
    this.data.value = curNodeValue == undefined ? "" : curNodeValue;

    this.finally = function() {
        callbackFinally();
    };

    this.onClickOk = function() {
        callback(this.data.value);
        this.finally();
    };

    this.onClose = function() {
        this.finally();
    };

    this.show = function() {
        this.container.showModal();
    };

    document.getElementById("editnodeOkBtn").onclick = this.onClickOk.bind(this);
    document.getElementById("editnodeCloseBtn").onclick = this.onClose.bind(this);
    dialogPolyfill.registerDialog(this.container);
};

ui.AddNodeDlg = function(nodeIdSuggestion, callback, callbackFinally) {
    this.container = document.getElementById("addNodeDlg");
    this.data = document.getElementById("nodeId");
    this.data.value = nodeIdSuggestion == undefined ? "" : nodeIdSuggestion;

    this.finally = function() {
        callbackFinally();
    };

    this.onClickOk = function() {
        callback(this.data.value);
        this.finally();
    };

    this.onClose = function() {
        this.finally();
    };

    this.show = function() {
        this.container.showModal();
    };

    document.getElementById("addnodeOkBtn").onclick =  this.onClickOk.bind(this);
    document.getElementById("addnodeCloseBtn").onclick = this.onClose.bind(this);
    dialogPolyfill.registerDialog(this.container);
};


ui.ImportDlg = function(callback) {
    this.container = document.getElementById("importDlg");
    this.data = document.getElementById("importData");
    this.data.value = "";

    this.onClickImport = function() {
        callback(this.data.value);
    };

    this.show = function() {
        this.container.showModal();
    };

    document.getElementById("importBtn").onclick = this.onClickImport.bind(this);
    dialogPolyfill.registerDialog(this.container);
};

ui.ExportDlg = function(data) {
    this.container = document.getElementById("exportDlg");
    document.getElementById("exportData").value = data;

    this.show = function() {
        this.container.showModal();
    };

    this.show = function() {
        this.container.showModal();
    };

    dialogPolyfill.registerDialog(this.container);
};