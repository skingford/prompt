import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function buildChatProxy(target: string, token?: string) {
  const url = new URL(target);
  const targetPath = `${url.pathname}${url.search}`;

  return {
    target: url.origin,
    changeOrigin: true,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    rewrite: () => targetPath,
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.CHAT_COMPLETIONS_PROXY_TARGET ||
    "http://localhost:1086/v1/chat/completions";
  const proxyToken = env.CHAT_COMPLETIONS_PROXY_TOKEN;
  const chatProxy = buildChatProxy(proxyTarget, proxyToken);

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/chat/completions": chatProxy,
      },
    },
    preview: {
      proxy: {
        "/api/chat/completions": chatProxy,
      },
    },
  };
});
