export function nthIndexOf(str: string, substr: string, n: number) {
    let i = -1;

    while (n-- && i++ < str.length) {
        i = str.indexOf(substr, i);
        if (i < 0) break;
    }

    return i;
}