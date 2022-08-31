import express, { Request, Response } from "express";
import { Order, ORDER_ATTRIBUTES } from "../../models";
import orderDraft from "../../data/orderDraft.json";
import orderTemplate from "../../data/orderTemplate.json";

export const router = express.Router();

const rejectRequest = (res: Response, msg: string) =>
  void res.status(400).json({ "400 Bad Request": msg });

function getOrderFromTemplate(details: Order, useDraftTemplate: boolean) {
  const template = useDraftTemplate ? orderDraft : orderTemplate;
  const order = { ...template };
  order.idParcel = details.id;
  order.content.contentDetails = details.contentDesc;
  const recipientData = {
    ...details.recipientData,
    firstName: null,
    lastName: null,
    pni: null,
  };
  order.recipientData = recipientData;
  // Update the order parcel cost, which may differ from the value in the template.
  // This is so verbose because of the poor structure of the Pocztex API.
  for (let i = 0; i < order.extraServices.length; i++) {
    // Find the section containing the parcel cost
    const service = order.extraServices[i];
    // Form item ID for the section containing misc payment info
    if (service.idFormItem !== "8867adfc-dbac-3311-9992-334b346ac268") {
      continue;
    }
    for (let j = 0; j < service.formItemSub.length; j++) {
      const formItem = service.formItemSub[j];
      // Form item ID for the field containing order cost
      if (formItem.idFormItem !== "407a5707-4edd-4bb7-bd42-882c77496d49") {
        continue;
      }
      order.extraServices[i].formItemSub[j].value = details.cost;
      break;
    }
    break;
  }
  return order;
}

function parseOrders(req: Request, res: Response, useDraftTemplate: boolean) {
  if (!req.body) return rejectRequest(res, "No request payload.");

  const parsedOrders = [];

  const orders: Order[] = req.body;
  for (let orderIdx = 0; orderIdx < orders.length; orderIdx++) {
    const order = orders[orderIdx];
    const orderDesc = `Order ${orderIdx + 1}/${orders.length}`;
    if (!order) return rejectRequest(res, `${orderDesc} was not found.`);

    // Ensure all required properties are present
    for (const requiredAttr of ORDER_ATTRIBUTES) {
      const attribute = order[requiredAttr];
      if (!attribute) {
        return rejectRequest(
          res,
          `${orderDesc} is missing required attribute '${requiredAttr}'. `
        );
      }
    }
    parsedOrders.push(getOrderFromTemplate(order, useDraftTemplate));
  }
  res.status(200).json(parsedOrders);
}

/**
 * This endpoint takes a payload which is an array of `Order` objects.
 * If the payload format is incorrect or any of the elements doesn't contain every required
 * `Order` interface property, a 400 response is sent.
 * Otherwise, converts the orders to the form accepted by Pocztex's API and sends them back in an array.
 */
router.post("/validate-orders", (req, res) => parseOrders(req, res, true));

router.post("/process-orders", (req, res) => parseOrders(req, res, false));
