import json
import boto3
import uuid
import os
from datetime import datetime
from pytz import timezone
from ai_response import get_gpt_answer
import logging

# Initialize DynamoDB resource
DYNAMODB_TABLE = os.getenv("TRANSCRIPTS_TABLE")
dynamodb = boto3.resource("dynamodb")
questions_table = dynamodb.Table(DYNAMODB_TABLE)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info("Received event: %s", event)
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("UserID")
        question = body.get("Question")

        if not user_id or not question:
            logger.error("Missing UserID or Question in the request")
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "UserID and Question are required"}),
            }

        logger.info("Processing question for user: %s", user_id)
        ai_response = get_gpt_answer(question)

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
