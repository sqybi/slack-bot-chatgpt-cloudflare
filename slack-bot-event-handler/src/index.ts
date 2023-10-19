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
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        try {
            if (request.method.toUpperCase() === 'POST') {
                const event: SlackEvent = await request.json();
                switch (event.type) {
                    case 'url_verification':
                        const urlVerificationEvent = event as SlackEventUrlVerification;
                        return Response.json({ challenge: urlVerificationEvent.challenge }, { status: 200 });
                    case 'app_mention':
                        const appMentionEvent = event as SlackEventAppMention;
                        await env.SLACK_EVENTS_APP_MENTION.send(appMentionEvent, { contentType: 'json' });
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
