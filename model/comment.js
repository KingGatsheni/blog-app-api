const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let date =new Date();
const comSchema = new Schema({
_id: mongoose.Types.ObjectId,
comment:String,
author:{
	type:Schema.Types.ObjectId,
	required: true,
	ref: 'User'
},
post: {
	type:Schema.Types.ObjectId,
	required:true,
	ref:'Post'
},
updateAt :{
	type: Date,
	default:Date.now
}

});
module.exports = mongoose.model('Comment', comSchema);