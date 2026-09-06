import datetime
from pydantic import BaseModel, ConfigDict


class MediaRead(BaseModel):
    id: int
    report_id: int
    file_path: str
    original_filename: str
    mime_type: str
    file_size: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
