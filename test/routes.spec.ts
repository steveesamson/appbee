import { RouteConfig } from "../src/common/types";
import { routes, Route } from "../src/rest/route";


let testRoutes:RouteConfig;

describe("rest routes", () => {
  beforeAll(async( done ) =>{
    const r = Route("Tests",'/tests');
    r.get('/:id?',() =>{})
    r.post('/',() =>{})
    r.del('/:id',() =>{})
    r.put('/:id',() =>{})
    r.patch('/:id',() =>{})
    testRoutes = routes.Tests;
    done();
  });

  it("expects routes to have key 'Tests'", async () => {
    expect(Object.keys(routes).length).toBe(1);
    expect(testRoutes).toBeTruthy();
  });

  it("expects routes to have 6 keys", async () => {
    expect(Object.keys(testRoutes).length).toBe(6);//mountPoint is a key too
  });

  it("expects routes to have mountPoint=/tests", async () => {
    expect(testRoutes.mountPoint).toBe('/tests');
  });

  it('expects routes to have key "get /tests/:id?" ', () =>{
    
     expect(testRoutes['get /tests/:id?']).toBeTruthy();
  })
   it('expects routes to have key "post /tests" ', () =>{
    
     expect(testRoutes['post /tests']).toBeTruthy();
  })
  it('expects routes to have key "delete /tests/:id" ', () =>{
    
     expect(testRoutes['delete /tests/:id']).toBeTruthy();
  })

   it('expects routes to have key "put /tests/:id" ', () =>{
    
     expect(testRoutes['put /tests/:id']).toBeTruthy();
  })

  it('expects routes to have key "patch /tests/:id" ', () =>{
    
     expect(testRoutes['patch /tests/:id']).toBeTruthy();
  })

});
