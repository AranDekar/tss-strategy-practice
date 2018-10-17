# NodeJs APIs (movie)
This repo is added by [aran dekar](https://www.linkedin.com/in/arandeh/)
This is a micro service to test the strategies by strategy owners, before they can promote it to live they need to backtest the strategies, create different strategies and when they are happy with the result (and if the result meets the mark for live trading) they can promote it to live.

## Documentation
OpenApi 2.0 (swagger). - validation and security
## Transpile
Babel transpiles es6/es7 code (e.g import, await, async, object destruction and etc) into node v8.
## Quality Coding
Eslint is integrated.
## Testing
Jest is used, code coverage is out of the box using Jest.
## Code Coverage Report
Jest provide code coverage, after running the "npm run coverage", to see the coverage on html please refer to coverage/icov-report/index.html.
## Postman
A collection of postman requests are provided in the root.

************

### To Run
1. git clone the project.
2. run "npm install". 
3. run "npm start".
4. the server should be hosted on port 3000.

### To Test
1. run "npm test" - it lints the project and then runs the tests using jest.

### To Lint
1. run "npm run lint" - eslint integrated.

### To Debug
1. open vsCode.
2. select launch from debug list.
3. press f5.

### To Debug Unit Tests
1. open vsCode.
2. select JEST* from debug list.
3. press f5.

### To Test By Postman
1. Movies.postman_collection.json should be imported to postman.
2. run requests.

### To Check Code Covergae
1. run "npm run coverage'.
2. you see a report in command line.
3. to see the coverage on html please refer to coverage/icov-report/index.html.# tss-strategy-practice
