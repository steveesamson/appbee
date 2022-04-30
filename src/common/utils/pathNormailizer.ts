const normalizePath = (base: string, mountPoint: string) =>
	base === '/' ? mountPoint : mountPoint + base.replace(mountPoint, '');

export { normalizePath };
