const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 8080;

const serviceAccountKeyFile = "./credentials.json"

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

async function getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountKeyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    return google.sheets({
      version: 'v4',
      auth: authClient,
    });
}

async function writeGoogleSheet(googleSheetClient, tabName, range,  sheetId, data) {
    await googleSheetClient.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tabName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        "majorDimension": "ROWS",
        "values": [data]
      },
    })
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/submit', async (req, res) => {
  const name = req.body.name;
  const mobile = req.body.mobile;
  const tabName = 'Users'
  const range = 'A:C'

  try {
    const googleSheetClient = await getGoogleSheetClient();
    const sheetId = '1yLyWnh9R1LeWQbdvyq1fawxs6tdivdTuiUR1YY7s5Pg';

    await writeGoogleSheet(googleSheetClient, tabName, range, sheetId, [name, mobile, new Date().toLocaleString()])

    res.send('Data recorded in Google Sheets successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error recording data in Google Sheets.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
