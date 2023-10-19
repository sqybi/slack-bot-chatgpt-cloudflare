import {OpenAI} from 'openai';


// Interfaces

export interface Env {
    CONFIG: KVNamespace;
}

interface SlackEvent {
    type: string;
}

interface SlackEventAppMention extends SlackEvent {
    type: 'app_mention';
    user: string;
    text: string;
    ts: string;
    channel: string;
    event_ts: string;
}

interface QueueEventAppMention {
    workspace: string;
    event: SlackEventAppMention;
}


// Slack Helpers

async function remove_mention(text: string, slack_bot_id: string): Promise<string> {
    return text.replace(`<@${slack_bot_id}>`, "").trim();
}


// Main

export default {
    async queue(batch: MessageBatch<QueueEventAppMention>, env: Env, ctx: ExecutionContext): Promise<void> {
        for (const message of batch.messages) {
            const appMentionEvent = message.body;
            const workspace = appMentionEvent.workspace;
            const text = appMentionEvent.event.text;
            const openai = new OpenAI({
                apiKey: await env.CONFIG.get(`workspace.${workspace}.openai.secret_key`) as string,
            });
            const slack_bot_id = await env.CONFIG.get(`workspace.${workspace}.slack.bot_id`) as string; // TODO: get bot id
        }
    },
};
