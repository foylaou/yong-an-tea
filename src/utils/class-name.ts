export const className = (...classes: (string | boolean | undefined | null)[]) =>
    classes.filter(Boolean).join('');
