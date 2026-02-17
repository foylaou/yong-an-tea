import ReactDom from 'react-dom';

interface NotificationProps {
    title: string;
    message: string;
    status?: string;
}

const Notification = (props: NotificationProps) =>
    ReactDom.createPortal(
        <section>
            <h2>{props.title}</h2>
            <p>{props.message}</p>
        </section>,
        document.getElementById('notification-root') as HTMLElement
    );

export default Notification;
