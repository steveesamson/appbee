import {baseModel} from "../src/common/utils/storeModels";

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
    describe('pipeline()',() =>{
        it('expects pipeline to be truthy',() =>{
            expect(UsersModel.excludes).toBeTruthy();
        })
    })

    describe('resolveResult',() =>{
        it('expects resolveResult to be defined',() =>{
            expect(UsersModel.resolveResult).toBeDefined();
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

        })
    })
    describe('create',() =>{
        it('expects create to be defined and function',async () =>{
            expect(UsersModel.create).toBeDefined();
            expect(UsersModel.create).toBeInstanceOf(Function);
        })
    })
      describe('update',() =>{
        it('expects update to be defined and function',async () =>{
            expect(UsersModel.update).toBeDefined();
            expect(UsersModel.update).toBeInstanceOf(Function);
        })
    })
    describe('destroy',() =>{
        it('expects destroy to be defined and function',async () =>{
            expect(UsersModel.destroy).toBeDefined();
            expect(UsersModel.destroy).toBeInstanceOf(Function);
        })
    })
    
})