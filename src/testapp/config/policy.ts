
import type { PolicyConfig } from "$lib/common/types.js";

const policies: PolicyConfig = {
    '*': true,//Global
    post: {
        '*': ['allowAll'],
        '/login': ['allowAll'],
    },
    put: {
        '*': 'allowAll'
    },
    get: {
        '/accounts/:id?': true,
        '/deadend': false
    },
};

export default policies;
