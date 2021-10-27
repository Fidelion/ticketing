import Router from "next/router";
import useRequest from "../../hooks/use-request";

const TicketShow = (ticket) => {

    const { data, errors } = useRequest({
        url: `/api/tickets/${ticket.id}`,
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    });

    return (
        <div>
            <h1>Title: {ticket.title}</h1>
            <h1>Price: {ticket.price}</h1>
            {errors}
            <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button>
        </div>
        );
}

TicketShow.getInitialProps = async(context, client) => {
    const { ticketId } = context.query;

    const { data } = await client.get(`/api/tickets/${ticketId}`);

    return { ticket: data };
}

export default TicketShow;