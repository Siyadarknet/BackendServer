# LibreTranslate/Dockerfile
FROM libretranslate/libretranslate:latest

# Limit to only needed languages to keep image/model downloads small
ENV LT_LOAD_ONLY=en,hi
# Automatically fetch/update models on boot (be mindful: slows cold starts)
ENV LT_UPDATE_MODELS=true

# Exposes port 5000 in the base image; Render will set $PORT.
# LibreTranslate listens on 5000 by default and does not support custom port env,
# so we proxy it by telling Render to route to port 5000.
