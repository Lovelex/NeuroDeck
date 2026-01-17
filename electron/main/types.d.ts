declare module 'json-parse-even-better-errors' {
    function parseJson(text: string, reviver?: (key: string, value: any) => any, context?: number): any;
    export = parseJson;
}
