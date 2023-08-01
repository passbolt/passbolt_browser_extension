import NodeEnvironment from "jest-environment-node";

class JestCustomKdbxEnvironment extends NodeEnvironment {
  constructor(config) {
    super({
      ...config,
      globals: {
        ...config.globals,
        Uint8Array: Uint8Array, // Node overrides this primitive making impossible to test the kdbx parsers
        ArrayBuffer: ArrayBuffer
      }
    });
  }
}

export default JestCustomKdbxEnvironment;
