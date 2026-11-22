import httpx
import json

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "qwen2.5:3b"


async def generate_manager_dialogue(
    career: str,
    scenario: str,
    decision: str,
    decision_feedback: str,
    next_situation: str,
    employee_name: str = "Engineer",
) -> str:
    prompt = f"""
You are Sarah, an experienced engineering manager at NexaTech.

The employee's name is {employee_name}.
Career: {career}
Scenario: {scenario}
Employee decision: {decision}
Verified decision feedback: {decision_feedback}
Next situation: {next_situation}

Respond directly to {employee_name} as Sarah.

Your response must:
1. Acknowledge the actual decision.
2. Explain its professional implications.
3. React naturally to the verified findings.
4. Introduce the next situation.
5. Ask one useful follow-up question if appropriate.

Rules:
- Use only the facts provided.
- Never invent logs, metrics, or technical findings.
- Never change scores or simulation outcomes.
- Do not use placeholders such as [Employee's Name].
- Keep the response under 130 words.
- Sound like a realistic engineering manager.
"""

    fallback = (
        f"Sarah: {employee_name}, {decision_feedback} "
        f"Let's continue. {next_situation}"
    )

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are Sarah, a realistic engineering "
                                "manager in a professional simulation."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.4,
                        "num_predict": 220,
                    },
                },
            )

            response.raise_for_status()
            dialogue = response.json()["message"]["content"].strip()

            return dialogue or fallback

    except (httpx.HTTPError, ValueError, KeyError):
        return fallback



async def generate_career_coaching(context: dict) -> str:
    context_json = json.dumps(
        context,
        ensure_ascii=False,
        default=str,
    )

    prompt = f"""
You are CareerVerse, an experienced AI career coach.

Analyze the following verified user data:

{context_json}

Create personalized career coaching advice.

Your response must include:

1. CURRENT PERFORMANCE
Briefly explain the user's current progress.

2. PRIORITY SKILLS
Identify the most important skills to improve based on assessment data.

3. ACTION PLAN
Give three practical actions the user can take next.
Make the actions relevant to their target career.

4. ENCOURAGEMENT
End with a short, realistic motivational message.

Rules:
- Use only the information provided.
- Never invent achievements, scores, experience, or completed activities.
- Do not claim the user has improved unless the data supports it.
- Prioritize actual weaknesses and assessment recommendations.
- Keep advice practical, specific, and professional.
- If assessment history is limited, acknowledge that limitation.
- Keep the response under 350 words.
"""

    fallback = (
        "Your career development journey is underway. "
        "Review your latest assessment, focus on the skills "
        "with the lowest scores, and complete another relevant "
        "simulation to build a more reliable performance history."
    )

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a professional and evidence-based "
                                "AI career coach. Never invent user data."
                            ),
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.4,
                        "num_predict": 600,
                    },
                },
            )

            response.raise_for_status()

            coaching = response.json()["message"]["content"].strip()

            return coaching or fallback

    except (httpx.HTTPError, ValueError, KeyError):
        return fallback

