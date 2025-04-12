import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const CompletionItemKind = monaco.languages.CompletionItemKind;

const allLanguages = monaco.languages.getLanguages();

const IdentifierPattern = new RegExp('([a-zA-Z_]\\w*)', 'g'); // 正则表达式定义 注意转义\\w

// 简易获取代码中的词
function getTokens(code) {
  let array1;
  const tokens = [];
  while ((array1 = IdentifierPattern.exec(code)) !== null) {
    tokens.push(array1[0]);
  }
  return Array.from(new Set(tokens)); // 去重
}

// 注册自动完成设置
export async function registerCompletionProvider(languageId, completionItems) {
  // 载入语言模型
  const language = await allLanguages.find((lang) => lang.id === languageId)?.loader?.();

  const provider = monaco.languages.registerCompletionItemProvider(languageId, {
    provideCompletionItems(model, pos) {
      const word = model.getWordUntilPosition(pos);
      const range = {
        startLineNumber: pos.lineNumber,
        endLineNumber: pos.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      // 自定义完成项
      const customItems = completionItems.map((item) => {
        if (typeof item === 'string') {
          item = [item];
        }
        if (Array.isArray(item)) {
          item = {
            label: {
              label: item[0],
              description: item[2],
            },
            kind: item[1] ?? CompletionItemKind.Keyword,
            insertText: item[0],
          };
        }
        if (typeof item.label === 'string') {
          item.label = {
            label: item.label,
            description: item.description ?? item.documentation,
          };
        }
        if (!item.insertText) {
          item.insertText = item.label.label;
        }
        item.range = range;
        return item;
      });

      // 语言关键词
      let keywords = [];
      if (language?.language?.keywords) {
        keywords = language.language.keywords
          .filter((key) => key !== word.word && !customItems.find((item) => item.label.label === key))
          .map((key) => ({
            label: key,
            kind: CompletionItemKind.Keyword,
            insertText: key,
            range,
          }));
      }

      // 代码中词
      const tokens = getTokens(model.getValue())
        .filter((token) => token !== word.word && !customItems.find((item) => item.label.label === token))
        .map((token) => ({
          label: token,
          kind: CompletionItemKind.Text,
          insertText: token,
          range,
        }));

      return { suggestions: keywords.concat(customItems, tokens) };
    },
  });
  return provider;
}
