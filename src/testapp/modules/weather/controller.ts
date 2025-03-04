import { Restful } from "$lib/rest/route.js";
import { type Request, type Response } from "$lib/common/types.js";

const { get, post, put, destroy, patch } = Restful("Weather", "/weather");

get(`/`, (req: Request, res: Response) => {

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

destroy(`/:id?`, async (req: Request, res: Response) => {
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


