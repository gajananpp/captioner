chrome.runtime.onMessage.addListener(async msg => {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (tabs.length && tabs[0].id && msg.type === 'startCaptioning') {
    const tabId = tabs[0].id;
    await chrome.scripting.executeScript({
      target: {
        tabId: tabId,
      },
      files: ['contentScript.js'],
    });
    chrome.tabs.sendMessage(tabId, msg);
  }
});
