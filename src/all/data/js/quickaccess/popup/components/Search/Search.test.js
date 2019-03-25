import React from "react";
import Search from "./Search";
import { render, fireEvent, waitForElement, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect'

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
});

// Cleanup after each test.
afterEach(cleanup);

describe("Search", () => {

  it("should match the snapshot", () => {
    const component = render(<Search debug />);
    expect(component.container).toMatchSnapshot();
  });

  it("should render the prop search as default input value", () => {
    const component = render(<Search search="search keywords" debug />);
    const searchInput = component.container.querySelector('[name="search"]');
    expect(searchInput.value).toBe("search keywords");
  });

  it("should execute the searchUpdated prop function when the search input field is updated", () => {
    const searchChangeCallbackFn = jest.fn();
    const component = render(<Search searchChangeCallback={searchChangeCallbackFn} debug />);
    const searchInput = component.container.querySelector('[name="search"]');
    const event = { target: { value: "search keywords" } };
    fireEvent.change(searchInput, event);
    expect(searchChangeCallbackFn).toHaveBeenCalledWith("search keywords");
  });

});
