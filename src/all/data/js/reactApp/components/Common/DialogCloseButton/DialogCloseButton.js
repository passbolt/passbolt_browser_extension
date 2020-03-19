import React, { Component} from "react";
import PropTypes from "prop-types";
import Icon from "../Icons/Icon";

class DialogCloseButton extends Component {
  handleCloseClick() {
    this.props.onClose();
  }

  getClassName() {
    let className = 'dialog-close';
    if (this.props.disabled) {
      className += ' disabled';
    }
    return className;
  }

  render() {
    return (
      <a className={this.getClassName()} onClick={this.handleCloseClick.bind(this)}>
        <Icon name='close' />
        <span className="visually-hidden">Close</span>
      </a>
    )
  }
}
DialogCloseButton.propTypes = {
  onClose: PropTypes.func,
  disabled: PropTypes.bool
};

export default DialogCloseButton;
