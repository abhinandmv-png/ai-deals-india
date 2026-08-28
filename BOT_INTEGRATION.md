# Connect the website to your Railway bot

## What changes

Your existing bot can keep doing this:

Premium Deals → Railway bot → Telegram channel

Add one extra action after a deal is successfully posted:

Premium Deals → Railway bot → Telegram channel
                         ↘ deals.json → website

The website reads `deals.json` every 60 seconds.

## Recommended free architecture

Keep your bot repository PRIVATE.

Create a separate PUBLIC GitHub repository only for the website. Host that website with GitHub Pages (or another free static host).

Your Railway bot updates only `deals.json` in the website repository using the GitHub Contents API.

Do NOT put your Telegram API hash, bot token, phone number, string session, affiliate credentials, or GitHub token into the website repository.

## Deal JSON format

Each deal should look like:

{
  "title": "Product title",
  "price": 699,
  "original_price": 1999,
  "category": "Fashion",
  "badge": "70% OFF",
  "note": "Short useful deal description",
  "url": "YOUR_AFFILIATE_URL"
}

`deals.json` should contain the newest deals first.

## Railway variables you will eventually add

GITHUB_TOKEN=your_token
WEBSITE_REPO=yourusername/ai-deals-india
WEBSITE_BRANCH=main

Use a fine-grained GitHub token with access ONLY to the website repository's Contents (write) permission.

Do not hard-code the token in bot.py.

## Python helper

Add a helper that reads the current deals.json from GitHub, prepends the new deal, keeps (for example) the latest 100 deals, then PUTs the updated file back through the GitHub Contents API.

The helper should run only AFTER your Telegram message has been successfully sent.

Important:
- Never upload `config.json`.
- Never upload `sessions/`.
- Never upload `*.session`.
- Never upload your Telegram StringSession.
- Never print secrets in Railway logs.
