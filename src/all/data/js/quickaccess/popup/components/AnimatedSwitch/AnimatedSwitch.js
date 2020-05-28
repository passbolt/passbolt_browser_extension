import React from "react";
import { Switch } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

export default class AnimatedSwitch extends React.Component {
  constructor(props) {
    super(props);
    this._previousLocationPathname = "";
    this._previousTransition = "";
  }

  getTransition(currentLocationPath, _previousLocationPathname) {
    let transition = null;

    if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname === "/data/quickaccess.html") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname.indexOf("/data/quickaccess/resources/view") != -1) {
      transition = "slideRight";
    }

    // Resource create transition
    else if (currentLocationPath == "/data/quickaccess/resources/create") {
      transition = "slideLeft";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname == "/data/quickaccess/resources/create") {
      transition = "slideLeft";
    }
    // Whatever current location is, if the previous location was the resource create page then slide right
    else if (this._previousLocationPathname === "/data/quickaccess/resources/create") {
      transition = "slideRight";
    }

    // Filter by group transitions
    else if (currentLocationPath == "/data/quickaccess/resources/group" && this._previousLocationPathname == "/data/quickaccess.html") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname == "/data/quickaccess/resources/group") {
      transition = "slideRight";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname.indexOf("/data/quickaccess/resources/group/") !== -1) {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/group/") != -1 && this._previousLocationPathname == "/data/quickaccess/resources/group") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess/resources/group" && this._previousLocationPathname.indexOf("/data/quickaccess/resources/group/") !== -1) {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/group") != -1) {
      transition = "slideLeft";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/group/") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/view") != -1) {
      transition = "slideRight";
    }

    // Filter by tag transitions
    else if (currentLocationPath == "/data/quickaccess/resources/tag" && this._previousLocationPathname == "/data/quickaccess.html") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname == "/data/quickaccess/resources/tag") {
      transition = "slideRight";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname.indexOf("/data/quickaccess/resources/tag/") !== -1) {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/tag/") != -1 && this._previousLocationPathname == "/data/quickaccess/resources/tag") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess/resources/tag" && this._previousLocationPathname.indexOf("/data/quickaccess/resources/tag/") !== -1) {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/tag") != -1) {
      transition = "slideLeft";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/tag/") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/view") != -1) {
      transition = "slideRight";
    }

    // More filters transitions
    else if (currentLocationPath == "/data/quickaccess/more-filters" && this._previousLocationPathname == "/data/quickaccess.html") {
      transition = "slideLeft";
    }
    else if (currentLocationPath == "/data/quickaccess.html" && this._previousLocationPathname == "/data/quickaccess/more-filters") {
      transition = "slideRight";
    }

    // Filter by favorite transitions
    else if (currentLocationPath == "/data/quickaccess/resources/favorite" && this._previousLocationPathname == "/data/quickaccess/more-filters") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess/more-filters" && this._previousLocationPathname == "/data/quickaccess/resources/favorite") {
      transition = "slideRight";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname == "/data/quickaccess/resources/favorite") {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/favorite") != -1) {
      transition = "slideLeft";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/favorite") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/view") != -1) {
      transition = "slideRight";
    }

    // Filter by items I own transitions
    else if (currentLocationPath == "/data/quickaccess/resources/owned-by-me" && this._previousLocationPathname == "/data/quickaccess/more-filters") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess/more-filters" && this._previousLocationPathname == "/data/quickaccess/resources/owned-by-me") {
      transition = "slideRight";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname == "/data/quickaccess/resources/owned-by-me") {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/owned-by-me") != -1) {
      transition = "slideLeft";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/owned-by-me") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/view") != -1) {
      transition = "slideRight";
    }

    // Filter by modified transitions
    else if (currentLocationPath == "/data/quickaccess/resources/recently-modified" && this._previousLocationPathname == "/data/quickaccess/more-filters") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess/more-filters" && this._previousLocationPathname == "/data/quickaccess/resources/recently-modified") {
      transition = "slideRight";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname == "/data/quickaccess/resources/recently-modified") {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/recently-modified") != -1) {
      transition = "slideLeft";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/recently-modified") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/view") != -1) {
      transition = "slideRight";
    }

    // Filter by modified transitions
    else if (currentLocationPath == "/data/quickaccess/resources/shared-with-me" && this._previousLocationPathname == "/data/quickaccess/more-filters") {
      transition = "slideLeft";
    }
    else if (currentLocationPath === "/data/quickaccess/more-filters" && this._previousLocationPathname == "/data/quickaccess/resources/shared-with-me") {
      transition = "slideRight";
    }
    else if (currentLocationPath === "/data/quickaccess.html" && this._previousLocationPathname == "/data/quickaccess/resources/shared-with-me") {
      transition = "slideRight";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/view") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/shared-with-me") != -1) {
      transition = "slideLeft";
    }
    else if (currentLocationPath.indexOf("/data/quickaccess/resources/shared-with-me") != -1 && this._previousLocationPathname.indexOf("/data/quickaccess/resources/view") != -1) {
      transition = "slideRight";
    }

    else {
      // The page has changed but not transition has been defined for it.
      // Use the default noTransition transition
      if (currentLocationPath !== this._previousLocationPathname) {
        transition = "noTransition";
      } else {
        // The transition is recalculated because of a status change.
        // Return the previous transition. The transition won't be played twice, and it will allow to complete it properly.
        transition = this._previousTransition;
      }
    }

    this._previousTransition = transition;
    return transition;
  }

  render() {
    const { children } = this.props;
    const currentLocationPathname = this.props.location.pathname;
    const transition = this.getTransition(currentLocationPathname, this._previousLocationPathname);
    // If no transition, the previous component should be hidden immediately.
    const transitionTimeout = transition !== "noTransition" ? 210 : 0;
    console.debug(`AnimatedSwitch render from ${this._previousLocationPathname} to ${currentLocationPathname} with transition ${transition}`);
    this._previousLocationPathname = currentLocationPathname;

    return (
      <TransitionGroup enter={true} exit={true}>
        <CSSTransition classNames={transition} key={currentLocationPathname} timeout={transitionTimeout}>
          <Switch location={this.props.location}>{children}</Switch>
        </CSSTransition>
      </TransitionGroup>
    );
  }
}
