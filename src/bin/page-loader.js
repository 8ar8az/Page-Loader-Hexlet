#!/usr/bin/env node

import program from 'commander';
import downloadingPageAndSave from '..';
import UI from '../ui';

const currentUI = UI.cliUI;

program
  .version('0.1.0', '-v, --version')
  .description('CLI utility to downloading web-pages with its resources and save it on your local disk.')
  .option('--output [path]', 'Input the output path to save files', process.cwd())
  .arguments('<url>')
  .action((url) => {
    downloadingPageAndSave(url, program.output, currentUI)
      .then((filepathOfSavedFile) => {
        currentUI.showSuccessMessage(filepathOfSavedFile);
      })
      .catch(() => {
        currentUI.showAbortMessage();
        process.exit(1);
      });
  })
  .parse(process.argv);
