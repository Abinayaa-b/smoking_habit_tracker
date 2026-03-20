"""
Gemini AI Service — Secure backend-only integration for AI-powered messages.
API key loaded from environment variables ONLY, never exposed to frontend.
"""
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Research-backed organ facts for detailed responses
ORGAN_FACTS = {
    "lungs": {
        "name": "Lungs",
        "facts": [
            "Smoking damages the tiny air sacs (alveoli) in your lungs. There are about 480 million alveoli — once destroyed, they don't regenerate.",
            "Tar from cigarettes coats the inside of your lungs, turning them from pink to black over time. One pack deposits about 1 cup of tar per year.",
            "Cigarette smoke contains over 7,000 chemicals, at least 70 of which are known carcinogens that directly damage lung tissue.",
            "Smoking paralyzes the cilia (tiny hairs) that clean your airways. This is why smokers cough — your lungs lose their natural cleaning ability.",
            "COPD (Chronic Obstructive Pulmonary Disease) is caused by smoking in 85-90% of cases. It's the 3rd leading cause of death worldwide (WHO, 2023).",
            "After quitting: In 2 weeks lung function improves by 30%. After 1 year, risk of lung cancer drops by 50%. After 10 years, risk equals a non-smoker's.",
            "Secondhand smoke from your cigarettes also damages the lungs of people around you, especially children.",
        ],
        "recovery": "Within 72 hours of quitting, your bronchial tubes begin to relax and breathing becomes easier. Your lung capacity starts improving within 2 weeks."
    },
    "heart": {
        "name": "Heart",
        "facts": [
            "Smoking increases heart rate by 10-20 beats per minute and raises blood pressure by 5-10 mmHg. Your heart works harder with every cigarette.",
            "Carbon monoxide from cigarettes replaces 15% of oxygen in your blood, forcing your heart to pump harder to deliver oxygen to organs.",
            "Smoking doubles the risk of heart attack and triples the risk of stroke (American Heart Association, 2023).",
            "Nicotine causes blood vessels to narrow by 25-30%, reducing blood flow. This is why smokers often have cold hands and feet.",
            "Smokers are 2-4 times more likely to develop coronary heart disease than non-smokers. It's the #1 killer of smokers worldwide.",
            "Smoking damages the endothelium (inner lining of blood vessels), causing plaque buildup — atherosclerosis — which can lead to heart attacks.",
            "After quitting: Within 20 minutes, heart rate drops. After 1 year, heart disease risk is cut in half. After 15 years, it equals a non-smoker's.",
        ],
        "recovery": "Just 20 minutes after your last cigarette, your heart rate and blood pressure begin to normalize. Within 24 hours, your heart attack risk starts decreasing."
    },
    "brain": {
        "name": "Brain",
        "facts": [
            "Nicotine reaches your brain within 10 seconds of inhaling, faster than an IV injection. It hijacks the dopamine reward system, creating powerful addiction.",
            "Smoking reduces blood flow to the brain by 12-17%, depriving it of oxygen and nutrients. This accelerates cognitive decline.",
            "Smokers have a 50% higher risk of developing dementia and Alzheimer's disease compared to non-smokers (Lancet, 2020).",
            "Nicotine withdrawal causes difficulty concentrating, irritability, and anxiety — but these symptoms peak at 72 hours and significantly reduce within 2-4 weeks.",
            "Smoking during adolescence permanently alters brain development, affecting memory, attention, and learning abilities.",
            "Carbon monoxide from cigarettes reduces oxygen delivery to the brain, causing headaches, dizziness, and impaired judgment.",
            "After quitting: Brain blood flow normalizes within 2 weeks. Nicotine receptors return to normal levels within 1-3 months.",
        ],
        "recovery": "Within 48 hours of quitting, nerve endings begin to regrow, and your sense of smell and taste start improving. Cognitive function measurably improves within 2 weeks."
    },
    "liver": {
        "name": "Liver",
        "facts": [
            "The liver metabolizes 90% of the toxins from cigarette smoke. Each cigarette adds to the liver's toxic burden with formaldehyde, arsenic, and benzene.",
            "Smoking increases the risk of liver cancer by 50-80%, even without alcohol consumption (World Journal of Hepatology, 2022).",
            "Cigarette chemicals accelerate liver fibrosis (scarring), which can progress to cirrhosis — normally associated only with heavy drinking.",
            "Smoking reduces the liver's ability to process medications effectively, meaning smokers often need higher drug doses.",
            "Nicotine activates hepatic stellate cells, which produce excess collagen and scar tissue in the liver.",
            "Smokers with Hepatitis B or C have 2-3x faster disease progression compared to non-smoking patients.",
            "After quitting: Liver inflammation begins to decrease within weeks. After 5 years, liver cancer risk drops significantly.",
        ],
        "recovery": "The liver is one of the most resilient organs. After quitting, liver enzymes begin normalizing within 2-4 weeks, and inflammation markers decrease steadily."
    }
}


def _get_organ_prompt(organ, damage_pct, severity, language, missed_days=0):
    """Build a rich, detailed prompt for organ voice generation."""
    facts = ORGAN_FACTS.get(organ, ORGAN_FACTS["lungs"])
    fact_text = "\n".join(f"- {f}" for f in facts["facts"])
    recovery = facts["recovery"]

    lang_instruction = ""
    if language and language != "English":
        lang_instruction = f"\n\nCRITICAL INSTRUCTION: You MUST translate ALL medical facts from English into {language}. Your ENTIRE response MUST be in {language} using {_get_script(language)}. Do NOT output any English words or bullets. Everything including the facts must be translated."

    return f"""You are the {facts['name']} organ of a real person who smokes. You are speaking directly to them in first person.

MEDICAL CONTEXT:
- Current damage level: {damage_pct:.1f}% ({severity} severity)
- Missed logging days: {missed_days}
- The person smokes regularly and this is your realistic health assessment.

RESEARCH-BACKED FACTS about how smoking affects me ({facts['name']}):
{fact_text}

RECOVERY INFORMATION:
{recovery}

YOUR TASK:
Write a detailed, emotionally compelling message (200-300 words) as if you ARE the {facts['name']} speaking to the person. Include:
1. How you currently feel at {damage_pct:.1f}% damage (use specific medical details)
2. Share 2-3 specific medical facts from the research data above (TRANSLATED IF APPLICABLE)
3. What will happen if they continue vs. if they quit (with specific timelines)
4. End with a heartfelt, motivating plea to quit — be emotional but NOT fear-based
5. Include specific numbers and statistics to make it credible

TONE: Caring, supportive, scientifically informed. Like a concerned friend who happens to have medical knowledge.
Do NOT use generic platitudes. Be specific with medical facts.{lang_instruction}"""


def _get_script(language):
    scripts = {
        "Tamil": "தமிழ் எழுத்துக்கள்",
        "Telugu": "తెలుగు లిపి",
        "Kannada": "ಕನ್ನಡ ಲಿಪಿ",
        "Malayalam": "മലയാളം ലിപി",
        "Hindi": "हिंदी देवनागरी"
    }
    return scripts.get(language, language)


async def generate_organ_voice(organ, damage_pct, severity, language="English", missed_days=0):
    """Generate detailed organ voice message using Gemini AI with research-backed medical facts."""
    if not GEMINI_API_KEY:
        # Fallback to detailed offline message if API key not configured
        return _get_offline_organ_message(organ, damage_pct, severity, language)

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = _get_organ_prompt(organ, damage_pct, severity, language, missed_days)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return _get_offline_organ_message(organ, damage_pct, severity, language)


def _get_offline_organ_message(organ, damage_pct, severity, language="English"):
    """Detailed fallback message with research facts when Gemini API is unavailable."""
    import random
    
    if language == "Tamil":
        tamil_facts = {
            "lungs": {
                "name": "நுரையீரல் (Lungs)",
                "facts": [
                    "புகைபிடிப்பது உங்கள் நுரையீரலில் உள்ள சிறிய காற்றுப் பைகளை முடக்குகிறது. இவை மீண்டும் வளர்வதில்லை.",
                    "சிகரெட் புகையில் உள்ள தார் நுரையீரலில் படிந்து அவற்றை கருப்பு நிறமாக மாற்றுகிறது.",
                    "சிகரெட் புகையில் 7,000 க்கும் மேற்பட்ட ரசாயனங்கள் உள்ளன, இவை புற்றுநோயை உருவாக்குபவை.",
                    "புகைபிடிப்பது உங்கள் சுவாசப்பாதையை சுத்தப்படுத்தும் செயலை முடக்குகிறது. இதனால் இருமல் ஏற்படுகிறது.",
                    "சிஓபிடி (COPD) ஆஸ்துமா போன்ற நோய்கள் ஏற்பட புகைபிடித்தல் 85% காரணம்.",
                    "நீங்கள் புகைபிடிப்பதை நிறுத்தினால் 2 வாரங்களில் உங்கள் நுரையீரல் திறன் 30% மேம்படும்.",
                    "பழக்கமில்லாதவர்கள் மீது படும் புகையும் அவர்களின் நுரையீரலை கடுமையாக பாதிக்கிறது."
                ],
                "recovery": "புகைபிடிப்பதை நிறுத்திய 72 மணி நேரத்திற்குள் சுவாசிப்பது எளிதாகிறது. 2 வாரங்களில் நுரையீரல் திறன் மேம்படும்."
            },
            "heart": {
                 "name": "இதயம் (Heart)",
                 "facts": [
                     "புகைபிடிப்பது இதயம் துடிக்கும் வேகத்தையும் இரத்த அழுத்தத்தையும் கடுமையாக அதிகரிக்கிறது.",
                     "புகையில் உள்ள கார்பன் மோனாக்சைடு இரத்தத்தில் உள்ள ஆக்ஸிஜனை வெகுவாகக் குறைக்கிறது.",
                     "மாரடைப்பு ஏற்படும் அபாயத்தை புகைபிடித்தல் இரட்டிப்பாக்குகிறது.",
                     "இரத்த நாளங்கள் சுருங்கி அடைப்பு ஏற்பட புகைபிடித்தல் முக்கிய காரணமாகும்.",
                     "குறைந்த வயதிலேயே இதய நோயால் பாதிக்கப்பட புகை மிக முக்கிய காரணம் ஆகும்.",
                     "புகைபிடிப்பவர்களின் இதயம் ஆக்ஸிஜனை அனுப்ப ஒவ்வொரு நிமிடமும் அதிகமாக உழைக்கிறது.",
                     "புகைபிடிப்பதை நிறுத்தினால் ஒரு வருடத்தில் மாரடைப்பு அபாயம் பாதியாகக் குறையும்."
                 ],
                 "recovery": "புகைபிடிப்பதை நிறுத்திய 20 நிமிடங்களில் நாடித் துடிப்பு இயல்பு நிலைக்குத் திரும்பும். மாரடைப்பு அபாயம் குறையும்."
            },
            "brain": {
                 "name": "மூளை (Brain)",
                 "facts": [
                     "நிகோடின் உள்ளிழுக்கப்பட்ட 10 வினாடிகளுக்குள் உங்கள் மூளையை அடைந்து அடிமைப்படுத்துகிறது.",
                     "புகைபிடிப்பது மூளைக்குச் செல்லும் இரத்த ஓட்டத்தை பெருமளவு குறைக்கிறது.",
                     "புகைபிடிப்பவர்களுக்கு நியாபக மறதி மற்றும் அல்சைமர் நோய் வர 50% அதிக வாய்ப்பு உள்ளது.",
                     "நிகோடின் இல்லாமை மனச்சோர்வு மற்றும் கோபத்தை ஏற்படுத்தும், ஆனால் இது சில வாரங்களில் சரியாகிவிடும்.",
                     "புகைபிடிப்பவர்கள் எளிதில் தலைவலி மற்றும் மயக்கத்திற்கு ஆளாகிறார்கள்.",
                     "இளமைப் பருவத்தில் புகைபிடித்தல் மூளை வளர்ச்சியை நிரந்தரமாகப் பாதிக்கிறது.",
                     "புகைபிடிப்பதை நிறுத்தினால் மூளையின் இரத்த ஓட்டம் 2 வாரங்களில் சீரடையும்."
                 ],
                 "recovery": "நிறுத்திய 48 மணி நேரங்களில் நரம்பு முனைகள் மீண்டும் வளரத் தொடங்கும், சுவை மற்றும் வாசனை அறியும் திறன் மேம்படும்."
            },
            "liver": {
                 "name": "கல்லீரல் (Liver)",
                 "facts": [
                     "சிகரெட் புகையில் வெளியாகும் அனைத்து நச்சுக்களையும் உறிஞ்சி வடிகட்டுவது கல்லீரலே.",
                     "மது அருந்தாவிட்டாலும் புகைபிடிப்பதால் கல்லீரல் புற்றுநோய் வரும் அபாயம் 50% அதிகம்.",
                     "சிகரெட் ரசாயனங்கள் கல்லீரலில் தழும்புகளை உருவாக்கி சிரோசிஸ் எனப்படும் மோசமான நோயை ஏற்படுத்துகிறது.",
                     "புகைபிடிப்பதால் முக்கிய மருந்துகளின் செயலாக்கத் திறனை கல்லீரல் இழக்கிறது.",
                     "ஹெபடைடிஸ் உள்ளவர்களுக்கு புகைபிடித்தால் நோய் மிக வேகமாக முற்றிவிடும்.",
                     "நிகோடின் கல்லீரலில் கெட்ட கொழுப்பை அதிகம் சேகரிக்கிறது.",
                     "நிறுத்தினால் கல்லீரல் வீக்கம் உடனடியாக குறைய ஆரம்பிக்கும்."
                 ],
                 "recovery": "நிறுத்திய சில வாரங்களில் கல்லீரல் என்சைம்கள் இயல்பு நிலைக்குத் திரும்பும். கல்லீரல் தன்னைத் தானே புதுப்பித்துக் கொள்ளும்."
            }
        }
        facts = tamil_facts.get(organ, tamil_facts["lungs"])
        name = facts["name"]
        available_facts = facts['facts']
        selected_facts = random.sample(available_facts, min(3, len(available_facts)))
        
        return f"""நான் உங்கள் {name}. என் தற்போதைய சேதம் {damage_pct:.1f}% ({severity}).

புகைபிடிப்பதால் என்னில் ஏற்படும் பாதிப்புகள் பற்றிய மருத்துவ உண்மைகள்:

{chr(10).join('• ' + f for f in selected_facts)}

மீட்பு தகவல்: {facts['recovery']}

நீங்கள் புகைபிடிப்பதை நிறுத்தினால், நான் குணமாக ஆரம்பிப்பேன். தயவுசெய்து என்னை காப்பாற்றுங்கள். ❤️"""

    else:
        facts = ORGAN_FACTS.get(organ, ORGAN_FACTS["lungs"])
        name = facts["name"]
        available_facts = facts['facts']
        selected_facts = random.sample(available_facts, min(3, len(available_facts)))

        return f"""I am your {name}, and right now I'm at {damage_pct:.1f}% damage — classified as {severity} severity.

Let me share some important medical facts about what smoking is doing to me:

{chr(10).join('• ' + f for f in selected_facts)}

🔬 Recovery Information: {facts['recovery']}

Every cigarette you don't smoke gives me a chance to heal. The human body has an incredible ability to recover — but I need you to give me that chance.

Please consider reducing today. Even cutting down by just 1-2 cigarettes makes a measurable difference to my health. I'm counting on you. ❤️"""


async def generate_urge_support(cigarettes_per_day, smoking_years, language="English",
                                 delay_timer_used=False, breathing_done=False):
    """Generate motivational urge support content with Gemini AI."""
    if not GEMINI_API_KEY:
        return {
            "story": "A 45-year-old teacher from Chennai smoked 15 cigarettes a day for 20 years. One morning, she couldn't walk up the stairs without gasping. That was her turning point. She used the 10-minute delay technique — every time she felt an urge, she set a timer and did something else. After 3 months, she was smoke-free. 'The urges don't disappear,' she says, 'but they lose their power. I can breathe again. I can play with my grandchildren. That's worth more than any cigarette.'",
            "motivation": f"You've been smoking for {smoking_years} years — that means you've already survived thousands of urges before. This urge will pass in the next 3-5 minutes, just like all the others. Each time you resist, your brain's nicotine pathways weaken. You are literally rewiring your brain right now. Stay strong — you're doing something extraordinary.",
            "tip": "Try the 4-4-6 breathing technique: Breathe in for 4 seconds, hold for 4 seconds, exhale slowly for 6 seconds. Repeat 5 times. This activates your parasympathetic nervous system and physically reduces the craving intensity. Then drink a glass of ice-cold water — the cold sensation helps reset your brain's reward center."
        }

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        lang_instruction = ""
        if language != "English":
            lang_instruction = f"\n\nIMPORTANT: Respond ENTIRELY in {language} language using {_get_script(language)} script. Every word must be in {language}."

        prompt = f"""You are a compassionate quit-smoking AI counselor. A person who smokes {cigarettes_per_day} cigarettes/day for {smoking_years} years is having an urge RIGHT NOW.

They {'used the breathing exercise' if breathing_done else 'are starting the support process'} and {'set a delay timer' if delay_timer_used else 'need immediate help'}.

Generate a JSON response with exactly these 3 fields (200+ words each):

1. "story": A realistic, inspiring success story of someone who quit smoking after a similar habit. Include specific details (name, age, city, years smoked, what happened, how they quit, their life now). Make it emotional and relatable to an Indian audience.

2. "motivation": A powerful, personalized motivational message for someone who has smoked {cigarettes_per_day}/day for {smoking_years} years. Include specific health statistics and what their body is going through right now during this urge. Explain the neuroscience of cravings briefly.

3. "tip": A specific, actionable distraction technique they can do RIGHT NOW (not generic advice). Include step-by-step instructions. Reference evidence-based techniques like behavioral replacement, cold water therapy, or physical movement.{lang_instruction}

Respond with valid JSON only, no markdown formatting."""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"): text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        import json
        return json.loads(text)
    except Exception as e:
        print(f"Gemini urge support error: {e}")
        return {
            "story": "A 45-year-old teacher from Chennai smoked 15 cigarettes daily for 20 years. She used the delay technique: setting a 10-minute timer each urge. After 3 months, she was smoke-free. 'The urges lose power each time you resist,' she says.",
            "motivation": f"You've survived thousands of urges in {smoking_years} years. This one will pass in 3-5 minutes. Each time you resist, your brain's nicotine receptors weaken. You are literally rewiring your brain.",
            "tip": "Right now: Stand up, splash cold water on your face, then do 10 jumping jacks. The physical shock breaks the craving cycle. Then drink a full glass of ice water slowly."
        }


async def generate_weekly_summary(user_data, language="English"):
    """Generate weekly AI summary of user's smoking data."""
    if not GEMINI_API_KEY:
        return "This week's summary: Continue reducing your cigarette intake gradually. Every cigarette fewer than last week is progress. Remember — your organs start healing within hours of reducing."

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        lang_instruction = f"\nRespond in {language}." if language != "English" else ""

        prompt = f"""Analyze this weekly smoking data and provide a brief supportive summary:
        {user_data}
        Include: progress observations, health impact changes, encouragement, and one specific tip for next week.{lang_instruction}"""
        response = model.generate_content(prompt)
        return response.text
    except:
        return "Keep going! Every cigarette fewer is a win for your health."


async def generate_missed_log_message(missed_days, language="English"):
    """Generate gentle missed-log reminder."""
    if not GEMINI_API_KEY:
        messages = {
            1: "Hey! We noticed you didn't log today. Even if you smoked, logging helps track your journey. No judgment — just data for your health. 📊",
            2: "We've missed you for 2 days now. Your health data works best when it's consistent. Take 30 seconds to log — your future self will thank you. 💪",
            3: "It's been 3 days without a log. We're here for you, no matter what. Logging doesn't mean you failed — it means you're still fighting. Come back anytime. ❤️"
        }
        return messages.get(min(missed_days, 3), messages[3])

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        lang_instruction = f"\nRespond entirely in {language}." if language != "English" else ""
        prompt = f"""A person tracking their smoking habit has missed {missed_days} day(s) of logging. Write a gentle, supportive reminder message (100 words). Be empathetic, not judgmental. Mention that logging even bad days helps their health journey.{lang_instruction}"""
        response = model.generate_content(prompt)
        return response.text
    except:
        return "We miss your logs! Remember, consistency helps us help you. Log today — no judgment. ❤️"
