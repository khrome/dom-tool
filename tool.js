(function(root, factory){
    if (typeof define === 'function' && define.amd){
        define(['extended-emitter'], factory);
    }else if(typeof exports === 'object'){
        module.exports = factory(require('extended-emitter'));
    }else{
        root.LiveTemplates = factory(root.ExtendedEmitter);
    }
}(this, function(Emitter){
    /*var mode = 'evented';
    var root = {};
    var Templates = {};
    Templates.domSelector = $;
    var updaters = {}; //calls to bind model fields to individual view elements
    var updaterModel = {};
    var cache = {};
    var blocks = {};
    var engine;*/
    
    /*var htmlToDom;
    var domSelector;
    var nodeTypeMap = {
        ELEMENT_NODE : 1, ATTRIBUTE_NODE  : 2, TEXT_NODE : 3, CDATA_SECTION_NODE  : 4,
        ENTITY_REFERENCE_NODE  : 5, ENTITY_NODE  : 6, PROCESSING_INSTRUCTION_NODE : 7,
        COMMENT_NODE : 8, DOCUMENT_NODE : 9, DOCUMENT_TYPE_NODE : 10, DOCUMENT_FRAGMENT_NODE : 11,
        NOTATION_NODE  : 12, element : 1, attribute  : 2, text : 3, cdata  : 4,
        entity_reference  : 5, entityReference  : 5, entity  : 6, instruction : 7,
        comment : 8, document : 9, document_type : 10, documentType : 10,
        document_fragment : 11, documentFragment : 11, notation  : 12,
    }
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    function traverseDOM(root, nodeMap, onComplete){ //not async
        if(typeof nodeMap == 'function'){
            nodeMap = { 'element+text' : nodeMap }
        }
        if(!isNumber(Object.keys(nodeMap))){
            var transformedMap = {};
            Object.keys(nodeMap).forEach(function(key){
                var keys = key.split('+');
                keys.forEach(function(typeName){
                    transformedMap[nodeTypeMap[typeName]] = nodeMap[key];
                })
            });
            nodeMap = transformedMap;
        }
        if(Array.isArray(root)){ //so we can pass in the output of $.parseHTML
            var replace = function(target, replacement){
                var index = root.indexOf(target);
                if(index != -1) root.splice(index, 1, replacement);
            }
            root.forEach(function(node){
                if(nodeMap[node.nodeType]) nodeMap[node.nodeType](node, replace);
                traverseDOM(node, nodeMap);
            });
        }else{
            Array.prototype.forEach.apply(root.childNodes, [function(child){
                if(nodeMap[child.nodeType]) nodeMap[child.nodeType](child, replace);
                traverseDOM(child, nodeMap);
            }])
        }
        if(onComplete) onComplete();
    }
    function field(root, name, value){
        if(typeof name == 'string') return field(root, name.split('.'), value);
        var current = root;
        var fieldName;
        while(name.length){
            fieldName = name.shift();
            if(!current[fieldName]){
                if(value) current[fieldName] = {};
                else return undefined;
            }
            if(!name.length){
                if(value) current[fieldName] = value;
                return current[fieldName];
            }else current = current[fieldName];
        }
        return undefined;
    }
    var uniqueID = function(){
        return Math.floor( Math.random() * 100000000 )+'';
    };
    var getItemBreaks = function(root){
        var itemBreaks = [];
        traverseDOM(root, {'comment':function(node, replace){
            var matches = (node.innerHTML || node.wholeText || node.data) === '<!--{{item}}-->';
            if(matches) itemBreaks.push(node);
        }});
        return itemBreaks;
    };
    var insertAt = function(root, nodes, position){
        //todo: cache this stuff
        var itemBreaks = getItemBreaks();
        if(itemBreaks.length > position) throw new Error('out of range insert');
        if(itemBreaks.length === position) root.appendChild(nodes);
        var target = itemBreaks[position];
        root.insertBefore(nodes, target);
    };
    var findComment = function(root, text){
        var root;
        traverseDOM(root, {'comment':function(node, replace){
            var matches = (node.innerHTML || node.wholeText || node.data) === text;
            if(matches && !root) root = node.parentNode;
        }});
        return root;
    };
    var findBlockNumber = function(root, position){
        var itemBreaks = getItemBreaks(root);
        var target = root.children.indexOf(itemBreaks[position]);
        var blocks;
        switch(position){
            case 0 :
                blocks = root.children.slice(0, target);
                break;
            case blocks.length - 1 :
                blocks = root.children.slice(target);
                break;
            default : 
                var bottom = root.children.indexOf(itemBreaks[position-1]);
                blocks = root.children.slice(bottom, target);
                break;
        }
        return blocks;
    };
    var convertMarkersToLiveHTML = function(dom, options){
        traverseDOM(dom, {'comment':function(node, replace){
            var matches = (node.innerHTML || node.wholeText || node.data).match(/^\[\[(.*)\]\]$/);
            if(matches){
                var parts = matches[1].split(':');
                var id = parts[0];
                var field = parts[1];
                createLiveDOM(node, id, field, replace, options);
            }
            matches = (node.innerHTML || node.wholeText || node.data).match(/^\{\{(.*)\}\}$/);
            if(matches){
                blocks[matches[1]] = node;
            }
        }});
    };
    
    var createLiveDOM = function(node, id, field, options){
        if(!htmlToDom) throw new Error('parser not set on dom-tool');
        var element = htmlToDom('<span></span>')[0];
        //var model = updaterModel[id];
        if(options.onCreateNode) options.onCreateNode(id, node, element, field, options);
        //element.setAttribute('model-link', model.namekey);
        //element.setAttribute('field-link', field);
        //var container = node.parentNode;
        if(options.updateNode) options.updateNode(id, node, element, field, options);
        if(container && container.nodeType != 11) container.replaceChild(element, node);
        //else if(replace) replace(node, element);
        /*updaters[id] = function(){
            var old = element.innerHTML;
            var newValue = model.get(field);
            var payload = {
                previous : old, 
                value : newValue, 
                field : field
            };
            if(emitter) emitter.emit('before-dom-update', payload);
            element.innerHTML = newValue;
            if(emitter) emitter.emit('dom-update', payload);
        };
        if(container && container.nodeType != 11) container.replaceChild(element, node);
        else if(replace) replace(node, element);
        model.on('change', {field : field}, function(payload){
            var payload = {
                previous : old, 
                value : newValue, 
                field : field
            };
            if(emitter) emitter.emit('before-model-update', payload);
            updaters[id]();
            if(emitter) emitter.emit('model-update', payload);
        });
        updaters[id]();*//*
    };
    
    var createLiveAttribute = function(field, node){
        var attr = node.getAttribute(field);
        var matches = (attr||'').match(/<!--\[\[.*?\]\]-->/g);
        var id = uniqueID();
        if(attr && matches){
            //*
            var links = []; //keep a list of the models we touch in this attr
            updaters[id] = function(callback){
                var value = attr;
                matches.forEach(function(match){
                    var parts = match.match(/<!--\[\[(.*):(.*)\]\]-->/);
                    var modelID = parts[1];
                    var field = parts[2];
                    var model = updaterModel[modelID];
                    if(model) value = value.replace(parts[0], model.get(field));
                    if(callback) callback(model, field);
                });
                node.setAttribute(field, value);
            };
            updaters[id](function(model, field){ //the first time, we attach listeners
                model.on('change:'+field, function(){ //if any connected field changes, rewrite attr
                    updaters[id]();
                });
            });//*//*
        }
    };
    */
    
    escapeRegEx = function(string) {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    };
    
    var nodeTypeMap = {
        ELEMENT_NODE : 1, ATTRIBUTE_NODE  : 2, TEXT_NODE : 3, CDATA_SECTION_NODE  : 4,
        ENTITY_REFERENCE_NODE  : 5, ENTITY_NODE  : 6, PROCESSING_INSTRUCTION_NODE : 7,
        COMMENT_NODE : 8, DOCUMENT_NODE : 9, DOCUMENT_TYPE_NODE : 10, DOCUMENT_FRAGMENT_NODE : 11,
        NOTATION_NODE  : 12, element : 1, attribute  : 2, text : 3, cdata  : 4,
        entity_reference  : 5, entityReference  : 5, entity  : 6, instruction : 7,
        comment : 8, document : 9, document_type : 10, documentType : 10,
        document_fragment : 11, documentFragment : 11, notation  : 12,
    }
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    function traverseDOM(root, nodeMap, onComplete){ //not async
        if(typeof nodeMap == 'function'){
            nodeMap = { 'element+text' : nodeMap }
        }
        if(!isNumber(Object.keys(nodeMap))){
            var transformedMap = {};
            Object.keys(nodeMap).forEach(function(key){
                var keys = key.split('+');
                keys.forEach(function(typeName){
                    transformedMap[nodeTypeMap[typeName]] = nodeMap[key];
                })
            });
            nodeMap = transformedMap;
        }
        if(Array.isArray(root)){ //so we can pass in the output of $.parseHTML
            var replace = function(target, replacement){
                var index = root.indexOf(target);
                if(index != -1) root.splice(index, 1, replacement);
            }
            root.forEach(function(node){
                console.log('@@@', node.nodeType);
                if(nodeMap[node.nodeType]) nodeMap[node.nodeType](node, replace);
                traverseDOM(node, nodeMap);
            });
        }else{
            Array.prototype.forEach.apply(root.childNodes, [function(child){
                if(nodeMap[child.nodeType]) nodeMap[child.nodeType](child, replace);
                traverseDOM(child, nodeMap);
            }])
        }
        if(onComplete) onComplete();
    }
    
    var between = function(dom, nodea, nodeb){
        var start = dom.children.indexOf(nodea);
        var stop = dom.children.indexOf(nodeb);
        if( !(nodea && nodeb)) throw new Error('node not a child of passed dom root');
        return dom.children.slice(start, stop);
    }
    
    var attrDebounces = {};
    
    var tool = {
        blocks : function(sentinel, dom){
            //todo: index?
            var blocks = [];
            blocks.push(document.createDocumentFragment());
            dom.children.forEach(function(node){
                var matches = (node.innerHTML || node.wholeText || node.data).match(sentinel);
                if(matches){
                    blocks.push(document.createDocumentFragment());
                }else{
                    blocks[blocks.length-1].appendChild(node);
                }
            });
            return blocks;
        },
        insertBlockAt : function(sentinel, dom, block, index){
            var blocks = tool.blocks(sentinel, dom);
            dom.insertBefore(block, blocks[index]);
            
        },
        removeBlockAt : function(sentinel, dom, index){
            var blocks = tool.blocks(sentinel, dom);
            dom.removeChild(blocks[index]);
            
        },
        attach : function(){
            throw new Error('you must override the attach function so dom-tool knows how to update using your models!');
        },
        uniqueID : function(){
            return Math.floor( Math.random() * 100000000 )+'';
        },
        live : function(options, dom, callback){
            var index = options.registry || {};
            var open = Array.isArray(options.sentinel)?options.sentinel[0]:options.sentinel;
            var close = Array.isArray(options.sentinel)?options.sentinel[1]:options.sentinel;
            traverseDOM(dom, {'comment':function(node, replace){
                //console.log('###########', node.outerHTML );
                var text = (tool.fragment(node).html() ||node.innerHTML || node.wholeText || node.data);
                var matches = text.match(open);
                if(matches){
                    var marker = text;
                    var element = tool.dom('<span></span>')[0];
                    var container = node.parentNode;
                    if(container && container.nodeType != 11)
                        container.replaceChild(element, node);
                    var id = text.substring(open.length, text.length - close.length);
                    var action;
                    switch(id[0]){
                        case '+' : 
                            id = id.substring(1);
                            action = function(item){
                                item.openEl =  element;
                                if(options.onOpenList) options.onOpenList(id, item, element);
                            };
                            break;
                        case '-' : 
                            id = id.substring(1);
                            action = function(item){
                                item.closeEl =  element;
                                if(options.onCloseList) options.onCloseList(item, element);
                                if(options.onList) options.onList(id, item, element);
                            };
                            break;
                        case '=' : 
                            id = id.substring(1);
                            action = function(item){
                                if(!item.spacerEls) item.spacerEls = [];
                                item.spacerEls.push(marker);
                                if(options.onListItem) options.onListItem(id, item, element);
                            };
                            break;
                        default:
                            action = function(item){
                                item.marker = marker;
                                item.element = element;
                                if(options.onValue) options.onValue(id, item, element);
                            };
                            break;
                            
                    }
                    if(!index[id]) index[id] = {};
                    if(options.emitter && !index[id].emitter) index[id].emitter = options.emitter;
                    if(!index[id].element) index[id].element = element;
                    if(!index[id].set) index[id].set = function(value){
                        element.innerHTML = value;
                    };
                    if(action) action(index[id]);
                }
            }});
            //console.log('[djvfjkfvj]');
            var filterFn = function(index, item){
                if(item && item.attributes) Array.prototype.forEach.call(item.attributes, function(attr, key){
                    if(attr.value.match('<!--'+open) != -1){
                        var id = item.id ||(item.id = tool.uniqueID());
                        var emitter = new Emitter();
                        /*index[id] = {
                            marker : marker,
                            attr : attr,
                            set : function(value){
                                //debounce all setters on this attr
                                //if(attrDebounces)
                            },
                            emitter : emitter
                        };*/
                    }
                })
            };
            var fragment = tool.fragment(dom);
            //console.log('vklvklv',  index);
            fragment.find('*').add(fragment).filter(filterFn);
            callback(index);
        }
    };
    return tool;
}));