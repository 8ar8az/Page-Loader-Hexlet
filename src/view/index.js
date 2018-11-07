const showAbortMessage = (message) => {
  console.log('Download has been aborted.');
  console.log(`Error message: ${message}`);
};

const showSuccessMessage = (filepath) => {
  console.log(`Download has been finished with success.\nPath to saved file: "${filepath}".`);
};

export default {
  showAbortMessage,
  showSuccessMessage,
};
