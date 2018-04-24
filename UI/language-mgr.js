"use strict";

var ui = ui || {};

ui.languageMgr = {};

ui.languageMgr.curLang = undefined;
ui.languageMgr.curLangData = undefined;

ui.languageMgr.load = function(lang, callback) {
    ui.languageMgr.curLangData = undefined;
    
    var finalize = x => {
        ui.languageMgr.curLangData = x;
        callback();
    };
    fetch(`UI/LanguageRes/${lang}.json`).then(x => x.json()).then(x => finalize(x));
};

ui.languageMgr.setLang = function(lang, callback) {
    ui.languageMgr.curLang = undefined;
    ui.languageMgr.load(lang, callback);
    ui.languageMgr.curLang = lang;
};

ui.languageMgr.translateDocument = function(doc) {
    var elements = doc.getElementsByTagName("*");
    for(var i=0; i != elements.length; i++) {
        var langId = elements[i].getAttribute("data-lang-id");
        if(langId != undefined) {
            elements[i].innerHTML = ui.languageMgr.translateId(langId);
        }
    }
};

ui.languageMgr.translateId = function(id) {
    return ui.languageMgr.curLangData[id];
};