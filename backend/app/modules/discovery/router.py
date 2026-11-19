
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.discovery import (
    DiscoveryRequest,
    DiscoveryResponse,
)
from app.modules.discovery.service import recommend_careers

router = APIRouter()


@router.post(
    "/recommendations",
    response_model=DiscoveryResponse,
)
def get_recommendations(
    data: DiscoveryRequest,
    current_user: User = Depends(get_current_user),
):
    recommendations = recommend_careers(data)

    return {
        "recommendations": recommendations,
        "message": (
            "These careers are worth exploring based on your answers. "
            "A match score is a starting point, not a prediction of success."
        ),
    }
