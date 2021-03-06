#!/usr/bin/env node

import program from 'commander';
import downloadingHTMLDocumentAndSave from '..';
import consoleView from '../view';

program
  .version('0.4.0', '-v, --version')
  .description('CLI utility to downloading web-pages with its resources and save it on your local disk.')
  .option('--output [path]', 'Input the output path to save files', process.cwd())
  .arguments('<url>')
  .action((url) => {
    downloadingHTMLDocumentAndSave(url, program.output, consoleView.showResourcesSavingStatuses)
      .then(({ filename }) => {
        consoleView.showSuccessMessage(filename);
      })
      .catch((err) => {
        consoleView.showAbortMessage(err.message);
        process.exit(1);
      });
  })
  .parse(process.argv);
