export interface Env {
    SLACK_EVENTS_APP_MENTION: Queue;
}

interface SlackEvent {
    type: string;
}

interface SlackEventUrlVerification extends SlackEvent {
    type: 'url_verification';
    challenge: string;
    token: string;
}

interface SlackEventAppMention extends SlackEvent {
    type: 'app_mention';
    user: string;
    text: string;
    ts: string;
    channel: string;
    event_ts: string;
    workspace?: string;
}

interface QueueEventAppMention {
    workspace: string;
    event: SlackEventAppMention;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        try {
            if (request.method.toUpperCase() === 'POST') {
                const workspace: string = request.url.split('/').pop() as string;
                const event: SlackEvent = await request.json();
                switch (event.type) {
                    case 'url_verification':
                        const urlVerificationEvent = event as SlackEventUrlVerification;
                        return Response.json({ challenge: urlVerificationEvent.challenge }, { status: 200 });
                    case 'app_mention':
                        const appMentionEvent = event as SlackEventAppMention;
                        const appMentionQueueEvent = {
                            workspace: workspace,
                            event: appMentionEvent,
                        } as QueueEventAppMention;
                        await env.SLACK_EVENTS_APP_MENTION.send(appMentionQueueEvent, { contentType: 'json' });
                        return new Response('OK');
                    default:
                        return new Response('Error: Unknown event type', { status: 400 });
                }
            }
        } catch (e) {
            return new Response(`Error: ${e}`, { status: 500 });
        }
        return new Response('Method Not Allowed', { status: 405 });
    },
};
