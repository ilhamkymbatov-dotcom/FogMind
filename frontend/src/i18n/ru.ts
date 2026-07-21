import type { Dictionary } from './en'

export const ru: Dictionary = {
  'common.loading': 'Загрузка',
  'common.somethingWrong': 'Возникла ошибка. Попробуйте еще раз.',
  'common.close': 'Закрыть',

  'lang.label': 'Язык',

  'auth.email': 'Электронная почта',
  'auth.password': 'Пароль',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.err.enterEmailPassword': 'Введите почту и пароль.',
  'auth.err.passwordTooShort': 'Используйте пароль не короче 6 символов.',
  'auth.err.invalidCredentials': 'Неверная почта или пароль.',
  'auth.err.emailNotConfirmed': 'Сначала подтвердите почту. Откройте ссылку из письма.',
  'auth.err.alreadyRegistered': 'Аккаунт с такой почтой уже существует. Попробуйте войти.',
  'auth.err.invalidEmail': 'Введите корректный адрес почты.',
  'auth.err.rateLimited': 'Слишком много попыток. Подождите немного и попробуйте снова.',
  'auth.err.sessionExpired': 'Сессия истекла. Войдите снова.',

  'login.title': 'Вход',
  'login.subtitle': 'С возвращением в FogMind.',
  'login.passwordPlaceholder': 'Ваш пароль',
  'login.submit': 'Войти',
  'login.submitting': 'Вход',
  'login.footerPrompt': 'Впервые здесь?',
  'login.footerLink': 'Создать аккаунт',

  'signup.title': 'Создайте аккаунт',
  'signup.subtitle': 'Начните превращать материалы в карты, по которым удобно учиться.',
  'signup.passwordPlaceholder': 'Не менее 6 символов',
  'signup.displayName': 'Отображаемое имя (необязательно)',
  'signup.displayNamePlaceholder': 'Как к вам обращаться',
  'signup.submit': 'Создать аккаунт',
  'signup.submitting': 'Создание аккаунта',
  'signup.footerPrompt': 'Уже есть аккаунт?',
  'signup.footerLink': 'Войти',
  'signup.confirmTitle': 'Подтвердите почту',
  'signup.confirmBody': 'Мы отправили ссылку для подтверждения на {email}. Откройте ее, чтобы завершить настройку аккаунта, затем войдите.',
  'signup.confirmFooterPrompt': 'Уже подтвердили?',
  'signup.confirmFooterLink': 'Войти',

  'shell.signOut': 'Выйти',
  'shell.signingOut': 'Выход',
  'shell.home': 'Главная FogMind',

  'dash.signedInAs': 'Вы вошли как {email}',
  'dash.title': 'Ваши карты знаний',
  'dash.upload': 'Загрузить',
  'dash.loading': 'Загрузка документов',
  'dash.errLoad': 'Не удалось загрузить документы.',
  'dash.emptyTitle': 'Пока нет карт',
  'dash.emptyBody': 'Загрузите файл PDF, DOCX, Markdown или текст, либо вставьте свои заметки, чтобы построить первую карту знаний.',
  'dash.rowMeta': '{source} · узлов: {count} · {date}',

  'status.pending': 'В очереди',
  'status.processing': 'Обработка',
  'status.ready': 'Готово',
  'status.failed': 'Ошибка',
  'source.text': 'Текст',

  'upload.title': 'Добавить материал',
  'upload.tabFile': 'Загрузить файл',
  'upload.tabPaste': 'Вставить текст',
  'upload.dropzone': 'Выберите файл PDF, DOCX, MD или TXT',
  'upload.pastePlaceholder': 'Вставьте сюда заметки или текст статьи',
  'upload.titleLabel': 'Название',
  'upload.titlePlaceholder': 'Дайте название',
  'upload.submit': 'Построить карту',
  'upload.working': 'Обработка',
  'upload.statusReading': 'Читаем ваш материал',
  'upload.statusBuilding': 'Строим карту знаний',
  'upload.errTitle': 'Укажите название.',
  'upload.errChooseFile': 'Выберите файл для загрузки.',
  'upload.errPasteText': 'Вставьте текст для карты.',
  'upload.errEmpty': 'Материал выглядит пустым. Попробуйте другой файл или текст.',

  'detail.allMaps': 'Все карты',
  'detail.mapFallback': 'Карта',
  'detail.loading': 'Загрузка карты',
  'detail.noMap': 'У этого документа пока нет карты.',
  'detail.summary': 'Освоено {mastered} из {total} · {percent}%',
  'detail.review': 'Повторить вопросы ({count})',
  'detail.doneNodeTitle': 'Раздел пройден',
  'detail.doneNodeBody': 'Туман здесь рассеялся, связанные узлы готовы. Ответьте на все вопросы верно, чтобы освоить узел.',
  'detail.reviewTitle': 'Раунд повторения',
  'detail.doneReviewTitle': 'Повторение завершено',
  'detail.doneReviewBody': 'Каждый верный ответ здесь осваивает узел и рассеивает больше тумана.',

  'panel.questionOf': 'Вопрос {n} из {total}',
  'panel.difficulty.1': 'Легко',
  'panel.difficulty.2': 'Средне',
  'panel.difficulty.3': 'Сложно',
  'panel.correct': 'Верно',
  'panel.correctShown': 'Правильный ответ показан выше',
  'panel.finish': 'Завершить',
  'panel.next': 'Следующий вопрос',
  'panel.backToMap': 'Вернуться к карте',
  'panel.noQuestions': 'Нет вопросов для показа.',
  'panel.errSave': 'Не удалось сохранить ответ.',

  'graph.mapLabel': 'Карта знаний',
  'graph.open': 'Открыть {title}',
  'graph.answered': 'Отвечено {answered} из {total}',
  'graph.zoomIn': 'Приблизить',
  'graph.zoomOut': 'Отдалить',
  'graph.panHint': 'Тяните, чтобы двигать, колесо или щипок для масштаба',

  'err.unsupportedFile': 'Неподдерживаемый тип файла. Загрузите PDF, DOCX, MD или TXT.',
  'err.readFile': 'Не удалось прочитать файл. Возможно, он поврежден или защищен.',
  'err.noContent': 'В этом документе не нашлось читаемого содержимого для карты.',
  'err.docNotFound': 'Документ не найден.',
  'err.loadMap': 'Не удалось загрузить карту.',

  // Landing: navigation and shared chrome -------------------------------------
  'nav.home': 'Главная',
  'nav.howItWorks': 'Как это работает',
  'nav.product': 'Продукт',
  'nav.getStarted': 'Начать',
  'nav.menu': 'Меню',

  // Landing: home page --------------------------------------------------------
  'hero.title': 'Превратите любой материал в карту, по которой можно учиться',
  'hero.subtitle':
    'FogMind превращает ваши учебные материалы в интерактивный граф знаний. Отвечайте на вопросы, рассеивайте туман и наблюдайте, как растет ваше понимание.',
  'hero.primary': 'Начать',
  'hero.secondary': 'Посмотреть, как это работает',

  'home.hiw.heading': 'Процесс',
  'home.hiw.line':
    'Загрузите материал и смотрите, как он превращается в карту, которую вы открываете понятие за понятием.',
  'home.hiw.link': 'Посмотреть, как это работает',

  'home.product.heading': 'Продукт',
  'home.product.line':
    'Живой граф знаний, вопросы по вашим страницам и освоение, которое видно прямо на карте.',
  'home.product.link': 'Открыть продукт',

  'cta.title': 'Готовы рассеять туман',
  'cta.button': 'Начать',

  'footer.tagline': 'Обучение, которое видно.',
  'footer.home': 'Главная',
  'footer.howItWorks': 'Как это работает',
  'footer.product': 'Продукт',

  // Landing: how it works page ------------------------------------------------
  'hiw.hero.title': 'Как работает FogMind',
  'hiw.hero.subtitle': 'От файла до живой карты ваших знаний за считанные минуты.',
  'hiw.upload.title': 'Загрузите материал',
  'hiw.upload.body':
    'Начните с того, что уже есть. Конспект лекции, глава учебника, объемная статья, что угодно из того, что вы изучаете, отправляется прямо внутрь.',
  'hiw.reads.title': 'Материал читается и структурируется',
  'hiw.reads.body':
    'FogMind находит в материале темы и связи между ними, а затем превращает эту структуру в то, что можно увидеть.',
  'hiw.map.title': 'Появляется карта знаний',
  'hiw.map.body':
    'Каждое понятие становится узлом, каждая связь соединением. Вы видите весь предмет целиком, а не стену страниц.',
  'hiw.fog.title': 'Рассейте туман',
  'hiw.fog.body':
    'Новые узлы скрыты в тумане. Отвечайте на вопросы по вашему материалу, чтобы открыть понятие, и продолжайте отвечать, чтобы освоить его.',
  'hiw.fog.stage1': 'В тумане',
  'hiw.fog.stage2': 'Отвечайте на вопросы',
  'hiw.fog.stage3': 'Освоено',
  'hiw.adaptive.title': 'Прогресс сохраняется',
  'hiw.adaptive.body':
    'Каждый ответ запоминается. Уйдите и вернитесь, и карта будет ждать ровно там, где вы остановились, вместе с туманом.',

  // Landing: product page -----------------------------------------------------
  'product.hero.title': 'Все, что нужно, чтобы действительно учиться',
  'product.hero.subtitle':
    'Не очередное приложение с карточками. Карта того, что вы знаете и что еще скрыто в тумане.',
  'product.graph.title': 'Интерактивный граф знаний',
  'product.graph.body':
    'Материал становится пространственной картой связанных понятий, которую можно исследовать, менять и расширять.',
  'product.questions.title': 'Вопросы из вашего материала',
  'product.questions.body':
    'К каждому узлу есть вопросы по вашему материалу в разных форматах, от свободного ответа до выбора варианта.',
  'product.fog.title': 'Механика тумана',
  'product.fog.body':
    'Повторение перестает быть рутиной. Открывая карту шаг за шагом, вы превращаете учебу в игру, к которой хочется возвращаться.',
  'product.adaptive.title': 'Адаптивная сложность',
  'product.adaptive.body':
    'Система следит за вашими ответами и настраивает уровень так, чтобы было сложно, но не безнадежно.',
  'product.progress.title': 'Наглядный прогресс',
  'product.progress.body':
    'Освоение не число в таблице. Вы видите, как оно расходится по карте, пока туман рассеивается узел за узлом.',
  'product.formats.title': 'Любой материал на входе',
  'product.formats.body':
    'Загружайте файлы как есть. FogMind принимает PDF, DOCX, Markdown и обычный текст без лишних преобразований.',
  'product.formats.plain': 'Обычный текст',

  // Landing: eyebrow labels and the warmer supporting copy ---------------------
  'hero.eyebrow': 'Ваш материал на карте',
  'hero.demoCaption': 'Ответьте на вопрос, и туман вокруг изученного рассеется',

  'home.cards.eyebrow': 'Почему это работает',
  'home.cards.title': 'Учеба, в которой виден прогресс',
  'home.card1.title': 'Виден весь предмет',
  'home.card1.body':
    'Все темы и связи между ними на одной карте, которую можно охватить одним взглядом.',
  'home.card2.title': 'Вопросы по вашим страницам',
  'home.card2.body':
    'Ничего шаблонного. Каждый вопрос взят из вашего материала, поэтому повторение всегда по делу.',
  'home.card3.title': 'Прогресс, который видно',
  'home.card3.body':
    'Туман редеет там, где вы уверены, и всегда понятно, что учить дальше.',

  'home.answer.eyebrow': 'Отвечайте и открывайте',
  'home.answer.title': 'По одному вопросу, без спешки',
  'home.answer.body':
    'В каждом узле несколько вопросов по вашему материалу. Ответьте на них, и тема раскроется вместе со всем, что с ней связано. Ошиблись, и вопрос спокойно дождется вас в раунде повторения.',

  'home.progress.eyebrow': 'Смотрите, как расходится',
  'home.progress.title': 'Освоение, которое правда видно',
  'home.progress.body':
    'Каждый верный ответ осваивает узел и рассеивает еще немного тумана. Вернитесь завтра, и карта будет ровно там, где вы ее оставили.',

  'home.explore.eyebrow': 'Посмотреть ближе',
  'cta.body': 'Возьмите главу, лекцию или стопку конспектов. Первая карта займет пару минут.',

  'hiw.hero.eyebrow': 'Как это работает',
  'hiw.intake.eyebrow': 'Первый шаг',
  'hiw.intake.title': 'Начните с того, что уже есть',
  'hiw.intake.body':
    'Загрузите PDF, DOCX, Markdown или вставьте конспект. FogMind прочитает материал, найдет темы внутри и разложит их в карту, которую можно расчищать сразу.',
  'hiw.saved.eyebrow': 'Система помнит вас',

  'product.hero.eyebrow': 'Продукт',
  'product.graph.eyebrow': 'Карта',
  'product.questions.eyebrow': 'Вопросы',
  'product.progress.eyebrow': 'Прогресс',
  'product.more.eyebrow': 'И остальное',
  'product.more.title': 'Детали, которые помогают не бросить',

  // Landing: the looping product demos ----------------------------------------
  'demo.q.prompt': 'Фотосинтез происходит в _____ клетки листа.',
  'demo.q.a1': 'Рибосома',
  'demo.q.a2': 'Хлоропласт',
  'demo.q.a3': 'Ядро',
  'demo.q.answer': 'хлоропласте',
  'demo.upload.file': 'Конспект лекции.pdf',
}
