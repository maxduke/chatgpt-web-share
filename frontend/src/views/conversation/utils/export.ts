import { saveAs } from 'file-saver';

import {
  BaseConversationHistory,
  OpenaiApiChatMessageTextContent,
  OpenaiWebChatMessageCodeContent,
  OpenaiWebChatMessageExecutionOutputContent,
  OpenaiWebChatMessageMetadata,
  OpenaiWebChatMessageTextContent,
} from '@/types/schema';
import {
  getChatModelNameTrans,
  getContentRawText,
  getMessageListFromHistory,
  getMultimodalContentImageParts,
  getTextMessageContent,
  mergeContinuousMessages,
  replaceMathDelimiters,
  splitMessagesInGroup,
} from '@/utils/chat';
import { sizeToHumanReadable } from '@/utils/media';

import { determineMessageType, splitPluginActions } from './message';

function addQuote(text: string) {
  return (
    '\n\n' +
    text
      .trim()
      .split('\n')
      .map((line) => '> ' + line)
      .join('\n') +
    '\n\n'
  );
}

export const saveAsMarkdown = (convHistory: BaseConversationHistory, addTitle = true) => {
  const messageList = getMessageListFromHistory(convHistory);
  let content = `# ${convHistory.title}\n\n`;
  const create_time = new Date(convHistory.create_time ? convHistory.create_time + 'Z' : new Date()).toLocaleString();
  content += `Date: ${create_time}\nModel: ${getChatModelNameTrans(convHistory.current_model || null)}\n`;
  content += '---\n\n';
  let index = 0;

  const sections = mergeContinuousMessages(messageList);
  // console.log(sections, sections);

  for (const section of sections) {
    let title: string | null = null;
    let sectionContent = '';
    const groups = splitMessagesInGroup(section);
    const role = groups[0][0].role;
    const author = role.charAt(0).toUpperCase() + role.slice(1);
    if (role === 'system') continue;

    sectionContent += `\n\n### ${author}\n\n`;

    // 附件
    const metadata = section[0].metadata as OpenaiWebChatMessageMetadata;
    if (metadata.attachments) {
      let attachmentsContent = 'Attachments:\n\n';
      for (const attachment of metadata.attachments) {
        attachmentsContent += '**' + attachment.name + '**      ' + sizeToHumanReadable(attachment.size || 0) + '\n\n';
      }
      sectionContent += addQuote(attachmentsContent);
    }

    for (const group of groups) {
      const displayType = determineMessageType(group);
      const textContent = getTextMessageContent(group);
      if (displayType === 'text') {
        sectionContent += textContent;
      } else if (displayType === 'multimodal_text' || displayType === 'dalle_result') {
        const imageParts = getMultimodalContentImageParts(group[0]);
        let imageContent = '';
        for (const part of imageParts) {
          imageContent += `\`[Image: ${part.width}*${part.height}${
            part.metadata ? ', ' + JSON.stringify(part.metadata) : ''
          }]\`\n\n`;
        }
        sectionContent += addQuote(imageContent);
        sectionContent += '\n\n' + getContentRawText(group[0]);
      } else if (displayType === 'code') {
        const codeContent = group[0].content as OpenaiWebChatMessageCodeContent;
        const execResult = group[1].content as OpenaiApiChatMessageTextContent;
        sectionContent += addQuote('Using interpreter:\n\n```python\n' + codeContent.text?.trim() + '\n```');
        sectionContent += addQuote('Output:\n\n ```\n' + execResult.text.trim() + '\n```');
      } else if (displayType === 'plugin') {
        const pluginActions = splitPluginActions(group);
        const pluginContents = [] as string[];
        for (const action of pluginActions) {
          pluginContents.push('Use plugin ' + action.pluginName + '...');
        }
        sectionContent += addQuote(pluginContents.join('\n\n'));
      } else if (displayType === 'dalle_prompt') {
        sectionContent += addQuote('DALL·E 3 Prompts:\n\n```json\n' + getContentRawText(group[0]) + '\n```');
      }

      sectionContent = replaceMathDelimiters(sectionContent);

      // 标题
      if (role === 'user' && !title && (displayType === 'text' || displayType === 'multimodal_text')) {
        title = textContent.trim().replace(/\n+/g, ' ');
        if (title.length >= 80) {
          title = title.slice(0, 77) + '...';
        }
      }
    }
    if (role === 'user') {
      content += `\n\n## [${++index}]${addTitle ? ' ' + title : ''}\n\n`;
    }
    content += sectionContent;
  }

  content = content.replace(/\n\n+/g, '\n\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${convHistory.title} - ChatGPT history.md`);
};
