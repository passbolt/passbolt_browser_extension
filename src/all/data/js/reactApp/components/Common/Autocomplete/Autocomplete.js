/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
import React, {Component} from "react";
import PropTypes from "prop-types";
import debounce from "debounce-promise";

import AutocompleteItem from "./AutocompleteItem";
import AutocompleteItemEmpty from "./AutocompleteItemEmpty";
import AutocompleteItemLoading from "./AutocompleteItemLoading";

class Autocomplete extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.bindEventHandlers();
    this.createInputRefs();
    this.state = this.getDefaultState();
    this.getItemsDebounced = debounce(this.getItems, 150, {leading: true});
    this.cache = [];
    this.cacheExpiry = 10000; // in ms (aka 10s)
  }

  /**
   * getDefaultState
   * @return {object}
   */
  getDefaultState() {
    return {
      loading: true,
      processing: false,

      // autocomplete
      selected: null,
      autocompleteItems: null,

      // Fields and errors
      name: 'loading...',
      nameError: false
    }
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   * @return {void}
   */
  componentDidMount() {
    this.setState({loading: false, name: ''}, () => {
      this.inputRef.current.focus();
    });
    document.addEventListener("keydown", this.handleKeyDown);
  }

  /**
   * componentDidUpdate
   * Invoked immediately after props are updated
   * @return {void}
   */
  componentDidUpdate(prevProps) {
    if (prevProps.disabled !== this.props.disabled) {
      this.inputRef.current.focus();
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  createInputRefs() {
    this.listRef = React.createRef();
    this.inputRef = React.createRef();
  }

  bindEventHandlers() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.selectNext = this.selectNext.bind(this);
    this.selectPrevious = this.selectPrevious.bind(this);
    this.handleAutocompleteChange = this.handleAutocompleteChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async getItems(keyword) {
    this.setState({processing: true});
    return await this.props.searchCallback(keyword);
  }

  async autocompleteSearch(keyword) {
    if (!this.cache[keyword] || this.cache[keyword].cacheExpiry < (new Date()).getTime()) {
      this.cache[keyword] = await this.getItemsDebounced(keyword);
      this.cache[keyword].cacheExpiry = (new Date()).getTime() + this.cacheExpiry;
    }
    return this.cache[keyword];
  }

  closeAutocomplete() {
    this.cache = [];
    this.setState({processing: false, autocompleteItems: null, selected: null});
    this.props.onClose();
  }

  handleKeyDown (event) {
    if (this.state.disabled || this.state.processing || this.state.autocompleteItems === null) {
      return;
    }
    if (event.keyCode === 40) { // key down
      event.preventDefault();
      this.selectNext();
      return;
    }
    if (event.keyCode === 38) { // key up
      event.preventDefault();
      this.selectPrevious();
      return;
    }
    if (event.keyCode === 13 || event.keyCode === 9) { // enter key or tab
      if (this.state.selected === null) {
        return;
      }
      event.preventDefault();
      this.handleSelect(this.state.selected);
    }
  }

  handleSelect(selected) {
    let obj = this.state.autocompleteItems[selected];
    this.cache = [];
    this.setState({name: ''});
    this.props.onSelect(obj);
    this.closeAutocomplete();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    }, () => {
      if (name === 'name') {
        this.handleAfterNameUpdate();
      }
    });
  }

  handleAfterNameUpdate() {
    if (this.state.name) {
      if (!this.state.name.endsWith(' ')) {
        this.handleAutocompleteChange();
      }
    } else {
      this.closeAutocomplete();
    }
  }

  /**
   *
   * @returns {Promise<void>}
   */
  async handleAutocompleteChange() {
    let keyword = this.state.name;
    if (!keyword) {
      this.closeAutocomplete();
      return;
    }
    try {
      let autocompleteItems = await this.autocompleteSearch(keyword);
      let selected = null;
      if (autocompleteItems.length > 0) {
        selected = 0;
      }
      this.props.onOpen();
      return new Promise(resolve => {
        this.setState({autocompleteItems, processing: false, selected: selected}, resolve());
      });
    } catch (error) {
      console.error(error);
      this.closeAutocomplete();
      this.setState({serviceError: error.message});
    }
  }

  selectPrevious() {
    if (this.state.selected === 0 || this.state.selected === null) {
      this.setState({selected: (this.state.autocompleteItems.length -1)});
    } else {
      this.setState({selected: (this.state.selected -1)});
    }
    this.scrollToSelectedItem();
  }

  selectNext() {
    if (this.state.selected === null || (this.state.selected === this.state.autocompleteItems.length-1)) {
      this.setState({selected: 0});
    } else {
      this.setState({selected: (this.state.selected +1)});
    }
    this.scrollToSelectedItem();
  }

  isItemSelected(key) {
    if (this.state.selected === null) {
      return false;
    } else {
      return key === this.state.selected;
    }
  }

  getPlaceholder() {
    if (this.props.disabled) {
      return 'please wait...';
    } else {
      return this.props.placeholder;
    }
  }

  isInputDisabled() {
    return (this.state.loading || this.props.disabled);
  }

  scrollToSelectedItem() {
    if (!this.state.autocompleteItems || this.state.autocompleteItems.length === 0) {
      this.listRef.current.scrollTop = 0;
    } else {
      const totalHeight = this.listRef.current.scrollHeight;
      const itemHeight = totalHeight / this.state.autocompleteItems.length;
      const visibleHeight = this.listRef.current.clientHeight;
      const howManyFits = Math.round(visibleHeight / itemHeight);
      const fitOffset = visibleHeight - (itemHeight * howManyFits);
      const currentItemPosition = itemHeight * this.state.selected;
      const currentScroll = this.listRef.current.scrollTop;
      if ((currentItemPosition - fitOffset) < currentScroll) {
        this.listRef.current.scrollTop = this.listRef.current.scrollTop - visibleHeight;
        return;
      }
      if (currentItemPosition > (currentScroll + visibleHeight)) {
        this.listRef.current.scrollTop = currentItemPosition;
        return;
      }
    }
  }

  render() {
    return (
      <div>
        <div>
          <div className="input text autocomplete">
            <label htmlFor={this.props.id}>{this.props.label}</label>
            <input id={this.props.id}
                   name={this.props.name}
                   ref={this.inputRef} maxLength="64"
                   type="text"
                   placeholder={this.getPlaceholder()}
                   autoComplete="off"
                   value={this.state.name}
                   disabled={this.isInputDisabled()}
                   onChange={this.handleInputChange}
            />
          </div>
          {(this.state.processing || this.state.autocompleteItems) &&
          <div className="autocomplete-wrapper">
            <div className="autocomplete-content scroll"  ref={this.listRef}>
              <ul>
                {this.state.processing &&
                <AutocompleteItemLoading />
                }
                {!this.state.processing && (!this.state.autocompleteItems || !this.state.autocompleteItems.length) &&
                <AutocompleteItemEmpty />
                }
                {!this.state.processing && this.state.autocompleteItems && (this.state.autocompleteItems).map((item, key) => {
                  if (item.username) {
                    return <AutocompleteItem key={key} id={key} user={item} selected={this.isItemSelected(key)}
                                             onClick={this.handleSelect}/>
                  } else {
                    return <AutocompleteItem key={key} id={key} group={item} selected={this.isItemSelected(key)}
                                             onClick={this.handleSelect}/>
                  }
                })}
              </ul>
            </div>
          </div>
          }
        </div>
      </div>
    )
  }
}

Autocomplete.propTypes = {
  id: PropTypes.string,
  searchCallback: PropTypes.func,
  onSelect: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool
};

export default Autocomplete;
