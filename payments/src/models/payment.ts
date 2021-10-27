import mongoose from "mongoose";

export interface PaymentAttrs {
    orderId: string;
    stripeId: string
}

export interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
}

export interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        required: true,
        type: String
    },
    stripeId: {
        required: true,
        type: String
    }
}, {
    toJSON: {
        transform(ret, doc) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };