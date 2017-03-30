module.exports = function (opts) {
  var userSchema = opts.mongoose.Schema({
    fname: { type: String, required: true, select: true },
    lname: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '', required: true, unique: true, select: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false, select: true },
    forgot: String,
    created: { type : Date, required: true, default: Date.now },
    lastseen: { type : Date, select: true }
  });
  
  userSchema.methods.verifyPassword = function verifyPassword(psswd) {
    return this.password == opts.SHA256(psswd + this.salt).toString();
  };

  try { // catch multiple calls in tests
    opts.mongoose.model('user', userSchema);
  } catch (error) {}

  return opts.mongoose.model('user');
};