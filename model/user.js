const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
_id: mongoose.Types.ObjectId,
username:{
	type:String,
	required: true,
	unique: true
},
email:{
	type: String,
	required:true,
	unique: true,
},
_pass:{
	type:String,
	required:true
 }
});

module.exports = mongoose.model('User', userSchema);