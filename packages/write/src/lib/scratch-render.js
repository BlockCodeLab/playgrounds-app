import { scratchblocks } from '@blockcode/utils';

const DefaultOptions = {
  style: 'scratch3',
  inline: false,
  languages: Object.keys(scratchblocks.allLanguages),
  scale: 0.7,
};

export const scratchRender = {
  language: 'scratch',
  // 使用 scratchblocks 渲染
  render(element, vditor) {
    const scratchElements = element.querySelectorAll('.language-scratch');
    scratchElements.forEach((el) => {
      if (
        el.parentElement.classList.contains('vditor-wysiwyg__pre') ||
        el.parentElement.classList.contains('vditor-ir__marker--pre')
      ) {
        return;
      }
      const code = el.textContent;
      if (!code) return;

      try {
        const doc = scratchblocks.parse(code, DefaultOptions);
        const svg = scratchblocks.render(doc, DefaultOptions);

        const div = document.createElement('div');
        div.setAttribute('class', 'language-scratch');
        div.setAttribute('data-processed', 'true');
        div.append(svg);

        el.parentElement.append(div);
        el.remove();
      } catch (err) {
        el.className = 'vditor-reset--error';
        el.innerHTML = `scratch blocks render error: <br>${err}`;
      }
    });
  },
};
