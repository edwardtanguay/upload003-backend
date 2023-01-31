import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb'; // TODO: check if this is an outdated version of lowdb

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../src/data/db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

const app = express();
const port = 5891;

// TODO: resolve TypeScript anys in this file
// TODO: move /public/images/uploadedFiles/general upward out of uploadedFiles
const staticDirectory = path.join(__dirname, './public');
app.use(express.static(staticDirectory));

const storage = multer.diskStorage({
	destination: (req: Express.Request, file: any, cb: (arg0: any, arg1: string) => void) => {
		cb(null, 'public/uploadedFiles/');
	},
	filename: (req: Express.Request, file: { originalname: string; }, cb: (arg0: any, arg1: any) => void) => {
		cb(null, file.originalname);
	}
});

const upload = multer({ storage: storage });

app.use(cors());

app.get('/fileitems', async (req, res) => {
	await db.read();
	res.send((db.data as any).fileItems);
});

app.post('/uploadfile', upload.single('file'), async (req: any, res: any) => {
	await db.read();
	const fileName = req.body.fileName;
	let iconPathAndFileName = '';
	if (fileName.endsWith('.xlsx')) {
		iconPathAndFileName = 'uploadedFiles/general/iconExcel.png';
	} else if (fileName.endsWith('.json')) {
		iconPathAndFileName = 'uploadedFiles/general/iconJson.png';
	} else if (fileName.endsWith('.txt')) {
		iconPathAndFileName = 'uploadedFiles/general/iconText.png';
	} else {
		iconPathAndFileName = `uploadedFiles/${fileName}`
	}

	(db.data as any).fileItems.push({
		title: req.body.title,
		description: req.body.description,
		notes: req.body.notes,
		fileName: req.body.fileName,
		iconPathAndFileName
	});
	await db.write();
	res.json({});
});

app.listen(port, () => {
	console.log(`listening at http://localhost:${port}`);
});
