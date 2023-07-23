import React from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";

import Lifecycle from "./Lifecycle.js";
import RouterContext from "./RouterContext.js";

/**
 * 用于在离开屏幕之前提示用户的公共API.
 * The public API for prompting the user before navigating away from a screen.
 * 
 * 依赖使用 history库中的 block history4 中 block 就是代表了 Prompt
 */
function Prompt({ message, when = true }) {
  return (
    <RouterContext.Consumer>
      {context => {
        invariant(context, "You should not use <Prompt> outside a <Router>");

        if (!when || context.staticContext) return null;

        const method = context.history.block;

        return (
          <Lifecycle
            onMount={self => {
              self.release = method(message);
            }}
            onUpdate={(self, prevProps) => {
              if (prevProps.message !== message) {
                self.release();
                self.release = method(message);
              }
            }}
            onUnmount={self => {
              self.release();
            }}
            message={message}
          />
        );
      }}
    </RouterContext.Consumer>
  );
}

if (__DEV__) {
  const messageType = PropTypes.oneOfType([PropTypes.func, PropTypes.string]);

  Prompt.propTypes = {
    when: PropTypes.bool,
    message: messageType.isRequired
  };
}

export default Prompt;
