chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("reloading tab");
  chrome.tabs.reload(null, null, function () {
    console.log("waiting for load");
    chrome.tabs.onUpdated.addListener(injectScript);
  });
});

function injectScript() {
  console.log("tab updated");
  try {
    chrome.tabs.onUpdated.removeListener(injectScript);
    chrome.tabs.executeScript(null, {
      file: "inject.js",
      runAt: "document_start"
    });
  } catch (e) {
    console.error("failed to inject script");
    console.error(e.stack);
  }
}
