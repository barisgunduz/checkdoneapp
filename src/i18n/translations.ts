export type LanguageCode = "tr" | "en"

type TranslationMap = Record<string, string>

type Translations = Record<LanguageCode, TranslationMap>

export const DEFAULT_LANGUAGE: LanguageCode = "en"

export const translations: Translations = {
    tr: {
        // Languages
        "languages.tr": "Türkçe",
        "languages.en": "İngilizce",

        // Common
        "common.ok": "Tamam",
        "common.cancel": "Vazgeç",
        "common.confirm": "Onayla",
        "common.add": "Ekle",
        "common.goBack": "Geri dön",
        "common.apply": "Kullan",
        "common.premiumUpgrade": "Premium Ol",
        "common.status": "Durum",
        "common.version": "Versiyon",

        // Categories
        "categories.work": "İş",
        "categories.personal": "Kişisel",
        "categories.health": "Sağlık",
        "categories.shopping": "Alışveriş",

        // Drawer / navigation
        "drawer.home": "Ana Liste",
        "drawer.calendar": "Takvim",
        "drawer.habits": "Günlük",
        "drawer.settings": "Ayarlar",
        "drawer.premium": "Premium",

        // Settings
        "settings.title": "Ayarlar",
        "settings.premium.title": "Premium",
        "settings.premium.active": "Aktif",
        "settings.premium.free": "Free",
        "settings.premium.upgrade": "Premium’a geç",
        "settings.premium.reset": "Premium sıfırla (DEV)",
        "settings.notifications.title": "Bildirimler",
        "settings.notifications.on": "Açık",
        "settings.notifications.off": "Kapalı",
        "settings.notifications.unknown": "Bilinmiyor",
        "settings.notifications.open": "Ayarlar’a git",
        "settings.notifications.enable": "Bildirimleri aç",
        "settings.notifications.manage": "Sistemde yönet",
        "settings.app.title": "Uygulama",
        "settings.app.language": "Dil: {language}",
        "settings.app.selectLanguage": "Dili Seç",

        // Home
        "home.title": "Bugünün Görevleri",
        "home.counterPremium": "{count} görev",
        "home.counterFree": "{count}/20 görev",
        "home.empty": "Başlamak için bir görev ekle 🚀",
        "home.limit.title": "Limit doldu",
        "home.limit.over": "20’den fazla görevin var. Yeni görev eklemek için bazılarını sil veya Premium’a geç.",
        "home.limit.max": "Free plan ile maksimum 20 görev ekleyebilirsin. Sınırsız görev için Premium’a geç.",

        // Add Task modal
        "addTask.placeholder": "Yeni görev",
        "addTask.save": "Ekle",

        // Calendar
        "calendar.premiumRequired.title": "Premium Gerekli",
        "calendar.premiumRequired.message": "Farklı aylara bakmak için Premium’a geç.",
        "calendar.tasksTitle": "Görevler",
        "calendar.empty": "Bu gün için görev yok",
        "calendar.error.title": "Hata",
        "calendar.error.past": "Geçmiş tarihe görev ekleyemezsin.",

        // Habit tracker
        "habits.title": "Bugünün Alışkanlıkları",
        "habits.counter": "{completed} / {total} tamamlandı · {percent}%",
        "habits.empty": "Alışkanlık ekleyerek başla 🚀",
        "habits.limit.title": "Limit doldu",
        "habits.limit.max": "Free planda en fazla 10 alışkanlık ekleyebilirsin. Daha fazlası için Premium’a geç.",
        "habits.limit.cap": "20 alışkanlık sınırına ulaştın. Yeni bir tane eklemek için birini sil.",
        "habits.modal.title": "Yeni Alışkanlık",
        "habits.modal.placeholder": "Örn. Meditasyon",
        "habits.streak": "Seri {current} / En iyi {best}",
        "habits.reminder.title": "Alışkanlıklarını tamamla",
        "habits.reminder.body": "Bugün hâlâ tamamlanmamış alışkanlıkların var. Serini sürdür!",

        // Premium screen
        "premium.title": "Daha Fazlasını Yap",
        "premium.subtitle": "Sınırsız görev ekle, hatırlatıcıları kullan ve tamamen reklamsız odaklan.",
        "premium.cardTitle": "Premium ile:",
        "premium.feature.tasks": "✓ Sınırsız görev",
        "premium.feature.noAds": "✓ Reklamsız kullanım",
        "premium.feature.reminders": "✓ Hatırlatıcılar",
        "premium.feature.categories": "✓ Kategoriler",
        "premium.feature.archive": "✓ Geçmiş görev arşivi",
        "premium.price.period": "/ ay",
        "premium.button.upgrade": "Premium’a Geç",
        "premium.promo.title": "Promo Kod",
        "premium.promo.placeholder": "Kodu gir",
        "premium.promo.button": "Kullan",
        "premium.promo.note": "İstediğin zaman iptal edebilirsin.",
        "premium.price.fxNote": "Fiyatlandırma 1 USD = ₺44 kuruna göre hesaplandı.",
        "premium.active.title": "Premium Aktif 🎉",
        "premium.info.title": "Üyelik Bilgisi",
        "premium.info.start": "Başlangıç: {date}",
        "premium.info.renew": "Yenileme: {date}",
        "premium.info.remaining": "Kalan gün: {days}",
        "premium.perks.title": "Premium Avantajları",
        "premium.dev.reset": "Premium’u Sıfırla (DEV)",
        "premium.back": "Geri dön",
        "premium.promo.success.title": "Tebrikler 🎉",
        "premium.promo.success.message": "1 ay ücretsiz Premium kazandın!",
        "premium.promo.error.title": "Geçersiz kod",
        "premium.promo.error.message": "Bu promo kodu geçerli değil.",

        // Notifications
        "notifications.taskReminder.title": "Görev zamanı",
        "notifications.permission.deniedTitle": "Bildirim izni gerekli",
        "notifications.permission.deniedMessage": "Hatırlatıcı gönderebilmemiz için bildirim izni vermen gerekiyor. Lütfen izin ver veya sistem ayarlarından aç.",
    },
    en: {
        // Languages
        "languages.tr": "Turkish",
        "languages.en": "English",

        // Common
        "common.ok": "OK",
        "common.cancel": "Cancel",
        "common.confirm": "Confirm",
        "common.add": "Add",
        "common.goBack": "Go back",
        "common.apply": "Apply",
        "common.premiumUpgrade": "Go Premium",
        "common.status": "Status",
        "common.version": "Version",

        // Categories
        "categories.work": "Work",
        "categories.personal": "Personal",
        "categories.health": "Health",
        "categories.shopping": "Shopping",

        // Drawer / navigation
        "drawer.home": "Home",
        "drawer.calendar": "Calendar",
        "drawer.habits": "Habits",
        "drawer.settings": "Settings",
        "drawer.premium": "Premium",

        // Settings
        "settings.title": "Settings",
        "settings.premium.title": "Premium",
        "settings.premium.active": "Active",
        "settings.premium.free": "Free",
        "settings.premium.upgrade": "Upgrade to Premium",
        "settings.premium.reset": "Reset Premium (DEV)",
        "settings.notifications.title": "Notifications",
        "settings.notifications.on": "On",
        "settings.notifications.off": "Off",
        "settings.notifications.unknown": "Unknown",
        "settings.notifications.open": "Open system settings",
        "settings.notifications.enable": "Enable notifications",
        "settings.notifications.manage": "Manage in system",
        "settings.app.title": "App",
        "settings.app.language": "Language: {language}",
        "settings.app.selectLanguage": "Select Language",

        // Home
        "home.title": "Today's Tasks",
        "home.counterPremium": "{count} tasks",
        "home.counterFree": "{count}/20 tasks",
        "home.empty": "Add a task to get started 🚀",
        "home.limit.title": "Limit reached",
        "home.limit.over": "You have more than 20 tasks. Delete some or go Premium to add new ones.",
        "home.limit.max": "Free plan allows up to 20 tasks. Get Premium for unlimited tasks.",

        // Add Task modal
        "addTask.placeholder": "New task",
        "addTask.save": "Add",

        // Calendar
        "calendar.premiumRequired.title": "Premium Required",
        "calendar.premiumRequired.message": "Go Premium to view other months.",
        "calendar.tasksTitle": "Tasks",
        "calendar.empty": "No tasks for this day",
        "calendar.error.title": "Error",
        "calendar.error.past": "You can't add tasks to a past date.",

        // Habit tracker
        "habits.title": "Today's Habits",
        "habits.counter": "{completed} / {total} done · {percent}%",
        "habits.empty": "Add a habit to get started 🚀",
        "habits.limit.title": "Limit reached",
        "habits.limit.max": "Free plan lets you add up to 10 habits. Upgrade to Premium for more.",
        "habits.limit.cap": "You've hit the 20 habit limit. Delete one to add another.",
        "habits.modal.title": "New Habit",
        "habits.modal.placeholder": "e.g. Meditation",
        "habits.streak": "Streak {current} / Best {best}",
        "habits.reminder.title": "Complete your habits",
        "habits.reminder.body": "You still have habits to finish today. Keep your streak alive!",

        // Premium screen
        "premium.title": "Do More",
        "premium.subtitle": "Add unlimited tasks, use reminders, and stay completely ad-free.",
        "premium.cardTitle": "With Premium:",
        "premium.feature.tasks": "✓ Unlimited tasks",
        "premium.feature.noAds": "✓ Ad-free experience",
        "premium.feature.reminders": "✓ Reminders",
        "premium.feature.categories": "✓ Categories",
        "premium.feature.archive": "✓ Past task archive",
        "premium.price.period": "/ month",
        "premium.button.upgrade": "Go Premium",
        "premium.promo.title": "Promo Code",
        "premium.promo.placeholder": "Enter code",
        "premium.promo.button": "Apply",
        "premium.promo.note": "Cancel anytime.",
        "premium.price.fxNote": "Pricing uses 1 USD = ₺44 for reference.",
        "premium.active.title": "Premium Active 🎉",
        "premium.info.title": "Membership Info",
        "premium.info.start": "Start: {date}",
        "premium.info.renew": "Renewal: {date}",
        "premium.info.remaining": "Days left: {days}",
        "premium.perks.title": "Premium Perks",
        "premium.dev.reset": "Reset Premium (DEV)",
        "premium.back": "Go back",
        "premium.promo.success.title": "Congrats 🎉",
        "premium.promo.success.message": "You unlocked 1 month of Premium for free!",
        "premium.promo.error.title": "Invalid code",
        "premium.promo.error.message": "This promo code isn't valid.",

        // Notifications
        "notifications.taskReminder.title": "Task time",
        "notifications.permission.deniedTitle": "Notification permission needed",
        "notifications.permission.deniedMessage": "We need notification permission to send reminders. Please allow it when prompted or enable it in system settings.",
    },
}
