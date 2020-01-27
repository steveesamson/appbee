declare namespace NodeJS {
	interface Global {
		isMultitenant: boolean;
		SERVER_TYPE: string;
		APP_PORT: number;
		MOUNT_PATH: string;
		BASE_DIR: string;
		PUBLIC_DIR: string;
		VIEW_DIR: string;
		IO: any;
	}
}
