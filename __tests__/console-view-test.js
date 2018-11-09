import consoleView from '../src/view';

const standardConsoleLog = console.log;
const standardConsoleError = console.error;
const consoleLogOutput = [];
const consoleErrorOutput = [];

const consoleLogMock = (arg) => {
  consoleLogOutput.push(arg);
};
const consoleErrorMock = (arg) => {
  consoleErrorOutput.push(arg);
};

beforeEach(() => {
  console.log = consoleLogMock;
  console.error = consoleErrorMock;
});

afterEach(() => {
  console.log = standardConsoleLog;
  console.error = standardConsoleError;
});

test("Show statuses of resource's saving", () => {
  const resources = [
    {
      resourceUrl: 'http://www.test.ru/assets/style.css',
      isSaved: true,
    },
    {
      resourceUrl: 'http://www.test.ru/assets/script.js',
      isSaved: true,
    },
    {
      resourceUrl: 'http://www.test.ru/assets/img.jpg',
      isSaved: false,
      err: new Error('Something wrong'),
    },
  ];

  consoleView.showStatusOfResourcesSaving(resources);

  expect(consoleLogOutput).toMatchSnapshot();
  expect(consoleErrorOutput).toMatchSnapshot();
});
