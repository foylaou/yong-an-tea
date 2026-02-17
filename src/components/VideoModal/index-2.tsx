import { useState } from 'react';
import { IoPlayCircleOutline, IoCloseOutline } from 'react-icons/io5';
import { BiLoaderAlt } from 'react-icons/bi';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

interface VideoModalTwoProps {
    containerCName: string;
}

function VideoModalTwo({ containerCName }: VideoModalTwoProps) {
    const v = useSettingsStore(useShallow((s) => ({
        title: s.video_title || s.site_name,
        desc: s.video_desc || s.site_description,
        image: s.video_image,
        imageAlt: s.video_image_alt,
        url: s.video_url,
    })));

    const [modal, setModal] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);

    const openModal = () => {
        setModal(!modal);
    };

    const spinner = () => {
        setVideoLoading(!videoLoading);
    };
    return (
        <div className="video-banner lg:pt-[90px] md:pt-[70px] pt-[40px]">
            <div className={containerCName}>
                <div className="video-content flex flex-col items-center">
                    <h2 className="font-haviland text-[60px] mb-[30px]">
                        {v.title}
                    </h2>
                    <p className="text-center lg:max-w-[770px] lg:mb-[95px] md:mb-[75px] mb-[45px]">
                        {v.desc}
                    </p>
                </div>
                <div className="video-img relative flex overflow-hidden after:transition-all after:duration-500 after:bg-[rgba(0,0,0,.4)] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:opacity-0 hover:after:opacity-100 group">
                    <img
                        className="object-cover object-center w-full transition-all duration-500 group-hover:scale-[1.05]"
                        src={v.image}
                        alt={v.imageAlt}
                        width={1130}
                        height={435}
                    />
                    <button type="button" onClick={openModal}>
                        <IoPlayCircleOutline className="text-[80px] text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />
                        {modal && (
                            <div className="fixed top-0 left-0 w-full h-full bg-[rgba(28,28,28,0.19)] backdrop-blur-[6px] opacity-100 ease-out duration-300 z-50">
                                <div className="flex justify-center items-center h-screen">
                                    <div className="lg:w-[800px] w-[calc(100%-30px)] h-[500px] shadow-[0px_100px_80px_rgba(184,184,184,0.07)] rounded-[20px] bg-transparent text-black mx-16">
                                        <div className="close-btn-wrap relative">
                                            <IoCloseOutline
                                                className="bg-white rounded-full cursor-pointer absolute top-[-80px] right-0 w-[32px] h-[32px]"
                                                arial-label="Close modal"
                                                onClick={() => setModal(false)}
                                            />
                                        </div>
                                        <div className="flex relative bottom-[37px]">
                                            {videoLoading && (
                                                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[40px] text-primary animate-spin">
                                                    <BiLoaderAlt />
                                                </div>
                                            )}
                                            <iframe
                                                className="rounded-[20px] z-10"
                                                onLoad={spinner}
                                                loading="lazy"
                                                width="800"
                                                height="500"
                                                src={v.url}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VideoModalTwo;
