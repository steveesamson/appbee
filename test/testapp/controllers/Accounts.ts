import { Route,Request, Response} from "../../../src";

const {get, post, put, del, patch} = Route("Accounts","/accounts");

  get(`/`, (req: Request, res: Response) => {
    
    // console.log('Parameters: ', req.parameters, req.db)
    res.status(200).json({
      data: [
        { accountNo: "00001", balance: 2000 },
        { accountNo: "00003", balance: 5000 }
      ]
    });
  });

  post(`/`, (req: Request, res: Response) => {
    
    res.status(200).json({
      data: req.body
    });
  });

  put(`/:id`, (req: Request, res: Response) => {
    res.status(200).json({
      data: {
      ...req.body
    }
    });
  });

  del(`/:id?`, async (req: Request, res: Response) => {
    res.status(200).json({ message: "Account removed" });
  });


  patch(`/:id`, (req: Request, res: Response) => {
    
    res.status(200).json({
      data: {
      ...req.body,
      balance: 15000
    }
    });
  });


