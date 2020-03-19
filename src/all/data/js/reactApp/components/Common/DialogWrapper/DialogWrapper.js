import React, {Component} from "react";
import DialogCloseButton from "../DialogCloseButton/DialogCloseButton";
import PropTypes from "prop-types";

class DialogWrapper extends Component {
  constructor() {
    super();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleKeyDown(event) {
    // Close the dialog when the user presses the "ESC" key.
    if (event.keyCode === 27) {
      this.handleClose();
    }
  }

  handleClose() {
    if (!this.props.disabled) {
      this.props.onClose();
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <div className={`${this.props.className} dialog-wrapper`}>
        <div className="dialog">
          <div className="dialog-header">
            <h2><span>{this.props.title}</span></h2>
            <DialogCloseButton onClose={this.handleClose} disabled={this.props.disabled}/>
          </div>
          <div className="dialog-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

DialogWrapper.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClose: PropTypes.func
};

export default DialogWrapper;
