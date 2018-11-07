import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import { keys } from 'lodash';
import axios from './lib/axios';

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

  return downloadingDataFromUrl(url, 'text')
    .then((html) => {
      const $ = cheerio.load(html, { decodeEntities: false });
      return { ...htmlDocument, $ };
    });
};

const findDomElementsForLocalResources = (htmlDocument) => {
  const selector = keys(typesOfLocalResources)
    .map(tag => `${tag}:not([${typesOfLocalResources[tag].sourceAttribute}*="://"])`)
    .join(', ');

  const localResources = htmlDocument.$(selector);
  return { ...htmlDocument, localResources };
};

const saveLocalResources = (htmlDocument, pathForSave) => {
  const nameOfDirectoryForLocalResources = `${formattingUrlOfHtmlDocument(htmlDocument.url)}${formatCharacters.localResourcesDirEnding}`;
  const pathForSaveLocalResources = path.join(pathForSave, nameOfDirectoryForLocalResources);

  const getAndSaveLocalResource = (localResource) => {
    const { sourceAttribute, responseType } = typesOfLocalResources[localResource.name];
    const resourceUrlPathname = htmlDocument.$(localResource).attr(sourceAttribute);
    const resourceUrl = new URL(resourceUrlPathname, htmlDocument.url.toString());

    const filenameForResource = formattingUrlOfLocalResource(resourceUrl);
    const pathForSaveLocalResource = path.join(pathForSaveLocalResources, filenameForResource);

    return downloadingDataFromUrl(resourceUrl.toString(), responseType)
      .then(resourceData => fs.promises.writeFile(pathForSaveLocalResource, resourceData))
      .then(() => {
        const newValueSourceAttribute = path.join(
          nameOfDirectoryForLocalResources,
          filenameForResource,
        );
        htmlDocument.$(localResource).attr(sourceAttribute, newValueSourceAttribute);
      });
  };

  return fs.promises.mkdir(pathForSaveLocalResources)
    .then(() => {
      if (htmlDocument.localResources.length === 0) {
        return null;
      }

      const iterateLocalResources = ([first, ...rest]) => {
        const iterNext = () => {
          if (rest.length === 0) {
            return null;
          }
          return iterateLocalResources(rest);
        };

        return getAndSaveLocalResource(first)
          .then(iterNext, iterNext);
      };

      return iterateLocalResources(htmlDocument.localResources.get());

    /*      const mapperFn = (i, el) => getAndSaveLocalResource(el);
            const getAndSaveResourcePromises = htmlDocument.localResources.map(mapperFn).get();
            return Promise.all(getAndSaveResourcePromises);
    */
    })
    .then(() => htmlDocument);
};

const saveHtmlDocument = (htmlDocument, pathForSave) => {
  const filenameForHTMLDocument = `${formattingUrlOfHtmlDocument(htmlDocument.url)}${formatCharacters.htmlDocFileExtension}`;
  const pathForSaveHTMLDocument = path.join(pathForSave, filenameForHTMLDocument);

  return fs.promises.writeFile(pathForSaveHTMLDocument, htmlDocument.$.html(), 'UTF-8')
    .then(() => pathForSaveHTMLDocument);
};

export default (htmlDocumentUrl, pathForSave) => {
  const htmlDocument = { url: new URL(htmlDocumentUrl) };

  return getHtmlAndBuildDom(htmlDocument)
    .then(htmlDoc => findDomElementsForLocalResources(htmlDoc))
    .then(htmlDoc => saveLocalResources(htmlDoc, pathForSave))
    .then(htmlDoc => saveHtmlDocument(htmlDoc, pathForSave));
};
