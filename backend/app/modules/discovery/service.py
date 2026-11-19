
CAREERS = [
    {
        "career": "Software Engineer",
        "description": "Design, build, test, and maintain software applications and systems.",
        "interests": ["software", "science", "engineering"],
        "strengths": ["problem_solving", "technical", "analysis"],
        "work_styles": ["independent", "collaborative", "flexible"],
        "priorities": ["learning", "income", "flexibility"],
        "reality_check": "Expect debugging, continuous learning, deadlines, and time spent investigating problems."
    },
    {
        "career": "Medical Doctor",
        "description": "Evaluate patients, make clinical decisions, and help manage their health.",
        "interests": ["healthcare", "science"],
        "strengths": ["empathy", "analysis", "communication", "organization"],
        "work_styles": ["collaborative", "structured", "fast_paced"],
        "priorities": ["impact", "stability", "learning"],
        "reality_check": "Expect demanding training, emotional responsibility, long shifts, and high-stakes decisions."
    },
    {
        "career": "Graphic Designer",
        "description": "Create visual concepts and communication materials for products and audiences.",
        "interests": ["design", "business"],
        "strengths": ["creativity", "communication"],
        "work_styles": ["independent", "flexible", "collaborative"],
        "priorities": ["creativity", "flexibility", "learning"],
        "reality_check": "Expect revisions, subjective feedback, client constraints, and tight delivery schedules."
    },
    {
        "career": "Data Scientist",
        "description": "Use statistics, programming, and data to discover patterns and support decisions.",
        "interests": ["science", "software", "business"],
        "strengths": ["analysis", "problem_solving", "technical"],
        "work_styles": ["independent", "collaborative", "structured"],
        "priorities": ["learning", "income", "impact"],
        "reality_check": "Expect messy datasets, uncertain results, technical troubleshooting, and explaining complex findings."
    },
    {
        "career": "Teacher",
        "description": "Plan learning experiences, explain concepts, and support student development.",
        "interests": ["education", "science"],
        "strengths": ["communication", "empathy", "organization", "creativity"],
        "work_styles": ["collaborative", "structured", "fast_paced"],
        "priorities": ["impact", "stability", "learning"],
        "reality_check": "Expect lesson preparation, classroom management, repetitive tasks, and varied student needs."
    },
    {
        "career": "Architect",
        "description": "Plan and design buildings while balancing function, safety, and aesthetics.",
        "interests": ["engineering", "design"],
        "strengths": ["creativity", "analysis", "problem_solving"],
        "work_styles": ["collaborative", "structured", "independent"],
        "priorities": ["creativity", "impact", "learning"],
        "reality_check": "Expect technical constraints, regulations, revisions, coordination, and demanding project deadlines."
    },
    {
        "career": "Lawyer",
        "description": "Research legal issues, prepare arguments, advise clients, and represent their interests.",
        "interests": ["law", "business"],
        "strengths": ["analysis", "communication", "organization"],
        "work_styles": ["structured", "independent", "collaborative"],
        "priorities": ["impact", "income", "stability"],
        "reality_check": "Expect extensive reading, detailed documentation, deadlines, negotiation, and difficult cases."
    }
]


def calculate_match(selected: list[str], career_values: list[str]) -> float:
    if not selected:
        return 0

    return len(set(selected) & set(career_values)) / len(set(selected))


def recommend_careers(data):
    weights = {
        "interests": 0.40,
        "strengths": 0.30,
        "work_styles": 0.15,
        "priorities": 0.15,
    }

    recommendations = []

    for career in CAREERS:
        score = 0
        reasons = []

        for category, weight in weights.items():
            selected = getattr(data, category)
            matches = set(selected) & set(career[category])

            score += calculate_match(
                selected, career[category]
            ) * weight

            if matches:
                reasons.append(
                    f"Your {category.replace('_', ' ')} align with this career."
                )

        recommendations.append({
            "career": career["career"],
            "description": career["description"],
            "match_score": round(score * 100),
            "reasons": reasons,
            "reality_check": career["reality_check"],
        })

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return recommendations[:5]
