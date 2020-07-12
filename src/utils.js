export function replaceLocalRefs(schema) {
    const get = (o, p) => p.split('/').slice(1).reduce((a, x) => a[x], o);
    let keys = Object.entries(schema).map(x => [...x, schema]);

    while (keys.length > 0) {
        const [k, v, o] = keys.pop();
        if (typeof v === 'object') keys = [...keys, ...Object.entries(v).map(x => [...x, v])];
        if (k === '$ref') {
            Object.assign(o, get(schema, v));
            delete o[k];
        }
    }
}

function getEndpoints(schema) {
    return Object.entries(schema.paths)
        .map(x => Object.entries(x[1])
            .map(y => ({
                path: x[0],
                verb: y[0],
                data: y[1]
            })))
        .reduce((a, x) => [...a, ...x], []);
}

export function getSections(schema) {
    return schema.tags.map(tag => (
        {
            info: tag,
            endpoints: getEndpoints(schema).filter(x => x.data.tags.includes(tag.name))
        }));
}

function add(name, value, json) {
    if (json === null) {
        return json;
    }

    if (Array.isArray(json)) {
        json.push(value);
    } else {
        if (name !== null) {
            json[name] = value;
        }
    }

    return json;
}

export function parameterToJson(name, parameter, json = null) {
    const enumValue = parameter.enum ? parameter.enum[0] : null;
    switch (parameter.type) {
        case 'integer':
            return add(name, enumValue || 0, json);
        case 'string':
            return add(name, enumValue || 'string', json);
        case 'array':
            const arr = [];
            add(name, arr, json);
            parameterToJson(null, parameter.items, arr);
            return arr;
        case 'object':
            const obj = {};
            add(name, obj, json);
            for (let kvp of Object.entries(parameter.properties)) {
                const [k, v] = kvp;
                parameterToJson(k, v, obj);
            }
            return obj;
        default:
            return json;
    }
}