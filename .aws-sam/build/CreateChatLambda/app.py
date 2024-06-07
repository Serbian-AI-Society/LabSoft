import json
import boto3
import uuid
import os
from datetime import datetime
from pytz import timezone
import logging

# Initialize DynamoDB resource
CHATS_TABLE = os.getenv("CHATS_TABLE")
dynamodb = boto3.resource("dynamodb")
chats_table = dynamodb.Table(CHATS_TABLE)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info("Received event: %s", event)
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("UserID")
        chat_name = body.get("ChatName")
        chat_topic = body.get("ChatTopic")

        if not user_id or not chat_name or not chat_topic:
            logger.error("Missing UserID, ChatName or ChatTopic in the request")
            return {
                "statusCode": 400,
                "body": json.dumps(
                    {"error": "UserID, ChatName, and ChatTopic are required"}
                ),
            }

        chat_id = str(uuid.uuid4())

        # Get current time in Central European Time (CET)
        cet = timezone("Europe/Belgrade")
        current_time = datetime.now(cet).isoformat()

        # Save new chat session to DynamoDB
        chats_table.put_item(
            Item={
                "ChatID": chat_id,
                "UserID": user_id,
                "ChatName": chat_name,
                "ChatTopic": chat_topic,
                "Timestamp": current_time,
            }
        )

        logger.info("Successfully created chat session for user: %s", user_id)
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
            },
            "body": json.dumps({"ChatID": chat_id}),
        }
    except Exception as e:
        logger.exception("Error creating chat session: %s", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "An error occurred. Please try again later."}),
        }
