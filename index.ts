import express from 'express';
import axios from 'axios';
import Bitrix, { MultiFieldArray } from '@2bad/bitrix'
import { bitrix_key } from './configuration';
import { basename } from 'path';
const bitrix = Bitrix(bitrix_key);
const app = express();
const port = 3000;
app.use(express.json({ limit: '70mb' }));

app.post('/API/createLead', async (req, res) => {
  console.log(req.body);
  let new_email = req.body.email;
  let new_phone = req.body.phone;
  let new_name = req.body.name;
  let new_last_name = req.body.lastName;
  let new_about = req.body.about;
  let new_file_link = req.body.fileLink;
  let new_file_url = req.body.fileUrl;
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
  console.log(`contact_id find: ${contact_id}`);

  if (contact == undefined) {
    let new_contact: any = {NAME: new_name}
    if (new_email != undefined && new_email != null) 
      new_contact["EMAIL"] =  [ { VALUE: new_email, VALUE_TYPE: "WORK" } ];
    if (new_phone != undefined && new_phone != null) 
      new_contact["PHONE"] =  [ { VALUE: new_phone, VALUE_TYPE: "WORK" } ];
    if (new_last_name != undefined && new_last_name != null) 
      new_contact["LAST_NAME"] = new_last_name;
    contact_id = (await bitrix.contacts.create(new_contact)).result.toString();
  }
  console.log(`contact_id second: ${contact_id}`);

  let new_deal: any = {TITLE: `Сделка от ${new_name}`, CONTACT_ID: contact_id}
  if (new_about!=undefined  && new_about != null) {
      new_deal["UF_CRM_1677021513259"] = `Примечание клиента: ${new_about}\n`;  
  }
  if (new_file_url!=undefined  && new_file_url != null) {
    new_deal["UF_CRM_1677020834979"] = new_file_url
  }
  if (new_file_link!=undefined  && new_file_link != null) {
    new_deal["UF_CRM_1677018935301"] = new_file_link
  }
  console.log(new_deal);
  bitrix.deals.create(new_deal);
  res.send('Request accepted');
})

app.post('/API/createFeedback', async (req, res) => {
  console.log(req.body);
  let new_email = req.body.email;
  let new_phone = req.body.phone;
  let new_name = req.body.name;
  let new_last_name = req.body.lastName;
  let new_text = req.body.text;
  let call_me = req.body.callMe
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
    if (new_email != undefined && new_email != null) 
      new_contact["EMAIL"] =  [ { VALUE: new_email, VALUE_TYPE: "WORK" } ];
    if (new_phone != undefined && new_phone != null) 
      new_contact["PHONE"] =  [ { VALUE: new_phone, VALUE_TYPE: "WORK" } ];
    if (new_last_name != undefined && new_last_name != null) 
      new_contact["LAST_NAME"] = new_last_name;
    contact_id = (await bitrix.contacts.create(new_contact)).result.toString();
  }
  let new_deal: any = {TITLE: `Обратная связь от ${new_name}`, CONTACT_ID: contact_id}
  if (new_text!=undefined  && new_text != null) {
    new_deal["UF_CRM_1677021513259"] = new_text;  
  }
  new_deal["UF_CRM_1677020612855"] = call_me?1:0;
  // bitrix.deals.create(new_deal);
  let deal = await bitrix.deals.get("59");
  console.log(deal);
  res.send('Request accepted');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})