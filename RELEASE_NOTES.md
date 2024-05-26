Song: https://www.youtube.com/watch?v=hbe3CQamF8k

Passbolt v4.8.1 is a maintenance update that addresses issues related to servers serving invalid SSL certificates, which affected the accessibility of the API with certain user journeys.

We hope these updates enhance your experience with Passbolt. Your feedback is always valuable to us.

## [4.8.1] - 2024-05-18
### Fix
- PB-33595 As a user running an instance serving an invalid certificate I should be able to sync the gpgkeyring
- PB-33596 As a user running an instance serving an invalid certificate I cannot sync my account settings
- PB-33597 As a user running an instance serving an invalid certificate I cannot install passbolt extension using an API < v3
