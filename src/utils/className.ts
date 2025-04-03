/**
 * Combines class names, filtering out falsy values
 * @param classes Array of class names or falsy values
 * @returns A string of combined class names
 */
export const className = (...classes: (string | undefined | null | false)[]): string =>
    classes.filter(Boolean).join(' ');