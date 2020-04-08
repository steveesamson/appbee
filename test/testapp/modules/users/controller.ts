import { Route, Request, Response } from "../../../../src";
// Route("Users","/users");
const { get, post,put, patch, del } = Route("Users","/users");

let users = [
    {
        id:1,
        username:'admin',
    },
    {
        id:2,
        username:'pepper',
    },
    {
        id:3,
        username:'helpd',
    }
]
  get(`/:id?`, (req: Request, res: Response) => {
      const {id,search, ROW_COUNT} = req.parameters;
      
      if(search){
         return res.status(200).json({data:users.filter((u:any) => u.username.indexOf(search) !== -1)});
      }
      if(ROW_COUNT){
          return res.status(200).json({data:{count:users.length}});
      }
      if(id){
            return res.status(200).json({data:users.find( (u:any) => u.id == id)})
        }
    res.status(200).json({data:users});
  })

  post(`/users`, (req: Request, res: Response) => {
      const newUser = req.parameters;
      newUser.id = 4;
      users = [...users, newUser];
    res.status(200).json({data:newUser});
  });

  put(`/users/:id?`, (req: Request, res: Response) => {
      const {id, where, ...others} = req.parameters;

     if(!id && !where){
         return res.status(200).json({error:"You need an id/where object to update any model"});
     }
     users = users.map((u:any) => u.id == id? ({...u,...others}) : (u));
    res.status(200).json({data:users.find((u:any) => u.id == id)});
  });

  del(`/users/:id?`, (req: Request, res: Response) => {
    const {id, where, ...others} = req.parameters;
     if(!id && !where){
         return res.status(200).json({error:"You need an id/where object to delete any model"});
     }
     const user = users.find((u:any) => u.id == id);
     users = users.filter((u:any) => u.id != id);
    res.status(200).json({data:user});
  });

  patch(`/users/:id?`, (req: Request, res: Response) => {
   const {id, where, ...others} = req.parameters;

     if(!id && !where){
         return res.status(200).json({error:"You need an id/where object to update any model"});
     }
     users = users.map((u:any) => u.id == id? ({...u,...others}) : (u));
    res.status(200).json({data:users.find((u:any) => u.id == id)});
  });

