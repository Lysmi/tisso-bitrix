import express from 'express';
import axios from 'axios';
import Bitrix from '@2bad/bitrix'
import { bitrix_key } from './configuration';


const bitrix = Bitrix(bitrix_key);
const app = express();
const port = 3000;
app.use(express.json());

app.post('/API/createLead', async (req, res) => {
  let new_email = req.body.email;
  let new_phone = req.body.phone;
  let new_name = req.body.name;
  let phones_list = await bitrix.contacts.list({ select: ['PHONE'] });
  bitrix.contacts.create({NAME: new_name,"PHONE": [ { "VALUE": new_phone, "VALUE_TYPE": "WORK" } ]}); 

    console.log(req.body);
    //console.log(phones_list);
    res.send('Request accepted')
})

app.listen(port, () => {

  console.log(`Example app listening on port ${port}`)
})