import os
import io
import asyncio
from sarvamai import SarvamAI

async def test_sarvam():
    client = SarvamAI(api_subscription_key=os.environ.get("SARVAM_API_KEY", "dummy"))
    
    # Let's see if we can get the original transcript
    # Actually, we don't have a valid API key yet.
    # We will just print the SDK signature again to confirm.
    import inspect
    from sarvamai.types import SpeechToTextTranslateResponse
    print(inspect.getsource(SpeechToTextTranslateResponse))

asyncio.run(test_sarvam())
