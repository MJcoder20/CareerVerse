
import asyncio

from app.services.ai_service import generate_manager_dialogue


async def main():
    dialogue = await generate_manager_dialogue(
        career="Software Engineer",
        scenario="The NexaTech Login Outage",
        decision="Examined database logs and slow queries",
        decision_feedback=(
            "The logs reveal long-running queries and connections "
            "that are not being released promptly."
        ),
        next_situation=(
            "You must now investigate connection acquisition "
            "and cleanup."
        ),
    )

    print("\nSarah's response:\n")
    print(dialogue)


if __name__ == "__main__":
    asyncio.run(main())
