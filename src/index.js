import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import fs from 'fs';
import path from 'path';
import UI from './ui';
import CustomErrors from './errors';

axios.defaults.adapter = httpAdapter;

const emptyPathnameCharacter = '/';
const filenameFormattingCharacters = {
  fileExtension: '.html',
  characterForReplace: '-',
};

const getFilename = (pageURL) => {
  const { hostname, pathname } = new URL(pageURL);

  const isPathnameEmpty = () => (pathname === emptyPathnameCharacter);

  const formatedPathname = isPathnameEmpty() ? '' : pathname;
  const filename = `${hostname}${formatedPathname}`.replace(/[^a-z\d]/gi, filenameFormattingCharacters.characterForReplace);
  return `${filename}${filenameFormattingCharacters.fileExtension}`;
};

export default (pageURL, pathForSave, currentUI = UI.libraryUI) => {
  const filename = getFilename(pageURL);
  const fullFilepath = path.resolve(pathForSave, filename);

  return axios.get(pageURL, { responseType: 'text' })
    .catch((err) => {
      const error = new CustomErrors.PageLoaderDownloadingError(err.message);
      currentUI.informAboutDownloadingError(pageURL, error.message);
      throw error;
    })

    .then(response => fs.promises.writeFile(fullFilepath, response.data))
    .catch((err) => {
      if (err instanceof CustomErrors.PageLoaderDownloadingError) {
        throw err;
      }

      const error = new CustomErrors.PageLoaderFilesystemError(err.message);
      currentUI.informAboutFilesystemError(fullFilepath, error.message);
      throw error;
    })

    .then(() => fullFilepath);
};
