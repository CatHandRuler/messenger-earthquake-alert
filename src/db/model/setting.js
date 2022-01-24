import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const settingSchema = new Schema({
  platform: {
    type: String,
    required: true,
  },
  guild_id: String,
  channel_id: String,
});
const Setting = model('setting', settingSchema);

export default Setting;
