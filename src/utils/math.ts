export function sum(array: number[]) {
    return array.reduce((sum, val) => sum + val);
}

export function average(array: number[]) {
    const len = array.length;
    return sum(array) / len;
}
