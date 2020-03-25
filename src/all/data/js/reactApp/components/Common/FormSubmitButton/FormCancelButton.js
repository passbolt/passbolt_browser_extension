import React, { Component} from "react";
import PropTypes from "prop-types";

class FormCancelButton extends Component {
  constructor() {
    super();
  }

  getClassName() {
    let name = 'cancel';
    if (this.props.disabled) {
      name += ' disabled';
    }
    return name;
  }

  handleClick() {
    if (!this.props.disabled) {
      this.props.onClick();
    }
  }

  render() {
    return (
      <a className={this.getClassName()} role="button" onClick={this.handleClick.bind(this)}>Cancel</a>
    )
  }
}

FormCancelButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default FormCancelButton;
