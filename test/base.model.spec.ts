import {baseModel} from "../src/common/utils/modelFactory";

const UsersModel = baseModel("Users");

describe('Base Model',() =>{
    describe('collection',() =>{
        it('expects collection to be "users"',() =>{
            expect(UsersModel.collection).toBe('users');
        })
    })
    describe('instanceName',() =>{
        it('expects instanceName to be "Users"',() =>{
            expect(UsersModel.instanceName).toBe('Users');
        })
    })
    describe('schema',() =>{
        it('expects schema to be truthy',() =>{
            expect(UsersModel.schema).toBeTruthy();
        })
    })
    describe('uniqueKeys',() =>{
        it('expects uniqueKeys to be truthy',() =>{
            expect(UsersModel.uniqueKeys).toBeTruthy();
        })
         it('expects uniqueKeys to be an array',() =>{
            expect(UsersModel.uniqueKeys).toBeInstanceOf(Array);
        })
        it('expects uniqueKeys to contain "id"',() =>{
            expect(UsersModel.uniqueKeys).toContain("id");
        })
    })
    describe('defaultDateValues',() =>{
        it('expects defaultDateValues to be truthy',() =>{
            expect(UsersModel.defaultDateValues).toBeTruthy();
        })
    })

    describe('checkConcurrentUpdate',() =>{
        it('expects checkConcurrentUpdate to be defined',() =>{
            expect(UsersModel.checkConcurrentUpdate).toBeDefined();
        })
    })
    describe('verbatims',() =>{
        it('expects verbatims to be defined and array',() =>{
            expect(UsersModel.verbatims).toBeDefined();
            expect(UsersModel.verbatims).toBeInstanceOf(Array);
        })
    })
    describe('searchPath',() =>{
        it('expects searchPath to be defined and array',() =>{
            expect(UsersModel.searchPath).toBeDefined();
            expect(UsersModel.searchPath).toBeInstanceOf(Array);
        })
    })
    describe('publishCreate',() =>{
        it('expects publishCreate to be defined and function',() =>{
            expect(UsersModel.publishCreate).toBeDefined();
            expect(UsersModel.publishCreate).toBeInstanceOf(Function);
        })
    })
    describe('publishUpdate',() =>{
        it('expects publishUpdate to be defined and function',() =>{
            expect(UsersModel.publishUpdate).toBeDefined();
            expect(UsersModel.publishUpdate).toBeInstanceOf(Function);
        })
    })
    describe('publishDestroy',() =>{
        it('expects publishDestroy to be defined and function',() =>{
            expect(UsersModel.publishDestroy).toBeDefined();
            expect(UsersModel.publishDestroy).toBeInstanceOf(Function);
        })
    })
     describe('find',() =>{
        it('expects find to be defined and function',async () =>{
            expect(UsersModel.find).toBeDefined();
            expect(UsersModel.find).toBeInstanceOf(Function);
            // const res = await UsersModel.find({});
            // expect(res).toMatchObject({});

        })
    })
    describe('create',() =>{
        it('expects create to be defined and function',async () =>{
            expect(UsersModel.create).toBeDefined();
            expect(UsersModel.create).toBeInstanceOf(Function);
            // const res = await UsersModel.create({});
            // expect(res).toMatchObject({});
        })
    })
      describe('update',() =>{
        it('expects update to be defined and function',async () =>{
            expect(UsersModel.update).toBeDefined();
            expect(UsersModel.update).toBeInstanceOf(Function);
            // const res = await UsersModel.update({});
            // expect(res).toMatchObject({});
        })
    })
    describe('destroy',() =>{
        it('expects destroy to be defined and function',async () =>{
            expect(UsersModel.destroy).toBeDefined();
            expect(UsersModel.destroy).toBeInstanceOf(Function);
            // const res = await UsersModel.destroy({});
            // expect(res).toMatchObject({});
        })
    })
    
})