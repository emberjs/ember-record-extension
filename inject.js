(function() {
  if (document.contentType !== "text/html") return;
  var script = document.createElement('script');
  script.type = "text/javascript";
  script.src = chrome.extension.getURL("resources/record-ember-calls.js");
  console.log(script.src);
  console.log(document.contentType);
  console.log(document.readyState);
  console.log(document.head);
  var head = document.head;
  if (!head) {
    head = document.createElement('head');
    document.documentElement.appendChild(head);
  }
  head.insertBefore(script, head.firstChild);
  script.onload = function() {
    head.removeChild(script);
  };
})();