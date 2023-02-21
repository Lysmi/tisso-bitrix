"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bitrix_1 = __importDefault(require("@2bad/bitrix"));
const configuration_1 = require("./configuration");
const bitrix = (0, bitrix_1.default)(configuration_1.bitrix_key);
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.post('/API/createLead', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Request body: ${req.body}`);
    let new_email = req.body.Email;
    let new_phone = req.body.Phone;
    let new_name = req.body.Name;
    let new_last_name = req.body.LastName;
    let new_about = req.body.About;
    let new_file_link = req.body.FileLink;
    let new_file_url = req.body.FileUrl;
    let phones_list = yield bitrix.contacts.list({ select: ['PHONE', 'EMAIL'] });
    let contact = phones_list.result.find((val, ind, obj) => {
        try {
            if (val["PHONE"] != null) {
                let phone = val["PHONE"][0]['VALUE'];
                if (phone == new_phone)
                    return true;
                else
                    return false;
            }
            return false;
        }
        catch (_a) {
            return false;
        }
        ;
    });
    let contact_id = contact === null || contact === void 0 ? void 0 : contact.ID;
    if (contact == undefined) {
        let new_contact = { NAME: new_name };
        if (new_email != undefined)
            new_contact["EMAIL"] = [{ VALUE: new_email, VALUE_TYPE: "WORK" }];
        if (new_phone != undefined)
            new_contact["PHONE"] = [{ VALUE: new_phone, VALUE_TYPE: "WORK" }];
        if (new_last_name != undefined)
            new_contact["LAST_NAME"] = new_last_name;
        contact_id = (yield bitrix.contacts.create(new_contact)).result.toString();
    }
    let new_deal = { TITLE: `Сделка от ${new_name}`, CONTACT_ID: contact_id };
    let add_info = '';
    if (new_about != undefined)
        add_info += `Примечание клиента: ${new_about}\n`;
    if (new_file_link != undefined) {
        add_info += `Ссылка от клиента: ${new_file_link}\n`;
    }
    if (new_file_url != undefined) {
        add_info += `Файл от клиента: ${new_file_url}\n`;
    }
    new_deal["ADDITIONAL_INFO"] = add_info;
    bitrix.deals.create(new_deal);
    res.send('Request accepted');
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
