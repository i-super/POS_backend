const Joi = require("joi");

module.exports = {
  storeSchema: Joi.object()
    .keys({
      storeName: Joi.string().required(),
      line1: Joi.string().required(),
      id: Joi.string(),
      isActive: Joi.boolean(),
      line2: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      owner: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
      }).required(),
      manager: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
      }),
      phoneNumber: Joi.string().required(),
      defaultTax: Joi.number().min(0).required(),
      discount: Joi.object().keys({
        startDate: Joi.date(),
        endDate: Joi.date(),
        discount: Joi.number().min(0),
      }),
      GlobalTradePercentage: Joi.number(),
      TradePercentageCategory: Joi.number(),
    })
    .unknown(),

  userSchema: Joi.object()
    .keys({
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      email: Joi.string().email().required(),
      role: Joi.string()
        .valid("admin", "store-manager", "store-owner", "employee")
        .required(),
      password: Joi.string().required(),
    })
    .unknown(),

  returnSchema: Joi.object()
    .keys({
      store: Joi.object()
        .keys({ id: Joi.string().required(), name: Joi.string().required() })
        .required(),
      id: Joi.string().required(),
      TransactionID: Joi.string().required(),
      PaymentType: Joi.string().required(),
      inventory: Joi.array()
        .items(
          Joi.object({
            item: Joi.string().required(),
            sku: Joi.string().required(),
            quantity: Joi.number().min(0).required(),
            price: Joi.number().min(0).required(),
          }).unknown()
        )
        .min(1)
        .required(),
      Tax: Joi.number().min(0).required(),
      SubTotal: Joi.number().min(1).required(),
      TotalAmountPaid: Joi.number().min(0).required(),
    })
    .unknown(),

  transactionSchema: Joi.object()
    .keys({
      store: Joi.object()
        .keys({ id: Joi.string().required(), name: Joi.string().required() })
        .required(),
      inventory: Joi.array()
        .items(
          Joi.object({
            item: Joi.string().required(),
            category: Joi.string().required(),
            sku: Joi.string().required(),
            quantity: Joi.number().min(1).required(),
            cogs: Joi.number().min(0).required(),
            price: Joi.number().min(0).required(),
          }).unknown()
        )
        .min(1)
        .required(),
      creditUsed: Joi.number().default(0),
      id: Joi.string().required(),
      TransactionType: Joi.string().valid("Draft", "Processed").required(),
      PaymentType: Joi.string().valid("Cash", "Credit").required(),
      discount: Joi.number().default(0),
      Tax: Joi.number().default(0),
      SubTotal: Joi.number().min(1).required(),
      TotalAmountPaid: Joi.number().min(0).required(),
    })
    .unknown(),

  receiptDetailsSchema: Joi.object().keys({
    returnPolicy: Joi.string().required(),
    logo: Joi.string().required(),
  }),

  bulkUploadSchema: Joi.array()
    .items(
      Joi.object()
        .keys({
          product_name: Joi.string().required(),
          category_name: Joi.string().required(),
          store: Joi.object()
            .keys({
              id: Joi.string().required(),
              name: Joi.string().required(),
            })
            .required(),
          sku: Joi.string().required(),
          date_added: Joi.string().required(),
          price: Joi.object().keys({
            quantity: Joi.number().min(0),
            unit_purchase_price: Joi.number().min(0),
            unit_sell_price: Joi.number().min(0),
            type: Joi.string(),
          }),
          product_id: Joi.string().required(),
          isActive: Joi.boolean().default(true),
        })
        .unknown()
    )
    .min(1)
    .required(),

  notificationSchema: Joi.object().keys({
    id: Joi.string().required(),
    category: Joi.string().required(),
    product: Joi.string().required(),
  }),

  categoryPercentageSchema: Joi.object().keys({
    id: Joi.string().required(),
    category: Joi.string().required(),
    percentage: Joi.number().min(0).required(),
  }),

  employeeSchema: Joi.object()
    .keys({
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      email: Joi.string().email().required(),
      role: Joi.string().required(),
      password: Joi.string().required(),
    })
    .unknown(),

  customerSchema: Joi.object()
    .keys({
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      email: Joi.string().email(),
      mobile: Joi.string(),
      store: Joi.object()
        .keys({ id: Joi.string().required(), name: Joi.string().required() })
        .required(),
      driverLicense: Joi.string(),
      notification: Joi.array(),
      line1: Joi.string(),
      line2: Joi.string(),
      state: Joi.string(),
      city: Joi.string(),
      zip: Joi.string(),
      currentBalance: Joi.number().default(0),
    })
    .unknown(),

  assignUserSchema: Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }),

  storeDiscountSchema: Joi.object()
    .keys({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      discount: Joi.number().min(0).required(),
    })
    .required(),

  updateQuantitySchema: Joi.object().keys({
    price: Joi.object().keys({
      quantity: Joi.number().min(1).required(),
      unit_purchase_price: Joi.number().min(1).required(),
      unit_sell_price: Joi.number().min(1).required(),
      type: Joi.string().required(),
    }),
  }),

  assignEmployeesSchema: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
      })
    )
    .min(1)
    .required(),

  inventorySchema: Joi.object()
    .keys({
      product_name: Joi.string().required(),
      category_name: Joi.string().required(),
      store: Joi.object()
        .keys({ id: Joi.string().required(), name: Joi.string().required() })
        .required(),
      sku: Joi.string().required(),
      date_added: Joi.string().required(),
      price: Joi.object().keys({
        quantity: Joi.number().min(1),
        unit_purchase_price: Joi.number().min(0),
        unit_sell_price: Joi.number().min(0),
        type: Joi.string(),
      }),
      product_id: Joi.string().required(),
    })
    .unknown(),

  categorySchema: Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }),
  loginSchema: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().trim().required(),
  }),

  registerSchema: Joi.object()
    .keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().trim().required(),
    })
    .unknown(),

  verifyCodeSchema: Joi.object().keys({
    email: Joi.string().email().required(),
    code: Joi.string().min(6).max(6).required(),
  }),

  addTradeSchema: Joi.object()
    .keys({
      id: Joi.string().required(),
      customer: Joi.object()
        .keys({ id: Joi.string().required(), name: Joi.string().required() })
        .required(),
      store: Joi.object()
        .keys({ id: Joi.string().required(), name: Joi.string().required() })
        .required(),
      PaymentType: Joi.string().valid("Cash", "Credit").required(),
      discount: Joi.number().default(0),
      Tax: Joi.number().default(0),
      SubTotal: Joi.number().min(1).required(),
      TotalAmountPaid: Joi.number().min(1).required(),
      inventory: Joi.array().items(
        Joi.object().keys({
          product_name: Joi.string().required(),
          category_name: Joi.string().required(),
          sku: Joi.string().required(),
          date_added: Joi.string().required(),
          price: Joi.object()
            .keys({
              quantity: Joi.number().min(1),
              unit_purchase_price: Joi.number().min(1),
              unit_sell_price: Joi.number().min(1),
              type: Joi.string(),
            })
            .unknown(),
          product_id: Joi.string().required(),
        })
      ),
    })
    .unknown(),
};
