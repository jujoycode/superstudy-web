FROM node:22.15.0-alpine3.20 as builder

ARG NODE_ENV="production"
ENV NODE_ENV=$NODE_ENV
ENV NODE_OPTIONS="--max-old-space-size=8192"

ARG REACT_APP_API_URL=$REACT_APP_API_URL

ENV REACT_APP_API_URL=$REACT_APP_API_URL

# /app 디렉토리 생성
RUN mkdir -p /app

# 현재 Dockerfile 있는 경로의 모든 파일을 /app 에 복사
COPY ./ ./app

# /app 디렉토리를 WORKDIR 로 설정
WORKDIR /app

RUN ./makeenv.sh

# npm install + build 실행
RUN yarn install --production=false
RUN yarn build


FROM nginx:1.23.3
# nginx의 기본 설정을 삭제하고 앱에서 설정한 파일을 복사
RUN rm -rf /etc/nginx/conf.d/nginx.conf
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY infra/nginx/nginx.conf /etc/nginx/conf.d/nginx.conf

# 위에서 생성한 앱의 빌드산출물을 nginx의 샘플 앱이 사용하던 폴더로 이동
COPY --from=builder /app/build /usr/share/nginx/html

#가상 머신에 오픈할 포트
EXPOSE 80

#컨테이너에서 실행될 명령을 지정
CMD ["nginx", "-g", "daemon off;"]
