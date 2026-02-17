import { DiscussionEmbed } from 'disqus-react';

function DisqusForm() {
    const disqusShortname = 'Helendo';

    const disqusConfig = {
        url: 'https://helendo.disqus.com/',
        identifier: '123',
        title: 'helendo-post',
    };
    return (
        <div className="pt-[65px]">
            <DiscussionEmbed
                shortname={disqusShortname}
                config={disqusConfig}
            />
        </div>
    );
}

export default DisqusForm;
