import { useState, useEffect} from "react";
import { Router } from "next/router";
import useRequest from "../../hooks/use-request";
import StripeCheckout from "react-stripe-checkout";

const OrderShow = ({ order, currentUser }) => {

    const [ timeLeft, setTimeLeft ] = useState(0);

    const { doRequest, erros } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess:() => Router.push('/orders')
    })

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };

        findTimeLeft();

        const timerId = setInterval(findTimeLeft, 1000);

        if(timeLeft < 0) {
            return <div>Order expired</div>;
        }

        return () => {
            clearInterval(timerId);
        }
    }, [order]);

    <div>
        <p>Order will expire at: { timeLeft } </p>
        <StripeCheckout
            token={(id) => doRequest({ token: id })}
            stripeKey="pk_test_51GcSvuCyYW8raZL545apE4bSPFvbp463SMhKFECc0tA68r6J5tUQYaiJiOsC3MBHgslGZEcc0doV5Bzfl6QI4BVy00O7gEklFS"
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
        {errors}
    </div>
};

OrderShow.getInitialProps = async(context, client) => {
    const { orderId } = context.query;

    const { data } = client.get(`/api/orders/${orderId}`);

    return { order: data };
}

export default OrderShow;