(function(root, factory){
    if (typeof define === 'function' && define.amd){
        define(['extended-emitter', 'async-arrays'], factory);
    }else if(typeof exports === 'object'){
        module.exports = factory(require('extended-emitter'), require('async-arrays'));
    }else{
        root.DomTool = factory(root.ExtendedEmitter, root.AsyncArray);
    }
}(this, function(Emitter, AsyncArray){
    //enforce no globals
    var window = {};
    var document = {};
    
    
    function exchangeTextNodeChildOfFragmentForElement(textNode, element){
        var fragment = textNode.parentNode;
        var result = this.fragment('');
        var len = textNode.parentNode.childNodes.length;
        var children = Array.prototype.slice.call(textNode.parentNode.childNodes);
        for(var lcv = 0; lcv < len; lcv++){ //todo: use docfrag instead
            var node = children[lcv];
            if(node === textNode){
                result.appendChild(element);
            }else result.appendChild(node);
        }
        return result;
    };
    function DomTool(){
        this.listeners = [];
    }
    
    DomTool.prototype.bond = function(instance, type){
        if(!type) type = 'native';
        if(instance.$) type = 'jquery';
        this.element = function(tagName){
            return instance.document.createElement(data);
        };
        this.text = function(elementInDOM, element){
            return instance.document.createTextNode(data);
        };
        this.comment = function(elementInDOM, element){
            
        };
        switch(type){
            case 'native':
                this.replace = function(elementInDOM, element){
                    
                };
                this.element = function(type, document){
                    return (document || instance.document).createElement(type);
                };
                this.text = function(value, document){
                    return (document || instance.document).createTextNode(value);
                };
                this.select = function(selector, root){ //
                    var res = instance.document.QuerySelector(context, root);
                    if(res.length == 1) return res[0];
                    else return res;
                };
                this.document = function(text){ //
                    var tmp = instance.document.implementation.createHTMLDocument();
                    tmp.body.innerHTML = text;
                    return tmp;
                };
                this.html = function(text){ //
                    var tmp = instance.document.implementation.createHTMLDocument();
                    if(text) tmp.body.innerHTML = text;
                    return tmp.body.childNodes;
                };
                this.fragment = function(text){ //
                    //todo: handle non-text
                    return tool.window.document.createDocumentFragment(text);
                };
                
                break;
            case 'jquery':
                this.replace = function(elementInDOM, element){
                    
                };
                this.element = function(type, document){
                    return (document || instance.document).createElement(type);
                };
                this.text = function(value, document){
                    return (document || instance.document).createTextNode(value);
                };
                this.select = function(selector, root){
                    var result = instance.$(selector, root);
                    //just in case
                    if(!result.forEach) result.forEach = function(handler){
                        result.each(function(index, item){
                            handler(item, index);
                        })
                    };
                    return result;
                };
                function fixBrokenJSDOMCreate(doc){
                    if(!doc.body){
                        var body = instance.$('body', doc)[0];
                        doc.body = body; //yay, buggy jsdom fun!
                    }
                }
                this.document = function(text){ //
                    var tmp = instance.document.implementation.createHTMLDocument();
                    fixBrokenJSDOMCreate(tmp);
                    tmp.body.innerHTML = text;
                    return tmp;
                };
                this.html = function(text){ //
                    var tmp = instance.document.implementation.createHTMLDocument();
                    fixBrokenJSDOMCreate(tmp);
                    if(text) tmp.body.innerHTML = text;
                    return tmp.body.childNodes;
                };
                this.fragment = function(text){ //
                    //todo: handle non-text
                    return instance.document.createDocumentFragment(text);
                };
                break;
            /*case 'bruiser':
                break;
            case 'phantom?':
                break;*/
        }
    };
    
    DomTool.prototype.profile = function(root, indent){ //
        
    };
    DomTool.prototype.cast = function(value, type){
        return (new Wrap(value)).as(type);
    };
    DomTool.prototype.between = function(nodea, nodeb){
        var root = nodea.parentNode.childNodes;
        var start = Array.prototype.indexOf.apply(root, [nodea]);
        var stop = nodeb?Array.prototype.indexOf.apply(root, [nodeb]):undefined;
        if( !(start !=-1)) throw new Error('node not a child of passed dom root');
        return Array.prototype.slice.apply(root, [start+1, stop]); // exclude the start sentinel
    };
    DomTool.prototype.insertBlockAt = function(sentinel, dom, block, index){
        var blocks = this.blocks(sentinel, dom);
        dom.insertBefore(block, blocks[index]);
        
    };
    DomTool.prototype.removeBlockAt = function(sentinel, dom, index){
        var blocks = this.blocks(sentinel, dom);
        dom.removeChild(blocks[index]);
        
    };
    DomTool.prototype.transform = function(node, options, callback, tracer){
        //if(!tracer) throw new Error();
        if(typeof options == 'function' && !callback){
            callback = options;
            options = {};
        }
        var ob = this;
        this.examine(node, options, function(err, tracer){
            var target = node.childNodes;
            if(
                node instanceof HTMLCollection ||
                node instanceof NodeList ||
                Array.isArray(node)
            ){
                target = node;
            }
            if(target && target.length){
                //todo:pick up attributes
                var whenDoneWithChildren = function(){
                    callback(undefined, tracer?tracer.subtrace():undefined);
                };
                var done = {};
                if(options.attributes && node.attributes){
                    whenDoneWithChildren = function(){
                        if(done.kids && done.attributes){
                            if(tracer) tracer.bond();
                            callback();
                        }
                    };
                    var attrNames;
                    if(typeof exports === 'object'){
                        attrNames = Object.keys(node.attributes).filter(function(item){
                            //in node we have all sorts of extras on the object, clean it
                            return (!isNumeric(item)) && (item[0] != '_') && (item != 'length');
                        });
                    }else{
                        var attrNames = Object.keys(node.attributes).filter(function(item){
                            return (item != 'length');
                        });
                    }
                    if(tracer) tracer.bond();
                    AsyncArray.forEachEmission(attrNames, function(name, index, complete){
                        ob.examine(node.attributes[name], options, function(){
                            complete();
                        }, tracer?tracer.subtrace():undefined);
                    }, function(){
                        done.attributes = true;
                        whenDoneWithChildren();
                    });
                }
                //pick up the kids
                AsyncArray.forEachEmission(target, function(child, index, complete){
                    ob.transform(child, options, complete, tracer?tracer.subtrace():undefined);
                }, function(){
                    done.kids = true;
                    whenDoneWithChildren();
                });
            }else{
                if(node.attributes){
                    var attrNames;
                    if(typeof exports === 'object'){
                        attrNames = Object.keys(node.attributes).filter(function(item){
                            //in node we have all sorts of extras on the object, clean it
                            return (!isNumeric(item)) && (item[0] != '_') && (item != 'length');
                        });
                    }else{
                        var attrNames = Object.keys(node.attributes).filter(function(item){
                            return (item != 'length');
                        });
                    }
                    if(tracer) tracer.bond();
                    AsyncArray.forEachEmission(attrNames, function(name, index, complete){
                        ob.examine(node.attributes[name], options, function(){
                            complete();
                        }, tracer?tracer.subtrace():undefined);
                    }, function(){
                        callback(undefined, tracer);
                    });
                }else callback(undefined, tracer);
            }
        }, tracer);
    };
    DomTool.prototype.traverse = DomTool.prototype.transform; // switch to more general name
    DomTool.prototype.lookFor = function(context, action){ //action executes in 'this' context
        this.listeners.push({
            context : context,
            action : action
        });
    };
    //ex: dom.lookFor({nodeType:name, regex:regx}, fn); can use: selector, nodeType, regex
    DomTool.prototype.examine = function(node, options, callback, tracer){
        var parentTrace = new Error().stack.split("\n");
        AsyncArray.forEachEmission(this.listeners, function(listener, index, complete){
            var postAction = function(){ /*console.log('NOOP post action');*/ }; //noop
            var selected = true;
            if(listener.context.nodeType && selected !== false){
                if(isNumeric(listener.context.nodeType)){
                    if(node.nodeType !== parseInt(listener.context.nodeType)) selected = false;
                }else{
                    if(nodeTypeName(node.nodeType) !== listener.context.nodeType)  selected = false;
                }
            }
            var matches;
            if(listener.context.regex){
                if(typeof listener.context.regex == 'string')
                    listener.context.regex = new RegExp(listener.context.regex, 'g');
                var value = node.innerHTML || node.value || node.textContent || node.nodeValue;
                if(!value){
                    selected = false;
                }else{
                    if(value.toString) value = value.toString();
                    matches = value.match(listener.context.regex);
                    //console.log('testing', value, 'against', listener.context.regex, ':', !!matches);
                    if(!matches) selected = false;
                }
            }
            if(listener.context.having){
                //todo: sift selector
            }
            if(listener.context.selector){
                //todo: css-style selector
            }
            if(!listener.action.length != 2 ) complete();
            else postAction = function(){
                complete(undefined, tracer);
            };
            //todo: handle undefined (no context)
            if(selected){
                //console.log(listener.action.toString());
                listener.action(node, options, postAction, tracer);
            }else postAction();
        }, function(){
            callback(undefined, tracer);
        });
        //callback();
    };
    DomTool.prototype.blocks = function(sentinel, dom){
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
    };
    
    function oneOrMany(list){
        if(list.length === 1){
            return list[0];
        }
        return list;
    }
    
    var escapeRegEx = function(string) {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    };
    
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    
    function Wrap(value){
        this.value = value;
    }
    
    Wrap.prototype.as = function(outbound){
        var type = (typeof this.value).toLowerCase();
        if(Array.isArray(this.value)) type = 'array';
        if(type === outbound) return this.value;
        if(!cast[type]) throw new Error('Cannot cast from type: '+type);
        if(!cast[type][outbound]) throw new Error('Cannot cast to type: '+outbound);
        else return cast[type][outbound](this.value);
    }
    
    /*var stacks = {};
    Live.uniqueStacks = function(id){
        if(!id) return stacks;
        if(!stacks[id]) stacks[id] = [];
        var stack = (new Error()).stack.split("\n");
        var error = stack.shift();
        stack.shift(); //this call context
        stack.shift(); //parent call context (call *to* this FN);
        var stack = stack.join("\n");
        if(stacks[id].indexOf(stack) !== -1) stacks[id].push(stack);
    }*/
    //todo: uniqueStacks
    DomTool.Tracer = function(stack){ //todo: fusion stack.. trim to common roots (rather than each context's full stack)
        if(!stack){
            this.stack = (new Error()).stack.split("\n");
            this.error = this.stack.shift();
            this.stack.shift(); //this call context
            this.stack.shift(); //parent call context (call *to* this FN);
        }else{
            this.stack = stack;
        }
    }
    
    DomTool.Tracer.prototype.stacktrace = function(){
        return this.error+"\n"+this.stack.join("\n")+"\n";
    }
    
    DomTool.Tracer.prototype.trap = function(block){
        try{
            block();
        }catch(ex){
                this.bond(ex);
            ex.stack = this.stacktrace()
            if(this.trapper) this.trapper(ex);
            else throw ex;
        }
    }
    
    DomTool.Tracer.prototype.subtrace = function(){
        return new DomTool.Tracer(this.stack.slice(0))
    }
    
    DomTool.Tracer.prototype.bond = function(error){
        if(!error) error = new Error();
        var stack = error.stack.split("\n");
        this.error = stack.shift();
        stack.shift(); //this call context
        //stack.shift(); //parent call context (call *to* this FN);
        stack.push('[Execution Context]====================================================');
        this.stack.forEach(function(line){
            stack.push(line);
        })
        this.stack = stack;
        return this;
    }
    
    /******************* TYPE CASTING *********************/
    var cast = {
        htmlcollection : {
            nodelist : function(value){
                return tool.fragment(value).childNodes;
            },
            array : function(value){
                return Array.prototype.slice(value);
            },
            element : function(value){
                return value[0]
            }
        },
        nodelist : {
            htmlcollection : function(value){ //possibly passthru?
                return tool.fragment(value).children;
            },
            array : function(value){
                return Array.prototype.slice(value);
            },
            element : function(value){
                return value[0]
            }
        },
        array : {
            nodelist : function(value){
                return tool.fragment(value).childNodes;
            },
            htmlcollection : function(value){ //possibly passthru?
                return tool.fragment(value).children;
            },
            element : function(value){
                return value[0]
            }
        },
        element : {
            nodelist : function(value){
                return tool.fragment(value).childNodes;
            },
            array : function(value){
                return Array.prototype.slice(value);
            },
            htmlcollection : function(value){ //possibly passthru?
                return tool.fragment(value).children;
            }
        }
    };
    
    /********************* Node-Type mappings ********************/
    var nodeTypeMap = {
        ELEMENT_NODE : 1, ATTRIBUTE_NODE  : 2, TEXT_NODE : 3, CDATA_SECTION_NODE  : 4,
        ENTITY_REFERENCE_NODE  : 5, ENTITY_NODE  : 6, PROCESSING_INSTRUCTION_NODE : 7,
        COMMENT_NODE : 8, DOCUMENT_NODE : 9, DOCUMENT_TYPE_NODE : 10, DOCUMENT_FRAGMENT_NODE : 11,
        NOTATION_NODE  : 12, element : 1, attribute  : 2, text : 3, cdata  : 4,
        entity_reference  : 5, entityReference  : 5, entity  : 6, instruction : 7,
        comment : 8, document : 9, document_type : 10, documentType : 10,
        document_fragment : 11, documentFragment : 11, notation  : 12,
    }
    
    var nodeMap; //inverted mapping
    
    function nodeType(name){
        return nodeTypeMap[name]
    }
    
    function nodeTypeName(value){
        if(!nodeMap){
            var transformedMap = {};
            Object.keys(nodeTypeMap).forEach(function(key){
                transformedMap[nodeTypeMap[key]] = key;
            });
            nodeMap = transformedMap;
        }
        return nodeMap[value];
    }
    var tool = new DomTool();
    tool.Tool = DomTool;
    return tool;
}));