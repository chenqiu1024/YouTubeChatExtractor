console.log('Popup script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');
  var downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    console.log('Download button found');
    downloadBtn.addEventListener('click', function() {
      console.log('Download button clicked');
      downloadChatLog();
    });
  } else {
    console.error('Download button not found');
  }
});

function downloadChatLog() {
  console.log('Attempting to download chat log');
  chrome.storage.local.get('chatMessages', (data) => {
    console.log('Retrieved data:', data);
    let chatLog = '';
    if (data.chatMessages && Array.isArray(data.chatMessages)) {
      chatLog = data.chatMessages.join('\n');
      console.log('Chat log created, length:', chatLog.length);
    } else {
      chatLog = '暂无聊天记录';
      console.log('No chat messages found');
    }
    const blob = new Blob([chatLog], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: 'youtube_chat_log.txt'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('下载失败:', chrome.runtime.lastError);
      } else {
        console.log('文件下载成功，下载ID:', downloadId);
      }
    });
  });
}
