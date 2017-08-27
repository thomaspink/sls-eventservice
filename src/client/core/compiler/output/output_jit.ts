function evalExpression(
  sourceUrl: string, ctx: EmitterVisitorContext, vars: { [key: string]: any },
  createSourceMap: boolean): any {
  let fnBody = `${ctx.toSource()}\n//# sourceURL=${sourceUrl}`;
  const fnArgNames: string[] = [];
  const fnArgValues: any[] = [];
  for (const argName in vars) {
    fnArgNames.push(argName);
    fnArgValues.push(vars[argName]);
  }
  if (createSourceMap) {
    // using `new Function(...)` generates a header, 1 line of no arguments, 2 lines otherwise
    // E.g. ```
    // function anonymous(a,b,c
    // /**/) { ... }```
    // We don't want to hard code this fact, so we auto detect it via an empty function first.
    const emptyFn = new Function(...fnArgNames.concat('return null;')).toString();
    const headerLines = emptyFn.slice(0, emptyFn.indexOf('return null;')).split('\n').length - 1;
    fnBody += `\n${ctx.toSourceMapGenerator(sourceUrl, sourceUrl, headerLines).toJsComment()}`;
  }
  return new Function(...fnArgNames.concat(fnBody))(...fnArgValues);
}
