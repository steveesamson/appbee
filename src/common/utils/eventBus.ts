import { prodBus } from "./prodBus";
import { devBus } from "./devBus";
import { EventBusType } from "../types";

const eventBus: EventBusType = process.env.NODE_ENV === "development" ? devBus : prodBus;
export { eventBus };
