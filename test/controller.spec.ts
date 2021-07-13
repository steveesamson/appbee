import path from "path"
import io from "socket.io-client";
import { serve as createServer, utils} from "../src";

const { http } = utils.request({});
http.set("hostname","localhost").set("port",8000);
let inserteID:any =null;
let socket:any = null,
Transport:any = {};
const startIO =  (done:any) => {
	socket = io("http://localhost:8000",{transports:['websocket']});
	socket.on('connect', () =>{

		Transport.sync = async (url:string, method:string, data:any={}) => {
			return new Promise((resolve, reject) => {
				socket.emit(method, {
					path: url,
					data: data
				}, (m:any) => {
					resolve(m);
				})
			});
        };
        console.log('Connected to io-socket server...');
      done();
	});

	socket.on('comets', (load:any) => console.log(load));
}

describe("Rest Controller and IO Controller", () => {
  let core:any = null;
  beforeAll( async (done) =>{
     core = await createServer(path.resolve(__dirname,"testapp"));
     done();
  })

  afterAll(async () =>{
    console.log('shutting down...')
    core.close();
  })

  describe("Accounts Rest Controller", () =>{
      it("expects get '/accounts' to return 'find' response ", async () => {
      const res = await http.get("/accounts");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);

      expect(res.body.data[1].balance).toBe(5000);
    });

    it("expects post '/accounts' to return 'create' response ", async () => {
      const params = {
        accountNo: "0007",
        balance: 7500
      };
      const res = await http.post("/accounts",params);


      expect(res.status).toBe(200);
      expect(res.body.data.accountNo).toBe(params.accountNo);
      expect(res.body.data.accountNo).toBe(params.accountNo);

      expect(res.body.data.balance).toBe(params.balance);
    });

    it("expects put '/accounts/2' to return 'update' response ", async () => {
      const params = {
        balance: 15000
      };
      const res = await http.put("/accounts/2",params);
      expect(res.status).toBe(200);
      expect(res.body.data.balance).toBe(params.balance);
    });

    it("expects patch '/accounts/2' to return 'edit' response ", async () => {
      const params = {
        balance: 15000
      };
      const res = await http.put("/accounts/2",params);
      expect(res.status).toBe(200);
      expect(res.body.data.balance).toBe(params.balance);
    });

    it("expects delete '/accounts/2' to return 'delete' response ", async () => {
      const res = await http.delete("/accounts/2");
      expect(res.status).toBe(200);
      expect((res.body as any).message).toBe("Account removed");
    });

    it("expects head '/accounts' to return 'info' response ", async () => {
      const res = await http.head("/accounts");
      expect(res.status).toBe(200);
    });
  })

   describe("Users Rest Controller", () =>{
      it("expects get '/users' to return 'find' response ", async () => {
      const res = await http.get("/users");
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0].username).toBe('admin');
    });


    it("expects get '/users' by search 'help' to return 'helpd' as username in response ", async () => {
      const res = await http.get("/users?search=help");
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].username).toBe('helpd');
    });

     it("expects get '/users/1' to return  a record with id of 1", async () => {
      const res = await http.get("/users/1");
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(1);
    });

    it("expects get '/users?ROW_COUNT=1' to return  total record as count", async () => {
      const res = await http.get("/users?ROW_COUNT=1");
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.count).toBe(3);
    });

    it("expects put '/users/2' to return  updated record", async () => {
      const res = await http.put("/users/2",{username:"goldstar"});
      // console.log(res)
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.username).toBe('goldstar');
    });


    it("expects post '/users' to return 'create' response ", async () => {
      const res = await http.post("/users",{username:'omoo',email:"some@some.com",password:'secret',phone:'0803566221144'});
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      inserteID = res.body.data.id;
      expect(res.body.data.username).toBe('omoo');
    });

     it(`expects delete '/users/${inserteID}' to delete record with id ${inserteID} `, async () => {
      const res = await http.delete(`/users/${inserteID}`);
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data.id).toBe(inserteID);
    });

    
  })

  describe("IO Controller", () => {
    let core:any = null;
    beforeAll((done) =>{
      startIO(done);
    })
    afterAll(() =>{
        socket && socket.connected && socket.disconnect();
    })
    it("expects socket to be defined", () => {

      expect(socket).toBeDefined();
    });

    it("expects Transport to be defined, indicating connection",  () => {
      
      expect(Transport).toBeDefined();
      expect(Transport.sync).toBeInstanceOf(Function);
    
    });

    it("expects get '/accounts' to valid response ", async () => {
      const res = await Transport.sync("/accounts","get",{});
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);

      expect(res.body.data[1].balance).toBe(5000);
    });
    it("expects get '/users' to valid response with 3 items ", async () => {
      const res = await Transport.sync("/users","get");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);

      expect(res.body.data[0].username).toBe('admin');
    });

    it("expects get '/users?ROW_COUNT=1' to return  total record as count", async () => {
      const res = await Transport.sync("/users?ROW_COUNT=1&smile=yes",'get');
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.count).toBe(3);
    });

    it("expects get '/users?search=help' to return  total record as count", async () => {
      const res = await Transport.sync("/users?search=help",'get'/*,{search:'help'}*/);
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].username).toBe("helpd");
    });

    it("expects post '/users' to return 'create' response ", async () => {
      const res = await Transport.sync("/users",'post',{username:'omoo',email:"some@some.com",password:'secret',phone:'0803566221144'});
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      inserteID = res.body.data.id;
      expect(res.body.data.username).toBe('omoo');
    });

     it(`expects delete '/users/${inserteID}' to delete record with id ${inserteID} `, async () => {
      const res = await Transport.sync(`/users/${inserteID}`,"delete");
      expect(res.status).toBe(200);
      expect(res.body.error).toBeUndefined();
      expect(res.body.data.id).toBe(inserteID);
    });

    it(`expects delete '/users' without 'id' or 'where' to return error `, async () => {
      const res = await Transport.sync(`/users/`,"delete");
      expect(res.status).toBe(200);
      expect(res.body.data).toBeUndefined();
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toBe("You need an id/where object to delete any model");
    });

    

  });

});




