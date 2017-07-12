/*
 *jsonQ.js v 1.1.0
 *Author: Sudhanshu Yadav
 *s-yadav.github.com
 *Copyright (c) 2013 - 2016 Sudhanshu Yadav.
 *MIT licenses
 */
//initialize jsonQ
;(function(factory) {
    /** support UMD ***/
    var global = Function('return this')() || (42, eval)('this');
    if (typeof define === "function" && define.amd) {
        define(["jsonq"], function($) {
            return (global.jsonQ = factory());
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();

    } else {
        global.jsonQ = factory();
    }
}(function(undefined) {

    var jsonQ = function(json) {
        //return a jsonQ object
        return new jsonQ.fn.init(json);
    },
        //plugin variable and methods
        error = function(msg) {
            throw msg;
        },
        stringify = JSON.stringify,
        parse = JSON.parse;

    //global settings
    jsonQ.settings = {
        sort: {
            "order": "ASC",
            "logic": function(val) {
                return val;
            },
            "caseIgnore": true,
            "allLevel": true //to sort all level if true and if false only lowest level
        }
    };

    /*****private functions for internal use only*******/

    //to check weather path b is subset of path a
    function matchPath(a, b) {
        var regex = new RegExp('^' + a.join('~~'), 'i');
        return regex.test(b.join('~~'));
    }

    //function to create new format
    function newFormat(option) {
        //parameter change
        var keyAdded = option.keyAdded || [],
            json = option.json,
            path = option.path,
            newJson = option.newJson;
        //add to new json

        jsonQ.each(json, function(k, val) {
            var lvlpath = path ? JSON.parse(JSON.stringify(path)) : [];
            lvlpath.push(k);

            //to add a new direct access for each key in json so we get the path of that key easily
            if (objType(json) == 'object') {
                if (keyAdded.indexOf(k) == -1) {
                    keyAdded.push(k);
                    newJson.jsonQ_path[k] = [];
                }

                newJson.jsonQ_path[k].push({
                    path: lvlpath
                });
            }
            //if value is json or array go to further level
            var type = objType(val);
            if (type == 'object' || type == 'array') {
                newFormat({
                    'json': val,
                    'newJson': newJson,
                    'path': lvlpath,
                    'keyAdded': keyAdded
                });
            }


        });

        return newJson;
    }

    //traverse functions
    var tFunc = {
        //search on top level
        topLevel: function(option) {
            var current = this.jsonQ_current,
                newObj = this.cloneObj(jsonQ()),
                newCurrent = newObj.jsonQ_current = [],
                prevPathStr = '',
                key = option.key,
                method = option.method;

            for (var i = 0, ln = current.length; i < ln; i++) {
                var pathC = current[i].path,
                    pathStr,
                    outofBound = false,
                    parPath = pathC.concat([]);

                //to run callback to apply top traverse logic
                if (method == 'parent') {
                    if (parPath.length === 0) {
                        outofBound = true;
                    } else {
                        parPath.pop();
                    }
                } else {
                    var keyIndex = parPath.lastIndexOf(key);
                    if (keyIndex == -1) {
                        outofBound = true;
                    } else {
                        parPath = parPath.slice(0, keyIndex + 1);
                    }
                }

                pathStr = JSON.stringify(parPath);

                if (prevPathStr != pathStr && !outofBound) {
                    newCurrent.push({
                        path: parPath
                    });
                }

                prevPathStr = pathStr;
            }

            //set other defination variables
            newObj.length = newCurrent.length;
            //to add selector
            newObj.selector.push({
                method: method,
                key: key
            });

            return newObj;
        },
        //travese which have qualifiers mainly on bottom and sibling method
        qualTrv: function(option) {
            var current = this.jsonQ_current,
                newObj = this.cloneObj(jsonQ()),
                newCurrent = newObj.jsonQ_current = [],
                pathObj = this.jsonQ_path,

                //key element (an array of paths with following key)
                key = option.key,
                //dont work with original object clone it and if undefined than make as empty array
                elm = jsonQ.clone(pathObj[key]) || [],
                //qualifier
                qualifier = option.qualifier,
                qType = objType(qualifier),
                //travese method
                method = option.method,
                find = method == "find" ? true : false;

            for (var i = 0, ln = current.length; i < ln; i++) {
                var pathC = current[i].path,
                    pathCTemp = [],
                    found = false;


                if (!find) {
                    //if it is top level continue the loop. This case comes when we do sibling method called on initial object
                    if (pathC.length === 0) {
                        continue;
                    }

                    pathCTemp = pathC.concat([]);
                    pathCTemp.pop();
                }

                //make a loop on element to match the current path and element path
                for (var j = 0; j < elm.length; j++) {
                    var pathE = elm[j].path,
                        condition;
                    if (find) {
                        condition = matchPath(pathC, pathE);
                    } else {
                        var pathETemp = pathE.concat([]);
                        //to pop last element
                        pathETemp.pop();
                        condition = pathCTemp.join() == pathETemp.join();
                    }

                    if (condition) {
                        //code to check qualifier need to be written this on is only when quantifier when it is function in other case it will be applied on last

                        var qTest = tFunc.qTest.call(this, qType, qualifier, pathE, newCurrent);

                        if (qTest) {
                            //to remove element which is already added
                            elm.splice(j, 1);
                            j--;
                        }

                        //make found flag true
                        found = true;
                    }
                    //break if path doesent match in next sequence and for one element is already there.
                    else if (found) {
                        break;
                    }
                }
            }

            //to apply qualifier if it is string . its mainly for array kind of qualifier
            if (qType == "string") {
                newObj = this.filter.call(newObj, qualifier);
            }

            //set other defination variables
            newObj.length = newObj.jsonQ_current.length;

            //to add selector
            newObj.selector.push({
                method: method,
                key: key,
                qualifier: qualifier
            });


            return newObj;
        },
        qTest: function(qType, qualifier, path, array) {
            var qTest = qType == 'function' ? qualifier.call(this.pathValue(path)) : qType == 'object' ? jsonQ.checkKeyValue(this.pathValue(path), qualifier) : true;

            //if it is key value pair than also we can check here.
            if (qTest) {
                array.push({
                    path: path
                });
            }
            return qTest;
        }

    };

    //functions involved on sorting
    var sortFunc = {
        baseConv: function(type, val, settings) {
            if (type == 'string') {
                if (settings.caseIgnore) {
                    return val.toLowerCase();
                }
            } else if (type == 'array') {
                return val.join();
            } else if (type == 'object') {
                return stringify(jsonQ.order(val));
            }

            return val;
        },
        sortAry: function(array, logic, settings) {
            array.sort(function(a, b) {
                var compA = logic(a);
                var compB = logic(b);
                return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
            });

            //to display on decending order
            if (settings.order.toLowerCase() == "desc") {
                array.reverse();
            }
            return array;
        }
    };

    jsonQ.fn = jsonQ.prototype = {
        init: function(json) {
            var type;

            //to return if no parameter is passed

            if (!json) return this;

            type = objType(json);
            if (type == 'string') {
                try {
                    json = JSON.parse(json);
                } catch (e) {
                    error('Not a valid json string.');
                }
            } else if (type != 'object' && type != 'array') {
                error('Not a valid json object.');
                return json;
            }

            //to set initial values
            this.jsonQ_root = json;
            this.jsonQ_path = {};
            this.jsonQ_current = [{
                path: []
            }];

            //to get other keys
            newFormat({
                json: json,
                newJson: this,
                refresh: true
            });

            //set jsonQ defination variables
            this.length = this.jsonQ_current.length;
            this.selector = [];

            return this;

        },

        //to get value at specific path from root
        pathValue: function(path) {
            return jsonQ.pathValue(this.jsonQ_root, path);
        },
        setPathValue: function(path, value) {
            jsonQ.setPathValue(this.jsonQ_root, path, value);
            return this;
        },
        clone: function() {
            return parse(stringify(this.jsonQ_current));
        },
        cloneObj: function(newObj) {
            var obj = this;

            newObj = newObj || {};

            jsonQ.each(obj, function(k, v) {
                newObj[k] = v;
            });

            //to make a different copy of selector otherwise selector will be same on all object.
            newObj.selector = jsonQ.merge([], newObj.selector);

            return newObj;
        },
        value: function(value, clone) {
            var json = this.jsonQ_current;


            clone = clone === false ? false : true;

            //to return value if called as getter (ie value is undefined)
            if (!value) {
                var newArray = [];
                //create a new set of values
                this.each(function(idx, path, val) {
                    newArray.push(val);
                });

                return newArray;
            }
            //value as setter. value can be the exact value which you want to set or can be a callback. In callback pathvalue will be first argument.
            else {
                var type = objType(value);
                for (var i = 0, ln = json.length; i < ln; i++) {
                    var path = json[i].path,
                        val;
                    if (type == 'function') {
                        var prevVal = this.pathValue(path);
                        val = clone ? jsonQ.clone(value(prevVal)) : value(prevVal);
                    } else {
                        val = clone ? jsonQ.clone(value) : value;
                    }
                    //to set value on json
                    this.setPathValue(path, val);
                }

                return this;
            }

        },
        //clone parameter is for if you want to append any object so append exact object or create clone of object and append
        //to append in last of values of current
        append: function(valObj, clone) {
            return this.appendAt("last", valObj, clone);
        },
        //to append in first of values of current
        prepend: function(valObj, clone) {
            return this.appendAt("first", valObj, clone);
        },
        //to append at specific index of values of current
        appendAt: function(index, valObj, clone) {
            var current = this.jsonQ_current;
            //return if incorrect index is given
            if (isNaN(index) && index != "first" && index != "last") {
                error(index + 'is not a valid index.');
                return this;
            }

            for (var i = 0, ln = current.length; i < ln; i++) {
                var pathC = current[i].path.concat([]),
                    lastKey = pathC.pop(),
                    parRef = this.pathValue(pathC),
                    type = objType(parRef[lastKey]),
                    objLn = parRef[lastKey].length;


                //to limit index
                var idx = index < 0 || index == "first" ? 0 : index > objLn || index == "last" ? objLn : index;


                //if array push
                if (type == 'array') {
                    valObj = clone ? jsonQ.clone(valObj) : valObj;

                    parRef[lastKey].splice(idx, 0, valObj);
                }

                //if string concatinate , if number add
                else if (type == 'string') {
                    var str = parRef[lastKey];
                    parRef[lastKey] = str.substring(0, idx) + valObj + str.substring(idx, objLn);
                }


            }
            return this;

        },
        filter: function(qualifier) {
            var current = this.jsonQ_current,
                newObj = this.cloneObj(jsonQ()),
                newCurrent = newObj.jsonQ_current = [],
                qType = objType(qualifier);

            if (!qualifier) return this;

            for (var i = 0, ln = current.length; i < ln; i++) {
                var pathC = current[i].path;

                //code to check qualifier need to be written this on is only when quantifier when it is function or json in other case it will be applied on last
                tFunc.qTest.call(this, qType, qualifier, pathC, newCurrent);
            }

            //to apply qualifier if it is string . its mainly for array kind of qualifier
            if (qType == 'string') {
                //to check string for nth and eq
                var regex = /(nth|eq)\((.+)\)/,
                    matched = regex.exec(qualifier);
                if (matched) {
                    newCurrent = jsonQ.nthElm(current, matched[2], true);
                } else {
                    newCurrent = jsonQ.nthElm(current, qualifier, true);
                }
                //to store it back on newObj
                newObj.jsonQ_current = newCurrent;
            }

            //set other defination variables
            newObj.length = newCurrent.length;

            //to add selector
            newObj.selector.push({
                method: 'filter',
                qualifier: qualifier
            });

            return newObj;

        },
        //first argument is key in which you want to search, second key is qualifier of it.
        find: function(key, qualifier) {
            return tFunc.qualTrv.call(this, {
                method: "find",
                key: key,
                qualifier: qualifier
            });
        },
        sibling: function(key, qualifier) {
            return tFunc.qualTrv.call(this, {
                method: "sibling",
                key: key,
                qualifier: qualifier
            });
        },
        parent: function() {
            return tFunc.topLevel.call(this, {
                method: "parent"
            });
        },
        closest: function(key) {
            return tFunc.topLevel.call(this, {
                method: "closest",
                key: key
            });
        },
        //return path of first element found through selector
        path: function() {
            return this.jsonQ_current[0].path;
        },
        //some time we can only return the value of the first element in current
        firstElm: function() {
            return this.pathValue(this.jsonQ_current[0].path);
        },
        lastElm: function() {
            return this.pathValue(this.jsonQ_current[this.length - 1].path);
        },
        nthElm: function(pattern, arrayReturn) {
            return jsonQ.nthElm(this.value(), pattern, arrayReturn);
        },
        index: function(elm, isQualifier) {
            return jsonQ.index(this.value(), elm, isQualifier);
        },
        createXML: function() {
            return jsonQ.createXML(this.value());
        },


        //function to sort array objects
        sort: function(key, settings) {
            //merge global setting with local setting
            settings = jsonQ.merge({}, jsonQ.settings.sort, settings);
            var jobj = this.find(key),
                current = jobj.clone(),
                sortStack = [],
                i, ln,
                sortedPath = [],
                type = objType(jobj.pathValue(current[0].path)),
                //function to get value which is an array from pathKey traversing from right.
                getClosestArray = function(key) {
                    while (key.length !== 0) {
                        var lastKey = key.pop();
                        if (!isNaN(lastKey)) {
                            var val = jobj.pathValue(key);
                            if (objType(val) == 'array') {
                                return val;
                            }
                        }
                    }
                    return null;
                };

            //initialize sort stack
            for (i = 0, ln = current.length; i < ln; i++) {
                sortStack.push({
                    pathHolder: current[i].path.concat([]),
                    current: current[i].path.concat([])
                });
            }

            //to run the loop untill all ar sorted
            var alpha = 0,

                // function to remove element if sorting is done for that path
                spliceElm = function(i) {
                    sortStack.splice(i, 1);
                    return --i;
                };
            while (sortStack.length !== 0) {
                alpha++;
                for (i = 0; i < sortStack.length; i++) {
                    var cur = sortStack[i].current,
                        pH = sortStack[i].pathHolder,
                        //to get the closest array in the current path. This will also change value of current path variable.
                        ary = getClosestArray(cur),
                        pathStr = cur.join();



                    //to remove from sort stack if no array is left on key or if that is already sorted
                    if (cur.length === 0 || sortedPath.indexOf(pathStr) != -1) {
                        i = spliceElm(i);
                    }

                    //to sort if array found
                    else {
                        //logic path is path which we add in on condition to find the element value according to which we are sorting
                        var logicPath = pH.slice(cur.length + 1, pH.length),

                            logic = function(a) {
                                var val = jsonQ.pathValue(a, logicPath);

                                //to convert val to be compared
                                val = sortFunc.baseConv(type, val, settings);
                                return settings.logic(val);
                            };

                        //to sort the root json
                        sortFunc.sortAry(ary, logic, settings);

                        //if multilevel sort is true
                        if (settings.allLevel) {
                            //to maintain the path which is already sorted and change pathHolder to point first element of sorted array
                            pH[cur.length] = 0;
                            sortedPath.push(pathStr);
                        } else {
                            //remove sorted path
                            i = spliceElm(i);
                        }
                    }



                }
            }


            return jsonQ(jobj.jsonQ_root).find(key);
        },
        //to make loop on current
        each: function(callback) {
            var current = this.jsonQ_current;
            for (var i = 0, ln = current.length; i < ln; i++) {
                callback(i, current[i].path, this.pathValue(current[i].path));
            }
            return this;
        },
        //to return unique value of current
        unique: function() {
            return jsonQ.unique(this.value());
        },
        refresh: function() {
            var selector = this.selector;

            var jObj = jsonQ(this.jsonQ_root);
            for (var i = 0, ln = selector.length; i < ln; i++) {
                var curSel = selector[i],
                    args = [];

                if (curSel.key) args.push(curSel.key);
                if (curSel.qualifier) args.push(curSel.qualifier);

                jObj = jObj[curSel.method].apply(jObj, args);
            }

            //to store value back on this
            this.cloneObj.call(jObj, this);

            return this;
        },
        prettify: function(htmlReturn) {
            return jsonQ.prettify(this.value(), htmlReturn);
        }
    };

    //super exposed functions
    //jsonQ each
    jsonQ.each = function(json, callback) {
        for (var key in json) {
            if (json.hasOwnProperty(key)) {
                callback(key, json[key]);
            }
        }
    };

    //to find object type of any object
    var objType = jsonQ.objType = (function() {
        var map = {
            '[object Array]': 'array',
            '[object Object]': 'object',
            '[object String]': 'string',
            '[object Number]': 'number',
            '[object Boolean]': 'boolean',
            '[object Null]': 'null',
            '[object Function]': 'function'
        };

        return function(obj) {
            var type = Object.prototype.toString.call(obj);
            return map[type];
        };
    }());

    //to merge all the objects in argument to the first argument.
    //idea taken by jquery extend.

    //deep parameter is required if a person want to merge a json in all level recursively
    jsonQ.merge = function() {
        var arg = arguments,
            deepType = objType(arg[0]),
            i = 1,
            ln = arg.length,
            deep = false,
            target = arg[0];
        if (ln === 0 || (deepType == "boolean" && ln == 1)) {
            return;
        }
        //to get the target object where all merge will be done
        if (deepType == "boolean") {
            target = arg[1];
            i = 2;
            deep = arg[0];
        }

        //callback function to recursiveliy merge
        var eachCallback = function(k, v) {
            var type = objType(v),
                tarType = objType(target[k]);

            if (deep && (type == "array" || type == "object")) {
                target[k] = type == tarType && (tarType == "array" || tarType == "object") ? target[k] : type == "array" ? [] : {};

                //to merge recursively
                jsonQ.merge(deep, target[k], v);
            } else {
                target[k] = v;
            }
        };

        for (; i < ln; i++) {

            jsonQ.each(arg[i], eachCallback);
        }
        return target;
    };

    jsonQ.merge(jsonQ, {
        sort: function(ary, settings) {
            settings = jsonQ.merge({}, jsonQ.settings.sort, settings);

            if (objType(ary) != 'array') {
                error('Only array is allowed to sort');
                return;
            }

            var convLogic = function(val) {

                var type = objType(val);
                val = sortFunc.baseConv(type, val, settings);

                return settings.logic(val);
            };

            //to return sorted array
            return sortFunc.sortAry(ary, convLogic, settings);
        },
        order: function(json) {

            //to return if json type is not an object type
            if (typeof json != 'object') {
                return json;
            }

            var logic = function(val) {
                //if a json is an array alike and keys are numbers as string type ("1","2" instad of 1,2) convert them to integer.
                if (!isNaN(val)) val = parseInt(val);
                return val;
            },

                func = function(jsonVal) {
                    var jsonType = objType(jsonVal),
                        keys = Object.keys(jsonVal);

                    if (jsonType == 'object') {
                        keys.sort(function(a, b) {
                            var compA = logic(a);
                            var compB = logic(b);
                            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
                        });
                    }
                    //to order
                    for (var i = 0, ln = keys.length; i < ln; i++) {
                        var key = keys[i],
                            val = jsonVal[key],
                            type = objType(val);

                        //to go to next level if value is json type
                        if (type == 'object' || type == "array") {
                            func(val);
                        }

                        //to order
                        if (jsonType == 'object') {
                            delete jsonVal[key];
                            jsonVal[key] = val;
                        }
                    }
                };

            //initialize
            func(json);

            return json;
        },
        clone: function(json) {
            var type = objType(json);
            return type == 'object' || type == 'array' ? parse(stringify(json)) : json;
        },
        //to find index of an element in set of element
        index: function(list, elm, isQualifier) {
            var type = objType(elm),
                ln = list.length,
                //check that elm is a object or not that is taken by refrence
                refObj = type == "object" || type == "array" || type == "function" ? true : false;


            //if elm is a function consider it as a qualifier
            if (type == "function") {
                isQualifier = true;
            }

            if (refObj && !isQualifier) {
                //convert object to string so that they can be compared.
                var jsonStr = stringify(jsonQ.order(elm));
            }

            for (var i = 0; i < ln; i++) {
                var cur = list[i];
                if (refObj) {
                    var lType = objType(cur);
                    if (lType != type && !isQualifier) continue;

                    //to compare
                    if (!isQualifier) {
                        if (stringify(jsonQ.order(cur)) == jsonStr) {
                            return i;
                        }

                        //if element is a qualifier
                    } else {
                        var test;
                        if (type == 'function') {
                            test = elm.call(cur);
                        } else if (type == "object" && lType == "object") {
                            test = jsonQ.checkKeyValue(cur, elm);
                        } else if (lType == "array") {
                            if (type == "array") {
                                for (var j = 0, elmLn = elm.length; j < elmLn; j++) {
                                    test = jsonQ.index(cur, elm[j]) != -1;
                                    if (!test) break;
                                }
                            } else {
                                test = jsonQ.index(cur, elm) != -1;
                            }
                        }

                        //return index if it passes the test
                        if (test) return i;

                    }

                } else if (elm == cur) {
                    return i;
                }
            }
            return -1;
        },
        //to check an array contains a specfic element or not . an element can be aaray or json.
        contains: function(array, elm, isQualifier) {
            return jsonQ.index(array, elm, isQualifier) != -1;
        },
        //function to check an json object contains a set of key value pair or not
        checkKeyValue: function(json, keyVal) {
            for (var k in keyVal) {
                if (keyVal.hasOwnProperty(k))
                    if (!jsonQ.identical(keyVal[k], json[k])) return false;
            }
            return true;
        },

        nthElm: function(array, arg, aryRetrn) {
            var result;
            if (array[arg]) {
                result = array[arg];
            } else if (arg == 'last') {
                result = array[array.length - 1];
            } else if (arg == 'first') {
                result = array[0];
            } else if (arg == 'random') {
                var rand = Math.floor(Math.random() * array.length);
                result = array[rand];
            } else if (arg == 'even') {
                result = jsonQ.nthElm(array, '2n');
            } else if (arg == 'odd') {
                result = jsonQ.nthElm(array, '2n+1');
            }
            //to return sequence
            else {
                try {
                    var newArray = [],
                        ln = array.length;

                    if (!arg.match(/^[0-9n*+-\/]+$/)) throw ('');

                    arg = arg.replace(/([0-9])n/g, function($0, $1) {
                        return $1 ? $1 + '*n' : $0;
                    });



                    for (var n = 0; n < ln; n++) {
                        var index = eval(arg);
                        if (index > ln - 1) {
                            break;
                        }
                        newArray.push(array[index]);
                    }
                    result = newArray;
                } catch (error) {
                    //if no correct option return whole array
                    result = array;
                }
            }
            result = result || array;
            return objType(result) != 'array' && aryRetrn ? [result] : result;
        },
        prettify: function(obj, htmlReturn) {

            if (typeof obj != 'object') {
                throw ('Only valid json object is allowed.');
            }

            //to return prtified. If htmlReturn false add 3 spaces else add &nbsp;
            if (htmlReturn) {
                return JSON.stringify(obj, null, '\t').replace(/\n/g, '</br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
            }
            return JSON.stringify(obj, null, 3);

        },

        //need to modify it little bit
        //By Chris O'Brien, prettycode.org
        identical: function(a, b) {

            function sort(object) {
                if (typeof object !== "object" || object === null) {
                    return object;
                }

                return Object.keys(object).sort().map(function(key) {
                    return {
                        key: key,
                        value: sort(object[key])
                    };
                });
            }

            return JSON.stringify(sort(a)) === JSON.stringify(sort(b));
        },
        //Return the union of arrays in new array
        union: function() {
            var arg = arguments,
                target = [],
                ln = arg.length;

            for (var i = 0; i < ln; i++) {
                var aryLn = arg[i].length;
                for (var j = 0; j < aryLn; j++) {
                    var itm = arg[i][j];
                    if (jsonQ.index(target, itm) == -1) {
                        target.push(itm);
                    }
                }

            }
            return target;
        },
        //return intersection of array in new array
        intersection: function() {
            var arg = arguments,
                target = [],
                flag,
                ln = arg.length;

            if (ln == 1) {
                target = arg[0];
            } else {
                for (var j = 0, aryLn = arg[0].length; j < aryLn; j++) {
                    var elm = arg[0][j];
                    flag = 1;
                    for (var i = 1; i < ln; i++) {
                        if (jsonQ.index(arg[i], elm) == -1) {
                            flag = 0;
                            break;
                        }
                    }
                    if (flag == 1) {
                        target.push(elm);
                    }

                }
            }
            return target;
        },
        //suffle the order of elements in a array. returns the same array.
        suffle: function(array) {
            for (var i = 1, ln = array.length; i < ln; i++) {
                var j = Math.floor(Math.random() * (i + 1)),
                    tmp = array[i];
                array[i] = array[j];
                array[j] = tmp;
            }

            return array;

        },
        //return a new array list of unuiqe(distinct) elements of an array
        unique: function(array) {
            var ln = array.length,
                newAry = [];
            for (var i = 0; i < ln; i++) {
                if (jsonQ.index(newAry, array[i]) == -1) {
                    newAry.push(array[i]);
                }
            }
            return newAry;
        },
        //to get value at specific path in a json
        pathValue: function(json, path) {
            var i = 0,

                ln = path.length;

            if (json === null) {
                return null;
            }
            while (i < ln) {
                if (json[path[i]] === null) {
                    json = null;
                    return;
                } else {
                    json = json[path[i]];
                }
                i = i + 1;
            }
            return json;
        },
        setPathValue: function(json, path, value) {
            var i = 0,
                tempJson = json,
                ln = path.length;
            if (json === null) {
                return null;
            }
            while (i < ln) {
                if (typeof tempJson[path[i]] != 'object') {
                    tempJson[path[i]] = objType(path[i + 1]) == 'number' ? [] : {};
                }
                if (i == path.length - 1) {
                    tempJson[path[i]] = value;
                }
                tempJson = tempJson[path[i]];
                i = i + 1;
            }
            return json;
        },
        createXML: function(json) {
            var jsonToXML = function(json, xmlAry) {
                xmlAry = xmlAry || [];
                var start = xmlAry.length === 0 ? true : false,
                    type = objType(json);
                if (start) {
                    xmlAry.push('<?xml version="1.0" encoding="ISO-8859-1"?><jsonXML>');
                }

                //to make loop on array or object;
                jsonQ.each(json, function(k, val) {
                    var tag = type == 'array' ? 'arrayItem' : k,
                        elmType = objType(val);
                    xmlAry.push('<' + tag + ' type="' + elmType + '">');
                    if (elmType == 'object' || elmType == 'array') {
                        jsonToXML(val, xmlAry);
                    } else {
                        xmlAry.push('<![CDATA[' + val + ']]>');

                    }
                    xmlAry.push('</' + tag + '>');
                });


                if (start) {
                    xmlAry.push('</jsonXML>');
                    return xmlAry.join('');
                } else {
                    return xmlAry;
                }

            };
            return jsonToXML(json);
        },
        //append functions

        //to append in last of values of array or string
        append: function(target, val, clone) {
            return jsonQ.appendAt(target, "last", val, clone);
        },
        //to append in first of values of array or string
        prepend: function(target, val, clone) {
            return jsonQ.appendAt(target, "first", val, clone);
        },
        //to append at specific index of values of array or string
        appendAt: function(target, index, val, clone) {

            if (isNaN(index) && index != "first" && index != "last") {
                error(index + 'is not a valid index.');
                return;
            }

            var type = objType(target),
                length = target.length;

            //to limit index
            var idx = index < 0 || index == "first" ? 0 : index > length || index == "last" ? length : index;


            //if array push
            if (type == 'array') {
                val = clone ? jsonQ.clone(val) : val;
                target.splice(idx, 0, val);
            }

            //if string concatinate , if number add
            else if (type == 'string') {
                target = target.substring(0, idx) + val + target.substring(idx, length);
            }


            return target;

        }

    });

    //to assign jsonQ prototypes to init function
    jsonQ.fn.init.prototype = jsonQ.fn;

    return jsonQ;
}));
