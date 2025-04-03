import {JSX} from "react";

interface GoogleMapProps {
    title?: string;
    src?: string;
    allowFullScreen?: boolean;
    loading?: 'lazy' | 'eager';
}

export default function GoogleMap(props: GoogleMapProps): JSX.Element {
    return (
        <iframe
            title={props.title || "Google map"}
            className="map-size w-full h-[620px]"
            src={props.src || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d423283.43554989767!2d-118.69191546801642!3d34.02073049790668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA%2C%20USA!5e0!3m2!1sen!2sbd!4v1653905796199!5m2!1sen!2sbd"}
            allowFullScreen={props.allowFullScreen ?? false}
            loading={props.loading || "lazy"}
            referrerPolicy="no-referrer-when-downgrade"
            width="100%"
            height="620"
        />
    );
}