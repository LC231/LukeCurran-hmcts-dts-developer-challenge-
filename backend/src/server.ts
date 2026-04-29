import { createApp } from './app.js';
import { createDatabase } from './db/database.js';

const port = Number(process.env.PORT ?? 4000);
const db = await createDatabase();
const app = createApp(db);

app.listen(port, () => {
  console.log(`HMCTS task API listening on http://localhost:${port}`);
});
