export const flatDeep = <T>(arr: (T | T[])[], d = 1): T[] =>
    d > 0
        ? arr.reduce<T[]>(
              (acc, val) =>
                  acc.concat(
                      Array.isArray(val)
                          ? flatDeep(val as (T | T[])[], d - 1)
                          : (val as T)
                  ),
              []
          )
        : (arr.slice() as T[]);
