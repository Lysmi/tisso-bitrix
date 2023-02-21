import express from 'express';
import axios from 'axios';
import Bitrix, { MultiFieldArray } from '@2bad/bitrix'
import { bitrix_key } from './configuration';
import { basename } from 'path';
const bitrix = Bitrix(bitrix_key);
const app = express();
const port = 3000;
app.use(express.json());

app.post('/API/createLead', async (req, res) => {
  console.log(`Request body: ${req.body}`);
  let new_email = req.body.Email;
  let new_phone = req.body.Phone;
  let new_name = req.body.Name;
  let new_last_name = req.body.LastName;
  let new_about = req.body.About;
  let new_file_link = req.body.FileLink;
  let new_file_url = req.body.FileUrl;
  let phones_list = await bitrix.contacts.list({ select: ['PHONE', 'EMAIL'] });
  
  let contact = phones_list.result.find((val, ind, obj) => {
      try {
        if (val["PHONE"] != null) {
          let phone = (val["PHONE"] as MultiFieldArray)[0]['VALUE'];
          if (phone == new_phone) 
            return true
          else return false;
        }
        return false;
      }    catch {return false};
  });
  let contact_id = contact?.ID;
  if (contact == undefined) {
    let new_contact: any = {NAME: new_name}
    if (new_email != undefined) 
      new_contact["EMAIL"] =  [ { VALUE: new_email, VALUE_TYPE: "WORK" } ];
    if (new_phone != undefined) 
      new_contact["PHONE"] =  [ { VALUE: new_phone, VALUE_TYPE: "WORK" } ];
    if (new_last_name != undefined) 
      new_contact["LAST_NAME"] = new_last_name;
    contact_id = (await bitrix.contacts.create(new_contact)).result.toString();
  }
  let new_deal: any = {TITLE: `Сделка от ${new_name}`, CONTACT_ID: contact_id}
  let add_info = '';
  if (new_about!=undefined)
    add_info+=`Примечание клиента: ${new_about}\n`;
  if (new_file_link!=undefined) {
    add_info+=`Ссылка от клиента: ${new_file_link}\n`;
  }
  if (new_file_url!=undefined) {
    add_info+=`Файл от клиента: ${new_file_url}\n`;
  }
  new_deal["ADDITIONAL_INFO"] = add_info;

  bitrix.deals.create(new_deal);
  res.send('Request accepted');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})