import { defineConfig } from "vite"
import process from "process"
import fs from "fs"

// https://vite.dev/config/
export default defineConfig({
  // 关键：base 用相对路径，确保部署到 GitHub Pages 子路径 /cpdd-1314/ 下资源正常
  base: './',
  plugins: [
    {
      name: 'deploy-report',
      // 仅开发环境：接收部署助手的执行结果并写入 /tmp/deploy_report.json（供部署排查用，不影响生产构建）
      configureServer(server) {
        server.middlewares.use('/__deploy_report__', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 404; res.end('not found'); return; }
          let body = ''
          req.on('data', (c) => { body += c })
          req.on('end', () => {
            try {
              fs.writeFileSync('/tmp/deploy_report.json', body)
              res.setHeader('Content-Type', 'application/json')
              res.end('{"ok":true}')
            } catch (e) {
              res.statusCode = 500
              res.end('err')
            }
          })
        })
      },
    },
  ],
  server: {
    host: '::',
    port: 5173,
    allowedHosts: true,
    cors: true,
    hmr: {
      protocol: 'wss',
      host: `5173-${process.env.X_IDE_SPACE_KEY}.e2b.${process.env.X_IDE_SPACE_REGION}.${process.env.X_IDE_SPACE_HOST}`
    },
  },
  build: {
    outDir: 'dist',
  },
})
