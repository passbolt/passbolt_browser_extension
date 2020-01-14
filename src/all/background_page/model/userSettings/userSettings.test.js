import Validator from 'validator';
import {UserSettings} from "./userSettings";


jest.mock('../config', () => ({
  getItem: (item) => {
    return item;
  },
  read: (item) => {
    return item;
  }
}));

// Reset the modules before each test.
beforeEach(() => {
  window.storage = {getItem: jest.fn()};
  window.Validator = Validator;
  jest.resetModules();
});

describe("User settings validation security token", () => {
  const userSettings = new UserSettings();

  it("should throw an error if security token is empty", () => {
    let t = () => {
      userSettings.validateSecurityToken(undefined);
    };
    expect(t).toThrow('A token cannot be empty.');
  });

  it("should throw an error if security token code is empty", () => {
    let t = () => {
      userSettings.validateSecurityToken({'test': 'test'});
    };
    expect(t).toThrow('A token code cannot be empty.');
  });

  it("should throw an error if security token code is not ASCII chars", () => {
    let t = () => {
      userSettings.validateSecurityToken({'code': '🔥'});
    };
    expect(t).toThrow('The token code should only contain ASCII characters.');
  });

  it("should throw an error if security token code does not contain at least 3 characters", () => {
    let t = () => {
      userSettings.validateSecurityToken({'code': '12'});
    };
    expect(t).toThrow('The token code should only contain 3 characters.');
  });

  it("should throw an error if security token code contains more than 3 characters", () => {
    let t = () => {
      userSettings.validateSecurityToken({'code': '1223'});
    };
    expect(t).toThrow('The token code should only contain 3 characters.');
  });

  it("should throw an error if security token color is not set", () => {
    let t = () => {
      userSettings.validateSecurityToken({'code': '123'});
    };
    expect(t).toThrow('The token color cannot be empty.');
  });

  it("should throw an error if security token color is not hex color", () => {
    let t = () => {
      userSettings.validateSecurityToken({'code': '123', 'color': '#RRR'});
    };
    expect(t).toThrow('This is not a valid token color: #RRR');
  });

  it("should throw an error if security token text color empty", () => {
    let t = () => {
      userSettings.validateSecurityToken({'code': '123', 'color': '#000'});
    };
    expect(t).toThrow('The token text color cannot be empty.');
  });

  it("should throw an error if security token text color is not hex color", () => {
    let t = () => {
      userSettings.validateSecurityToken({'code': '123', 'color': '#66CC00', 'textcolor': '#RRR'});
    };
    expect(t).toThrow('This is not a valid token text color: #RRR.');
  });

  it("should return true if data is valid", () => {
    let t = userSettings.validateSecurityToken({'code': '123', 'color': '#000', 'textcolor' : '#FFF'});
    expect(t).toBe(true);
  });
});
