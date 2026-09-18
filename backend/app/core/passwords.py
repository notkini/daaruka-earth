import re


def validate_password(password: str) -> list[str]:
    errors: list[str] = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")

    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")

    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter.")

    if not re.search(r"\d", password):
        errors.append("Password must contain at least one number.")

    if not re.search(r"[^A-Za-z0-9]", password):
        errors.append(
            "Password must contain at least one special character."
        )

    if re.search(r"\s", password):
        errors.append("Password must not contain spaces.")

    return errors


def is_password_strong(password: str) -> bool:
    return not validate_password(password)