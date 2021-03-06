(function (setupHooks, downloadFile, loaderHook) {
  "use strict";
  var calls = {};
  self.___calls = calls;
  setupHooks(function (installHook) {
    function applicationLoad(application) {
      var router = application.__deprecatedInstance__.lookup('router:main');
      router.one('didTransition', function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              setTimeout(function () {
                var blob = new Blob([JSON.stringify(calls, null, 2)], {type : 'application/json'});
                downloadFile(blob, 'recorded-calls.json');
              }, 1000);
            });
          });
        });
      });
    }
    installHook("Ember", buildWrapper);
    installHook("application", applicationLoad);
  });

  loaderHook(function (loader) {
    var registry = loader.registry;
    console.log('loader defined');
    var cacheModule;
    Object.defineProperty(registry, 'ember-metal/cache', {
      get() {
        return cacheModule;
      }, set(v) {
        let orig = v.callback;
        v.callback = function (exports) {
          orig.apply(this, arguments);
          hookCache(exports);
        };
        cacheModule = v;
      }
    });

    function hookCache(mod) {
      let storeMap = new WeakMap();
      console.dir(mod);
      Object.defineProperty(mod.default.prototype, 'store', {
        get() {
          return storeMap.get(this);
        }, set(store) {
          storeMap.set(this, wrapStore(store));
        }
      });

      let stores = calls['stores'] = {};
      let storeId = 1;
      let storeCalls = calls['storeCalls'] = [];
      function wrapStore(store) {
        let id = storeId++;
        let err = new Error();
        Error.captureStackTrace(err);
        stores[id] = err.stack;
        return {
          id,
          store,
          get(key) {
            storeCalls.push([this.id, 'get', key]);
            return this.store.get(key);
          },
          set(key, value) {
            storeCalls.push([this.id, 'set', key, typeof value === 'string' ? value : '__omitted__']);
            this.store.set(key, value);
          },
          clear() {
            storeCalls.push([this.id, 'clear']);
            this.store.clear();
          }
        };
      }
    }
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function buildWrapper() {
    var RouteRecognizer = Ember.__loader.require("route-recognizer").default;
    var original = RouteRecognizer.prototype;
    var proto = Object.create(original);
    RouteRecognizer.prototype = proto;

    wrap("add", function (args) {
      calls.add.push(clone(args));
    });

    wrap("handlersFor", function (args) {
      calls.handlersFor.push(args);
    });

    wrap("hasRoute", function (args) {
      calls.hasRoute.push(args);
    });

    wrap("generate", function (args) {
      calls.generate.push(clone(args));
    });

    wrap("generateQueryString", function (args) {
      calls.generateQueryString.push(clone(args));
    });

    wrap("parseQueryString", function (args) {
      calls.parseQueryString.push(args);
    });

    wrap("recognize", function (args) {
      calls.recognize.push(args);
    });

    calls["map"] = [];

    function wrapTo(node, original) {
      var obj = Object.create(original);
      obj.to = function (name, callback) {
        node.to = name;
        if (callback) {
          node.block = [];
          original.to.call(this, name, wrapCallback(node, callback));
        } else {
          original.to.call(this, name);
        }
      };
      return obj;
    }

    function wrapMatch(parent, match) {
      return function (path, callback) {
        var node = {
          match: path
        };
        parent.block.push(node);
        if (callback) {
          node.block = [];
          match.call(this, path, wrapCallback(node, callback));
        } else {
          return wrapTo(node, match.call(this, path));
        }
      }
    }

    function wrapCallback(parent, callback) {
      return function (match) {
        callback(wrapMatch(parent, match));
      }
    }

    proto.map = function (callback, addCallback) {
      var node = {
        block: []
      };
      calls.map.push(node);
      original.map.call(this, wrapCallback(node, callback), addCallback);
    };

    /*
"map" => {
  block: [
    {
      match: "/path",
      to: "name"
      block?: [...]
    },
    {
      path: "/foo",
      block?: [...]
    }, ...
  ]
};
    */

    function wrap(methodName, callback) {
      calls[methodName] = [];
      proto[methodName] = function () {
        var args = new Array(arguments.length);
        for (var i = 0; i < arguments.length; i++) {
          args[i] = arguments[i];
        }
        callback(args);
        return original[methodName].apply(this, arguments);
      }
    }
  }
})((function(callback) {
  var ENV;
  var _Ember;
  var __loader;
  var hooks;
  if (typeof EmberENV === "undefined") {
    Object.defineProperty(self, "EmberENV", {
      get: function () {
        return ENV;
      },
      set: function (value) {
        ENV = value;
        setupHooks();
      }
    });
    function setupHooks() {
      if (!ENV) return;
      hooks = ENV.EMBER_LOAD_HOOKS;
      if (!ENV.EMBER_LOAD_HOOKS) {
        hooks = ENV.EMBER_LOAD_HOOKS = {};
      }
      callback(installHook);
    }
    function installHook(name, hook) {
      if (Array.isArray(hooks[name])) {
        hooks[name].push(hook);
      } else {
        hooks[name] = [hook];
      }
    }
  }
}), function downloadFile(blob, filename) {
  var a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}, function loaderHook(callback) {
  let _Ember;
  let __loader;
  if (typeof Ember === 'undefined') {
    Object.defineProperty(self, "Ember", {
      get() {
        return _Ember;
      },
      set(v) {
        if (v.__loader === undefined) {
          Object.defineProperty(v, '__loader', {
            get() {
              return __loader;
            },
            set(v) {
              callback(v);
              __loader = v;
            }
          });
        }
        _Ember = v;
      }
    });
  }
});
