(function (setupHooks, downloadFile) {
  "use strict";
  setupHooks(function (installHook) {
    var addCalls = [];
    function EmberLoad() {
      var RouteRecognizer = Ember.__loader.require("route-recognizer").default;
      var originalAdd = RouteRecognizer.prototype.add;
      RouteRecognizer.prototype.add = function (routes, options) {
        addCalls.push(JSON.parse(JSON.stringify([routes, options])));
        return originalAdd.call(this, routes, options);
      };
    }
    function applicationLoad(application) {
      var router = application.__deprecatedInstance__.lookup('router:main');
      router.one('didTransition', function () {
        var blob = new Blob([JSON.stringify(addCalls, null, 2)], {type : 'application/json'});
        downloadFile(blob, 'route-recognizer_add_calls.json');
      });
    }
    installHook("Ember", EmberLoad);
    installHook("application", applicationLoad);
  });
})((function(callback) {
  var ENV;
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
});
