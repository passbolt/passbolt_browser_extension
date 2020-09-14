import PropTypes from "prop-types";
import React from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import AppContext from "../../contexts/AppContext";
import SimpleBar from "../SimpleBar/SimpleBar";

const BROWSED_RESOURCES_LIMIT = 500;

class FilterResourcesBySharedWithMePage extends React.Component {
  constructor(props) {
    super(props);
    this.initEventHandlers();
    this.initState();
  }

  componentDidMount() {
    this.context.focusSearch();
    if (this.context.searchHistory[this.props.location.pathname]) {
      this.context.updateSearch(this.context.searchHistory[this.props.location.pathname]);
    }
    this.findAndLoadResources();
  }

  initEventHandlers() {
    this.handleGoBackClick = this.handleGoBackClick.bind(this);
    this.handleSelectResourceClick = this.handleSelectResourceClick.bind(this);
  }

  initState() {
    this.state = {
      resources: null
    };
  }

  handleGoBackClick(ev) {
    ev.preventDefault();
    // Clean the search and remove the search history related to this page.
    this.context.updateSearch("");
    delete this.context.searchHistory[this.props.location.pathname];
    this.props.history.goBack();
  }

  handleSelectResourceClick(ev, resourceId) {
    ev.preventDefault();
    // Add a search history for the current page.
    // It will allow the page to restore the search when the user will come back after clicking goBack (caveat, the workflow is not this one).
    // By instance when you select a resource you expect the page to be filtered as when you left it.
    this.context.searchHistory[this.props.location.pathname] = this.context.search;
    this.context.updateSearch("");
    this.props.history.push(`/data/quickaccess/resources/view/${resourceId}`);
  }

  async findAndLoadResources() {
    const filters = { 'is-shared-with-me': true };
    const resources = await passbolt.request('passbolt.resources.find-all', { filters });
    this.sortResourcesAlphabetically(resources);
    this.setState({ resources });
  }

  sortResourcesAlphabetically(resources) {
    resources.sort((resource1, resource2) => {
      const resource1Name = resource1.name.toUpperCase();
      const resource2Name = resource2.name.toUpperCase();
      if (resource1Name > resource2Name) {
        return 1;
      } else if (resource2Name > resource1Name) {
        return -1;
      }
      return 0;
    });
  }

  /**
   * Get the resources to display
   * @return {array} The list of resources.
   */
  getBrowsedResources() {
    let resources = this.state.resources;

    if (this.context.search.length) {
      // @todo optimization. Memoize result to avoid filtering each time the component is rendered.
      // @see reactjs doc https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
      resources = this.filterResourcesBySearch(resources, this.context.search);
    }

    return resources.slice(0, BROWSED_RESOURCES_LIMIT);
  }

  /**
   * Filter resources by keywords.
   * Search on the name, the username, the uri and the description of the resources.
   * @param {array} resources The list of resources to filter.
   * @param {string} needle The needle to search.
   * @return {array} The filtered resources.
   */
  filterResourcesBySearch(resources, needle) {
    // Split the search by words
    const needles = needle.split(/\s+/);
    // Prepare the regexes for each word contained in the search.
    const regexes = needles.map(needle => new RegExp(this.escapeRegExp(needle), 'i'));

    return resources.filter(resource => {
      let match = true;
      for (let i in regexes) {
        // To match a resource would have to match all the words of the search.
        match &= (regexes[i].test(resource.name)
          || regexes[i].test(resource.username)
          || regexes[i].test(resource.uri)
          || regexes[i].test(resource.description));
      }

      return match;
    });
  }

  /**
   * Escape a string that is to be treated as a literal string within a regular expression.
   * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
   * @param {string} value The string to escape
   */
  escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  isReady() {
    return this.state.resources != null;
  }

  render() {
    const isReady = this.isReady();
    const isSearching = this.context.search.length > 0;
    let browsedResources;

    if (isReady) {
      browsedResources = this.getBrowsedResources();
    }

    return (
      <div className="index-list">
        <div className="back-link">
          <a href="#" className="primary-action" onClick={this.handleGoBackClick} title="Go back">
            <span className="icon fa">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z" /></svg>
            </span>
            <span className="primary-action-title">
              Shared with me
            </span>
          </a>
          <Link to="/data/quickaccess.html" className="secondary-action button-icon button" title="Cancel">
            <span className="fa icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" /></svg>
            </span>
            <span className="visually-hidden">cancel</span>
          </Link>
        </div>
        <SimpleBar className="list-container">
          <ul className="list-items">
            {!isReady &&
              <li className="empty-entry">
                <p className="processing-text">
                  Retrieving your passwords
                </p>
              </li>
            }
            {isReady &&
              <React.Fragment>
                {!browsedResources.length &&
                  <li className="empty-entry">
                    <p>
                      {isSearching && "No result match your search. Try with another search term."}
                      {!isSearching && "No passwords are shared with you yet. \
                        It does feel a bit empty here, wait for a team member to share a password with you."}
                    </p>
                  </li>
                }
                {(browsedResources.length > 0) &&
                  browsedResources.map(resource =>
                    <li className="resource-entry" key={resource.id}>
                      <a href="#" onClick={(ev) => this.handleSelectResourceClick(ev, resource.id)}>
                        <span className="title">{resource.name}</span>
                        <span className="username"> {resource.username ? `(${resource.username})` : ""}</span>
                        <span className="url">{resource.uri}</span>
                      </a>
                    </li>
                  )}
              </React.Fragment>
            }
          </ul>
        </SimpleBar>
        <div className="submit-wrapper">
          <Link to="/data/quickaccess/resources/create" id="popupAction" className="button primary big full-width" role="button">
            create new
          </Link>
        </div>
      </div>
    );
  }
}

FilterResourcesBySharedWithMePage.contextType = AppContext;

FilterResourcesBySharedWithMePage.propTypes = {
  // Match, location and history props are injected by the withRouter decoration call.
  match: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object
};

export default withRouter(FilterResourcesBySharedWithMePage);
