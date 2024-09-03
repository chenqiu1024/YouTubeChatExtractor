console.log('Content script loaded');

function parseChatMessages() {
    const chatMessages = document.querySelectorAll('yt-live-chat-text-message-renderer');
    let newMessages = [];
  
    chatMessages.forEach(message => {
      const timestamp = message.querySelector('#timestamp').textContent.trim();
      const author = message.querySelector('#author-name').textContent.trim();
      const text = message.querySelector('#message').textContent.trim();
  
      newMessages.push(`${timestamp} ${author}: ${text}`);
    });
  
    console.log('Parsed messages:', newMessages);
    return newMessages;
  }
  
  function sendMessagesToBackground(messages) {
    chrome.runtime.sendMessage({action: "updateMessages", messages: messages}, response => {
      console.log('Background response:', response);
    });
  }
  
  setInterval(() => {
    const newMessages = parseChatMessages();
    if (newMessages.length > 0) {
      console.log('Sending messages to background');
      sendMessagesToBackground(newMessages);
    }
  }, 5000); // 每5秒检查一次新消息
