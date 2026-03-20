import { useAppStore } from '../store/useStore'

const tamilDict = {
  // Sidebar
  'Dashboard': 'முகப்பு',
  'Analytics': 'பகுப்பாய்வு',
  'Quit Plan': 'நிறுத்தும் திட்டம்',
  'Nearby Help': 'அருகிலுள்ள உதவி',
  'Settings': 'அமைப்புகள்',
  // Dashboard
  'Welcome': 'வரவேற்கிறோம்',
  'Your AI-powered health dashboard': 'உங்கள் AI-ஆதரவு சுகாதார தளம்',
  'Overall': 'மொத்தம்',
  "I'm Feeling an Urge to Smoke": 'எனக்கு புகைபிடிக்க தோன்றுகிறது',
  'Tap for instant support': 'உடனடி ஆதரவுக்கு அழுத்தவும்',
  'Health Impact': 'சுகாதார தாக்கம்',
  'Lungs': 'நுரையீரல்',
  'Heart': 'இதயம்',
  'Brain': 'மூளை',
  'Liver': 'கல்லீரல்',
  "Today's Log": 'இன்றைய பதிவு',
  'DATE': 'தேதி',
  'CIGARETTES SMOKED TODAY': 'இன்று புகைத்த சிகரெட்டுகள்',
  'Save Log': 'பதிவைச் சேமி',
  'Let your organ speak': 'உங்கள் உறுப்பு பேசட்டும்',
  'Stop Speaking': 'பேசுவதை நிறுத்து',
  // Urge Modal
  'Urge Support': 'ஆதரவு',
  "You've got this. Let's get through this together.": 'நீங்கள் தனிமையில் இல்லை. நாம் இதை ஒன்றாக கடந்து வருவோம்.',
  'Delay Timer': 'தாமத டைமர்',
  'Breathe In': 'மூச்சை உள்ளிழுக்கவும்',
  'Hold': 'பிடித்து வைக்கவும்',
  'Breathe Out': 'மூச்சை வெளியே விடவும்',
  'Get AI Support 🌿': 'AI ஆதரவைப் பெறுங்கள் 🌿',
  'Inspiring Story': 'ஊக்கமளிக்கும் கதை',
  'Motivation': 'உந்துதல்',
  'Try This Now': 'இதை இப்போதே முயற்சிக்கவும்',
  'I Got Through It! 💪': 'நான் இதை கடந்து வந்தேன்! 💪',
  'Loading...': 'ஏற்றுகிறது...',
  // Settings
  'Profile Information': 'சுயவிவர தகவல்',
  'Update your personal details and smoking history.': 'உங்கள் தனிப்பட்ட விவரங்களை புதுப்பிக்கவும்.',
  'Full Name': 'முழு பெயர்',
  'Age': 'வயது',
  'Gender': 'பாலினம்',
  'Male': 'ஆண்',
  'Female': 'பெண்',
  'Other': 'மற்றொன்று',
  'Smoking History': 'புகைபிடிக்கும் வரலாறு',
  'Years of Smoking': 'புகைபிடிக்கும் ஆண்டுகள்',
  'Cost per Cigarette (₹)': 'ஒரு சிகரெட்டின் விலை (₹)',
  'Cigarettes Per Day (avg)': 'ஒரு நாளைக்கு சிகரெட்டுகள் (சராசரி)',
  'App Preferences': 'பயன்பாட்டு விருப்பங்கள்',
  'Language': 'மொழி',
  'Tamil': 'தமிழ்',
  'English': 'English',
  'Save Changes': 'மாற்றங்களைச் சேமி',
  // Analytics Elements
  'Progress Overview': 'முன்னேற்றக் கண்ணோட்டம்',
  'Weekly Trend': 'வாராந்திர போக்கு',
  'Cigarettes': 'சிகரெட்டுகள்',
  'Days': 'நாட்கள்',
  // Auth & Others
  'Start My Journey 🌿': 'எனது பயணத்தை தொடங்குங்கள் 🌿',
  'Continue': 'தொடர்க',

  // Daily Log Panel + Moods
  "Cigarettes Smoked Today": 'இன்று புகைத்த சிகரெட்டுகள்',
  "Craving Level:": 'ஏக்கத்தின் அளவு:',
  "Low": 'குறைவு',
  "High": 'அதிகம்',
  "Mood": 'மனநிலை',
  "Notes (optional)": 'குறிப்புகள் (விருப்பமானவை)',
  "Save Today's Log": "இன்றைய பதிவை சேமி",
  "Great": "மிக நன்று",
  "Neutral": "சாதாரண",
  "Stressed": "அழுத்தம்",
  "Irritable": "எரிச்சல்",
  "Tired": "சோர்வு",

  // Analytics
  'Analytics Dashboard': 'பகுப்பாய்வு கட்டுப்பாட்டகம்',
  'Track your progress, finances, and health trends.': 'உங்கள் முன்னேற்றம், நிதி மற்றும் சுகாதார போக்குகளைக் கண்காணிக்கவும்.',
  'Streak': 'தொடர்ச்சி',
  'Consecutive logs': 'தொடர்ச்சியான பதிவுகள்',
  'Weekly Change': 'வாராந்திர மாற்றம்',
  'vs last week': 'கடந்த வாரம் ஒப்பிடுகையில்',
  'Avg / Day': 'சராசரி / நாள்',
  'Urges': 'ஏக்கங்கள்',
  'This week': 'இந்த வாரம்',
  'Smoking Trend (30 Days)': 'புகைப்பிடிக்கும் போக்கு (30 நாட்கள்)',
  'Money Spent on Smoking': 'புகைப்பிடிப்பதில் செலவழித்த பணம்',
  'Today': 'இன்று',
  'This Month': 'இந்த மாதம்',
  'This Year': 'இந்த ஆண்டு',
  'Daily Spending Trend': 'தினசரி செலவு போக்கு',
  'Instead, You Could Have Bought...': 'பதிலாக, நீங்கள் வாங்கியிருக்கலாம்...',
  'Books': 'புத்தகங்கள்',
  'Movie Tickets': 'திரைப்பட டிக்கெட்டுகள்',
  'Gym Months': 'மாத உடற்பயிற்சிக் கூடம்',
  'Restaurant Meals': 'உணவக உணவுகள்',
  'Urge Management Stats': 'ஏக்க மேலாண்மை புள்ளிவிவரங்கள்',
  'Total Urges': 'மொத்த ஏக்கங்கள்',
  'Breathing Used': 'சுவாசம் பயன்படுத்தப்பட்டது',
  'Timer Used': 'டைமர் பயன்படுத்தப்பட்டது',

  // Quit Plan
  "Your Quit Plan": "உங்கள் விட்டுவிடுதல் திட்டம்",
  "A personalized 8-week gradual reduction strategy.": "தனிப்பயனாக்கப்பட்ட 8-வார குறைப்பு உத்தி.",
  "Starting Point": "தொடக்க புள்ளி",
  "Currently:": "தற்போது:",
  "Goal:": "இலக்கு:",
  "Target:": "இலக்கு:",
  "Accomplished": "முடக்கப்பட்டது",
  "Missed": "தவறவிட்டது",
  "Weekly Focus Tip:": "வாராந்திர குறிப்பு:",
  "Undo status": "நிலையை ரத்துசெய்",
  "Missed Target": "இலக்கை தவறவிட்டது",
  "Health Recovery Milestones": "சுகாதார மீட்பு மைல்கற்கள்",
  "Day": "நாள்",
  "Habit Replacement Techniques": "பழக்கத்தை மாற்றும் நுட்பங்கள்",

  // Location Page
  "Nearby Support": "அருகிலுள்ள ஆதரவு",
  "Find hospitals, doctors, and rehabilitation centers in your district.": "உங்கள் மாவட்டத்தில் மருத்துவமனைகளைக் கண்டறியவும்.",
  "All Districts": "அனைத்து மாவட்டங்களும்",
  "All Types": "அனைத்து வகைகளும்",
  "Hospital": "மருத்துவமனை",
  "Doctor": "மருத்துவர்",
  "Rehab Center": "மறுவாழ்வு மையம்"
}

export function useTranslation(overrideLang) {
  const storeLanguage = useAppStore(state => state.language)
  const language = overrideLang || storeLanguage
  
  const t = (text) => {
    if (language === 'Tamil' && tamilDict[text]) {
      return tamilDict[text]
    }
    return text
  }

  return { t }
}
