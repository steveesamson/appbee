import fs from 'fs-extra';
// import os from "node:os";
// import path from "node:path";

// const appName = process.env.npm_package_name;
// const MODEL_FILE = path.join(os.tmpdir(), `${appName}.models`);
const interfaceSet = new Set<string>();

const writeGlobals = (base: string) => async (list: string[]) => {
  const globalTemplate = `
	import type { AppModel, DBAware } from "appbee";
	declare global {
	  interface Models {
		${list.join("\n\t\t")}
	  }
	}
	`;
  await fs.ensureDir(base);
  const dest = `${base}/types/extensions.d.ts`;
  await fs.outputFile(dest, globalTemplate);
  // await saveModel(list.length);
}


export const useGlobals = async (isDev: boolean, base: string, models: Models) => {

  const write = writeGlobals(base);
  if (isDev) {
    // const savedModels = getSavedModel();

    const interfaceList: Set<string> = new Set<string>();

    for (const key of Object.keys(models)) {
      if (!interfaceSet.has(key)) {
        interfaceList.add(`${key}: (req: DBAware) => AppModel;`);
        interfaceSet.add(key);
      }
    }
    // if (interfaceSet.size !== savedModels) {
    await write([...interfaceList]);
    // }
  }
}

// function getSavedModel() {
//   if (fs.existsSync(MODEL_FILE)) {
//     const content = fs.readFileSync(MODEL_FILE, 'utf8');
//     return parseInt(content, 10);
//   }
//   return 0;
// }

// async function saveModel(count: number) {
//   await fs.outputFile(MODEL_FILE, `${count}`, 'utf8');
// }
