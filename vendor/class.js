/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();


///* Simple JavaScript Inheritance for ES 5.1
// * based on http://ejohn.org/blog/simple-javascript-inheritance/
// *  (inspired by base2 and Prototype)
// * MIT Licensed.
// * http://stackoverflow.com/questions/15050816/is-john-resigs-javascript-inheritance-snippet-deprecated
// */
//(function(global) {
//  "use strict";
//  var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
//
//  // The base Class implementation (does nothing)
//  function BaseClass(){}
//
//  // Create a new Class that inherits from this class
//  BaseClass.extend = function(props) {
//    var _super = this.prototype;
//
//    // Instantiate a base class (but only create the instance,
//    // don't run the init constructor)
//    var proto = Object.create(_super);
//
//    // Copy the properties over onto the new prototype
//    for (var name in props) {
//      // Check if we're overwriting an existing function
//      proto[name] = typeof props[name] === "function" && 
//        typeof _super[name] == "function" && fnTest.test(props[name]) ?
//        (function(name, fn){
//          return function() {
//            var tmp = this._super;
//
//            // Add a new ._super() method that is the same method
//            // but on the super-class
//            this._super = _super[name];
//
//            // The method only need to be bound temporarily, so we
//            // remove it when we're done executing
//            var ret = fn.apply(this, arguments);        
//            this._super = tmp;
//
//            return ret;
//          };
//        })(name, props[name]) :
//        props[name];
//    }
//
//    // The new constructor
//    var newClass = typeof proto.init === "function" ?
//      proto.init : // All construction is actually done in the init method
//      function(){};
//
//    // Populate our constructed prototype object
//    newClass.prototype = proto;
//
//    // Enforce the constructor to be what we expect
//    proto.constructor = newClass;
//
//    // And make this class extendable
//    newClass.extend = BaseClass.extend;
//
//    return newClass;
//  };
//
//  // export
//  global.Class = BaseClass;
//})(this);
