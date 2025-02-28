
	import type { AppModel, DBAware } from "appbee";
	declare global {
	  interface Models {
		Accounts: (req: DBAware) => AppModel;
		Posts: (req: DBAware) => AppModel;
		Stories: (req: DBAware) => AppModel;
		Users: (req: DBAware) => AppModel;
		Vehicles: (req: DBAware) => AppModel;
		Weather: (req: DBAware) => AppModel;
	  }
	}
	