//Tạo mật khẩu
const bcrypt = require('bcryptjs');

const password = '123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  console.log('Mật khẩu: ' + password);
  console.log('Chuỗi mã hóa (Copy cái này vào DB):');
  console.log(hash);
});