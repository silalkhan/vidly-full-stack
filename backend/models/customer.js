const Joi = require("joi");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    sparse: true,
    unique: true,
  },
});

customerSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId: userId });
};

customerSchema.statics.ensureForUser = async function (user, options = {}) {
  const customerName = options.name || user.name;
  const phone = options.phone;

  let customer = await this.findOne({ userId: user._id });
  if (customer) {
    const needsNameUpdate = customerName && customer.name !== customerName;
    const needsPhoneUpdate = phone && customer.phone !== phone;

    if (needsNameUpdate || needsPhoneUpdate) {
      if (needsNameUpdate) customer.name = customerName;
      if (needsPhoneUpdate) customer.phone = phone;
      await customer.save();
    }

    return customer;
  }

  if (options.linkExisting === true) {
    const matchingCustomers = await this.find({
      name: customerName,
      userId: { $exists: false },
    })
      .limit(2);

    if (matchingCustomers.length > 1) {
      const error = new Error(
        "Multiple unlinked customer records match this account. Ask an administrator to link the correct record.",
      );
      error.status = 409;
      throw error;
    }

    if (matchingCustomers.length === 1) {
      customer = matchingCustomers[0];
      customer.userId = user._id;
      await customer.save();
      return customer;
    }
  }

  customer = new this({
    name: customerName,
    phone: phone || "Not provided",
    isGold: false,
    userId: user._id,
  });

  await customer.save();
  return customer;
};

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(5).max(50).required(),
    isGold: Joi.boolean(),
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  });
  return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
