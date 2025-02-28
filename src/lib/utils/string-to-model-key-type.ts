import capitalize from "./capitalize.js";


const stringToModelKeyType = (storeName: string): keyof Models => {
    const modelName = capitalize(storeName);
    return modelName as keyof Models;
};

export default stringToModelKeyType;