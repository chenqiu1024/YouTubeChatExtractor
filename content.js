console.log('Content script loaded');

let lastMessageCount = 0;

function getAllShadowRoots(root) {
    const shadowRoots = [];
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode;
        if (node.shadowRoot) {
            shadowRoots.push(node.shadowRoot);
        }
    }
    return shadowRoots;
}

function parseChatMessages() {
    let chatMessages = [];
    const shadowRoots = getAllShadowRoots(document.body);
    shadowRoots.forEach(root => {
        chatMessages = chatMessages.concat(Array.from(root.querySelectorAll('yt-live-chat-text-message-renderer')));
    });
    chatMessages = chatMessages.concat(Array.from(document.querySelectorAll('yt-live-chat-text-message-renderer')));
    
    if (chatMessages.length === lastMessageCount) {
        return []; // 如果消息数量没有变化，直接返回空数组
    }
    
    console.log('Found chat messages:', chatMessages.length);
    
    let newMessages = [];
    
    // 只处理新增的消息
    for (let i = lastMessageCount; i < chatMessages.length; i++) {
        const message = chatMessages[i];
        try {
            const timestamp = message.querySelector('#timestamp')?.textContent.trim() || '未知时间';
            const author = message.querySelector('#author-name')?.textContent.trim() || '未知作者';
            const text = message.querySelector('#message')?.textContent.trim() || '空消息';
    
            newMessages.push(`${timestamp} ${author}: ${text}`);
        } catch (error) {
            console.error('解析消息时出错:', error);
        }
    }
    
    lastMessageCount = chatMessages.length;
    console.log('Parsed new messages:', newMessages.length);
    return newMessages;
}

function sendMessagesToBackground(messages) {
    if (messages.length > 0) {
        chrome.runtime.sendMessage({action: "updateMessages", messages: messages}, response => {
            console.log('Background response:', response);
        });
    }
}

// 使用防抖函数来限制处理频率
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedParse = debounce(() => {
    const newMessages = parseChatMessages();
    sendMessagesToBackground(newMessages);
}, 1000);

// 等待页面加载完成
window.addEventListener('load', () => {
    console.log('Page fully loaded');
    
    // 使用MutationObserver来监听整个文档的变化
    const bodyObserver = new MutationObserver(debouncedParse);

    // 开始观察整个body
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    console.log('Started observing body for chat messages');

    // 立即尝试解析消息
    debouncedParse();
});

// 定期检查，但频率降低
setInterval(debouncedParse, 30000); // 每30秒检查一次
