"use client"
import { DiscussionEmbed } from 'disqus-react';
import {JSX, useEffect, useState} from "react";
import { v4 as uuidv4 } from 'uuid';

interface DisqusFormData {
    url: string;
    postId: string;
    postTitle: string;
}

export default function DisqusForm(): JSX.Element {
    const [error, setError] = useState("")
    const [disqusFormData, setDisqusFormData] = useState<DisqusFormData>({
        url: "",
        postId: "",
        postTitle: ""
    });
    const disqusShortname = 'yong-an-tea';

    useEffect(() => {
        const webside_url = process.env.WEBSIDE_URL;
        if (webside_url === undefined) {
            setError(`WebSIDE_URL is null`);
            return;
        }

        // 生成 UUID 作為 postId
        const uniqueId = uuidv4();

        setDisqusFormData({
            url: `${webside_url}/some-post`,
            postId: uniqueId,
            postTitle: "My Post Title"
        });
    }, []);

    const disqusConfig = {
        url: disqusFormData.url,
        identifier: disqusFormData.postId,
        title: disqusFormData.postTitle,
    };

    return (
        <div className="pt-[65px]">
            {/* @ts-ignore - Ignoring type error for DiscussionEmbed */}
            <DiscussionEmbed
                shortname={disqusShortname}
                config={disqusConfig}
            />
            {error && <div className="error">{error}</div>}
        </div>
    );
}