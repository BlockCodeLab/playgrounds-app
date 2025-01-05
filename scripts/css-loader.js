import { bundle } from 'lightningcss';

export function cssLoader(option) {
  option = {
    minify: true,
    sourceMap: true,
    cssModules: true,
    ...option,
  };

  return {
    name: 'cssLoader',
    setup({ onLoad, onResolve }) {
      onResolve({ filter: /^__inject_style__$/ }, (args) => {
        return {
          path: args.path,
          namespace: 'inject_style',
        };
      });

      onLoad({ filter: /.*/, namespace: 'inject_style' }, () => {
        return {
          contents: `
            export default function (text) {
              const document = globalThis.document;
              const style = document.createElement('style');
              style.appendChild(document.createTextNode(text));
              document.head.append(style);
            }
          `,
          loader: 'js',
        };
      });

      if (option.cssModules) {
        onLoad({ filter: /\.module\.css$/ }, async (args) => {
          const rawCssBuffer = await Bun.file(args.path).arrayBuffer();

          const { code, exports = {} } = bundle({
            ...option,
            filename: args.path,
            code: rawCssBuffer,
          });

          const exportCSSModule = Object.fromEntries(
            Object.entries(exports).map(([key, value]) => {
              const moduleName = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
              const cssName = value.name;
              return [moduleName, cssName];
            }),
          );

          return {
            contents: `
              import injectStyle from '__inject_style__';
              injectStyle(${JSON.stringify(code.toString())});
              export default ${JSON.stringify(exportCSSModule)};
            `,
            loader: 'js',
          };
        });
      }

      onLoad({ filter: /^.*\.css(?!\.module\.css)$/ }, async (args) => {
        const rawCssBuffer = await Bun.file(args.path).arrayBuffer();

        const { code } = bundle({
          ...option,
          filename: args.path,
          code: rawCssBuffer,
          cssModules: false,
        });

        return {
          contents: `
            import injectStyle from '__inject_style__';
            injectStyle(${JSON.stringify(code.toString())});
          `,
          loader: 'js',
        };
      });
    },
  };
}
