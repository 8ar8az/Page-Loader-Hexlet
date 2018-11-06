import noop from 'lodash/map';

const informAboutDownloadingError = noop;

const informAboutFilesystemError = noop;

const showAbortMessage = noop;

const showSuccessMessage = noop;

export default {
  informAboutDownloadingError,
  informAboutFilesystemError,
  showAbortMessage,
  showSuccessMessage,
};
