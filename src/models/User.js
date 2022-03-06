import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Schema } = mongoose;
const UserSchema = new Schema(
  {
    username: String,
    hashedPassword: String,
  },
  { versionKey: false },
);

UserSchema.methods.setPassword = async function (password) {
  const hash = await bcryptjs.hash(password, 10);
  this.hashedPassword = hash;
};
UserSchema.methods.checkPassword = async function (password) {
  return bcryptjs.compare(password, this.hashedPassword);
};
UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};
UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};
UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
  return token;
};

const User = mongoose.model('user', UserSchema);
export default User;
