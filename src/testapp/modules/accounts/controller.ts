import { Route } from "$lib/rest/route.js";
import type { Request, Response } from "$lib/common/types.js";
import type { AddAccount, UpdateAccount, DeleteAccount, FindAccount } from "./model.js";
import { StatusCodes } from "http-status-codes";
const { get, post, put, destroy, patch } = Route("Accounts", "/accounts");

get(`/:id?`, (req: Request<FindAccount>, res: Response) => {
  res.status(StatusCodes.OK).json({
    data: [
      { accountNo: "00001", balance: 2000 },
      { accountNo: "00003", balance: 5000 }
    ]
  });
});

post(`/`, (req: Request<AddAccount>, res: Response) => {
  const { context: { data } } = req;
  res.status(StatusCodes.OK).json({
    data
  });
});

put(`/:id`, (req: Request<UpdateAccount>, res: Response) => {
  const { context: { data } } = req;
  res.status(StatusCodes.OK).json({
    data
  });
});

destroy(`/:id?`, async (req: Request<DeleteAccount>, res: Response) => {
  res.status(StatusCodes.OK).json({ message: "Account removed" });
});


patch(`/:id`, (req: Request, res: Response) => {

  res.status(StatusCodes.OK).json({
    data: {
      ...req.body,
    }
  });
});


