import {
    prop,
    getModelForClass,
    ModelOptions,
    Severity
} from "@typegoose/typegoose";

@ModelOptions({
    schemaOptions: {
        collection: "sessions",
        minimize: false
    },
    options: {
        allowMixed: Severity.ALLOW
    }
})
export class LoginSession {
    @prop()
    id!: string;

    @prop()
    access_token!: string;

    @prop()
    refresh_token!: string;

    @prop()
    expires_at!: number;

    @prop()
    scope!: string;

    @prop()
    ip!: string;

    @prop()
    userAgent!: string;
}

export const LoginSessionModel = getModelForClass(LoginSession);
