import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import debug from 'debug';
import { keys, constant } from 'lodash';
import axios from './lib/axios';

const commonLogging = debug('page-loader:common');
const httpLogging = debug('page-loader:http');
const filesystemLogging = debug('page-loader:filesystem');

const emptyPathnameCharacter = '/';
const formatCharacters = {
  htmlDocFileExtension: '.html',
  localResourcesDirEnding: '_files',
  characterForReplace: '-',
};

const typesOfLocalResources = {
  link: {
    sourceAttribute: 'href',
    responseType: 'text',
  },
  script: {
    sourceAttribute: 'src',
    responseType: 'text',
  },
  img: {
    sourceAttribute: 'src',
    responseType: 'arraybuffer',
  },
};

const formattingUrlComponent = component => component.replace(/[^\w]|_/gi, formatCharacters.characterForReplace);

const formattingUrlOfHtmlDocument = (url) => {
  const { hostname, pathname } = url;
  const isPathnameEmpty = () => pathname === emptyPathnameCharacter;

  const formatedHostname = formattingUrlComponent(hostname);
  const formatedPathname = isPathnameEmpty() ? '' : formattingUrlComponent(pathname);
  return `${formatedHostname}${formatedPathname}`;
};

const formattingUrlOfLocalResource = (url) => {
  const { pathname } = url;
  const { dir, name, ext } = path.parse(pathname);
  const pathnameWithoutExt = path.format({ dir, name }).slice(1);

  return `${formattingUrlComponent(pathnameWithoutExt)}${ext}`;
};

const downloadingDataFromUrl = (url, responseType) => axios.get(url, { responseType })
  .then(response => response.data);

const getHtmlAndBuildDom = (htmlDocument) => {
  const url = htmlDocument.url.toString();

  httpLogging('GET-request to HTML-document: %s', url);

  return downloadingDataFromUrl(url, 'text')
    .then((html) => {
      httpLogging('HTML-document has been downloaded');
      const $ = cheerio.load(html, { decodeEntities: false });
      return { ...htmlDocument, $ };
    });
};

const findDomElementsForLocalResources = (htmlDocument) => {
  commonLogging('Finding elements for local resources in HTML-document...');

  const selector = keys(typesOfLocalResources)
    .map(tag => `${tag}:not([${typesOfLocalResources[tag].sourceAttribute}*="://"])`)
    .join(', ');

  const localResources = htmlDocument.$(selector);

  commonLogging('Has been found %n local resources', localResources.length);

  return { ...htmlDocument, localResources };
};

const saveHtmlDocument = (htmlDocument, pathForSave) => {
  const filenameForHtmlDocument = `${formattingUrlOfHtmlDocument(htmlDocument.url)}${formatCharacters.htmlDocFileExtension}`;
  const pathForSaveHtmlDocument = path.join(pathForSave, filenameForHtmlDocument);

  filesystemLogging('Write a file for HTML-document: %s', pathForSaveHtmlDocument);

  return fs.promises.writeFile(pathForSaveHtmlDocument, htmlDocument.$.html(), 'UTF-8')
    .then(() => {
      filesystemLogging('File for HTML-document has been created');
      commonLogging('Page-loader has finished downloading and saving HTML-document');

      return pathForSaveHtmlDocument;
    });
};

const saveLocalResources = (htmlDocument, pathForSave) => {
  if (htmlDocument.localResources.length === 0) {
    return htmlDocument;
  }

  const nameOfDirectoryForLocalResources = `${formattingUrlOfHtmlDocument(htmlDocument.url)}${formatCharacters.localResourcesDirEnding}`;
  const pathForSaveLocalResources = path.join(pathForSave, nameOfDirectoryForLocalResources);

  const getAndSaveLocalResource = (localResource) => {
    const { sourceAttribute, responseType } = typesOfLocalResources[localResource.name];
    const resourceUrlPathname = htmlDocument.$(localResource).attr(sourceAttribute);
    const resourceUrl = new URL(resourceUrlPathname, htmlDocument.url.toString());

    const filenameForResource = formattingUrlOfLocalResource(resourceUrl);
    const pathForSaveLocalResource = path.join(pathForSaveLocalResources, filenameForResource);

    httpLogging('GET-request to local resource: %s', resourceUrl);

    return downloadingDataFromUrl(resourceUrl.toString(), responseType)
      .then((resourceData) => {
        httpLogging('Local resource with URL: "%s" has been downloaded', resourceUrl);
        filesystemLogging('Write a file for local resource: %s', pathForSaveLocalResource);

        fs.promises.writeFile(pathForSaveLocalResource, resourceData);
      })
      .then(() => {
        filesystemLogging('File for local resource: "%s" has been created', pathForSaveLocalResource);

        const newValueSourceAttribute = path.join(
          nameOfDirectoryForLocalResources,
          filenameForResource,
        );
        htmlDocument.$(localResource).attr(sourceAttribute, newValueSourceAttribute);
        commonLogging("Source attribute of local resource's element has been changed to: %s", newValueSourceAttribute);
      });
  };

  filesystemLogging('Make a directory for save files of local resources: %s', pathForSaveLocalResources);
  return fs.promises.mkdir(pathForSaveLocalResources)
    .then(() => {
      filesystemLogging('The directory has been made');
      commonLogging('Downloading and saving of local resources starting...');

      const mapperFn = (i, el) => getAndSaveLocalResource(el).then(constant(null), constant(null));
      const getAndSaveResourcePromises = htmlDocument.localResources.map(mapperFn).get();
      return Promise.all(getAndSaveResourcePromises);
    })
    .then(() => htmlDocument);
};

export default (htmlDocumentUrl, pathForSave) => {
  const htmlDocument = { url: new URL(htmlDocumentUrl) };

  commonLogging('Page-loader has been started to the download HTML-document from: "%s", to "%s"', htmlDocument.url.toString(), pathForSave);

  return getHtmlAndBuildDom(htmlDocument)
    .then(htmlDoc => findDomElementsForLocalResources(htmlDoc))
    .then(htmlDoc => saveLocalResources(htmlDoc, pathForSave))
    .then(htmlDoc => saveHtmlDocument(htmlDoc, pathForSave));
};
