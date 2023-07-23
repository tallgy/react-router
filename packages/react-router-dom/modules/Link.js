import React from "react";
import { __RouterContext as RouterContext } from "react-router";
import { createPath } from 'history';
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import {
  resolveToLocation,
  normalizeToLocation
} from "./utils/locationUtils.js";

// React 15 compat
const forwardRefShim = C => C;
let { forwardRef } = React;
if (typeof forwardRef === "undefined") {
  forwardRef = forwardRefShim;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * Link 的 component 默认使用的组件
 */
const LinkAnchor = forwardRef(
  (
    {
      innerRef, // TODO: deprecate
      navigate,
      onClick,
      ...rest
    },
    forwardedRef
  ) => {
    const { target } = rest;

    let props = {
      ...rest,
      onClick: event => {
        try {
          if (onClick) onClick(event);
        } catch (ex) {
          // catch 之后直接上抛，不执行后续的跳转逻辑
          event.preventDefault();
          throw ex;
        }

        /**
         * event.button 按键事件
         * 0：主按键，通常指鼠标左键或默认值（译者注：如 document.getElementById('a').click() 这样触发就会是默认值）
         * 1：辅助按键，通常指鼠标滚轮中键
         * 2：次按键，通常指鼠标右键
         * 3：第四个按钮，通常指浏览器后退按钮
         * 4：第五个按钮，通常指浏览器的前进按钮
         */
        if (
          !event.defaultPrevented && // onClick prevented default onClick阻止默认
          event.button === 0 && // ignore everything but left clicks 忽略一切，除了左键
          // 如果存在 target 如果 target 为 _self 才能执行，代表了其他模式由浏览器自行处理
          (!target || target === "_self") && // let browser handle "target=_blank" etc. 让浏览器处理“target= blank”等。
          !isModifiedEvent(event) // ignore clicks with modifier keys // 忽略带有修饰符键的单击
        ) {
          event.preventDefault();
          // 执行 navigate 进行跳转
          navigate();
        }
      }
    };

    // TODO 不知道是用来判断什么的
    // React 15 compat
    if (forwardRefShim !== forwardRef) {
      props.ref = forwardedRef || innerRef;
    } else {
      props.ref = innerRef;
    }

    /* eslint-disable-next-line jsx-a11y/anchor-has-content */
    return <a {...props} />;
  }
);

if (__DEV__) {
  LinkAnchor.displayName = "LinkAnchor";
}

/**
 * The public API for rendering a history-aware <a>.
 */
const Link = forwardRef(
  (
    {
      component = LinkAnchor,
      replace,
      to,
      innerRef, // TODO: deprecate
      ...rest
    },
    forwardedRef
  ) => {
    return (
      <RouterContext.Consumer>
        {context => {
          invariant(context, "You should not use <Link> outside a <Router>");

          const { history } = context;

          const location = normalizeToLocation(
            resolveToLocation(to, context.location),
            context.location
          );

          const href = location ? history.createHref(location) : "";
          const props = {
            ...rest,
            href,
            navigate() {
              const location = resolveToLocation(to, context.location);
              // 判断是否为重复导航 createPath 通过location 生成一个完整的 url
              // 通过 当前页面的location 和 本Link的location比较是否同一个
              const isDuplicateNavigation = createPath(context.location) === createPath(normalizeToLocation(location));
              // 判断使用 replace 还是 push
              const method = (replace || isDuplicateNavigation) ? history.replace : history.push;

              method(location);
            }
          };

          // React 15 compat
          if (forwardRefShim !== forwardRef) {
            props.ref = forwardedRef || innerRef;
          } else {
            props.innerRef = innerRef;
          }

          return React.createElement(component, props);
        }}
      </RouterContext.Consumer>
    );
  }
);

if (__DEV__) {
  const toType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.func
  ]);
  const refType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]);

  Link.displayName = "Link";

  Link.propTypes = {
    innerRef: refType,
    onClick: PropTypes.func,
    replace: PropTypes.bool,
    target: PropTypes.string,
    to: toType.isRequired
  };
}

export default Link;
