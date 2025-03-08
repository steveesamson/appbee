import { Route } from "$lib/rest/route.js";
import { type Request, type Response } from "$lib/common/types.js";
import { StatusCodes } from "http-status-codes";

const { get, post, put, destroy, patch } = Route("Vehicles", "/vehicles");

get(`/`, (req: Request, res: Response) => {

  res.status(StatusCodes.OK).json({
    data: [
      { accountNo: "00001", balance: 2000 },
      { accountNo: "00003", balance: 5000 }
    ]
  });
});

post(`/`, (req: Request, res: Response) => {

  res.status(StatusCodes.OK).json({
    data: req.body
  });
});

put(`/:id`, (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    data: {
      ...req.body
    }
  });
});

destroy(`/:id?`, async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ message: "Account removed" });
});


patch(`/:id`, (req: Request, res: Response) => {

  res.status(StatusCodes.OK).json({
    data: {
      ...req.body,
      balance: 15000
    }
  });
});


