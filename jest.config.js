module.exports = {
  roots: ["<rootDir>/test"],
  testMatch: [
    "**/?(*.)+(spec|test).+(ts|tsx)"
  ],
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest"
  },
  //Install enzyme-adapter-react-16, enzyme, @types/enzyme, @types/enzyme-adapter-react-16
  //Needed for Enzyme, React and <rootDir>/jest.setup.ts
  //"setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"]
};
