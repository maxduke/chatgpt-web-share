import { saveAs } from 'file-saver';

import { BaseConversationHistory } from '@/types/schema';
import {getChatModelNameTrans, getContentRawText, getMessageListFromHistory} from '@/utils/chat';

// 导入chatmessage类以便后续使用 
import { OpenaiWebChatMessageTextContent, OpenaiApiChatMessageTextContent } from '@/types/schema';

export const saveAsMarkdown = (convHistory: BaseConversationHistory) => {
  const messageList = getMessageListFromHistory(convHistory);
  let content = `# ${convHistory.title}\n\n`;
  const create_time = new Date(convHistory.create_time ? convHistory.create_time + 'Z' : new Date()).toLocaleString();
  content += `Date: ${create_time}\nModel: ${getChatModelNameTrans(convHistory.current_model || null)}\n`;
  content += '---\n\n';
  let index = 0;
  for (const message of messageList) {
    // 针对message.source的两种openai_web和openai_api区分处理，因为2中数据结构有微小差异
    // 这里处理openai_web来源的
    if (message.source === 'openai_web') {
      // 针对message.content类型
      const textContent = message.content as OpenaiWebChatMessageTextContent;
      // 针对message.content的数据中存放消息内容是textContent.parts
      // 如果parts存在就继续读取
      if (textContent.parts){
        // 这里复用up主的代码
        if (message.role === 'user') {
          let title = getContentRawText(message).trim().split('\n')[0];
          if (title.length >= 50) {
            title = title.slice(0, 47) + '...';
          }
          content += `## ${++index}. ${title}\n\n`;
          content += `### User\n\n${textContent.parts[0]}\n\n`;
        } else {
          content += `### ChatGPT\n\n${textContent.parts[0]}\n\n`;
          content += '---\n\n';
        }
      }
    } 
    // 这里处理openai_web来源的  
    else if (message.source === 'openai_api') 
    {
      // 继续明确类型，和web不同
      const textContent = message.content as OpenaiApiChatMessageTextContent; 
      if (message.role === 'user') {
        // 复用up主代码
        let title = getContentRawText(message).trim().split('\n')[0];
        if (title.length >= 50) {
          title = title.slice(0, 47) + '...';
        }
        content += `## ${++index}. ${title}\n\n`;
        // 这里User对话可以从message.content取到，保留up代码
        content += `### User\n\n${message.content}\n\n`;
      } else {
        // 这里ChatGPT返回对话需要从textContent.text获取
        content += `### ChatGPT\n\n${textContent.text}\n\n`;
        content += '---\n\n';
      }  
    }
  }
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${convHistory.title} - ChatGPT history.md`);
};
