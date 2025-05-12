import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import tailwindcssPostcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
import { execSync } from 'child_process'
import react from '@vitejs/plugin-react-swc'

function generateMetaTag() {
  try {
    execSync('node ./node_modules/react-cache-buster/dist/generate-meta-tag.js')
    console.log('✅ Generate meta tag success.')
  } catch (error) {
    console.error('❌ Generate meta tag error:', error)
  }
}

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '')

  if (mode === 'production') {
    try {
      execSync('npm run env:prod')
      console.log('✅ Production environment variables are set.')
    } catch (error) {
      console.error('❌ Production environment variable setting error:', error)
    }
  } else {
    try {
      execSync('npm run env:dev')
      console.log('✅ Development environment variables are set.')
    } catch (error) {
      console.error('❌ Development environment variable setting error:', error)
    }
  }

  // 프론트엔드에 노출할 환경 변수만 선택
  const exposedEnvs: Record<string, string> = {}
  Object.keys(env).forEach((key) => {
    // VITE_ 또는 REACT_APP_ 접두사가 있는 환경변수만 노출
    if (key.startsWith('VITE_') || key.startsWith('REACT_APP_')) {
      exposedEnvs[key] = env[key]
    }
  })

  return {
    plugins: [
      {
        name: 'generate-meta-tag',
        buildStart() {
          if (mode === 'production') {
            generateMetaTag()
          }
        },
      },
      react({
        jsxImportSource: 'react',
        tsDecorators: true,
        plugins: [],
      }),
      // 빌드 후 meta.json 파일 복사 (캐시 버스팅 기능 유지)
      {
        name: 'copy-meta-json',
        closeBundle() {
          if (mode === 'production') {
            try {
              const metaFile = path.resolve(__dirname, 'meta.json')
              const destDir = path.resolve(__dirname, 'build') // CRA와 동일한 출력 폴더 사용

              if (fs.existsSync(metaFile)) {
                fs.copyFileSync(metaFile, path.join(destDir, 'meta.json'))
                console.log('✅ meta.json 파일이 build 폴더로 복사되었습니다.')
              }
            } catch (err) {
              console.error('meta.json 파일 복사 중 오류 발생:', err)
            }
          }
        },
      },
    ],
    define: {
      'process.env': exposedEnvs,
    },
    server: {
      port: 3000,
      host: true,
    },
    css: {
      postcss: {
        plugins: [tailwindcssPostcss(), autoprefixer],
      },
    },
    build: {
      outDir: 'build',
      sourcemap: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
    },
    // 경로 별칭 설정 (tsconfig.json과 일치)
    resolve: {
      alias: {
        '@/legacy': '/src/legacy',
        '@/routers': '/src/routers',
      },
    },
  }
})
