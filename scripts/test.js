const bcrypt = require('bcrypt');
async function test() {
    const hash = "$2b$10$orT.MvMOljGfFLG.6uvNy.x7FyInzEqJaQGQdyv7W9F2MRwQSXjO2";
    const res = await bcrypt.compare('admin123', hash);
    console.log("Password matches:", res);
}
test();
