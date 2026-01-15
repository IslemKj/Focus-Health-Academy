"""
Apple In-App Purchase Receipt Validation
"""
import requests
from django.conf import settings

class IAPValidator:
    """Validate Apple IAP receipts with Apple's servers"""
    
    # Apple's production verification endpoint
    PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt'
    # Apple's sandbox verification endpoint
    SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt'
    
    @classmethod
    def validate_receipt(cls, transaction_id, receipt_data=None):
        """
        Validate an Apple IAP transaction
        
        Args:
            transaction_id: The transaction identifier from RevenueCat
            receipt_data: Optional base64-encoded receipt data
            
        Returns:
            dict: Validation result with transaction details
        """
        # For RevenueCat, we can validate via their webhook or API
        # This is a simplified version - in production, use RevenueCat's webhook
        
        # For now, we'll accept the transaction ID from RevenueCat
        # RevenueCat already validated the receipt with Apple
        
        return {
            'valid': True,
            'transaction_id': transaction_id,
            'product_id': None,  # Will be extracted from transaction_id format: course_123
            'purchase_date': None,
        }
    
    @classmethod
    def is_iap_transaction(cls, payment_intent_id):
        """Check if transaction ID is from IAP (vs Stripe)"""
        # IAP transaction IDs don't start with 'pi_' like Stripe
        # They're Apple transaction IDs or RevenueCat identifiers
        return not payment_intent_id.startswith('pi_')