'use babel'

export function activate() {
  // Fill something here, optional
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
    lint(textEditor) {
  
      const editorPath = textEditor.getPath()

      // Do something sync
      return [{
        severity: 'info',
        location: {
          file: editorPath,
          position: [[0, 0], [0, 1]],
        },
        excerpt: `A random value is ${Math.random()}`,
        description: `### What is this?\nThis is a randomly generated value`
      }]

      // Do something async
      return new Promise(function(resolve) {
        resolve([{
          severity: 'info',
          location: {
            file: editorPath,
            position: [[0, 0], [0, 1]],
          },
          excerpt: `A random value is ${Math.random()}`,
          description: `### What is this?\nThis is a randomly generated value`
        }])
      })
    }
  }
}
