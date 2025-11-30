import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    [key: string]: any;
    exp: number;
};

export const decodeUsername = (token: string): string | undefined => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    }
    catch (error) {
        console.error("Error in JWT decoding:", error);
        return undefined;
    }
};
