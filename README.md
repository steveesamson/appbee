[![Build Status](https://travis-ci.org/steveesamson/typescript-rollup-starter.svg?branch=master)](https://travis-ci.org/steveesamson/typescript-rollup-starter)
[![Coverage Status](https://coveralls.io/repos/github/steveesamson/typescript-rollup-starter/badge.svg?branch=master)](https://coveralls.io/github/steveesamson/typescript-rollup-starter?branch=master)

# Typescript-rollup-starter

This is a boiler-plate for both library authors and application developers targetting TypeScript, rollup.js bundler and jest for tests.

## Prerequisite

- [Node.js](https://nodejs.org)
- [Git](https://git-scm.com)

## Usage

Clone this repo as another name like so:

```cli

$ git clone https://github.com/steveesamson/typescript-rollup-starter.git [project]
```

For instance, when project is **`todo`**:

```cli

$ git clone https://github.com/steveesamson/typescript-rollup-starter.git todo

```

```cli

$ cd todo

$ npm install

```

## React.js

In order to test React components, using enzyme, please install the following:

- enzyme
- @types/enzyme
- enzyme-adapter-react-16
- @types/enzyme-adapter-react-16

Also, ensure to register the `jest.setup.ts` inside `jest.config.js` by adding it like so:

```javascript

"setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"]

```

## Creating Tests

Write your tests inside the test folder using **`[module_name].spec.ts`** as test name template e.g **`LoginModule.spec.ts or LoginModule.spec.tsx`** Note `.tsx` for JSX e.g for react components.

## Running Tests

```cli

$ npm run test

```

Check the scripts key in `package.json` for the complete list of targets.
