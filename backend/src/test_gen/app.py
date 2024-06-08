import json
import boto3
import uuid
import os
from datetime import datetime
from pytz import timezone
from ai_response import get_gpt_answer
import logging

# Initialize DynamoDB resources
DYNAMODB_QUESTIONS_TABLE = os.getenv("QUESTION_TABLE")
DYNAMODB_CHATS_TABLE = os.getenv("CHATS_TABLE")
dynamodb = boto3.resource("dynamodb")
questions_table = dynamodb.Table(DYNAMODB_QUESTIONS_TABLE)
chats_table = dynamodb.Table(DYNAMODB_CHATS_TABLE)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info("Received event: %s", event)
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("UserID")
        chat_id = body.get("ChatID")

        if not user_id or not chat_id:
            logger.error("Missing UserID, ChatID or Question in the request")
            return {
                "statusCode": 400,
                "body": json.dumps(
                    {"error": "UserID, ChatID and Question are required"}
                ),
            }

        logger.info("Processing question for user: %s", user_id)

        # Get chat topic from Chats table
        chat_response = chats_table.get_item(Key={"ChatID": chat_id})
        if "Item" not in chat_response:
            logger.error("ChatID not found in Chats table")
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "ChatID not found"}),
            }

        chat_topic = chat_response["Item"]["ChatTopic"]

        # Get the last 10 questions and responses for the chat
        response = questions_table.query(
            IndexName="ChatID-index",
            KeyConditionExpression=boto3.dynamodb.conditions.Key("ChatID").eq(chat_id),
            Limit=10,
            ScanIndexForward=False,  # Get the latest items first
        )

        osnovna_skola = "Odgovaras uceniku osnovne skole. Potrudi se da odgovor bude zanimljiv i postavi dodatno pitanje da zainteresujes ucenika."
        srednja_skola = "Odgovaras uceniku srednje skole. Potrudi se da odgovor bude na nivou znanja srednjoskolca."
        fakultet = "Odgovaras studentu na fakultetu. Daj kompletan odgovor sa referencama. Pretrazi internet za najnovije clanke koji mu mogu pomoci u daljem istrazivanju."
        nivo_znanja = fakultet

        SYSPROMPT = f""" 
            Ti si ekspert za pravljenje testova. Tvoj zadatak je da osnovu teme koja je data izmedju ''' i
            pitanja koje je student imao naprvis test od 10 pitanja za studenta. 
            {nivo_znanja}
            Test treba da bude sa 4 ponudjena odgovora od koji je samo jedan tacan. Sve pises na sprpskom jeziku.

            Ispisi svih 10 pitanja u json formatu: "pitanje", "ponudjeni odgovori", "slovo za tacan odgovor".

            '''{chat_topic}'''

            """

        messages = [{"role": "system", "content": SYSPROMPT}]
        for item in reversed(
            response["Items"]
        ):  # Reverse to maintain chronological order
            question = item.get("Question", "")
            ai_response = item.get("AIResponse", "")
            messages.append({"role": "user", "content": question if question else ""})
            messages.append(
                {"role": "assistant", "content": ai_response if ai_response else ""}
            )

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
                "question": "Generisi Test",
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
