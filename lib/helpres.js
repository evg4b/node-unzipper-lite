function promiseProps(obj) {
    const keys = Object.keys(obj);
    return Promise.all(keys.map(key => obj[key]))
        .then(values => values.reduce((acc, value, ind) => ({
            ...acc,
            [keys[ind]]: value
        }), {}));
}

async function promiseMapSeries(array, callback) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        result.push(await callback(array[i], i));
    }
    return result;
}

async function promiseMap(array, callback, options = {}) {
    const limit = options.concurrency ?? 1;
    let result = [];
    const dataChinks = chunk(array.map(callback), limit);
    for (let i = 0; i < dataChinks.length; i++) {
        result.push(...await Promise.all(dataChinks[i]));
    }

    return result;
}

function chunk(array, size) {
    let result = [];

    for (let i = 0; i < array.length; i += size) {
        let chunk = array.slice(i, i + size);
        result.push(chunk);
    }

    return result;
}

module.exports = {
    promiseProps: promiseProps,
    mapSeries: promiseMapSeries,
    promiseMap: promiseMap,
}