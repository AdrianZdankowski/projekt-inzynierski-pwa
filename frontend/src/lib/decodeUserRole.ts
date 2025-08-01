import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    [key: string]: any;
    exp: number;
};

export const decodeUserRole = (token: string) : string | undefined=> {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    }
    catch (error) {
        console.error("Error in JWT decoding:", error);
        return undefined;
    }
};