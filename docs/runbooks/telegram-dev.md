# Telegram Mini App Development Runbook

## Prerequisites

1. **Bot created in BotFather**
   - Create bot via [@BotFather](https://t.me/BotFather)
   - Get `BOT_TOKEN`
   - Store in `.env` (not committed to git)

2. **Webapp runs locally**
   - Port: `5173` (default)
   - Command: `pnpm --filter @tracked/webapp dev`
   - Verify: http://localhost:5173 opens

3. **ngrok installed and configured**
   - See [tools/ngrok/README.md](../../tools/ngrok/README.md)
   - Authtoken configured: `ngrok config add-authtoken YOUR_TOKEN`

## Quick Start (Copy-Paste)

### Terminal A: Webapp

```bash
pnpm --filter @tracked/webapp dev
```

Wait for: `Local: http://localhost:5173/`

### Terminal B: ngrok tunnel

```bash
ngrok http 5173
```

Copy the public URL (e.g., `https://xxxx.ngrok-free.app`)

**Verify**: Open the public URL in browser → should show webapp

### Terminal C: Bot

```bash
BOT_TOKEN=your_token_here pnpm --filter @tracked/bot start
```

Bot should start and log: `Bot @your_bot_name started`

## Environment Variables

### Local `.env` (not committed)

```env
BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBAPP_URL=https://xxxx.ngrok-free.app
```

**Important**: `.env` is in `.gitignore`, never commit tokens or URLs.

## Story 1.1 Placeholder

On Story 1.1, we'll add a `web_app` button to the bot that opens `TELEGRAM_WEBAPP_URL`.

For now, the bot only responds to `/start` command.

## Troubleshooting

### "invalid host header" / CORS

- This is normal for ngrok
- Webapp should handle ngrok headers correctly
- If issues persist, check webapp CORS settings

### "ngrok authtoken missing"

```bash
ngrok config add-authtoken YOUR_TOKEN
```

Verify: `ngrok config check`

### Telegram cache issues

- **Bot restart**: Stop and restart bot (Terminal C)
- **Webapp cache**: Clear browser cache or use incognito
- **Telegram cache**: Close and reopen Telegram Mini App

### Port already in use

```bash
# Check what's using port 5173
lsof -i :5173

# Kill process if needed
kill -9 <PID>
```

### ngrok URL changes on restart

- ngrok free tier: URL changes on each restart
- Update `TELEGRAM_WEBAPP_URL` in `.env` after each ngrok restart
- On Story 1.1, bot will read from env automatically

## Development Workflow

1. Start webapp: `pnpm --filter @tracked/webapp dev`
2. Start ngrok: `ngrok http 5173`
3. Copy public URL to `.env`: `TELEGRAM_WEBAPP_URL=https://xxxx.ngrok-free.app`
4. Start bot: `BOT_TOKEN=... pnpm --filter @tracked/bot start`
5. Test in Telegram: Send `/start` to bot
6. (Story 1.1) Click web_app button to open Mini App

## Helper Scripts

From root:

```bash
# Start webapp dev server
pnpm dev:webapp

# Show instructions for public dev setup
pnpm dev:public
```
