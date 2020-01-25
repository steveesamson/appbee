import path from "path";

import { configure, Encrypt, Token } from "../src/common/utils/configurer";

let testPlainString = 'Captain America', testEncryptedString:string;
let testPlainObject:any = {name:'Sally Bay', age:30}, testSignedObject:any;
describe("Encrypt & Token", () => {
    beforeAll(async( done ) =>{
        await configure(path.resolve(__dirname,"testapp"));
        done();
    })
describe("Encrypt", () => {
  it("expects verify to be defined and be a function", async () => {
     expect(Encrypt.verify).toBeDefined();
     expect(Encrypt.verify).toBeInstanceOf(Function);
  });
  it("expects hash to be defined and be a function", async () => {
     expect(Encrypt.hash).toBeDefined();
     expect(Encrypt.hash).toBeInstanceOf(Function);
  });

  it("expects hash to generate encrypted string with no error.", (done) => {
     Encrypt.hash(testPlainString, (e:any,enc:string) =>{
        expect(e).toBeNull();
        expect(enc).toBeDefined();
        testEncryptedString = enc;
        done();
     })
  });

   it("expects verify to assure that testPlainString  equals testEncryptedString.", (done) => {
     Encrypt.verify(testPlainString,testEncryptedString, (e:any,verdit:boolean) =>{
        
        expect(e).toBeNull();
        expect(verdit).toBeDefined();
        expect(verdit).toBe(true);
        done();
     })
  });

});

describe("Token", () => {
    it("expects verify to be defined and be a function", async () => {
     expect(Token.verify).toBeDefined();
     expect(Token.verify).toBeInstanceOf(Function);
  });

  it("expects sign to be defined and be a function", async () => {
     expect(Token.sign).toBeDefined();
     expect(Token.sign).toBeInstanceOf(Function);
  });

  it("expects sign to generate sign object with no error.", () => {
     const enc = Token.sign(testPlainObject);
       testEncryptedString = enc;
        expect(enc).toBeDefined();
  });

   it("expects verify to assure that testPlainString  equals testPlainObject.", (done) => {
     Token.verify(testEncryptedString, (e:any,verdit:any) =>{
        
        expect(e).toBeNull();
        expect(verdit).toBeDefined();
        expect(verdit).toMatchObject(testPlainObject);
        done();
     })
  });



});

});