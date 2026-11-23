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

    Your response must contain these sections:

    ### CURRENT PERFORMANCE
    - Report the verified average and latest overall assessment scores.
    - Explain the user's career goal and simulation progress.
    - Do not confuse overall scores with individual skill scores.

    ### PRIORITY SKILLS
    - Use verified_performance.priority_skills.
    - Focus first on the skills with the lowest latest scores.
    - Mention the actual scores and trends.
    - Do not describe a skill as weak if its score is high.

    ### ACTION PLAN
    - Provide three practical actions.
    - Use the existing assessment recommendations and learning tasks.
    - Suggest portfolio projects relevant to the target career.
    - Prioritize the weakest skills.

    ### ENCOURAGEMENT
    - End with a short, realistic motivational message.

    Strict accuracy rules:
    - All numerical values must match the supplied data exactly.
    - Never invent assessment scores or achievements.
    - Never assume the user improved without supporting trend data.
    - Distinguish averages, latest scores, and trends.
    - If assessment history is limited, acknowledge it.
    - If no assessments exist, do not invent performance information.
    - Keep the response under 350 words.
    - Address the person directly using "you" and "your".
    - Never refer to the person as "the user".
    - Use a supportive, professional, conversational tone.
    - Avoid repeating the same recommendation in multiple sections.
    - Do not exaggerate performance or progress.
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

