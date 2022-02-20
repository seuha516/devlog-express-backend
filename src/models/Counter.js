import mongoose from 'mongoose';

const { Schema } = mongoose;
const CounterScehma = new Schema({
  date: Date,
  ip: String,
});

const Counter = mongoose.model('counter', CounterScehma);
export default Counter;
