import Listr from 'listr';
import { noop } from 'lodash';

const showAbortMessage = (message) => {
  console.error('Download has been aborted.');
  console.error(`Error message: ${message}`);
};

const showSuccessMessage = (filename) => {
  console.log(`\nPage was downloaded as '${filename}'`);
};

const showResourcesSavingStatuses = (resources, getAndSaveLocalResource) => {
  const makeTask = (resource) => {
    const task = {
      title: resource.resourceUrl.toString(),
      task: () => getAndSaveLocalResource(resource),
    };

    return task;
  };

  const tasks = new Listr(resources.map(makeTask), { concurrent: true, exitOnError: false });
  return tasks.run().catch(noop);
};

export default {
  showAbortMessage,
  showSuccessMessage,
  showResourcesSavingStatuses,
};
