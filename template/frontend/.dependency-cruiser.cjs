// Extend this starter configuration as application modules are introduced (ADR 0011).
module.exports = {
  forbidden: [
    { name: 'no-unresolved-imports', severity: 'error', from: {}, to: { couldNotResolve: true } },
    { name: 'no-cycles', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'production-does-not-import-tests',
      severity: 'error',
      from: { pathNot: '__tests__|\\.(spec|test)\\.' },
      to: { path: '__tests__|\\.(spec|test)\\.' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.app.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { extensions: ['.ts', '.js', '.vue', '.json', '.css'] },
  },
}
