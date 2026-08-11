export function sum(array: number[]): number {
    return array.reduce((sum, val) => sum + val);
}

export function average(array: number[]): number {
    const len = array.length;
    return sum(array) / len;
}

export function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}
