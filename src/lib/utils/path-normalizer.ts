
type Mount = `/${string}`;
const normalizePath = (base: string, mountPoint: Mount) =>
	base === "/" ? mountPoint : mountPoint + base.replace(mountPoint, "");
// base.replace(mountPoint, "");

export { normalizePath };
