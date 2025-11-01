from django.contrib.auth.tokens import PasswordResetTokenGenerator
from datetime import datetime, timedelta
import time

class CustomPasswordResetTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # Include timestamp in the hash value so it can be checked for expiration
        return f"{user.pk}{user.password}{timestamp}"

    def check_token(self, user, token, token_lifetime=3):
        """
        Check if the token is valid and has not expired. Token expiration is based on the embedded timestamp.
        """
        try:
            # Get the timestamp from the token and check if it's valid
            token_timestamp = self._get_token_timestamp(token)
            if token_timestamp is None:
                return False

            # Calculate the age of the token in minutes
            token_age_minutes = (time.time() - token_timestamp) / 60
            if token_age_minutes > token_lifetime:
                return False  # Token has expired

            return super().check_token(user, token)  # Verify the token against the user
        except Exception:
            return False

    def _get_token_timestamp(self, token):
        """
        Extract the timestamp from the token.
        """
        try:
            token_parts = token.split("-")
            if len(token_parts) < 2:
                return None
            return int(token_parts[1])  # The timestamp is stored in the second part of the token
        except (ValueError, IndexError):
            return None

# Create the custom token generator instance
custom_token_generator = CustomPasswordResetTokenGenerator()
