def test_assessment_service_import():
    from app.modules.simulations.assessment_service import generate_assessment

    assert callable(generate_assessment)