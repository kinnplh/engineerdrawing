 /**
 * Created by kinnplh on 2016/10/9.
 */
var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/ExprOnline');


// =======
// mongoose.connect('mongodb://localhost/ExprOnline');
// >>>>>>> f36a4caa5be89d5645de13ae953c2a767265813c
exports.mongoose = mongoose;