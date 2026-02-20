# Локальный запуск всей системы для теста фронта
1. Добавить host.docker.internal в /etc/hosts маппинг на 127.0.0.1
2. Зайти сюда https://github.com/Xatas-dev/bazar-k8s-charts/blob/master/bazar-infra/policies/space.yaml, скопировать оттуда space.yaml и вставить в папку devSandbox с именем space-policy.yaml 
3. Запустить docker-compose.yaml
    - Либо перейти в devSandbox и прописать docker-compose up (загуглите и скачайте прогу)
    - Либо в самой IDEA нажать на запуск в файлике docker-compose.yaml (зеленый треугольник сдвоенный)
4. Зайти на http://host.docker.internal:9999 , откроется админка, вводим admin:admin
5. В админке нажимаем слева сверху кнопку **Manage realm**
6. Создаем реалм **bazar-realm** и выбираем его как активный (слева сверху будет - bazar-realm Current realm)
7. Заходим во вкладку **Clients**, жмем **import client** и вставляем bazar-api-gateway-client.json из папки devSandbox в проекте
8. Если все сделали правильно, то можно поднимать фронт и радоваться жизни



# ВАЖНО!!
1. Отрубить прокси и всю хуйню что может помешать сходить по host.docker.internal

# Возможные траблы
Если какая-то хуйня случиться с 500, 502 и тд ошибками, скорее всего дело либо в хосте host.internal.docker ебано задали,
либо дело в чем то особом и надо писать в общий чат и спрашивать че делать йоу