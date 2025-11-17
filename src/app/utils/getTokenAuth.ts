export function requireGDriveAuth(): string | undefined {
  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const rawValue = parts.pop()?.split(";").shift();
      if (rawValue) return decodeURIComponent(rawValue.trim());
    }
    return undefined;
  };

  const token = getCookie("gdrive_refresh_token");

  if (!token || token.length < 1) {
    window.location.href = "/api/google-auth";
    return;
  }

  return token;
}
