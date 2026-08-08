# Whitepace — фінальний веб-проєкт

Адаптивний односторінковий лендинг.

## Опис роботи

Проєкт відтворює наданий макет (header, hero, блоки "Project Management" /
"Work together") і доповнює його до повноцінної сторінки:

- **Header** зі стікі-позиціонуванням і бургер-меню на мобільних.
- **Hero** з декоративним градієнтним фоном (без залежності від відсутніх
  растрових ассетів макета).
- **Features** — два почергові блоки "текст + зображення" (другий — у
  зворотному порядку через модифікатор `.feature--reverse`).
- **Footer** — колонки посилань, соцмережі, копірайт.

## Особливості реалізації

### SCSS

- `scss/abstracts/_variables.scss` — кольори, шрифт, брейкпоінти, розміри.
- `scss/abstracts/_mixins.scss` — `media()` для медіазапитів.
- `scss/base/` — reset і базова типографіка (`.text-h1`, `.text-h2`).
- `scss/components/` — перевикористовувані елементи (кнопки).
- `scss/layout/` — header і footer.
- `scss/sections/` — hero, features, tabs, cta.
- `scss/style.scss` — точка входу, яка через `@use` збирає всі партіали.

Готовий скомпільований CSS лежить у `css/style.css`, тож сторінку можна
відкривати одразу, без збірки. Якщо редагуєте файли в `scss/`, перезберіть
CSS командою нижче.

## Структура проєкту

```
├── index.html
├── css/style.css        # скомпільований CSS (готовий до використання)
├── img/logo.svg
├── scss/
│   ├── style.scss        # точка входу
│   ├── abstracts/         # змінні, міксини
│   ├── base/               # reset, типографіка
│   ├── components/         # кнопки
│   ├── layout/              # header, footer
│   └── sections/            # hero, features, tabs, cta
├── package.json
└── README.md
```

## Запуск проєкту

Найпростіше — відкрити `index.html` у браузері (CSS вже скомпільований).

Для редагування стилів через SCSS:

```bash
npm install
npm run watch:css   # перекомпілює css/style.css при кожній зміні в scss/
```
