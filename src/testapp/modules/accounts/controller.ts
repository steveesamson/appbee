import { Route } from "$lib/rest/route.js";
import type { Request, Response } from "$lib/common/types.js";
import { StatusCodes } from "http-status-codes";
const { get, post, put, destroy, patch } = Route("Accounts", "/accounts");

get(`/:id?`, (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    data: [
      { accountNo: "00001", balance: 2000 },
      { accountNo: "00003", balance: 5000 }
    ]
  });
});

post(`/`, (req: Request, res: Response) => {
  const { context: { data } } = req;
  res.status(StatusCodes.OK).json({
    data
  });
});

put(`/:id`, (req: Request, res: Response) => {
  const { context: { data } } = req;
  res.status(StatusCodes.OK).json({
    data
  });
});

destroy(`/:id?`, async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ message: "Account removed" });
});


patch(`/:id`, (req: Request, res: Response) => {

  res.status(StatusCodes.OK).json({
    data: {
      ...req.body,
    }
  });
});


