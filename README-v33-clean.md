# v33 Frontend Clean-up

این نسخه فقط خطاهای TypeScript و ESLint فرانت‌اند نسخه v33 را اصلاح می‌کند و منطق قابلیت‌های موجود پروژه را تغییر نمی‌دهد.

## اصلاحات اصلی

- حذف importهای بلااستفاده (`Swords`, `Shield`).
- هماهنگ‌سازی type بازیکن Arena با فیلد `online`.
- رفع nullability مربوط به `answerResult`.
- حذف `any`های صریح از صفحات Login/Register/Arena.
- مشخص‌کردن نوع event در Register.
- رفع تداخل نام type و component در `ArenaProfile`.
- یکدست‌سازی سرویس‌های frontend با Axios client موجود در `src/api/axios.ts`.
- رفع هشدار Fast Refresh مربوط به `useAuth`.
- اصلاح state tracking در `PlayerStatus` با `useRef`.
- اصلاح dependencyهای Effectهای Arena.
- حفظ رفتار فعلی Auth، Admin، Exam و Arena.

## تست محلی

داخل `frontend` اجرا کنید:

```powershell
npm install
npm run build
npm run lint
```

انتظار می‌رود هر دو `build` و `lint` بدون error اجرا شوند.
