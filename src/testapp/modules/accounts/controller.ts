import { Route } from "$lib/rest/route.js";
import type { Request, Response } from "$lib/common/types.js";
import type { AddAccount, UpdateAccount, DeleteAccount } from "./model.js";
const { get, post, put, destroy, patch } = Route("Accounts", "/accounts");

get(`/:id?`, (req: Request, res: Response) => {
  res.status(200).json({
    data: [
      { accountNo: "00001", balance: 2000 },
      { accountNo: "00003", balance: 5000 }
    ]
  });
});

post(`/`, (req: Request<AddAccount>, res: Response) => {
  const { parameters } = req;
  const { parameters: { data } } = req;
  res.status(200).json({
    data
  });
});

put(`/:id`, (req: Request<UpdateAccount>, res: Response) => {
  const { parameters: { data } } = req;
  res.status(200).json({
    data
  });
});

destroy(`/:id?`, async (req: Request, res: Response) => {
  const { parameters: { params, query } } = req;
  res.status(200).json({ message: "Account removed" });
});


patch(`/:id`, (req: Request, res: Response) => {

  res.status(200).json({
    data: {
      ...req.body,
    }
  });
});


