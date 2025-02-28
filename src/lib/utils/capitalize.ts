
const capitalize = (str: string): string => {

    if (!str) return str;
    const strArr = str.split(/_/);
    const caps = strArr.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1));
    return caps.join("");
}

export default capitalize;