'use babel'

import { dirname } from 'path';
import * as helpers from 'atom-linter';

import { CompositeDisposable } from 'atom';

const yamlErrorRegex = /line (\d*), column (\d*) (.*)$/gm
const schemaSaladToolErrorRegex = /[^:]*:(\d*):(\d*): (.*)$/gm

let executablePath;
let validateYamlPath;

export function activate() {
  require('atom-package-deps').install('linter-cwl');
  this.subscriptions = new CompositeDisposable();

  this.subscriptions.add(
      atom.config.observe('linter-cwl.executablePath', (value) => {
        executablePath = value;
      }),
      atom.config.observe('linter-cwl.validateYamlPath', (value) => {
        validateYamlPath = value;
      }),
  );
}

export function deactivate() {
  // Fill something here, optional
}

export function provideLinter() {
  return {
    name: 'CWL',
    scope: 'file', // or 'project'
    lintsOnChange: false, // or true
    grammarScopes: ['source.cwl'],
    lint: async (textEditor) => {
      const filePath = textEditor.getPath();
      const fileText = textEditor.getText();

      const execArgs = ['--quiet', '--print-oneline', validateYamlPath, filePath];
      const execOpts = {
        cwd: dirname(filePath),
        stream: 'stderr',
        ignoreExitCode: true,
        allowEmptyStderr: true,
      };

      const result = await helpers.exec(executablePath, execArgs, execOpts);
      //
      // if (textEditor.getText() !== fileText) {
      //   // File contents changed since lint started, print a warning to the console
      //   // eslint-disable-next-line no-console
      //   console.warn('linter-cwl:: The file was modified since the ' +
      //     'request was sent to check it. Since any results would no longer ' +
      //     'be valid, they are not being updated. Please save the file ' +
      //     'again to update the results.');
      //   return null;
      // }


      const messages = [];
      //
      let match = yamlErrorRegex.exec(result);
      //console.log(match==null)
      while (match !== null) {
        const line = Number.parseInt(match[1], 10) - 1;
        const column = Number.parseInt(match[2], 10) - 1;
        messages.push({
          severity: 'error',
          location: {
            file: filePath,
            position: [[line, column], [line, column + 1]],
          },
          excerpt: match[3],
          description: match[3]
        });
        match = yamlErrorRegex.exec(result);
      }
      //
      let match2 = schemaSaladToolErrorRegex.exec(result)
      while(match2 !== null){
        const line = Number.parseInt(match2[1], 10) - 1;
        const column = Number.parseInt(match2[2], 10) - 1;
        messages.push({

        severity: 'error',
        location: {
          file: filePath,
          position: [[line, column], [line, column + 1]],
        },
        excerpt: match2[3],
        description: match2[3]
        });
        match2 = schemaSaladToolErrorRegex.exec(result)
      }

      return messages
      return new Promise(function(resolve) {
        resolve(messages)
      })
    }
  }
}
