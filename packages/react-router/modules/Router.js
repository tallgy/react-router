import React from "react";
import PropTypes from "prop-types";
import warning from "tiny-warning";

import HistoryContext from "./HistoryContext.js";
import RouterContext from "./RouterContext.js";

/**
 * 用于将历史记录放在上下文上的公共API。
 * The public API for putting history on context.
 */
class Router extends React.Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }

  // 构造函数 执行一次
  constructor(props) {
    super(props);

    this.state = {
      location: props.history.location
    };

    // 这是一个 hack。
    // 我们必须在构造函数中开始监听位置变化，以防在初始渲染中出现<Redirect>。
    // 如果有，它们将在挂载时 replace/push，并且由于 cDM 在子节点中先于父节点触发，我们可能会在<Router>被挂载之前得到一个新的位置。
    // This is a bit of a hack. We have to start listening for location
    // changes here in the constructor in case there are any <Redirect>s
    // on the initial render. If there are, they will replace/push when
    // they mount and since cDM fires in children before parents, we may
    // get a new location before the <Router> is mounted.
    this._isMounted = false;
    this._pendingLocation = null;

    // TOOD 这个 staticContext 静态上下文 需要 理解
    // 应该是一共 StaticRouter 需要去看其工作原理
    if (!props.staticContext) {
      // 监听 location 将 pendingLocation 进行更新
      this.unlisten = props.history.listen(location => {
        this._pendingLocation = location;
      });
    }
  }

  // 组件被挂载时 执行一次
  componentDidMount() {
    this._isMounted = true;

    if (this.unlisten) {
      // 此时已经捕获了任何预挂载位置更改，因此取消侦听器的注册。
      // Any pre-mount location changes have been captured at
      // this point, so unregister the listener.
      this.unlisten();
    }
    if (!this.props.staticContext) {
      this.unlisten = this.props.history.listen(location => {
        // 此时可以使用 setState 去进行更新 location
        if (this._isMounted) {
          this.setState({ location });
        }
      });
    }
    // 这是由最开始 构造函数的时候进行的监听所获取的 _pendingLocation
    if (this._pendingLocation) {
      this.setState({ location: this._pendingLocation });
    }
  }

  // 组件被卸载 执行一次
  componentWillUnmount() {
    if (this.unlisten) {
      // 注销监听
      this.unlisten();
      this._isMounted = false;
      this._pendingLocation = null;
    }
  }

  render() {
    return (
      // 主要是为了创建 Provider context 用于内部组件去获取 history location 等数据
      // RouterContext 有 history、location、match、staticContext
      // HistoryContext 有 history
      <RouterContext.Provider
        value={{
          history: this.props.history,
          location: this.state.location,
          match: Router.computeRootMatch(this.state.location.pathname),
          staticContext: this.props.staticContext
        }}
      >
        <HistoryContext.Provider
          children={this.props.children || null}
          value={this.props.history}
        />
      </RouterContext.Provider>
    );
  }
}

if (__DEV__) {
  Router.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object.isRequired,
    staticContext: PropTypes.object
  };

  Router.prototype.componentDidUpdate = function(prevProps) {
    warning(
      prevProps.history === this.props.history,
      "You cannot change <Router history>"
    );
  };
}

export default Router;
