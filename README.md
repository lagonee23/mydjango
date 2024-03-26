# 🕹️육각지뢰찾기 게임🎮
육각지뢰찾기는 전통적인 사각형 모양의 칸이 아닌 육각형 모양으로 구성된 새로운 타입의 지뢰찾기 게임입니다. 이 게임에서는 지뢰 대신 벌이 등장하며, 플레이어의 목표는 벌을 피해 꿀을 채취하는 것입니다.

## 게임 설명
- **게임 시작**
    - 육각형 타일의 아무곳이나 눌러 게임을 시작할 수 있습니다.
    - 게임이 시작되면 스톱워치가 작동하며 게임이 끝날 때까지 시간을 잽니다.
- **승리 조건**
    - 일반 지뢰찾기 게임과 규칙이 동일합니다. 벌이 있는 방에 깃발을 꽃고, 벌집 속 모든 꿀을 채취하면 게임에서 승리하게 됩니다.
    - 게임이 끝나면 스톱워치도 종료됩니다. 시간이 기록되어 플레이타임의 평균과 최단시간이 표시됩니다.
- **Reset**
    - 우측상단의 Reset 버튼을 눌러 게임을 초기화할 수 있습니다.

## 기술 스택
- **DJANGO**: Python의 Django를 사용하여 개발되었습니다. Django는 강력하면서도 유연한 웹 개발을 위한 고수준의 오픈소스 웹 프레임워크입니다. 모델-템플릿-뷰(MTV) 패턴을 따르고 있으며 현재는 장고 소프트웨어 재단에 의해 관리되고 있습니다.
- **JAVASCRIPT**: 게임내 모든 작동방식은 Javascript로 구현 되었습니다. 플레이어의 좌클릭, 우클릭 혹은 좌우클릭 모두 `js/game.js` 파일의 리스너(listener) 함수를 통해 동작합니다. 
- **AWS ELASTIC BEANSTALK**: 해당 장고앱은 AWS의 Elastic BeanStalk를 통해 배포되었습니다. 배포를 위해 `settings.py` 파일에 호스트를 추가, 그리고 `.ebextensions` 디렉토리를 생성하여 `django.config` 파일을 추가하였습니다.

## 시작하기
- 아래 도메인에 접속하여 게임을 시작할 수 있습니다.<br>
http://My-django-app-env.eba-najxrmmr.ap-northeast-2.elasticbeanstalk.com <br>
![게임 스크린샷]()
- 만약 도메인에 접속이 불가하거나, 프로젝트를 직접 로컬에 설치하여 게임을 플레이하고 싶으시다면 아래의 단계를 따르십시오.
    1. 저장소를 클론합니다.
        ```bash
        git clone https://github.com/lagonee23/mydjango.git
        ```
    2. 프로젝트 디렉토리로 이동합니다.
        ```bash
        cd mydjango
        ```
    3. 필요한 패키지를 설치합니다.
        ```bash
        pip install -r requirements.txt
        ```
        또는 Pipenv를 사용하는 경우
        ```bash
        pipenv install
        ```
        🔑 pipenv 가상환경에 대한 사용법은 [공식문서](https://pipenv.pypa.io/en/latest/)를 참고하십시오.
    4. Django 서버를 실행합니다.
        ```bash
        python manage.py runserver
        ```
        브라우저에서 http://127.0.0.1:8000/ 으로 접속하여 게임을 즐기세요!
