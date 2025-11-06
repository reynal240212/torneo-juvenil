const bcrypt = require('bcryptjs');
const password = 'admin24120627'; // Cambia por tu password real

async function run() {
  const hash = await bcrypt.hash(password, 10);
  console.log('HASH GENERADO:', hash);
}
run();
