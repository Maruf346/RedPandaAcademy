import os

import requests

from .models import BotMessage

FALLBACK_PLAYBOOK_CONTEXT = '''You are Panda Bot, the Red Panda Closer Academy coach. Answer only from the Red Panda Academy sales playbook. Every coaching answer should name the relevant step and KPI when applicable. If the user asks outside the academy playbook, say it is outside the playbook and route back to academy material.'''


def build_prompt(conversation, user_message, playbook_context=''):
    context = (playbook_context or '').strip() or FALLBACK_PLAYBOOK_CONTEXT
    history = []
    for message in conversation.messages.order_by('-created_at')[:8]:
        speaker = 'REP' if message.role == BotMessage.Role.USER else 'COACH'
        history.append(f'{speaker}: {message.content}')
    history.reverse()
    history.append(f'REP: {user_message}')
    return f'{context}\n\n=== CONVERSATION ===\n' + '\n'.join(history) + '\nCOACH:'


def complete_bot_reply(conversation, user_message, playbook_context=''):
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise RuntimeError('ANTHROPIC_API_KEY is not configured on the backend.')

    prompt = build_prompt(conversation, user_message, playbook_context)
    model = os.getenv('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022')
    timeout = int(os.getenv('ANTHROPIC_TIMEOUT_SECONDS', '60'))

    response = requests.post(
        'https://api.anthropic.com/v1/messages',
        headers={
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': api_key,
        },
        json={
            'model': model,
            'max_tokens': int(os.getenv('ANTHROPIC_MAX_TOKENS', '900')),
            'messages': [{'role': 'user', 'content': prompt}],
        },
        timeout=timeout,
    )
    response.raise_for_status()
    payload = response.json()
    parts = payload.get('content') or []
    text = ''.join(part.get('text', '') for part in parts if part.get('type') == 'text').strip()
    if not text:
        raise RuntimeError('AI provider returned an empty response.')
    return text
