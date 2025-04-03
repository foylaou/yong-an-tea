import ReactDOM from 'react-dom';
import React from "react";

// Define the props interface
interface NotificationProps {
    title: string;
    message: string;
    status?: 'pending' | 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({
                                                       title,
                                                       message,
                                                       status = 'pending'
                                                   }) => {
    // Determine the CSS class based on status
    const notificationClass = `
        fixed top-0 right-0 z-50 p-4 m-4 rounded-lg shadow-lg 
        ${status === 'pending'
        ? 'bg-yellow-100 text-yellow-800'
        : status === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
    }
    `;

    return ReactDOM.createPortal(
        <section className={notificationClass}>
        <h2 className="text-lg font-bold mb-2">{title}</h2>
            <p>{message}</p>
            </section>,
    document.getElementById('notification-root') as HTMLElement
);
};

export default Notification;