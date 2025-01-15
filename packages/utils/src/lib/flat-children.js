import { Fragment, toChildArray } from 'preact';

export function flatChildren(children) {
  return [].concat(
    ...toChildArray(children).map((child) =>
      Array.isArray(child) ? flatChildren(child) : child.type === Fragment ? flatChildren(child.props.children) : child
    )
  );
}
