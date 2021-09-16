# Conversations

## Setup

### 0.

```bash
$ yarn
```

### 1.

config/credentials.json

```json
{
  "web": {
    "client_id": "",
    "project_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_secret": "",
    "redirect_uris": [""]
  }
}
```

### 2.

config/index.json

```json
{
  "server": {
    "port": "<port>"
  },
  "services": {
    "google": {
      "scopes": [""],
      "pathToToken": "config/token.json",
      "pathToCredentials": "config/credentials.json",
      "calendarId": {
        "<calendar_name>": ""
      }
    },
    "slack": {
      "<app_name>": {
        "botToken": "",
        "userToken": ""
      },
      "channels": {
        "<channel_name>": ""
      }
    },
    "discord": {}
  }
}
```

### 3.

Setup Google auth token

```bash
$ ts-node services/google/auth/getAccesstoken.ts
```

## run locally

```
$ yarn start:local
```
