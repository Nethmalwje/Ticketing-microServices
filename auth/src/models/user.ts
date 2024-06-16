import mongoose, { Model } from "mongoose";
import { Password } from "../services/password";

//an interface that describes the properties rquires to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

//iinterface that describes the properties that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//interface that describes the properties that user document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String, //this is not tied to typescript this is the type for db
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

//hashing passwords
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

//adding a method to user model
userSchema.statics.build = (attrs: UserAttrs) => {
  //creates a new user while solving ts issue 01
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

// const buildUser = (attrs: UserAttrs) => {
//   //creates a new user while solving ts issue 01
//   return new User(attrs);
// };

export { User };
