import React from "react";
import Search from "./Search";
import { render, fireEvent, waitForElement, cleanup } from 'react-testing-library';
import AppContext from "../../contexts/AppContext";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
});

// Cleanup after each test.
afterEach(cleanup);

describe("Search", () => {

  it("should render the prop search as default input value", () => {
    const appContext = {
      search: "search keywords"
    };
    const component = render(
      <AppContext.Provider value={appContext}>
        <Search debug />);
      </AppContext.Provider>
    );
    const searchInput = component.container.querySelector('[name="search"]');
    expect(searchInput.value).toBe("search keywords");
  });

  it("should update the context search when the search input is updated", () => {
    const appContext = {
      updateSearch: jest.fn()
    };
    const component = render(
      <AppContext.Provider value={appContext}>
        <Search debug />
      </AppContext.Provider>
    );
    const searchInput = component.container.querySelector('[name="search"]');
    const event = { target: { value: "search keywords" } };
    fireEvent.change(searchInput, event);
    expect(appContext.updateSearch).toHaveBeenCalledWith("search keywords");
  });

});
