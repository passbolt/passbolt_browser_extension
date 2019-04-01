import PropTypes from "prop-types";
import React from "react";

class Search extends React.Component {

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    this.props.searchChangeCallback(event.target.value);
  }

  render() {
    return (
      <div className="search">
        <div className="input text required">
          <label className="visually-hidden">search</label>
          <input name="search" maxLength="50" type="text" placeholder="search" autoComplete="off" autoFocus onChange={this.handleInputChange} value={this.props.search} />
          <a id="search-submit" className="search-submit button button-icon" role="button">
            <span className="visually-hidden">search</span>
            <span className="fa icon">
              <svg xmlns="http://www.w3.org/2000/svg" aria-label="magnifying glass icon"><path id="search-icon" d="M15.781 13.844a.723.723 0 0 1 .219.531.723.723 0 0 1-.219.531l-.875.875a.723.723 0 0 1-.531.219.723.723 0 0 1-.531-.219l-3.125-3.125a.723.723 0 0 1-.219-.531v-.5C9.333 12.542 8 13 6.5 13a6.313 6.313 0 0 1-3.266-.875 6.567 6.567 0 0 1-2.359-2.36A6.313 6.313 0 0 1 0 6.5c0-1.187.292-2.276.875-3.266A6.567 6.567 0 0 1 3.235.875 6.313 6.313 0 0 1 6.5 0c1.187 0 2.276.292 3.266.875a6.567 6.567 0 0 1 2.359 2.36c.583.989.875 2.078.875 3.265 0 1.5-.458 2.833-1.375 4h.5c.208 0 .385.073.531.219l3.125 3.125zM6.5 10.5c.73 0 1.401-.177 2.016-.531a3.891 3.891 0 0 0 1.453-1.453A3.966 3.966 0 0 0 10.5 6.5c0-.73-.177-1.401-.531-2.016a3.891 3.891 0 0 0-1.453-1.453A3.966 3.966 0 0 0 6.5 2.5c-.73 0-1.401.177-2.016.531a3.891 3.891 0 0 0-1.453 1.453A3.966 3.966 0 0 0 2.5 6.5c0 .73.177 1.401.531 2.016a3.891 3.891 0 0 0 1.453 1.453A3.966 3.966 0 0 0 6.5 10.5z" fillRule="evenodd" /></svg>
            </span>
          </a>
        </div>
      </div>
    );
  }
}

Search.propTypes = {
  search: PropTypes.string,
  searchChangeCallback: PropTypes.func
};

export default Search;
