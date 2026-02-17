declare module 'disqus-react' {
    import { ComponentType } from 'react';

    interface DiscussionEmbedConfig {
        url?: string;
        identifier?: string;
        title?: string;
        language?: string;
    }

    interface DiscussionEmbedProps {
        shortname: string;
        config: DiscussionEmbedConfig;
    }

    export const DiscussionEmbed: ComponentType<DiscussionEmbedProps>;
}
