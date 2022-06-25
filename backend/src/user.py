
class User():
    def __init__(self):
        self.id = self.__generate_id() # Generate an id

    def is_authenticated(self) -> bool:
        # Check if a user has provided valid login credentials
        return True # Placeholder

    def is_active(self) -> bool:
        # Check if the user is active (i.e. their account is not suspended / pending etc.)
        return True # Placeholder, but might not need to change for the purpose of our project

    def is_anonymous(self) -> bool:
        # Check if the user is an anonymous user (guest user)
        return False # Placeholder

    def get_id(self) -> str:
        # Return the users unique identifier
        return self.id

    def __generate_id(self) -> str:
        # Ensure ID is unique, random, non-predictable, non-reversible
        pass

    def get(self, user_id):
        return self if user_id == self.id else None
        