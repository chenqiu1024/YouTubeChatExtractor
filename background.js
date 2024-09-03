console.log('Background script loaded');

let allMessages = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === "updateMessages") {
    allMessages = allMessages.concat(request.messages);
    chrome.storage.local.set({chatMessages: allMessages}, () => {
      console.log('Messages saved:', allMessages);
      sendResponse({status: 'success', count: allMessages.length});
    });
    return true; // 保持消息通道开放以进行异步响应
  }
});

// 如果需要在安装或更新时执行操作
chrome.runtime.onInstalled.addListener(() => {
  console.log('扩展已安装或更新');
  chrome.storage.local.clear(() => {
    console.log('Storage cleared');
  });
});
