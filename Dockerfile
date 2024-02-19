# Python 이미지 불러오기
FROM python:3.12

# 환경변수 설정
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 패키지 설치
COPY Pipfile Pipfile.lock ./
RUN pip install pipenv && pipenv install --dev --system --deploy

# Django 프로젝트를 컨테이너에 복사
COPY . .
