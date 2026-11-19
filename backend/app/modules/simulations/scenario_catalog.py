
SCENARIOS = {
    "nexatech-login-outage": {
        "career_slug": "software-engineer",
        "career": "Software Engineer",
        "title": "The NexaTech Login Outage",
        "description": "Investigate a production login outage at a growing technology company.",
        "steps": {
            1: {
                "title": "Investigate the incident",
                "message": (
                    "It is 10:15 AM at NexaTech. Your manager Sarah reports "
                    "that 38% of login attempts are failing and response times "
                    "have increased to 2.8 seconds. Investigate the cause. "
                    "Do not make production changes until we understand what is happening."
                ),
                "options": [
                    {
                        "id": "database",
                        "label": "Investigate database connectivity",
                        "score": 10,
                        "feedback": "Monitoring reveals database connection timeouts and an exhausted connection pool.",
                        "skills": {"problem_solving": 4, "technical_diagnosis": 5, "risk_management": 5},
                        "state_updates": {"investigation_lead": "database_timeouts"},
                        "next_step": 2,
                    },
                    {
                        "id": "password",
                        "label": "Investigate password verification",
                        "score": 7,
                        "feedback": "Password verification is worth investigating, but database timeouts remain a stronger lead.",
                        "skills": {"problem_solving": 3, "technical_diagnosis": 3, "risk_management": 4},
                        "state_updates": {"investigation_lead": "password_verification"},
                        "next_step": 2,
                    },
                    {
                        "id": "deployment",
                        "label": "Review recent deployments",
                        "score": 8,
                        "feedback": "Reviewing recent deployments is a useful way to identify changes that may have contributed to the incident.",
                        "skills": {"problem_solving": 4, "technical_diagnosis": 4, "risk_management": 4},
                        "state_updates": {"investigation_lead": "recent_deployment"},
                        "next_step": 2,
                    },
                    {
                        "id": "rollback",
                        "label": "Immediately roll back the application",
                        "score": 2,
                        "feedback": "This is premature. You do not yet know whether a deployment caused the incident.",
                        "skills": {"problem_solving": 1, "technical_diagnosis": 1, "risk_management": 0},
                        "state_updates": {"investigation_lead": "unverified_rollback"},
                        "next_step": 2,
                    },
                ],
            },

            2: {
                "title": "Choose your next investigation",
                "message": (
                    "Sarah asks for your next step. You have gathered an initial "
                    "lead, but the root cause is not yet confirmed. Choose how "
                    "to investigate further."
                ),
                "options": [
                    {
                        "id": "pool_metrics",
                        "label": "Inspect connection pool usage and database metrics",
                        "score": 10,
                        "feedback": "You inspect active connections, pool limits, wait times, and database load. The application pool is exhausted while database CPU remains relatively low.",
                        "skills": {"problem_solving": 5, "technical_diagnosis": 5, "risk_management": 5},
                        "state_updates": {"finding": "pool_exhaustion", "database_cpu": "not_saturated"},
                        "next_step": 4,
                    },
                    {
                        "id": "database_logs",
                        "label": "Examine database logs and slow queries",
                        "score": 9,
                        "feedback": "The logs reveal long-running queries and connections that are not being released promptly. You have a strong lead involving connection lifecycle management.",
                        "skills": {"problem_solving": 4, "technical_diagnosis": 5, "risk_management": 4},
                        "state_updates": {"finding": "connection_lifecycle_issue", "slow_queries_found": True},
                        "next_step": 3,
                    },
                    {
                        "id": "restart_database",
                        "label": "Restart the production database",
                        "score": 1,
                        "feedback": "The restart temporarily clears connections, but interrupts active transactions and removes some useful diagnostic evidence. The incident is not yet resolved.",
                        "skills": {"problem_solving": 1, "technical_diagnosis": 0, "risk_management": 0},
                        "state_updates": {"finding": "temporary_recovery", "operational_risk": "elevated"},
                        "next_step": 5,
                    },
                ],
            },

            3: {
                "title": "Trace the connection lifecycle",
                "message": (
                    "The database logs point to long-running queries and connections "
                    "that are not being released promptly. Sarah asks you to recommend "
                    "the next engineering action."
                ),
                "options": [
                    {
                        "id": "inspect_connection_cleanup",
                        "label": "Trace connection acquisition, transaction handling, and cleanup",
                        "score": 10,
                        "feedback": "Excellent. You identify code paths that fail to release connections reliably. You recommend a tested fix and regression tests.",
                        "skills": {"problem_solving": 5, "technical_diagnosis": 5, "risk_management": 5},
                        "state_updates": {"recommended_action": "fix_connection_cleanup"},
                        "next_step": None,
                    },
                    {
                        "id": "increase_pool",
                        "label": "Increase the connection pool size immediately",
                        "score": 4,
                        "feedback": "Increasing the pool may temporarily reduce waiting, but it can hide a connection leak and overload the database. Measure capacity and fix connection handling first.",
                        "skills": {"problem_solving": 2, "technical_diagnosis": 2, "risk_management": 1},
                        "state_updates": {"recommended_action": "increase_pool_without_root_cause"},
                        "next_step": None,
                    },
                    {
                        "id": "ignore_slow_queries",
                        "label": "Ignore the slow queries and close the incident",
                        "score": 0,
                        "feedback": "The evidence has not been addressed. Closing the incident now risks another outage.",
                        "skills": {"problem_solving": 0, "technical_diagnosis": 0, "risk_management": 0},
                        "state_updates": {"recommended_action": "incident_closed_prematurely"},
                        "next_step": None,
                    },
                ],
            },

            4: {
                "title": "Diagnose pool exhaustion",
                "message": (
                    "Metrics show that the connection pool has reached its limit, "
                    "but database CPU is not saturated. Sarah asks what you should "
                    "investigate before changing capacity."
                ),
                "options": [
                    {
                        "id": "trace_connection_leak",
                        "label": "Trace checked-out connections and identify connections not returned",
                        "score": 10,
                        "feedback": "Correct. Low database CPU combined with exhausted application connections suggests a connection leak or long-held connections. You recommend tracing ownership and cleanup.",
                        "skills": {"problem_solving": 5, "technical_diagnosis": 5, "risk_management": 5},
                        "state_updates": {"recommended_action": "trace_connection_leak"},
                        "next_step": None,
                    },
                    {
                        "id": "raise_pool_limit",
                        "label": "Raise the pool limit without further investigation",
                        "score": 3,
                        "feedback": "This may increase concurrency temporarily, but can shift the problem to the database and conceal the underlying issue.",
                        "skills": {"problem_solving": 2, "technical_diagnosis": 1, "risk_management": 1},
                        "state_updates": {"recommended_action": "raise_pool_limit_unverified"},
                        "next_step": None,
                    },
                    {
                        "id": "restart_service",
                        "label": "Restart the authentication service immediately",
                        "score": 2,
                        "feedback": "A restart may release connections temporarily, but without identifying the cause the issue may return. Coordinate and preserve diagnostic evidence.",
                        "skills": {"problem_solving": 1, "technical_diagnosis": 1, "risk_management": 1},
                        "state_updates": {"recommended_action": "restart_without_root_cause"},
                        "next_step": None,
                    },
                ],
            },

            5: {
                "title": "Manage the recovery",
                "message": (
                    "The database restart temporarily restored connectivity, but "
                    "active transactions were interrupted and the original cause "
                    "remains unknown. Sarah asks how you should proceed."
                ),
                "options": [
                    {
                        "id": "verify_and_investigate",
                        "label": "Verify service health, communicate the impact, and continue root-cause investigation",
                        "score": 10,
                        "feedback": "Good recovery management. You verify error rates and latency, communicate the temporary recovery, and continue investigating why connections accumulated.",
                        "skills": {"problem_solving": 5, "technical_diagnosis": 4, "risk_management": 5},
                        "state_updates": {"recommended_action": "verify_recovery_and_investigate"},
                        "next_step": None,
                    },
                    {
                        "id": "declare_resolved",
                        "label": "Declare the incident resolved because logins are working again",
                        "score": 2,
                        "feedback": "The service may be temporarily healthy, but the root cause remains. Declaring resolution too early risks recurrence.",
                        "skills": {"problem_solving": 1, "technical_diagnosis": 0, "risk_management": 0},
                        "state_updates": {"recommended_action": "premature_resolution"},
                        "next_step": None,
                    },
                    {
                        "id": "restart_again",
                        "label": "Restart the database again to be safe",
                        "score": 0,
                        "feedback": "Repeating a disruptive action without new evidence adds risk and does not address the underlying cause.",
                        "skills": {"problem_solving": 0, "technical_diagnosis": 0, "risk_management": 0},
                        "state_updates": {"recommended_action": "repeated_unnecessary_restart"},
                        "next_step": None,
                    },
                ],
            },
        },
    },
}


def get_scenario(scenario_id: str):
    return SCENARIOS.get(scenario_id)
