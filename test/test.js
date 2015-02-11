var should = require("chai").should();
var Dom = require('../tool');
var fs = require('fs');
var AsyncArray = require('async-arrays');
var Levenshtein = require('levenshtein')
var rootContext;

var data = {};

data.tags = fs.readFileSync('test/count-test.html').toString();
data.attributes = fs.readFileSync('test/count-test.html').toString();
data.nesting = fs.readFileSync('test/nested-test.html').toString();
data.tagValues = JSON.parse(fs.readFileSync('test/count-test-selections.json').toString());

function noSpaces(text){
    return text.replace(/\n/g, '').replace(/ /g, '');
}

describe('dom-tool', function(){
    
    before(function(complete){
        var jsdom = require('jsdom');
        jsdom.env(
            '<html><head></head><body></body></html>',
            ["http://code.jquery.com/jquery.js"],
            function(errors, window){
                rootContext = window;
                //browsers expect these objects to be global
                global.HTMLCollection = window.HTMLCollection;
                global.NodeList = window.NodeList;
                complete();
            }
        );
    });

    it('generates valid fragments', function(complete){
        var tool = new Dom.Tool();
        tool.bond(rootContext);
        var fragment = tool.document(data.tags);
        var levenshtein = new Levenshtein( noSpaces(fragment.body.innerHTML), noSpaces(data.tags) );
        levenshtein.distance.should.be.below(10); //take into account a small amount of legal reformatting: inexact
        fragment.body.childNodes.length.should.equal(1);
        fragment.body.childNodes[0].childNodes.length.should.equal(7); //3 DOM nodes + 4 Text nodes
        complete();
    });
    
    it('identifies the correct number of markers in text nodes', function(complete){
        var tool = new Dom.Tool();
        tool.bond(rootContext);
        var doc = tool.document(data.tags);
        var count = 0;
        tool.lookFor({}, function(node){
            count++;
        });
        tool.transform(doc.body, function(){
            count.should.equal(45); //determined by hand, change count-test at your own peril
            complete();
        });
        
    });
    
    it('finds the marker text by regex', function(complete){
        var tool = new Dom.Tool();
        tool.bond(rootContext);
        var doc = tool.document(data.tags);
        var values = data.tagValues.slice();
        tool.lookFor({
            nodeType : 'text',
            regex : /\[.*?\]/g
        }, function(node){
            var value = (node.innerHTML || node.nodeValue || node.textContent)
            value = value.substring(1, value.length-1);
            AsyncArray.erase(values, {text : value } );
        });
        tool.transform(doc.body, function(){
            values.length.should.equal(0);
            complete();
        });
    }); 

    
    it('discriminates count properly by regex', function(complete){
        var tool = new Dom.Tool();
        tool.bond(rootContext);
        var doc = tool.document(data.tags);
        var count = 0;
        tool.lookFor({
            nodeType : 'text',
            regex : /\[.*?\]/g
        }, function(node){
            count++;
        });
        tool.transform(doc.body, function(){
            count.should.equal(8);
            complete();
        });
    });
    
    it('discriminates by tag type', function(complete){
        var tool = new Dom.Tool();
        tool.bond(rootContext);
        var doc = tool.document(data.tags);
        var count = 0;
        tool.lookFor({
            nodeType : 'text'
        }, function(node){
            count++;
        });
        tool.transform(doc.body, function(){
            count.should.equal(27);
            complete();
        });
    });
    
    it('identifies the correct number of attributes', function(complete){
        var tool = new Dom.Tool();
        tool.bond(rootContext);
        var doc = tool.document(data.tags);
        var count = 0;
        tool.lookFor({
            nodeType : 'attribute'
        }, function(node){
            count++;
        });
        tool.transform(doc.body, {attributes : true}, function(){
            count.should.equal(11);
            complete();
        });
        
    });
    
    it('uses regex to select attributes', function(complete){
        var tool = new Dom.Tool();
        tool.bond(rootContext);
        var doc = tool.document(data.tags);
        var count = 0;
        tool.lookFor({
            nodeType : 'attribute',
            regex : /\[.*?\]/g
        }, function(node){
            count++;
        });
        tool.transform(doc.body, {attributes : true}, function(){
            count.should.equal(2);
            complete();
        });
        
    });

});