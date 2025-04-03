/**
 * Flattens an array to a specified depth
 * @param arr The input array to flatten
 * @param d The depth of flattening (default is 1)
 * @returns A flattened array
 */
export const flatDeep = <T>(arr: T[], d: number = 1): T[] => {
    if (d > 0) {
        return arr.reduce<T[]>((acc, val) => {
            // Type guard to check if val is an array
            if (Array.isArray(val)) {
                return acc.concat(flatDeep(val as T[], d - 1));
            }
            return acc.concat(val);
        }, []);
    }
    return arr.slice();
};