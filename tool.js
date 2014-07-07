(function(root, factory){
    if (typeof define === 'function' && define.amd){
        define(['extended-emitter'], factory);
    }else if(typeof exports === 'object'){
        module.exports = factory(require('extended-emitter'));
    }else{
        root.LiveTemplates = factory(root.ExtendedEmitter);
    }
}(this, function(Emitter){
    
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
    
    function exchangeTextNodeChildOfFragmentForElement(textNode, element){
        var fragment = textNode.parentNode;
        var result = tool.fragment('');
        var len = textNode.parentNode.childNodes.length;
        var children = Array.prototype.slice.call(textNode.parentNode.childNodes);
        for(var lcv = 0; lcv < len; lcv++){
            var node = children[lcv];
            if(node === textNode){
                result.appendChild(element);
            }else result.appendChild(node);
        }
        return result;
    };
    
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
        setup : function(){
            if(tool.jQuery && !tool.select) tool.select = tool.jQuery;
            if(tool.jQuery && !tool.dom) tool.dom = tool.jQuery.parseHTML;
            
            if(tool.window && !tool.document) tool.document = tool.window.document;
            if(tool.window && !tool.fragment) tool.fragment = function(text){
                return tool.window.document.createDocumentFragment(text);
            }
            if(tool.window && !tool.element) tool.element = function(tagName){
                return tool.window.document.createElement(tagName);
            };
            delete tool.setup;
        },
        live : function(options, dom, callback){
            if(tool.setup) tool.setup();
            var index = options.registry || {};
            var open = Array.isArray(options.sentinel)?options.sentinel[0]:options.sentinel;
            var close = Array.isArray(options.sentinel)?options.sentinel[1]:options.sentinel;
            var fragment = dom;
            traverseDOM(dom, {
            'comment':function(node, replace){
                var text = (tool.select(node).html() || node.innerHTML || node.wholeText || node.data);
                var matches = text.match(open);
                if(matches){
                    var marker = text;
                    var element = tool.element('span');
                    var container = node.parentNode;
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
                            if(container){
                                if(container.nodeType == 11){
                                    fragment = exchangeTextNodeChildOfFragmentForElement(node, element);
                                    //console.log('replaced with '+element.innerHTML);
                                }else{
                                    container.replaceChild(element, node);
                                }
                            }
                            break;
                            
                    }
                    if(!index[id]) index[id] = {};
                    if(options.emitter && !index[id].emitter) index[id].emitter = options.emitter;
                    if(!index[id].element) index[id].element = element;
                    if(!index[id].set) index[id].set = function(value){
                        index[id].value = value;
                        element.innerHTML = value;
                    };
                    if(action) action(index[id]);
                }
            }});
            traverseDOM(dom, {
                'element':function(node, replace){
                    if(node && node.attributes) Array.prototype.forEach.call(node.attributes, function(attr, key){
                        if(attr.value.match('<!--'+open)){
                            attr.value.match( new RegExp('<!--'+open+'(.+?)'+close+'-->', 'g')).forEach(function(id){
                                id = id.substring('<!--'.length+open.length, id.length - (close.length+'-->'.length));
                                if(!index[id]) index[id] = {};
                                if(options.emitter && !index[id].emitter) index[id].emitter = options.emitter;
                                if(!index[id].element) index[id].element = node;
                                if(!index[id].attributeName) index[id].attributeName = attr.name;
                                var original;
                                if(!(original = index[id].element.getAttribute('data-'+attr.name+'-original'))){
                                    index[id].element.setAttribute('data-'+attr.name+'-original', attr.value);
                                    original = attr.value;
                                }
                                if(!index[id].pieces) index[id].pieces = original.split(
                                    new RegExp('<!--('+open+'.+?'+close+')-->', 'g')
                                ).map(function(string){
                                    return string; 
                                }).filter(function(string){
                                    return string !==''; 
                                });
                                if(!index[id].set) index[id].set = function(value){
                                    index[id].value = value;
                                    var newValue = '';
                                    index[id].pieces.forEach(function(piece){
                                        if(piece.substring(0, open.length) === open){
                                            var id = piece.substring(open.length, piece.length - close.length);
                                            newValue += (index[id] && index[id].value) || '';
                                        }else newValue += piece;
                                    });
                                    index[id].element.setAttribute(index[id].attributeName, newValue);
                                };
                                if(options.onAttribute) options.onAttribute(id, index[id], node);
                            });
                        }
                    });
                }
            });
            function attrs(node){
                var attributes = node.attributes;
                if(!attributes.length) return '';
                var result = ' ';
                Object.keys(attributes).forEach(function(field){
                    //jsdom is fucking stupid trash
                    if(
                        field[0] == '_' || 
                        field == 'length' || 
                        ( !isNaN(parseFloat(field)) && isFinite(field) )) 
                            return;
                    result += field+'="'+node.getAttribute(field)+'" ';
                });
                return result;
            }
            if(!fragment.html) fragment.html = function(){
                var fragment = this;
                if(fragment.nodeType != 11) return fragment.outerHTML || fragment.innerHTML || fragment.wholeText || fragment.data;
                var html = '';
                var node;
                for(var lcv = 0; lcv < fragment.childNodes.length; lcv++){
                    var node = fragment.childNodes[lcv];
                    var val = node.tagName ?
                        (
                            node.childNodes.length ?
                            '<'+node.tagName.toLowerCase()+attrs(node)+'>'+
                                node.innerHTML+
                                '</'+node.tagName.toLowerCase()+'>':
                            '<'+node.tagName.toLowerCase()+attrs(node)+'/>'
                        ):
                        (
                            fragment.childNodes[lcv].outerHTML || 
                            fragment.childNodes[lcv].innerHTML || 
                            fragment.childNodes[lcv].wholeText || 
                            fragment.childNodes[lcv].data
                        );
                    html += val;
                }
                return html;
            }
            callback(index, fragment);
        }
    };
    return tool;
}));