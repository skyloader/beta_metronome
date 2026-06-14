import _ from 'lodash';
export class JsonBuilder {
    constructor(json = {}) {
        this.json = json;
    }
    add(key, value, serializeEmpty = false) {
        if ((_.isNil(value) || value === '') && !serializeEmpty) {
            return this;
        }
        this.json[key] = value;
        return this;
    }
}
export function recursiveDasherizeKeys(body) {
    let dasherized = _.mapKeys(body, (_value, key) => dasherize(key));
    dasherized = _.mapValues(dasherized, (value) => {
        if (_.isPlainObject(value)) {
            return recursiveDasherizeKeys(value);
        }
        return value;
    });
    return dasherized;
}
export function dasherize(target) {
    // prettier-ignore
    return target
        .replace(/([A-Z])/g, (_match, p1, _offset, _whole) => `-${p1.toLowerCase()}`)
        .replace(/\s/g, '-');
}
//# sourceMappingURL=json-util.js.map