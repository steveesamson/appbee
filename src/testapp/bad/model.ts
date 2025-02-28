import type { Model } from "$lib/common/types.js";


const Accounts: Model = {
    schema: {
        name: 'boolean',
        id: 'number'
    },
    collection: '_accounts_store'
};

// export { Accounts };
// export default Accounts;