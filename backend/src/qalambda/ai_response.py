import openai
import logging
import boto3
from botocore.exceptions import ClientError
import json

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_secret():
    secret_name = "Hakaton"
    region_name = "eu-central-1"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(service_name="secretsmanager", region_name=region_name)

    try:
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
        # Assume the secret is stored as a JSON object
        secret = json.loads(get_secret_value_response["SecretString"])
        logger.info("Successfully retrieved secret for OpenAI API key")
        return secret["OPENAI_API_KEY"]
    except ClientError as e:
        logger.exception(f"Unable to retrieve secret: {e}")
        raise e


# Set the OpenAI API key from the Secrets Manager
openai.api_key = get_secret()


def get_gpt_answer(messages):
    if not messages:
        logger.warning("Messages list is empty.")
        return "Pitanje ne može biti prazno."

    logger.info("Calling OpenAI for Q&A")
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0,
        )
        logger.info("Received response from OpenAI")
        return response.choices[0].message.content
    except Exception as e:
        logger.exception("Error calling OpenAI API: %s", str(e))
        return "Došlo je do greške prilikom pozivanja OpenAI API-ja. Pokušajte ponovo kasnije."
