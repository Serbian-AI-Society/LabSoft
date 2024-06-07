import json
import boto3
import os
import logging
from datetime import datetime
from pytz import timezone
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def lambda_handler(event, context):
    try:
        # Log the incoming event
        logger.info("Received event: %s", json.dumps(event))

        # Extract user attributes from the event
        user_attributes = event["request"]["userAttributes"]
        user_id = user_attributes["sub"]
        email = user_attributes["email"]

        # Log the extracted user attributes
        logger.info(
            "Extracted user attributes: userID=%s, email=%s",
            user_id,
            email,
        )
        cet = timezone("Europe/Belgrade")
        current_time = datetime.now(cet).isoformat()
        # Create the user item
        user_item = {
            "UserID": user_id,
            "Email": email,
            "RegistrationDate": current_time,
        }

        # Insert the item into the DynamoDB table
        users_table.put_item(Item=user_item)

        # Log the successful insertion
        logger.info("Successfully inserted user item: %s", json.dumps(user_item))

        # Return the event unchanged
        return event

    except ClientError as e:
        logger.error("DynamoDB ClientError: %s", e.response["Error"]["Message"])
        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "message": "Error creating user item",
                    "error": e.response["Error"]["Message"],
                }
            ),
        }
    except Exception as e:
        logger.exception("Unexpected error: %s", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "message": "Unexpected error occurred",
                    "error": str(e),
                }
            ),
        }
