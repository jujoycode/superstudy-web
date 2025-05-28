import { execSync } from 'child_process'
import { defineConfig, loadEnv, type PluginOption } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

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
      {
        name: 'generate-meta-tag',
        buildStart() {
          if (mode === 'production') {
            generateMetaTag()
          }
        },
      },
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
      react({
        jsxImportSource: 'react',
        tsDecorators: true,
        plugins: [],
      }),
      tailwindcss(),
      compression(),
      visualizer() as PluginOption,
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
      postcss: {},
    },
    // 빌드 설정
    build: {
      outDir: 'build',
      sourcemap: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['swiper'],
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
        '@/templates': '/src/components/templates',
        '@/layouts': '/src/layouts',
        '@/hooks': '/src/hooks',
        '@/providers': '/src/components/providers',
        '@/utils': '/src/utils',
        '@/constants': '/src/constants',
        '@/stores': '/src/stores',
        '@/routers': '/src/routers',
        '@/assets': '/src/assets',
      },
    },
  }
})
