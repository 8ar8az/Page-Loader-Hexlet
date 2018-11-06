import os from 'os';
import nock from 'nock';
import path from 'path';
import fs from 'fs';
import downloadingPageAndSave from '../src';
import CustomErrors from '../src/errors';

const pathToTestPageFile = path.resolve(__dirname, '__fixtures__/index.html');
const notExistDirectory = '/wrong-dir-name/123';

const testURLOrigin = 'http://my-test-999.com';
const testURLPathname = '/';
const testURL = `${testURLOrigin}${testURLPathname}`;

let pathForSave;
let testPageHTML;

beforeAll(async () => {
  testPageHTML = await fs.promises.readFile(pathToTestPageFile, 'UTF-8');
});

beforeEach(async () => {
  pathForSave = await fs.promises.mkdtemp(path.join(os.tmpdir(), path.sep));
});

afterEach(() => {
  nock.cleanAll();
});

test('A successful download of web-page', async () => {
  nock(testURLOrigin)
    .get(testURLPathname)
    .replyWithFile(
      200,
      pathToTestPageFile,
      { 'Content-Type': 'text/html', 'Content-Length': Buffer.byteLength(testPageHTML) },
    );

  const pathToSavedFile = await downloadingPageAndSave(testURL, pathForSave);
  const savedHtml = await fs.promises.readFile(pathToSavedFile, 'UTF-8');

  expect(savedHtml).toBe(testPageHTML);
});

test('A failed download of web-page caused status code 404', async () => {
  nock(testURLOrigin)
    .get(testURLPathname)
    .reply(404);

  try {
    await downloadingPageAndSave(testURL, pathForSave);
    expect(false).toBeTruthy();
  } catch (err) {
    expect(err).toBeInstanceOf(CustomErrors.PageLoaderDownloadingError);

    const filesInPathForSave = await fs.promises.readdir(pathForSave);
    expect(filesInPathForSave).toHaveLength(0);
  }
});

test('A failed download of web-page caused wrong dirname for save', async () => {
  nock(testURLOrigin)
    .get(testURLPathname)
    .replyWithFile(
      200,
      pathToTestPageFile,
      { 'Content-Type': 'text/html', 'Content-Length': Buffer.byteLength(testPageHTML) },
    );

  try {
    await downloadingPageAndSave(testURL, notExistDirectory);
    expect(false).toBeTruthy();
  } catch (err) {
    expect(err).toBeInstanceOf(CustomErrors.PageLoaderFilesystemError);
  }

  try {
    await fs.promises.readdir(notExistDirectory);
    expect(false).toBeTruthy();
  } catch (err) {
    expect(err.constructor.name).not.toBe('JestAssertionError');
  }
});
