import React from "react";
import { Switch } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export default class AnimatedSwitch extends React.Component {
  constructor(props) {
    super(props);
    this._previousLocationPathname = "";
  }

  getTransition(currentLocationPath, _previousLocationPathname) {
    let transition = "slideNoTransition";

    if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname === "/data/quickaccess.html") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname.indexOf("/data/quickaccess/resources/view") != -1) {
      transition = "slideRight";
    }
    else if (currentLocationPath == "/data/quickaccess/resources/create" && this._previousLocationPathname === "/data/quickaccess.html") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname.indexOf("/data/quickaccess/resources/create") != -1) {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname == "/data/quickaccess/resources/create") {
      transition = "slideLeft";
    }

    return transition;
  }

  render() {
    const { children } = this.props;
    const currentLocationPathname = this.props.location.pathname;
    const transition = this.getTransition(currentLocationPathname, this._previousLocationPathname);
    console.debug(`AnimatedSwitch render from ${this._previousLocationPathname} to ${currentLocationPathname} with transition ${transition}`);
    this._previousLocationPathname = currentLocationPathname;

    return (
      <TransitionGroup enter={true} exit={true}>
        <CSSTransition classNames={transition} key={currentLocationPathname} timeout={210}>
          <Switch location={this.props.location}>{children}</Switch>
        </CSSTransition>
      </TransitionGroup>
    );
  }
}
