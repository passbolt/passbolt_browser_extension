import React, { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import AppContext from "../../contexts/AppContext";

class PrivateRoute extends Component {

  render() {
    let { component: Component, exact, strict, path, computedMatch, location, ...componentProps } = this.props;

    return (
      <Route
        exact={exact}
        strict={strict}
        path={path}
        render={props => (
          <React.Fragment>
            {this.context.isAuthenticated &&
              <Component {...props} {...componentProps} />
            }
            {!this.context.isAuthenticated &&
              <Redirect
                to={{
                  pathname: "/data/quickaccess/login",
                  state: { from: props.location }
                }}
              />
            }
          </React.Fragment>
        )}
      />
    );
  }
}

PrivateRoute.contextType = AppContext;

export default PrivateRoute;
