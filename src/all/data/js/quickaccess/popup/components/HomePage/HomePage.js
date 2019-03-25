import browser from "webextension-polyfill/dist/browser-polyfill";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router-dom";
import AppContext from "../../contexts/AppContext";

const SUGGESTED_RESOURCES_LIMIT = 3;
const BROWSED_RESOURCES_LIMIT = 500;

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.initEventHandlers();
    this.initState();
  }

  componentDidMount() {
    this.findResources();
    this.getTabUrl();
  }

  initEventHandlers() {
    this.handleStorageChange = this.handleStorageChange.bind(this);
    browser.storage.onChanged.addListener(this.handleStorageChange);
  }

  initState() {
    this.state = {
      resources: null,
      tabUrl: null
    };
  }

  handleStorageChange(changes) {
    if (changes.resources) {
      const resources = changes.resources.newValue;
      this.sortResourcesAlphabetically(resources);
      this.setState({ resources });
    }
  }

  async findResources() {
    const storageData = await browser.storage.local.get(["resources"]);
    if (storageData.resources) {
      const resources = storageData.resources;
      this.sortResourcesAlphabetically(resources);
      this.setState({ resources });
    }
    passbolt.request("passbolt.resources.update-local-storage");
  }

  sortResourcesAlphabetically(resources) {
    if (resources == null) {
      return;
    }

    resources.sort((resource1, resource2) => {
      const resource1Name = resource1.name.toUpperCase();
      const resource2Name = resource2.name.toUpperCase();
      if (resource1Name > resource2Name) {
        return 1;
      } else if (resource2Name > resource1Name) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  async getTabUrl() {
    const tabUrl = await passbolt.request("passbolt.active-tab.get-url");
    this.setState({ tabUrl })
  }

  /**
   * Get the resources for the suggested section.
   * @return {array} The list of resources.
   */
  getSuggestedResources() {
    const suggestedResources = [];
    // If the resources have not yet been loaded or the user is searching.
    if (this.state.resources == null || this.props.search.length > 0) {
      return suggestedResources;
    }

    for (let i in this.state.resources) {
      const resource = this.state.resources[i];
      if (resource.uri) {
        // Extract the domain from the resource uri, it ensures a higher matching rate :
        // - By instance at amazon the same credentials can be used on different subdomains: www.amazon.com; signin.aws.amazon.com; etc ..
        // - Removing the final part of the urls allows to match DOMAIN/user/login as well as DOMAIN/ap/signin that can vary from a domain service to another.
        const resourceUriToMatch = resource.uri.replace(/^((http|https):\/\/)?(www\.)?([^\/]*)(\/.*)?/, "$4");
        const regex = new RegExp(this.escapeRegExp(resourceUriToMatch), 'i');
        if (regex.test(this.state.tabUrl)) {
          suggestedResources.push(resource);
          if (suggestedResources.length == SUGGESTED_RESOURCES_LIMIT) {
            break;
          }
        }
      }
    }

    return suggestedResources;
  }

  /**
   * Get the resources for the browse section.
   * @return {array} The list of resources.
   */
  getBrowsedResources() {
    let resources = this.state.resources;
    if (resources == null) {
      return null;
    }

    if (this.props.search.length) {
      // @todo optimization. Memoize result to avoid filtering each time the component is rendered.
      // @see reactjs doc https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
      resources = this.filterResourcesBySearch(resources, this.props.search);
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
    return this.state.resources !== null
      && this.state.tabUrl != null;
  }

  render() {
    const suggestedResources = this.getSuggestedResources();
    const browsedResources = this.getBrowsedResources();

    return (
      <div className="index-list">
        <div className="list-container" data-simplebar>
          {/* This section cannot be shown/hidden with a JSX && condition. Otherwise it generates an unexpected error : Failed to execute 'insertBefore' on 'Node' */}
          <div className={`list-section ${!suggestedResources.length ? "visually-hidden" : ""}`}>
            <div className="list-title">
              <h2>Suggested</h2>
            </div>
            <ul className="list-items">
              {suggestedResources.length > 0 &&
                suggestedResources.map((resource) => (
                  <li className="resource-entry" key={resource.id}>
                    <Link to={`/data/quickaccess/resources/view/${resource.id}`}>
                      <span className="title">{resource.name}</span>
                      <span className="username"> {resource.username ? `(${resource.username})` : ""}</span>
                      <span className="url">{resource.uri}</span>
                    </Link>
                  </li>
                ))
              }
            </ul>
          </div>
          <div className="list-section">
            <div className="list-title">
              <h2>Browse</h2>
            </div>
            <ul className="list-items">
              <React.Fragment>
                {(browsedResources == null) &&
                  <li className="empty-entry">
                    <p className="processing-text">Retrieving your passwords</p>
                  </li>
                  || ""}
                {(browsedResources && browsedResources.length > 0) &&
                  browsedResources.map((resource) => (
                    <li className="resource-entry" key={resource.id}>
                      <Link to={`/data/quickaccess/resources/view/${resource.id}`}>
                        <span className="title">{resource.name}</span>
                        <span className="username"> {resource.username ? `(${resource.username})` : ""}</span>
                        <span className="url">{resource.uri}</span>
                      </Link>
                    </li>
                  ))}
                {(browsedResources && browsedResources.length == 0) &&
                  <li className="empty-entry">
                    {this.props.search.length &&
                      <p>No result match your search. Try with another search term.</p>
                      || ""}
                    {!this.props.search.length &&
                      <p>It does feel a bit empty here. Create your first password or wait for a team member to share one with you.</p>
                      || ""}
                  </li>
                }
              </React.Fragment>
            </ul>
          </div>
        </div>
        <div className="submit-wrapper">
          <a href={this.context.user["user.settings.trustedDomain"]} id="popupAction" className="button primary big full-width" role="button" target="_blank" rel="noopener noreferrer">
            open passbolt
          </a>
        </div>
      </div>
    );
  }
}

HomePage.contextType = AppContext;

HomePage.propTypes = {
  search: PropTypes.string
};

export default HomePage;
