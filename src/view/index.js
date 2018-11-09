const savingStatusCharacters = {
  success: '+',
  fail: '-',
};

const showAbortMessage = (message) => {
  console.error('Download has been aborted.');
  console.error(`Error message: ${message}`);
};

const showSuccessMessage = (filepath) => {
  console.log(`Download has been finished with success.\nPath to saved file: "${filepath}".`);
};

const showStatusOfResourcesSaving = (resources) => {
  const savedResources = resources.filter(resource => resource.isSaved);
  const notSavedResources = resources.filter(resource => !resource.isSaved);

  console.log('This local resources has been successful saved:');
  savedResources.forEach((resource) => {
    console.log(`${savingStatusCharacters.success} ${resource.resourceUrl}`);
  });

  console.log();
  console.error("This local resources hasn't been saved:");
  notSavedResources.forEach((resource) => {
    console.error(`${savingStatusCharacters.fail} ${resource.resourceUrl}`);
    console.error(`Reason: ${resource.err.message}`);
  });
};

export default {
  showAbortMessage,
  showSuccessMessage,
  showStatusOfResourcesSaving,
};
