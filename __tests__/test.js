import os from 'os';
import nock from 'nock';
import path from 'path';
import fs from 'fs';
import downloadingHTMLDocumentAndSave from '../src';
import consoleView from '../src/view';

const testURLOrigin = 'http://www.my-test-999.com';
const testURLPathname = '/my_page';
const testURL = `${testURLOrigin}${testURLPathname}`;
const pathnameForScriptLocalResource = '/assets/script_1.js';
const pathnameForStyleLocalResource = '/assets/my-best-style.css';
const pathnameForImageLocalResource = '/assets/test.jpg';

const pathToTestFixtures = path.join(__dirname, '__fixtures__');
const pathToOriginalHTMLDocumentFile = path.join(pathToTestFixtures, 'original-index.html');
const pathToResultHTMLWithAllLocalResourcesWasSaving = path.join(pathToTestFixtures, 'all-local-res-saved-index.html');
const pathToResultHTMLWithOneLocalResourcesWasSaving = path.join(pathToTestFixtures, 'not-all-local-res-saved-index.html');
const pathToScriptLocalResourceFile = path.join(pathToTestFixtures, pathnameForScriptLocalResource);
const pathToStyleLocalResourceFile = path.join(pathToTestFixtures, pathnameForStyleLocalResource);
const pathToImageLocalResourceFile = path.join(pathToTestFixtures, pathnameForImageLocalResource);

const savedHTMLDocumentFilename = 'www-my-test-999-com-my-page.html';
const directoryForSavingLocalResources = 'www-my-test-999-com-my-page_files';
const savedScriptLocalResourceFilename = 'assets-script-1.js';
const savedStyleLocalResourceFilename = 'assets-my-best-style.css';
const savedImageLocalResourceFilename = 'assets-test.jpg';

const notExistDirectory = '/wrong-dir-name/123';

let pathForSave;

let originalHTMLDocument;
let originalStyleLocalResource;
let originalScriptLocalResource;
let originalImageLocalResource;
let resultHTMLWithAllLocalResourcesWasSaving;
let resultHTMLWithOneLocalResourcesWasSaving;

beforeAll(async () => {
  originalHTMLDocument = await fs.promises.readFile(pathToOriginalHTMLDocumentFile, 'UTF-8');
  originalStyleLocalResource = await fs.promises.readFile(pathToStyleLocalResourceFile, 'UTF-8');
  originalScriptLocalResource = await fs.promises.readFile(pathToScriptLocalResourceFile, 'UTF-8');
  originalImageLocalResource = await fs.promises.readFile(pathToImageLocalResourceFile);
  resultHTMLWithAllLocalResourcesWasSaving = await fs.promises.readFile(pathToResultHTMLWithAllLocalResourcesWasSaving, 'UTF-8');
  resultHTMLWithOneLocalResourcesWasSaving = await fs.promises.readFile(pathToResultHTMLWithOneLocalResourcesWasSaving, 'UTF-8');
});

beforeEach(async () => {
  pathForSave = await fs.promises.mkdtemp(path.join(os.tmpdir(), path.sep));
});

afterEach(() => {
  nock.cleanAll();
});

test('Saving web-page that its all local resources has been saved (library view)', async () => {
  nock(testURLOrigin)
    .get(testURLPathname)
    .replyWithFile(
      200,
      pathToOriginalHTMLDocumentFile,
      { 'Content-Type': 'text/html', 'Content-Length': Buffer.byteLength(originalHTMLDocument) },
    )
    .get(pathnameForScriptLocalResource)
    .replyWithFile(
      200,
      pathToScriptLocalResourceFile,
      { 'Content-Type': 'application/js', 'Content-Length': Buffer.byteLength(originalScriptLocalResource) },
    )
    .get(pathnameForStyleLocalResource)
    .replyWithFile(
      200,
      pathToStyleLocalResourceFile,
      { 'Content-Type': 'text/css', 'Content-Length': Buffer.byteLength(originalStyleLocalResource) },
    )
    .get(pathnameForImageLocalResource)
    .replyWithFile(
      200,
      pathToImageLocalResourceFile,
      { 'Content-Type': 'image/jpeg', 'Content-Length': Buffer.byteLength(originalImageLocalResource) },
    );

  const { resources, filename } = await downloadingHTMLDocumentAndSave(testURL, pathForSave);

  expect(filename).toBe(savedHTMLDocumentFilename);
  expect(resources).toMatchSnapshot();
  const savedHTMLDocument = await fs.promises.readFile(path.join(pathForSave, savedHTMLDocumentFilename), 'UTF-8');
  expect(savedHTMLDocument).toBe(resultHTMLWithAllLocalResourcesWasSaving);

  const pathToSavedScriptLocalResource = path.join(
    pathForSave,
    directoryForSavingLocalResources,
    savedScriptLocalResourceFilename,
  );
  const savedScriptLocalResource = await fs.promises.readFile(pathToSavedScriptLocalResource, 'UTF-8');
  expect(savedScriptLocalResource).toBe(originalScriptLocalResource);

  const pathToSavedStyleLocalResource = path.join(
    pathForSave,
    directoryForSavingLocalResources,
    savedStyleLocalResourceFilename,
  );
  const savedStyleLocalResource = await fs.promises.readFile(pathToSavedStyleLocalResource, 'UTF-8');
  expect(savedStyleLocalResource).toBe(originalStyleLocalResource);

  const pathToSavedImageLocalResource = path.join(
    pathForSave,
    directoryForSavingLocalResources,
    savedImageLocalResourceFilename,
  );
  const savedImageLocalResource = await fs.promises.readFile(pathToSavedImageLocalResource);
  expect(savedImageLocalResource.compare(originalImageLocalResource)).toBe(0);
});

test("Saving web-page that its only one local resources has been saved (several local resources wasn't available)", async () => {
  nock(testURLOrigin)
    .get(pathnameForStyleLocalResource)
    .replyWithError('something awful happened')
    .get(pathnameForImageLocalResource)
    .replyWithError('something awful happened')
    .get(testURLPathname)
    .replyWithFile(
      200,
      pathToOriginalHTMLDocumentFile,
      { 'Content-Type': 'text/html', 'Content-Length': Buffer.byteLength(originalHTMLDocument) },
    )
    .get(pathnameForScriptLocalResource)
    .replyWithFile(
      200,
      pathToScriptLocalResourceFile,
      { 'Content-Type': 'application/js', 'Content-Length': Buffer.byteLength(originalScriptLocalResource) },
    );

  await downloadingHTMLDocumentAndSave(
    testURL,
    pathForSave,
    consoleView.showResourcesSavingStatuses,
  );
  const savedHTMLDocument = await fs.promises.readFile(path.join(pathForSave, savedHTMLDocumentFilename), 'UTF-8');
  expect(savedHTMLDocument).toBe(resultHTMLWithOneLocalResourcesWasSaving);

  const pathToSavedScriptLocalResource = path.join(
    pathForSave,
    directoryForSavingLocalResources,
    savedScriptLocalResourceFilename,
  );
  const savedScriptLocalResource = await fs.promises.readFile(pathToSavedScriptLocalResource, 'UTF-8');
  expect(savedScriptLocalResource).toBe(originalScriptLocalResource);

  const pathToDirForLocalResources = path.join(
    pathForSave,
    directoryForSavingLocalResources,
  );
  const filesWithinDirForLocalResources = await fs.promises.readdir(pathToDirForLocalResources);
  expect(filesWithinDirForLocalResources).toHaveLength(1);
});

test('A failed download of web-page caused status code 404', async () => {
  nock(testURLOrigin)
    .get(testURLPathname)
    .reply(404);

  await expect(downloadingHTMLDocumentAndSave(testURL, pathForSave))
    .rejects.toThrowErrorMatchingSnapshot();

  const filesInPathForSave = await fs.promises.readdir(pathForSave);
  expect(filesInPathForSave).toHaveLength(0);
});

test('A failed download of web-page caused wrong dirname for save', async () => {
  nock(testURLOrigin)
    .get(testURLPathname)
    .replyWithFile(
      200,
      pathToOriginalHTMLDocumentFile,
      { 'Content-Type': 'text/html', 'Content-Length': Buffer.byteLength(originalHTMLDocument) },
    );

  await expect(downloadingHTMLDocumentAndSave(testURL, notExistDirectory))
    .rejects.toThrowErrorMatchingSnapshot();
  await expect(fs.promises.readdir(notExistDirectory)).rejects.toThrowErrorMatchingSnapshot();
});
