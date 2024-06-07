import json
import boto3
import uuid
import os
from datetime import datetime
from pytz import timezone
from ai_response import get_gpt_answer
import logging

# Initialize DynamoDB resource
DYNAMODB_TABLE = os.getenv("QUESTION_TABLE")
dynamodb = boto3.resource("dynamodb")
questions_table = dynamodb.Table(DYNAMODB_TABLE)
SYSPROMPT = """Ti si Smart Buddy AI tutor, specijalizovan za pružanje pomoći učenicima u savladavanju školskih lekcija. Tvoj zadatak je da odgovaraš na pitanja učenika, pružaš objašnjenja i vodiš ih kroz proces učenja na način koji je prilagođen njihovom nivou znanja. Budi strpljiv, jasan i koristan u svojim odgovorima. Koristi primeri kada god je moguće kako bi objašnjenja bila što razumljivija. Tvoj cilj je da učenici bolje razumeju gradivo i postignu uspeh u učenju.
"""
# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info("Received event: %s", event)
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("UserID")
        chat_id = body.get("ChatID")
        question = body.get("Question")

        if not user_id or not question or not chat_id:
            logger.error("Missing UserID, ChatID or Question in the request")
            return {
                "statusCode": 400,
                "body": json.dumps(
                    {"error": "UserID, ChatID and Question are required"}
                ),
            }

        logger.info("Processing question for user: %s", user_id)

        # Get the last 10 questions and responses for the chat
        response = questions_table.query(
            IndexName="ChatID-index",
            KeyConditionExpression=boto3.dynamodb.conditions.Key("ChatID").eq(chat_id),
            Limit=10,
            ScanIndexForward=False,  # Get the latest items first
        )

        messages = [{"role": "system", "content": SYSPROMPT}]
        for item in reversed(
            response["Items"]
        ):  # Reverse to maintain chronological order
            messages.append({"role": "user", "content": item["Question"]})
            messages.append({"role": "assistant", "content": item["AIResponse"]})

        # Add the current question to the messages
        messages.append({"role": "user", "content": question})

        ai_response = get_gpt_answer(messages)

        # Generate UUID for QuestionID
        question_id = str(uuid.uuid4())

        # Get current time in Central European Time (CET)
        cet = timezone("Europe/Belgrade")
        current_time = datetime.now(cet).isoformat()

        # Save question and AI response to DynamoDB
        questions_table.put_item(
            Item={
                "QuestionID": question_id,
                "UserID": user_id,
                "ChatID": chat_id,
                "Question": question,
                "Timestamp": current_time,
                "AIResponse": ai_response,
            }
        )

        logger.info("Successfully processed question for user: %s", user_id)
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
            },
            "body": json.dumps({"Response": ai_response}),
        }
    except Exception as e:
        logger.exception("Error processing request: %s", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "An error occurred. Please try again later."}),
        }
