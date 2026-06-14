import _ from 'lodash';
export type BasicJsonValue = boolean | number | string | null | undefined;
export type JsonValue = BasicJsonValue | JsonArray | JsonMap;
export interface JsonMap {
    [key: string]: JsonValue | undefined;
}
export type JsonArray = JsonValue[];
export declare class JsonBuilder {
    readonly json: JsonMap;
    constructor(json?: JsonMap);
    add(key: string, value: JsonValue, serializeEmpty?: boolean): this;
}
export declare function recursiveDasherizeKeys(body: any): _.Dictionary<any>;
export declare function dasherize(target: string): string;
//# sourceMappingURL=json-util.d.ts.map