import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import svgr from 'vite-plugin-svgr'
import tailwindcssPostcss from '@tailwindcss/postcss'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'

// 메타 태그 생성 함수
const generateMetaTag = () => {
  try {
    execSync('node ./node_modules/react-cache-buster/dist/generate-meta-tag.js')
    console.log('✅ Generate meta tag success.')
  } catch (error) {
    console.error('❌ Generate meta tag error:', error)
  }
}

// 환경 설정 함수
const setupEnvironment = (mode: string) => {
  // const script = mode === 'production' ? 'yarn run env:prod' : 'yarn run env:dev'
  const message = `${mode === 'production' ? 'Production' : 'Development'} environment variables are set.`

  try {
    console.log(`✅ ${message}`)
  } catch (error) {
    console.error(
      `❌ ${mode === 'production' ? 'Production' : 'Development'} environment variable setting error:`,
      error,
    )
  }
}

// meta.json 파일 복사 함수
const copyMetaJson = () => {
  try {
    const metaFile = path.resolve(__dirname, 'meta.json')
    const destDir = path.resolve(__dirname, 'build')

    if (fs.existsSync(metaFile)) {
      fs.copyFileSync(metaFile, path.join(destDir, 'meta.json'))
      console.log('✅ Copy meta.json file to build folder.')
    }
  } catch (err) {
    console.error('Copy meta.json file error:', err)
  }
}

// 프론트엔드에 노출할 환경 변수 필터링 함수
const filterExposedEnvs = (env: Record<string, string>) => {
  return Object.entries(env).reduce(
    (acc, [key, value]) => {
      if (key.startsWith('VITE_') || key.startsWith('REACT_APP_')) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, string>,
  )
}

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '')

  // 환경 설정
  setupEnvironment(mode)

  // 프론트엔드에 노출할 환경 변수 필터링
  const exposedEnvs = filterExposedEnvs(env)

  // Vite 설정 반환
  return {
    plugins: [
      // 메타 태그 생성 플러그인
      {
        name: 'generate-meta-tag',
        buildStart() {
          if (mode === 'production') {
            generateMetaTag()
          }
        },
      },
      // SVG를 React 컴포넌트로 변환하는 플러그인
      svgr({
        svgrOptions: {
          exportType: 'named',
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: '**/*.svg',
        esbuildOptions: {
          loader: 'tsx',
        },
      }),
      // React 플러그인
      react({
        jsxImportSource: 'react',
        tsDecorators: true,
        plugins: [],
      }),
      // 빌드 후 meta.json 파일 복사 플러그인
      {
        name: 'copy-meta-json',
        closeBundle() {
          if (mode === 'production') {
            copyMetaJson()
          }
        },
      },
    ],
    // 환경 변수 정의
    define: {
      'process.env': exposedEnvs,
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    // 서버 설정
    server: {
      port: 3000,
      host: true,
    },
    // CSS 설정
    css: {
      postcss: {
        plugins: [tailwindcssPostcss()],
      },
    },
    // 빌드 설정
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
    optimizeDeps: {
      include: ['swiper', 'swiper/css'],
      esbuildOptions: {
        loader: {
          '.svg': 'tsx',
        },
      },
    },
    // 경로 별칭 설정
    resolve: {
      alias: {
        '@/': '/src',
        '@/legacy': '/src/legacy',
        '@/atoms': '/src/components/atoms',
        '@/molecules': '/src/components/molecules',
        '@/organisms': '/src/components/organisms',
        '@/pages': '/src/components/pages',
        '@/layouts': '/src/components/layouts',
        '@/hooks': '/src/hooks',
        '@/stores': '/src/store',
        '@/stores2': '/src/stores',
        '@/routers': '/src/routers',
        '@/assets': '/src/assets',
      },
    },
  }
})
