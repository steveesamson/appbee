import path from "path";

import { configureRestServer, configuration} from "../src/common/utils/configurer";
import { Encrypt, Token } from "../src/common/utils/security";
import { appState } from "../src/common/appState";

let testPlainString = 'Captain America', testEncryptedString:string;
let testPlainObject:any = {name:'Sally Bay', age:30}, testSignedObject:any;
describe("Encrypt & Token", () => {
    beforeAll(async( done ) =>{
       await configureRestServer(path.resolve(__dirname,"testapp"));
       appState({SECRET:configuration.security.secret});
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

  it("expects hash to generate encrypted string with no error.", async (done) => {
     const enc = await Encrypt.hash(testPlainString);
     expect(enc).toBeDefined();
        testEncryptedString = enc;
        done();
   //   , (e:any,enc:string) =>{
   //      expect(e).toBeNull();
   //      expect(enc).toBeDefined();
   //      testEncryptedString = enc;
   //      done();
   //   })
  });

   it("expects verify to assure that testPlainString  equals testEncryptedString.", async (done) => {

     const verdit = await Encrypt.verify(testPlainString,testEncryptedString);//, (e:any,verdit:boolean) =>{
        
      //   expect(e).toBeNull();
        expect(verdit).toBeDefined();
        expect(verdit).toBe(true);
        done();
   //   })
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

   it("expects verify to assure that testPlainString  equals testPlainObject.", () => {
     const verdit = Token.verify(testEncryptedString);//, (e:any,verdit:any) =>{
        
      //   expect(e).toBeNull();
        expect(verdit).toBeDefined();
        expect(verdit).toMatchObject(testPlainObject);
      //   done();
   //   })
  });



});

});
