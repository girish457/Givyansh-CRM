const bcrypt = require('bcryptjs');
const password = '7790813609';
bcrypt.hash(password, 12, (err, hash) => {
    if (err) throw err;
    console.log(hash);
});
