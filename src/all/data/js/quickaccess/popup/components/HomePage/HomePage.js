import browser from "webextension-polyfill/dist/browser-polyfill";
import React from "react";
import PropTypes from "prop-types";
import {Trans, withTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import AppContext from "../../contexts/AppContext";
import SimpleBar from "../SimpleBar/SimpleBar";
import canSuggestUrl from "./canSuggestUrl";

const SUGGESTED_RESOURCES_LIMIT = 20;
const BROWSED_RESOURCES_LIMIT = 500;

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.initEventHandlers();
    this.initState();
  }

  componentDidMount() {
    // Reset the search and any search history.
    this.context.searchHistory = [];
    this.context.updateSearch("");
    this.context.focusSearch();
    this.findResources();
    this.getActiveTabUrl();
  }

  initEventHandlers() {
    this.handleStorageChange = this.handleStorageChange.bind(this);
    browser.storage.onChanged.addListener(this.handleStorageChange);
  }

  initState() {
    this.state = {
      resources: null,
      activeTabUrl: null
    };
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
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
    passbolt.request('passbolt.resources.update-local-storage');
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

  async getActiveTabUrl() {
    try {
      const activeTabUrl = await passbolt.request("passbolt.active-tab.get-url");
      this.setState({ activeTabUrl });
    } catch(error) {
      console.error(error);
    }
  }

  /**
   * Get the resources for the suggested section.
   * @param {string} activeTabUrl the active tab url
   * @param {array} resources The list of resources to filter.
   * @return {array} The list of filtered resources.
   */
  getSuggestedResources(activeTabUrl, resources) {
    if (!activeTabUrl) {
      return [];
    }

    const suggestedResources = [];

    for (let i in resources) {
      if (!resources[i].uri) {
        continue;
      }

      if (canSuggestUrl(activeTabUrl, resources[i].uri)) {
        suggestedResources.push(resources[i]);
        if (suggestedResources.length == SUGGESTED_RESOURCES_LIMIT) {
          break;
        }
      }
    }

    // Sort the resources by uri lengths, the greater on top.
    suggestedResources.sort((a, b) => b.uri.length - a.uri.length);

    return suggestedResources;
  }

  /**
   * Get the resources for the browse section.
   * @return {array} The list of resources.
   */
  getBrowsedResources() {
    let browsedResources = this.state.resources.slice(0);

    if (this.context.search.length) {
      // @todo optimization. Memoize result to avoid filtering each time the component is rendered.
      // @see reactjs doc https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
      browsedResources = this.filterResourcesBySearch(browsedResources, this.context.search);
    }

    return browsedResources.slice(0, BROWSED_RESOURCES_LIMIT);
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

  render() {
    const isReady = this.state.resources !== null;
    const showSuggestedSection = !this.context.search.length;
    const showBrowsedResourcesSection = this.context.search.length > 0;
    const showFiltersSection = !this.context.search.length;
    const isProEdition = this.context.siteSettings && this.context.siteSettings.passbolt.edition === "pro";
    let browsedResources, suggestedResources;

    if (isReady) {
      if (showSuggestedSection) {
        suggestedResources = this.getSuggestedResources(this.state.activeTabUrl, this.state.resources);
      }
      if (showBrowsedResourcesSection) {
        browsedResources = this.getBrowsedResources();
      }
    }

    return (
      <div className="index-list">
        <SimpleBar className="list-container">
          {showSuggestedSection &&
            <div className={`list-section`}>
              <div className="list-title">
                <h2><Trans>Suggested</Trans></h2>
              </div>
              <ul className="list-items">
                {!isReady &&
                  <li className="empty-entry">
                    <p className="processing-text"><Trans>Retrieving your passwords</Trans></p>
                  </li>
                }
                {(isReady && suggestedResources.length == 0) &&
                  <li className="empty-entry">
                    <p><Trans>No passwords found for the current page. You can use the search.</Trans></p>
                  </li>
                }
                {(isReady && suggestedResources.length > 0) &&
                  suggestedResources.map((resource) => (
                    <li className="resource-entry" key={resource.id}>
                      <Link to={`/data/quickaccess/resources/view/${resource.id}`}>
                        <span className="title">{resource.name}</span>
                        <span className="username"> {resource.username ? `(${resource.username})` : ""}</span>
                        <span className="url">{resource.uri}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          }
          {showBrowsedResourcesSection &&
            <div className="list-section">
              <div className="list-title">
                <h2><Trans>Browse</Trans></h2>
              </div>
              <ul className="list-items">
                <React.Fragment>
                  {!isReady &&
                    <li className="empty-entry">
                      <p className="processing-text"><Trans>Retrieving your passwords</Trans></p>
                    </li>
                  }
                  {(isReady && browsedResources.length == 0) &&
                    <li className="empty-entry">
                      <p><Trans>No result match your search. Try with another search term.</Trans></p>
                    </li>
                  }
                  {(isReady && browsedResources.length > 0) &&
                    browsedResources.map((resource) => (
                      <li className="resource-entry" key={resource.id}>
                        <Link to={`/data/quickaccess/resources/view/${resource.id}`}>
                          <span className="title">{resource.name}</span>
                          <span className="username"> {resource.username ? `(${resource.username})` : ""}</span>
                          <span className="url">{resource.uri}</span>
                        </Link>
                      </li>
                    ))}
                </React.Fragment>
              </ul>
            </div>
          }
          {showFiltersSection &&
            <div className="list-section">
              <div className="list-title">
                <h2><Trans>Browse</Trans></h2>
              </div>
              <ul className="list-items">
                <li className="filter-entry">
                  <Link to={"/data/quickaccess/more-filters"}>
                    <span className="fa icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-label="filter icon"><path d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z" /></svg>
                    </span>
                    <span className="filter"><Trans>Filters</Trans></span>
                  </Link>
                </li>
                <li className="filter-entry">
                  <Link to={"/data/quickaccess/resources/group"}>
                    <span className="fa icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" aria-label="group icon"><path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z" /></svg>
                    </span>
                    <span className="filter"><Trans>Groups</Trans></span>
                  </Link>
                </li>
                {isProEdition &&
                  <li className="filter-entry">
                    <Link to={"/data/quickaccess/resources/tag"}>
                      <span className="fa icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" aria-label="tags icon"><path d="M497.941 225.941L286.059 14.059A48 48 0 0 0 252.118 0H48C21.49 0 0 21.49 0 48v204.118a48 48 0 0 0 14.059 33.941l211.882 211.882c18.744 18.745 49.136 18.746 67.882 0l204.118-204.118c18.745-18.745 18.745-49.137 0-67.882zM112 160c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48zm513.941 133.823L421.823 497.941c-18.745 18.745-49.137 18.745-67.882 0l-.36-.36L527.64 323.522c16.999-16.999 26.36-39.6 26.36-63.64s-9.362-46.641-26.36-63.64L331.397 0h48.721a48 48 0 0 1 33.941 14.059l211.882 211.882c18.745 18.745 18.745 49.137 0 67.882z" /></svg>
                      </span>
                      <span className="filter"><Trans>Tags</Trans></span>
                    </Link>
                  </li>
                }
              </ul>
            </div>
          }
        </SimpleBar>
        <div className="submit-wrapper">
          <Link to={`/data/quickaccess/resources/create`} id="popupAction" className="button primary big full-width" role="button">
            <Trans>Create new</Trans>
          </Link>
        </div>
      </div>
    );
  }
}

HomePage.contextType = AppContext;
HomePage.propTypes = {
  t: PropTypes.func, // The translation function
};

export default withTranslation('common')(HomePage);
