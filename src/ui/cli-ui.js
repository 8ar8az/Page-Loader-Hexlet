const informAboutDownloadingError = (url, errorMessage) => {
  console.log(`While downloading the web-page with URL: "${url}" error occurred!`);
  console.log(`Error message: ${errorMessage}`);
};

const informAboutFilesystemError = (filepath, errorMessage) => {
  console.log(`While saving file "${filepath}" error occurred!`);
  console.log(`Error message: ${errorMessage}`);
};

const showAbortMessage = () => {
  console.log('Download has been aborted.');
};

const showSuccessMessage = (filepath) => {
  console.log(`Download has been finished with success.\nPath to saved file: "${filepath}".`);
};

export default {
  informAboutDownloadingError,
  informAboutFilesystemError,
  showAbortMessage,
  showSuccessMessage,
};
