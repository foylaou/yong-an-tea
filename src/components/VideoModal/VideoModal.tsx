import {JSX, useState} from 'react';
import { IoPlayCircleOutline, IoCloseOutline } from 'react-icons/io5';
import { BiLoaderAlt } from 'react-icons/bi';

export default function VideoModal(): JSX.Element {
    const [modal, setModal] = useState<boolean>(false);
    const [videoLoading, setVideoLoading] = useState<boolean>(true);

    const openModal = (): void => {
        setModal(!modal);
    };

    const spinner = (): void => {
        setVideoLoading(!videoLoading);
    };

    return (
        <button type="button" onClick={openModal}>
            <IoPlayCircleOutline className="text-[80px] text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />
            {modal && (
                <div className="fixed top-0 left-0 w-full h-full bg-[rgba(28,_28,_28,_0.19)] backdrop-blur-[6px] opacity-100 ease-out duration-300 z-[100]">
                    <div className="flex justify-center items-center h-screen">
                        <div className="lg:w-[800px] w-[calc(100%-30px)] h-[500px] shadow-[0px_100px_80px_rgba(184,_184,_184,_0.07)] rounded-[20px] bg-transparent text-black mx-[4rem]">
                            <div className="close-btn-wrap relative">
                                <IoCloseOutline
                                    className="bg-white rounded-full cursor-pointer absolute top-[-60px] right-0 w-[32px] h-[32px]"
                                    arial-label="Close modal"
                                    onClick={() => setModal(false)}
                                />
                            </div>
                            <div className="flex relative">
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
                                    src="https://www.youtube.com/embed/fkoEj95puX0"
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
    );
}