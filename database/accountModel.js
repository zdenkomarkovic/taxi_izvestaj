const { Schema, models, model } = require("mongoose");

const AccountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    password: { type: Number, required: true },
  },
  { timestamps: true }
);

const Account = models?.Account || model("Account", AccountSchema);
export default Account;
