const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let date =new Date();
const postSchema = new Schema({
_id: mongoose.Types.ObjectId,
title:String,
description:String,
author:{
	type:Schema.Types.ObjectId,
	required: true,
	ref: 'User'
},
updateAt :{
	type: Date,
	default:Date.now
}

});
module.exports = mongoose.model('Post', postSchema);